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
  ShieldAlert,
  Trophy,
  Coins,
  Footprints,
  Heart,
  Timer
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

// --- Sub-components ---

const NavItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 w-full group ${
      active 
        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="hidden lg:block font-semibold tracking-wide">{label}</span>
  </button>
);

const DocNavigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) => (
  <nav className="doc-nav lg:hidden">
    <button 
      onClick={() => setActiveTab('overview')}
      className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'overview' ? 'bg-brand-primary text-white scale-110' : 'text-slate-400'}`}
    >
      <LayoutDashboard size={24} />
    </button>
    <button 
      onClick={() => setActiveTab('plan')}
      className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'plan' ? 'bg-brand-primary text-white scale-110' : 'text-slate-400'}`}
    >
      <Calendar size={24} />
    </button>
    <button 
      onClick={() => setActiveTab('profile')}
      className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'profile' ? 'bg-brand-primary text-white scale-110' : 'text-slate-400'}`}
    >
      <UserIcon size={24} />
    </button>
  </nav>
);

const ActivitySummaryCard = ({ icon, label, value, unit, colorClass }: { icon: React.ReactNode, label: string, value: string, unit: string, colorClass: string }) => (
  <div className="premium-card p-6 min-w-[200px] flex-1">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-900 leading-none">{value}</span>
      <span className="text-sm font-bold text-slate-400">{unit}</span>
    </div>
  </div>
);

const RewardCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode, label: string, value: string, colorClass: string }) => (
  <div className="bg-slate-50 rounded-3xl p-4 flex flex-col items-center text-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-transparent hover:border-slate-200">
    <div className={`p-3 rounded-2xl mb-3 ${colorClass}`}>
      {icon}
    </div>
    <span className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</span>
    <span className="text-lg font-black text-slate-900">{value}</span>
  </div>
);

// --- Main Dashboard Component ---

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
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', barCol: 'bg-blue-400' };
    if (bmi < 25) return { label: 'Healthy', color: 'text-emerald-500', barCol: 'bg-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500', barCol: 'bg-orange-400' };
    return { label: 'Obese', color: 'text-rose-500', barCol: 'bg-rose-400' };
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
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col py-10 px-6 fixed inset-y-0 left-0">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/30 animate-float">
            <Activity size={28} strokeWidth={2.5} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">Lumina</span>
        </div>

        <nav className="flex-1 space-y-4">
          <NavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={22} />} 
            label="Dashboard" 
          />
          <NavItem 
            active={activeTab === 'plan'} 
            onClick={() => setActiveTab('plan')} 
            icon={<Calendar size={22} />} 
            label="Daily Activity" 
          />
          <NavItem 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon size={22} />} 
            label="Profile" 
          />
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-50">
          <button 
            onClick={resetData}
            className="flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-rose-500 transition-all duration-300 font-bold group"
          >
            <LogOut size={22} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pb-32 lg:pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Namaste, <span className="gradient-text">{profile?.name}</span>
              </h1>
              <p className="text-slate-500 font-medium text-lg">Your wellness journey is looking Luminous today.</p>
            </div>
            <div className="flex items-center gap-6 bg-white p-2 pr-6 rounded-full shadow-premium border border-slate-50">
              <div className="w-14 h-14 rounded-full bg-luminous-lavender border-2 border-white shadow-soft overflow-hidden ring-4 ring-brand-primary/5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt="avatar" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Plan</p>
                <p className="text-slate-900 font-black">Week {currentWeek || 1}</p>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Activity Hub Row */}
                <section>
                  <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Activity Hub</h2>
                    <span className="text-brand-primary font-black text-sm uppercase tracking-widest bg-brand-primary/5 px-4 py-2 rounded-full border border-brand-primary/10">Real-time Stats</span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <ActivitySummaryCard 
                      icon={<Flame size={24} className="text-orange-500" />}
                      label="Calories Burned"
                      value={sessionLogs.reduce((acc, l) => acc + l.calories_burned, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      unit="kcal"
                      colorClass="bg-orange-50"
                    />
                    <ActivitySummaryCard 
                      icon={<Timer size={24} className="text-blue-500" />}
                      label="Active Time"
                      value={(sessionLogs.length * 45).toString()}
                      unit="mins"
                      colorClass="bg-blue-50"
                    />
                    <ActivitySummaryCard 
                      icon={<Footprints size={24} className="text-emerald-500" />}
                      label="Steps Count"
                      value="1,243"
                      unit="steps"
                      colorClass="bg-emerald-50"
                    />
                    <ActivitySummaryCard 
                      icon={<TrendingUp size={24} className="text-indigo-500" />}
                      label="Daily Streak"
                      value={streakCount.toString()}
                      unit="days"
                      colorClass="bg-indigo-50"
                    />
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Performance Chart */}
                  <div className="lg:col-span-2 premium-card p-10 overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h3 className="font-black text-xl text-slate-900 tracking-tight">Focus on Consistency</h3>
                        <p className="text-slate-400 font-medium">Daily completion trends across the week</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-black shadow-lg">Week</button>
                        <button className="px-5 py-2 bg-slate-50 text-slate-400 rounded-full text-xs font-black">Month</button>
                      </div>
                    </div>
                    <div className="h-80 -ml-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyCompletionData.length > 0 ? weeklyCompletionData : [{day: 'Mon', completion: 0}, {day: 'Sun', completion: 0}]}>
                          <defs>
                            <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                              <stop offset="90%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 700}} 
                            dy={15}
                          />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }}
                            contentStyle={{ 
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                              padding: '16px 20px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="completion" 
                            stroke="#6366f1" 
                            strokeWidth={5} 
                            fillOpacity={1} 
                            fill="url(#colorComp)" 
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Goals & Rewards */}
                    <div className="premium-card p-8">
                      <h3 className="font-black text-xl text-slate-900 tracking-tight mb-6">Goals & Rewards</h3>
                      <div className="bg-luminous-lavender rounded-3xl p-6 border border-brand-primary/10 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Trophy size={32} className="text-brand-primary animate-bounce" />
                          <h4 className="font-black text-slate-900">Master of Consistency!</h4>
                        </div>
                        <p className="text-sm font-medium text-slate-600 mb-6">Complete 3 more sessions this week to earn the <span className="font-black text-brand-primary">Weekly Warrior</span> badge.</p>
                        <button className="w-full py-4 gradient-bg text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                          Claim Rewards
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <RewardCard 
                          icon={<Coins size={20} className="text-amber-500" />}
                          label="Coins"
                          value="44"
                          colorClass="bg-amber-50"
                        />
                        <RewardCard 
                          icon={<Trophy size={20} className="text-brand-primary" />}
                          label="Points"
                          value="2.3k"
                          colorClass="bg-indigo-50"
                        />
                      </div>
                    </div>

                    {/* Next Session / BMI Snapshot */}
                    <div className="premium-card p-1 bg-linear-to-br from-brand-primary to-brand-secondary overflow-hidden">
                      <div className="bg-white rounded-[1.9rem] p-7">
                        {todayWorkout && !todayWorkout.is_rest_day ? (
                          <>
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="font-black text-lg text-slate-900">Today's Session</h3>
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Recommended</span>
                            </div>
                            <div className="p-4 bg-luminous-lavender rounded-2xl flex items-center gap-4 mb-6">
                              <div className="p-3 bg-white rounded-xl shadow-sm text-brand-primary">
                                <Activity size={24} />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 leading-none mb-1">{todayWorkout.session_type}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">{todayWorkout.exercises.length} Specialized Drills</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => startSession(todayWorkout)}
                              className="w-full py-5 gradient-bg text-white rounded-2xl font-black shadow-xl shadow-brand-primary/10 hover:opacity-90 transition-opacity"
                            >
                              Launch Session
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-6">
                            <Footprints className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="font-black text-xl text-slate-900 mb-2">Recovery Window</h3>
                            <p className="text-slate-400 font-medium mb-6 px-4">Focus on hydration and mobility today.</p>
                            <button className="w-full py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest">Active Recovery</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'plan' && (
              <motion.div 
                key="plan"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {!currentPlan ? (
                  <div className="premium-card p-20 text-center flex flex-col items-center">
                    <div className="w-32 h-32 bg-luminous-lavender rounded-full flex items-center justify-center mb-10 ring-8 ring-brand-primary/5">
                      <Calendar className="text-brand-primary animate-pulse" size={64} />
                    </div>
                    <h3 className="text-3xl font-black mb-4 tracking-tight">No Active Blueprint</h3>
                    <p className="text-slate-500 mb-12 max-w-md mx-auto text-lg font-medium">
                      Let's sync with our Lumina AI to construct your next hyper-personalized training week.
                    </p>
                    <button 
                      onClick={handleGeneratePlan}
                      disabled={isGenerating}
                      className="px-12 py-5 gradient-bg text-white rounded-2xl font-black text-xl shadow-2xl shadow-brand-primary/30 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isGenerating ? "Synthesizing Blueprint..." : "Construct Week 1"}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Training Blueprint</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Strategic Execution Plan • Week {currentWeek}</p>
                      </div>
                      <button 
                        onClick={handleGeneratePlan}
                        disabled={isGenerating}
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-100 rounded-2xl font-black shadow-premium hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        <div className="p-1 bg-brand-primary/10 text-brand-primary rounded-lg group-hover:rotate-90 transition-transform duration-500">
                          <Plus size={20} strokeWidth={3} />
                        </div>
                        {isGenerating ? "Iterating..." : "Evolve Plan"}
                      </button>
                    </div>

                    {currentPlan.adaptation_notes && (
                      <div className="premium-card p-8 bg-linear-to-r from-slate-900 to-indigo-950 text-white relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                          <ShieldAlert size={120} />
                        </div>
                        <div className="relative z-10 flex gap-6">
                          <div className="p-4 bg-white/10 rounded-2xl text-brand-primary backdrop-blur-md">
                            <Info size={28} />
                          </div>
                          <div>
                            <p className="font-black text-xs uppercase tracking-widest text-brand-primary mb-2">Coach's Strategic Insights</p>
                            <p className="text-lg font-medium text-slate-100/90 leading-relaxed max-w-3xl">{currentPlan.adaptation_notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                      {currentPlan.days.map((day, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                          className={`premium-card p-1 group flex flex-col ${day.is_rest_day ? 'opacity-70 grayscale' : ''}`}
                        >
                          <div className="bg-white rounded-[1.95rem] p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-8">
                              <div>
                                <h4 className="font-black text-2xl text-slate-900 leading-tight tracking-tight mb-2 uppercase italic">{day.day}</h4>
                                <p className="text-xs font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full border border-brand-primary/10 inline-block">
                                  {day.is_rest_day ? 'Active Recovery' : 'Drill Session'}
                                </p>
                              </div>
                              {!day.is_rest_day && (
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Energy Scale</p>
                                  <div className="flex gap-1 mt-1">
                                    {[1, 2, 3].map(s => (
                                      <div key={s} className={`h-1.5 w-3 rounded-full ${s <= 2 ? 'bg-orange-400' : 'bg-slate-100'}`} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 mb-8">
                              <p className="text-lg font-bold text-slate-700 mb-6 group-hover:text-brand-primary transition-colors">{day.session_type}</p>
                              {!day.is_rest_day && (
                                <div className="space-y-4">
                                  {day.exercises.slice(0, 3).map((ex, i) => (
                                    <div key={i} className="flex justify-between items-center group/item p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                      <span className="text-sm font-bold text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap mr-4">{ex.name}</span>
                                      <span className="text-xs font-black text-slate-400 shrink-0">{ex.sets} x {ex.reps}</span>
                                    </div>
                                  ))}
                                  {day.exercises.length > 3 && (
                                    <p className="text-xs text-brand-secondary font-black tracking-widest uppercase pl-2 mt-4 flex items-center gap-2">
                                      +{day.exercises.length - 3} Drills Pending <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {!day.is_rest_day && (
                              <button 
                                onClick={() => startSession(day)}
                                className="w-full py-4 bg-slate-900 group-hover:bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 group-hover:shadow-brand-primary/20"
                              >
                                Drill Profile
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-5xl mx-auto"
              >
                <div className="premium-card p-12 text-center mb-10 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl animate-pulse">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-xs font-black tracking-widest uppercase italic">In Range</span>
                         </div>
                      </div>
                   </div>

                  <div className="relative w-40 h-40 mx-auto mb-8">
                     <div className="absolute inset-0 bg-linear-to-br from-brand-primary to-brand-secondary rounded-full blur-2xl opacity-20 animate-pulse" />
                     <div className="relative w-40 h-40 rounded-full bg-slate-100 border-4 border-white shadow-2xl mx-auto overflow-hidden ring-8 ring-brand-primary/5">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt="avatar" className="scale-110" />
                     </div>
                  </div>
                  
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">{profile?.name}</h3>
                  <div className="flex justify-center flex-wrap gap-3">
                     <span className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl">{profile?.level} Operative</span>
                     <span className="px-5 py-2 bg-luminous-lavender text-brand-primary border border-brand-primary/10 rounded-full text-xs font-black uppercase tracking-widest">{profile?.goal.replace('_', ' ')} Primary</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="premium-card p-10">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-4">
                      <UserIcon size={28} className="text-brand-primary" />
                      Biometric Grid
                    </h4>
                    <div className="space-y-6">
                      <BiometricItem label="Chrono Age" value={`${profile?.age} years`} />
                      <BiometricItem label="Mass Index" value={`${profile?.weight_kg} kg`} />
                      <BiometricItem label="Alt Vertical" value={`${profile?.height_cm} cm`} />
                      <div className="pt-6 border-t border-slate-50">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Global BMI Status</span>
                            <span className={`text-lg font-black uppercase italic ${bmiCategory.color}`}>{bmiCategory.label}</span>
                         </div>
                         <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex ring-4 ring-slate-50">
                            <div className="h-full bg-blue-400" style={{width: '18.5%'}} />
                            <div className="h-full bg-emerald-400" style={{width: '25%'}} />
                            <div className="h-full bg-orange-400" style={{width: '30%'}} />
                            <div className="h-full bg-rose-400" style={{width: '26.5%'}} />
                         </div>
                         <p className="text-[10px] text-slate-300 font-bold mt-4 uppercase tracking-tighter">Current calculated value: {bmiValue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="premium-card p-10">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-4">
                      <ShieldAlert size={28} className="text-brand-accent" />
                      Tactical Constraints
                    </h4>
                    <div className="space-y-10">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Available Arsenal</p>
                        <div className="flex flex-wrap gap-3">
                          {profile?.available_equipment.map(e => (
                            <span key={e} className="px-4 py-2 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-brand-primary/30 transition-all cursor-default">{e}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Operational Vulnerabilities</p>
                        <div className="flex flex-wrap gap-3">
                          {profile?.injuries.length ? profile.injuries.map(i => (
                            <span key={i} className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest">{i} Impact</span>
                          )) : <span className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-xs font-black uppercase tracking-widest">Optimized Structure</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Doc Navigation for Mobile */}
      <DocNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Session Modal - Reimagined for Luminous */}
      <AnimatePresence>
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-8"
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <div className="p-8 lg:p-12 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary">
                      <Activity size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{activeSession.day_name} DRILLS</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Strategic Phase • Week {activeSession.week_number}</p>
                   </div>
                </div>
                <div className="text-right hidden md:block">
                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-luminous-lavender rounded-full border border-brand-primary/10">
                    <span className="text-2xl font-black text-brand-primary leading-none">{activeSession.session_completion_pct.toFixed(0)}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">Mission Progress</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 lg:p-12 pb-24 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeSession.exercises.map((ex, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="premium-card p-1"
                    >
                      <div className="bg-white rounded-[1.95rem] p-6 lg:p-8">
                        <div className="flex gap-8 mb-8">
                          <div className="w-24 h-24 shrink-0 rounded-3xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner">
                            <ExerciseAnimation type={ex.name} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-black text-xl text-slate-900 mb-2 uppercase leading-none">{ex.name}</h4>
                            <p className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2">
                               <Timer size={14} /> {ex.planned_sets} Blocks Planned
                            </p>
                            <div className="flex flex-wrap gap-2">
                               {[...Array(ex.planned_sets)].map((_, i) => (
                                 <button
                                   key={i}
                                   onClick={() => updateExercise(ex.name, i + 1)}
                                   className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${
                                     i < ex.completed_sets 
                                       ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-105' 
                                       : 'bg-slate-50 border border-slate-100 text-slate-300 hover:border-brand-primary/30'
                                   }`}
                                 >
                                   {i + 1}
                                 </button>
                               ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-6 mt-4 pt-6 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2"><Flame size={14} className="text-orange-400" /> ~{12 * ex.completed_sets} kcal</span>
                          <span className="flex items-center gap-2"><TrendingUp size={14} className="text-indigo-400" /> {ex.completed_sets} Blocks Finalized</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-8 lg:p-12 border-t border-slate-50 flex gap-6 bg-white/90 backdrop-blur-md sticky bottom-0">
                <button 
                  onClick={() => setActiveSession(null)}
                  className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Suspend Mission
                </button>
                <button 
                  onClick={finishSession}
                  className="flex-[2] py-5 gradient-bg text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Finalize Operations
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BiometricItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 group">
    <span className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{label}</span>
    <span className="text-lg font-black text-slate-900 italic tracking-tight">{value}</span>
  </div>
);
