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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('lumina_wellness_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      profile: null,
      weeklyPlans: [],
      sessionLogs: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('lumina_wellness_state', JSON.stringify(state));
  }, [state]);

  const setProfile = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  };

  const addWeeklyPlan = (plan: WeeklyPlan) => {
    setState(prev => ({
      ...prev,
      weeklyPlans: [...prev.weeklyPlans.filter(p => p.week_number !== plan.week_number), plan]
    }));
  };

  const addSessionLog = (log: SessionLog) => {
    setState(prev => ({
      ...prev,
      sessionLogs: [...prev.sessionLogs, log]
    }));
  };

  const updateSessionLog = (log: SessionLog) => {
    setState(prev => ({
      ...prev,
      sessionLogs: prev.sessionLogs.map(l => l.id === log.id ? log : l)
    }));
  };

  const resetData = () => {
    setState({
      profile: null,
      weeklyPlans: [],
      sessionLogs: [],
    });
    localStorage.removeItem('lumina_wellness_state');
  };

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
