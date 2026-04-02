import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan, SessionLog } from './types';

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  sessions: SessionLog[];
  addSession: (session: SessionLog) => void;
  currentPlan: WeeklyPlan | null;
  setPlan: (plan: WeeklyPlan) => void;
  loading: boolean;
  syncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = '/api';

// Premium Dummy Data for dynamic "up and down" graph
const DUMMY_SESSIONS: SessionLog[] = [
  {
    id: 'd7', user_id: 'dummy', type: 'strength', duration_mins: 55, calories_burned: 420,
    intensity: 'high', timestamp: new Date(Date.now() - 86400000 * 0).toISOString(), completed: true, notes: 'Peak performance'
  },
  {
    id: 'd1', user_id: 'dummy', type: 'strength', duration_mins: 45, calories_burned: 320,
    intensity: 'high', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), completed: true, notes: 'Focus on form'
  },
  {
    id: 'd2', user_id: 'dummy', type: 'cardio', duration_mins: 30, calories_burned: 510,
    intensity: 'extreme', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), completed: true, notes: 'Morning HIIT'
  },
  {
    id: 'd3', user_id: 'dummy', type: 'flexibility', duration_mins: 20, calories_burned: 150,
    intensity: 'low', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), completed: true, notes: 'Active recovery'
  },
  {
    id: 'd4', user_id: 'dummy', type: 'strength', duration_mins: 50, calories_burned: 380,
    intensity: 'high', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), completed: true, notes: 'Heavy lifts'
  },
  {
    id: 'd5', user_id: 'dummy', type: 'cardio', duration_mins: 40, calories_burned: 420,
    intensity: 'medium', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), completed: true, notes: 'Evening jog'
  },
  {
    id: 'd6', user_id: 'dummy', type: 'strength', duration_mins: 60, calories_burned: 480,
    intensity: 'extreme', timestamp: new Date(Date.now() - 86400000 * 6).toISOString(), completed: true, notes: 'Max effort'
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('lumina_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [sessions, setSessions] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('lumina_sessions');
    return saved ? JSON.parse(saved) : DUMMY_SESSIONS;
  });
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(() => {
    const saved = localStorage.getItem('lumina_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (profile?.id) {
        setLoading(true);
        try {
          const [pRes, sRes, plRes] = await Promise.all([
            fetch(`${API_BASE}/profile/${profile.id}`),
            fetch(`${API_BASE}/sessions/${profile.id}`),
            fetch(`${API_BASE}/plans/${profile.id}`)
          ]);

          if (pRes.ok) {
            const data = await pRes.json();
            setProfileState(data);
          }
          if (sRes.ok) {
            const data = await sRes.json();
            if (data.length > 0) setSessions(data);
          }
          if (plRes.ok) {
            const data = await plRes.json();
            setCurrentPlan(data[0] || null);
          }
        } catch (err) {
          console.error('Persistence Sync Error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initData();
  }, [profile?.id]);

  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('lumina_profile', JSON.stringify(newProfile));
    setSyncing(true);
    try {
      await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });
    } catch (err) {
      console.error('API Sync Error (Profile):', err);
    } finally {
      setSyncing(false);
    }
  };

  const addSession = async (session: SessionLog) => {
    const newSessions = [session, ...sessions];
    setSessions(newSessions);
    localStorage.setItem('lumina_sessions', JSON.stringify(newSessions));
    setSyncing(true);
    try {
      await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, user_id: profile?.id }),
      });
    } catch (err) {
      console.error('API Sync Error (Session):', err);
    } finally {
      setSyncing(false);
    }
  };

  const setPlan = async (plan: WeeklyPlan) => {
    setCurrentPlan(plan);
    localStorage.setItem('lumina_plan', JSON.stringify(plan));
    setSyncing(true);
    try {
      await fetch(`${API_BASE}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, user_id: profile?.id }),
      });
    } catch (err) {
      console.error('API Sync Error (Plan):', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppContext.Provider value={{ profile, setProfile, sessions, addSession, currentPlan, setPlan, loading, syncing }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
