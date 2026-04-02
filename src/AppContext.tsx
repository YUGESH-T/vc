import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan, SessionLog, AppState } from './types';

interface AppContextType extends AppState {
  setProfile: (profile: UserProfile) => void;
  addWeeklyPlan: (plan: WeeklyPlan) => void;
  addSessionLog: (log: SessionLog) => void;
  updateSessionLog: (log: SessionLog) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    profile: null,
    weeklyPlans: [],
    sessionLogs: [],
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial data from MongoDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, plansRes, sessionsRes] = await Promise.all([
          fetch(`${API_URL}/profile`),
          fetch(`${API_URL}/plans`),
          fetch(`${API_URL}/sessions`)
        ]);

        const profile = await profileRes.json();
        const weeklyPlans = await plansRes.json();
        const sessionLogs = await sessionsRes.json();

        setState({ profile, weeklyPlans, sessionLogs });
      } catch (e) {
        console.error("Failed to fetch initial state from MongoDB", e);
        // Fallback to localStorage if API is down
        const saved = localStorage.getItem('lumina_wellness_state');
        if (saved) {
          try {
            setState(JSON.parse(saved));
          } catch (parseErr) {
            console.error("Failed to parse saved state from localStorage", parseErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync to localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('lumina_wellness_state', JSON.stringify(state));
    }
  }, [state, loading]);

  const setProfile = async (profile: UserProfile) => {
    // Optimistic update
    setState(prev => ({ ...prev, profile }));
    try {
      await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (e) {
      console.error("Failed to sync profile to MongoDB", e);
    }
  };

  const addWeeklyPlan = async (plan: WeeklyPlan) => {
    setState(prev => ({
      ...prev,
      weeklyPlans: [...prev.weeklyPlans.filter(p => p.week_number !== plan.week_number), plan]
    }));
    try {
      await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
    } catch (e) {
      console.error("Failed to sync plan to MongoDB", e);
    }
  };

  const addSessionLog = async (log: SessionLog) => {
    setState(prev => ({
      ...prev,
      sessionLogs: [...prev.sessionLogs, log]
    }));
    try {
      await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) {
      console.error("Failed to sync session to MongoDB", e);
    }
  };

  const updateSessionLog = async (log: SessionLog) => {
    setState(prev => ({
      ...prev,
      sessionLogs: prev.sessionLogs.map(l => l.id === log.id ? log : l)
    }));
    try {
      await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) {
      console.error("Failed to sync session update to MongoDB", e);
    }
  };

  const resetData = async () => {
    setState({
      profile: null,
      weeklyPlans: [],
      sessionLogs: [],
    });
    localStorage.removeItem('lumina_wellness_state');
    try {
      await fetch(`${API_URL}/reset`, { method: 'POST' });
    } catch (e) {
      console.error("Failed to reset data on MongoDB", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ ...state, setProfile, addWeeklyPlan, addSessionLog, updateSessionLog, resetData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
