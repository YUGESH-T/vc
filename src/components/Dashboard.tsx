import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  User as UserIcon, 
  LogOut, 
  TrendingUp, 
  Flame, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Plus,
  AlertTriangle,
  Info,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { generateWorkoutPlan } from '../services/aiService';
import { WeeklyPlan, SessionLog, ExerciseLog, WorkoutDay } from '../types';
import { ExerciseAnimation } from './ExerciseAnimation';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { profile, weeklyPlans, sessionLogs, addWeeklyPlan, addSessionLog, updateSessionLog, resetData } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'profile'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionLog | null>(null);

  const currentWeek = weeklyPlans.length > 0 ? Math.max(...weeklyPlans.map(p => p.week_number)) : 0;
  const currentPlan = weeklyPlans.find(p => p.week_number === currentWeek);
  
  const todayName = format(new Date(), 'EEEE');
  const todayWorkout = currentPlan?.days.find(d => d.day === todayName);

  const handleGeneratePlan = async () => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const newWeek = currentWeek + 1;
      const plan = await generateWorkoutPlan(profile, newWeek, sessionLogs, currentPlan);
      addWeeklyPlan(plan);
    } finally {
      setIsGenerating(false);
    }
  };

  const startSession = (day: WorkoutDay) => {
    const newSession: SessionLog = {
      id: crypto.randomUUID(),
      week_number: currentWeek,
      day_name: day.day,
      started_at: new Date().toISOString(),
      completed_at: null,
      exercises: day.exercises.map(ex => ({
        name: ex.name,
        planned_sets: ex.sets,
        completed_sets: 0,
        reps_per_set: [],
        weight_kg: null,
        notes: null,
        skipped: false
      })),
      session_completion_pct: 0,
      calories_burned: 0
    };
    setActiveSession(newSession);
  };

  const updateExercise = (exerciseName: string, completedSets: number) => {
    if (!activeSession) return;
    
    const updatedExercises = activeSession.exercises.map(ex => {
      if (ex.name === exerciseName) {
        return { ...ex, completed_sets: completedSets };
      }
      return ex;
    });

    const totalSets = updatedExercises.reduce((acc, ex) => acc + ex.planned_sets, 0);
    const completedSetsTotal = updatedExercises.reduce((acc, ex) => acc + ex.completed_sets, 0);
    const completionPct = (completedSetsTotal / totalSets) * 100;

    // MET Calculation: MET * weight * (duration/60)
    // For simplicity, we estimate duration based on sets (approx 5 mins per set including rest)
    const estimatedDurationHours = (completedSetsTotal * 5) / 60;
    const calories = 5 * (profile?.weight_kg || 70) * estimatedDurationHours;

    setActiveSession({
      ...activeSession,
      exercises: updatedExercises,
      session_completion_pct: completionPct,
      calories_burned: calories
    });
  };

  const finishSession = () => {
    if (!activeSession) return;
    const completedSession = {
      ...activeSession,
      completed_at: new Date().toISOString()
    };
    addSessionLog(completedSession);
    setActiveSession(null);
  };

  const calculateBMI = () => {
    if (!profile) return 0;
    const heightM = profile.height_cm / 100;
    return (profile.weight_kg / (heightM * heightM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-green-500' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const streakCount = sessionLogs.length > 0 ? 
    [...new Set(sessionLogs.map(l => format(new Date(l.started_at), 'yyyy-MM-dd')))].length : 0;

  const bmiValue = parseFloat(calculateBMI() as string);
  const bmiCategory = getBMICategory(bmiValue);

  const weeklyCompletionData = sessionLogs
    .filter(log => log.week_number === currentWeek)
    .map(log => ({
      day: log.day_name.substring(0, 3),
      completion: log.session_completion_pct,
      calories: log.calories_burned
    }));

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col items-center lg:items-stretch py-8 px-4">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white">
            <Activity size={24} />
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-tight">Lumina</span>
        </div>

        <nav className="flex-1 space-y-2 w-full">
          <NavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavItem 
            active={activeTab === 'plan'} 
            onClick={() => setActiveTab('plan')} 
            icon={<Calendar size={20} />} 
            label="Workout Plan" 
          />
          <NavItem 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon size={20} />} 
            label="Profile" 
          />
        </nav>

        <button 
          onClick={resetData}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-brand-accent transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="hidden lg:block font-medium">Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back, {profile?.name}!</h2>
            <p className="text-slate-500">Ready to crush your {profile?.goal.replace('_', ' ')} goal?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Week {currentWeek || 1}</p>
              <p className="text-xs text-slate-500">Active Plan</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt="avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={<Flame className="text-orange-500" />} 
                label="Calories Burned" 
                value={sessionLogs.reduce((acc, l) => acc + l.calories_burned, 0).toFixed(0)} 
                unit="kcal"
                trend="+12% from last week"
              />
              <StatCard 
                icon={<Clock className="text-blue-500" />} 
                label="Workout Time" 
                value={(sessionLogs.length * 45).toString()} 
                unit="mins"
                trend="On track"
              />
              <StatCard 
                icon={<TrendingUp className="text-brand-primary" />} 
                label="Current Streak" 
                value={streakCount.toString()} 
                unit="days"
                trend="Keep it up!"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Weekly Activity</h3>
                  <select className="bg-slate-100 border-none rounded-lg text-sm px-3 py-1 outline-none">
                    <option>This Week</option>
                    <option>Last Week</option>
                  </select>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyCompletionData.length > 0 ? weeklyCompletionData : [{day: 'Mon', completion: 0}, {day: 'Sun', completion: 0}]}>
                      <defs>
                        <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="completion" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Next Workout / BMI */}
              <div className="space-y-6">
                {todayWorkout && !todayWorkout.is_rest_day ? (
                  <div className="glass-card p-6 gradient-bg text-white">
                    <h3 className="font-bold text-lg mb-2">Today's Session</h3>
                    <p className="text-white/80 text-sm mb-4">{todayWorkout.session_type}</p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 uppercase">Duration</p>
                        <p className="font-bold">{todayWorkout.estimated_duration_mins} mins</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => startSession(todayWorkout)}
                      className="w-full py-3 bg-white text-brand-primary rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                      Start Workout
                    </button>
                  </div>
                ) : (
                  <div className="glass-card p-6 bg-slate-100 border-dashed border-2 border-slate-300 flex flex-col items-center justify-center text-center">
                    <Info className="text-slate-400 mb-2" />
                    <h3 className="font-bold text-slate-600">Rest Day</h3>
                    <p className="text-slate-500 text-sm">Focus on recovery today!</p>
                  </div>
                )}

                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-4">Health Metrics</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Current BMI</p>
                      <p className="text-2xl font-bold">{bmiValue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase">Category</p>
                      <p className={`font-bold ${bmiCategory.color}`}>{bmiCategory.label}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-400" style={{width: '18.5%'}} />
                    <div className="h-full bg-green-400" style={{width: '25%'}} />
                    <div className="h-full bg-orange-400" style={{width: '30%'}} />
                    <div className="h-full bg-red-400" style={{width: '26.5%'}} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    *BMI may not reflect body composition for athletes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-6">
            {!currentPlan ? (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="text-brand-primary" size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-2">No active plan found</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Let's generate your first personalized workout plan based on your goals and level.
                </p>
                <button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="px-8 py-4 gradient-bg text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
                >
                  {isGenerating ? "Generating Plan..." : "Generate Week 1 Plan"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Week {currentWeek} Plan</h3>
                  <button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl font-bold hover:bg-brand-primary/20 transition-all disabled:opacity-50"
                  >
                    <Plus size={18} />
                    {isGenerating ? "Generating..." : "New Week"}
                  </button>
                </div>

                {currentPlan.adaptation_notes && (
                  <div className="p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl flex gap-3">
                    <Info className="text-brand-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-brand-primary">Coach's Note</p>
                      <p className="text-sm text-slate-600">{currentPlan.adaptation_notes}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPlan.days.map((day, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`glass-card p-6 ${day.is_rest_day ? 'bg-slate-50 border-dashed border-2 border-slate-200' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg">{day.day}</h4>
                          <p className="text-sm text-slate-500">{day.session_type}</p>
                        </div>
                        {!day.is_rest_day && (
                          <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded uppercase">
                            {day.exercises.length} Exercises
                          </span>
                        )}
                      </div>

                      {day.is_rest_day ? (
                        <div className="py-8 text-center">
                          <p className="text-slate-400 text-sm italic">Active recovery suggested</p>
                        </div>
                      ) : (
                        <div className="space-y-3 mb-6">
                          {day.exercises.slice(0, 3).map((ex, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 font-medium">{ex.name}</span>
                              <span className="text-slate-400">{ex.sets}x{ex.reps}</span>
                            </div>
                          ))}
                          {day.exercises.length > 3 && (
                            <p className="text-xs text-brand-primary font-bold">+{day.exercises.length - 3} more</p>
                          )}
                        </div>
                      )}

                      {!day.is_rest_day && (
                        <button 
                          onClick={() => startSession(day)}
                          className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="glass-card p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg mx-auto mb-4 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt="avatar" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-2xl font-bold">{profile?.name}</h3>
              <p className="text-slate-500 capitalize">{profile?.level} • {profile?.goal.replace('_', ' ')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <UserIcon size={18} className="text-brand-primary" />
                  Physical Profile
                </h4>
                <div className="space-y-3">
                  <ProfileItem label="Age" value={`${profile?.age} years`} />
                  <ProfileItem label="Weight" value={`${profile?.weight_kg} kg`} />
                  <ProfileItem label="Height" value={`${profile?.height_cm} cm`} />
                  <ProfileItem label="BMI" value={bmiValue.toString()} />
                </div>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-brand-accent" />
                  Constraints
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Equipment</p>
                    <div className="flex flex-wrap gap-1">
                      {profile?.available_equipment.map(e => (
                        <span key={e} className="px-2 py-1 bg-slate-100 rounded text-xs">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Injuries</p>
                    <div className="flex flex-wrap gap-1">
                      {profile?.injuries.length ? profile.injuries.map(i => (
                        <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs">{i}</span>
                      )) : <span className="text-xs text-slate-500">None reported</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Active Session Modal */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{activeSession.day_name} Workout</h3>
                  <p className="text-sm text-slate-500">Week {activeSession.week_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-primary">{activeSession.session_completion_pct.toFixed(0)}%</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Complete</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeSession.exercises.map((ex, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-24 h-24 shrink-0 text-brand-primary">
                        <ExerciseAnimation type={ex.name} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-900">{ex.name}</h4>
                            <p className="text-xs text-slate-500">{ex.planned_sets} sets • {ex.completed_sets} completed</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(ex.planned_sets)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => updateExercise(ex.name, i + 1)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                  i < ex.completed_sets 
                                    ? 'bg-brand-primary text-white' 
                                    : 'bg-white border border-slate-200 text-slate-400'
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                          <span className="flex items-center gap-1"><TrendingUp size={12} /> Target: {ex.planned_sets} sets</span>
                          <span className="flex items-center gap-1"><Flame size={12} /> ~{12 * ex.completed_sets} kcal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={() => setActiveSession(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={finishSession}
                  className="flex-[2] py-4 gradient-bg text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-opacity"
                >
                  Finish Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
      active 
        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
        : 'text-slate-500 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="hidden lg:block font-medium">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, unit, trend }: { icon: React.ReactNode, label: string, value: string, unit: string, trend: string }) => (
  <div className="glass-card p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-slate-50 rounded-lg">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
    <div className="flex items-baseline gap-1 mb-1">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-sm text-slate-400">{unit}</span>
    </div>
    <p className="text-xs text-green-500 font-medium">{trend}</p>
  </div>
);

const ProfileItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);
