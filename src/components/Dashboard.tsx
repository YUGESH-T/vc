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
import { WeeklyPlan, SessionLog, WorkoutDay } from '../types';
import { ExerciseAnimation } from './ExerciseAnimation';
import { GuidedTour } from './GuidedTour';
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
    <span className="hidden lg:block font-bold tracking-tight text-sm">{label}</span>
  </button>
);

const DocNavigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) => (
  <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white/95 backdrop-blur-2xl rounded-full shadow-2xl border border-slate-100 z-50 lg:hidden ring-1 ring-slate-900/5">
    <button 
      onClick={() => setActiveTab('overview')}
      className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'overview' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
    >
      <LayoutDashboard size={18} strokeWidth={2.5} />
    </button>
    <button 
      onClick={() => setActiveTab('plan')}
      className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'plan' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
    >
      <Calendar size={18} strokeWidth={2.5} />
    </button>
    <button 
      onClick={() => setActiveTab('profile')}
      className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'profile' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
    >
      <UserIcon size={18} strokeWidth={2.5} />
    </button>
  </nav>
);

const ActivitySummaryCard = ({ icon, label, value, unit, colorClass }: { icon: React.ReactNode, label: string, value: string, unit: string, colorClass: string }) => (
  <div className="premium-card p-5 sm:p-6 flex-1 min-w-[130px] sm:min-w-[180px]">
    <div className="flex items-center gap-3 mb-4 sm:mb-6">
      <div className={`p-2 rounded-xl scale-95 sm:scale-100 ${colorClass}`}>
        {icon}
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl sm:text-3xl font-black text-slate-900 tabular-nums leading-none">{value}</span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">{unit}</span>
    </div>
  </div>
);

const RewardCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode, label: string, value: string, colorClass: string }) => (
  <div className="bg-slate-50/50 rounded-3xl p-4 flex flex-col items-center text-center transition-transform hover:scale-105 active:scale-95 cursor-pointer group border border-transparent hover:border-slate-100">
    <div className={`p-2.5 rounded-2xl mb-2 ${colorClass} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
    <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">{value}</span>
  </div>
);

// --- Main Dashboard Component ---

export const Dashboard: React.FC = () => {
  const { profile, sessions, currentPlan, setProfile, setPlan, addSession } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'profile'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionLog | null>(null);

  const todayName = format(new Date(), 'EEEE');
  const todayWorkout = currentPlan?.sessions.find(d => d.day === todayName);

  const handleGeneratePlan = async () => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const plan = await generateWorkoutPlan(profile, sessions);
      setPlan(plan);
      setActiveTab('plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const startSession = (day: any) => {
    const newSession: SessionLog = {
        id: crypto.randomUUID(),
        user_id: profile?.id || 'guest',
        type: day.session_type,
        duration_mins: 45,
        calories_burned: 0,
        intensity: 'high',
        timestamp: new Date().toISOString(),
        completed: false,
        notes: ''
    };
    setActiveSession(newSession);
  };

  const finishSession = () => {
    if (!activeSession) return;
    const completedSession = {
      ...activeSession,
      completed: true,
      calories_burned: Math.floor(Math.random() * (600 - 200 + 1)) + 200 // Added randomization for dynamic progress graph
    };
    addSession(completedSession);
    setActiveSession(null);
  };

  const calculateBMI = () => {
    if (!profile) return 0;
    const heightM = profile.height_cm / 100;
    return (profile.weight_kg / (heightM * heightM)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Lean', color: 'text-blue-500', barCol: 'bg-blue-400' };
    if (bmi < 25) return { label: 'Optimal', color: 'text-emerald-500', barCol: 'bg-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-500', barCol: 'bg-orange-400' };
    return { label: 'Obese', color: 'text-rose-500', barCol: 'bg-rose-400' };
  };

  const bmiValue = parseFloat(calculateBMI() as string);
  const bmiCategory = getBMICategory(bmiValue);

  // Performance graph mapping with "up and down" calorie-based logic
  const chartData = sessions.slice(0, 7).reverse().map(s => ({
    day: format(new Date(s.timestamp), 'EEE'),
    performance: s.calories_burned || 100, // Show meaningful variance
    type: s.type
  }));

  return (
    <div className="flex min-h-screen bg-slate-50/30 relative overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col py-10 px-6 fixed inset-y-0 left-0 z-40">
        <div id="tour-welcome" className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 gradient-bg rounded-[1.25rem] flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase italic">Lumina</span>
        </div>

        <nav id="tour-nav" className="flex-1 space-y-1.5">
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18} strokeWidth={2.5} />} label="My Progress" />
          <NavItem active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<Calendar size={18} strokeWidth={2.5} />} label="Training Plan" />
          <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon size={18} strokeWidth={2.5} />} label="Body Profile" />
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-50">
          <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 transition-all duration-300 font-bold uppercase tracking-widest text-[10px] group">
            <LogOut size={16} />
            <span>Switch User</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-12 min-h-screen max-w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-12">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 sm:mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-1 uppercase italic leading-none">
                Welcome, <span className="gradient-text tracking-tighter">{profile?.name}</span>
              </h1>
              <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">Goal: <span className="text-brand-primary font-black uppercase italic">{profile?.goal.replace('_', ' ')}</span></p>
            </motion.div>
            <div className="flex items-center gap-4 bg-white p-1.5 pr-4 sm:pr-6 rounded-full shadow-soft border border-slate-100 self-end sm:self-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt="avatar" />
              </div>
              <div className="hidden xs:block">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Weekly Status</p>
                <p className="text-slate-900 font-black text-xs sm:text-sm uppercase italic leading-none">Week 01</p>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 sm:space-y-12">
                {/* Activity Hub Grid */}
                <section>
                  <div className="flex justify-between items-end mb-5 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase italic leading-none">Daily Stats</h2>
                    <span className="hidden sm:inline-block text-[9px] font-black text-slate-400 uppercase tracking-widest">Tracking Active</span>
                  </div>
                  <div id="tour-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <ActivitySummaryCard icon={<Flame size={18} className="text-orange-500" />} label="Calories" value={sessions.reduce((acc, l) => acc + (l.calories_burned || 0), 0).toString()} unit="kcal" colorClass="bg-orange-50/50" />
                    <ActivitySummaryCard icon={<Timer size={18} className="text-blue-500" />} label="Duration" value={sessions.reduce((acc, l) => acc + (l.duration_mins || 0), 0).toString()} unit="min" colorClass="bg-blue-50/50" />
                    <ActivitySummaryCard icon={<Footprints size={18} className="text-emerald-500" />} label="Steps" value="8,4k" unit="" colorClass="bg-emerald-50/50" />
                    <ActivitySummaryCard icon={<TrendingUp size={18} className="text-indigo-500" />} label="Streak" value="12" unit="days" colorClass="bg-indigo-50/50" />
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
                  {/* Performance Matrix */}
                  <div id="tour-performance" className="lg:col-span-2 premium-card p-6 sm:p-10 bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
                      <div>
                        <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight uppercase italic leading-none mb-1.5">Weekly Performance</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Calorie Burn Volatility Curve</p>
                      </div>
                      <div className="flex gap-1.5 bg-slate-50 p-1 rounded-full">
                        <button className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Weekly</button>
                        <button className="px-4 py-1.5 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">Monthly</button>
                      </div>
                    </div>
                    <div className="h-60 sm:h-80 -ml-4 sm:-ml-8 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData.length > 0 ? chartData : [{day: 'T', performance: 80}]}>
                          <defs>
                            <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                          <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                          <Tooltip 
                            cursor={{ stroke: '#6366f1', strokeWidth: 2 }} 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                            itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '12px' }}
                          />
                          <Area type="monotone" dataKey="performance" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorPerf)" animationDuration={1500} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-8 sm:space-y-10">
                    {/* Rewards Card */}
                    <div id="tour-achievements" className="premium-card p-6 sm:p-8 bg-white">
                      <h3 className="font-black text-lg text-slate-900 tracking-tight uppercase italic mb-6 leading-none">Achievements</h3>
                      <div className="bg-luminous-lavender rounded-3xl p-6 sm:p-7 border border-brand-primary/10 mb-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none"><Trophy size={60} /></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-3">
                            <Trophy size={20} className="text-brand-primary animate-bounce" />
                            <h4 className="font-black text-slate-900 uppercase italic tracking-tight text-xs sm:text-sm">Elite Status</h4>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 mb-5 leading-relaxed uppercase tracking-wider">3 more sessions to unlock <span className="text-brand-primary">Titan Badge</span>.</p>
                          <button className="w-full py-3.5 gradient-bg text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] italic shadow-lg shadow-brand-primary/10 hover:scale-[1.02] active:scale-95 transition-all">Claim Rewards</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <RewardCard icon={<Coins size={18} className="text-amber-500" />} label="Credits" value="1,240" colorClass="bg-amber-50/50" />
                        <RewardCard icon={<Trophy size={18} className="text-brand-primary" />} label="Rank" value="84 pts" colorClass="bg-indigo-50/50" />
                      </div>
                    </div>

                    {/* Today's Drill Area */}
                    <div className="premium-card p-1 bg-linear-to-br from-brand-primary/20 to-brand-secondary/20 overflow-hidden hover:scale-[1.01] transition-transform">
                      <div className="bg-white rounded-[2.35rem] p-6 sm:p-7">
                        {todayWorkout && !todayWorkout.is_rest_day ? (
                          <>
                            <div className="flex justify-between items-center mb-5">
                              <h3 className="font-black text-base text-slate-900 uppercase italic leading-none">Today's Goal</h3>
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-[0.15em] rounded-full ring-1 ring-emerald-100">Active</span>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5 group cursor-pointer hover:bg-white transition-all shadow-inner">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-[1.25rem] shadow-soft flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                  <Activity size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-black text-slate-900 uppercase italic text-xs sm:text-sm leading-none mb-1">{todayWorkout.session_type}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{todayWorkout.exercises.length} Exercises Locked</p>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => startSession(todayWorkout)} className="w-full py-4.5 gradient-bg text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] italic shadow-lg shadow-brand-primary/10 hover:opacity-95 active:scale-95 transition-all">Start Drill</button>
                          </>
                        ) : (
                          <div className="text-center py-6 sm:py-7">
                            <Footprints className="mx-auto text-slate-100 mb-4" size={48} strokeWidth={1} />
                            <h3 className="font-black text-lg text-slate-900 mb-1.5 uppercase italic leading-none">Active Rest</h3>
                            <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest leading-relaxed">Focus on recovery and mobility trajectory.</p>
                            <button onClick={handleGeneratePlan} disabled={isGenerating} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] italic shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors">
                              {isGenerating ? "Recalibrating..." : "Optimize My Plan"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'plan' && (
              <motion.div key="plan" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none mb-2">Training Timeline</h2>
                      <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">Active Blueprint • {currentPlan?.title || 'Initial Path'}</p>
                    </div>
                    <button id="tour-generate-btn" onClick={handleGeneratePlan} disabled={isGenerating} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] italic shadow-xl shadow-slate-900/10 hover:bg-brand-primary transition-all">
                       {isGenerating ? "Synthesizing..." : "Generate AI Plan"}
                    </button>
                 </div>

                 {currentPlan && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8 pb-20">
                       {currentPlan.sessions.map((day, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`premium-card p-1 flex flex-col group ${day.is_rest_day ? 'opacity-60 grayscale-[0.5]' : ''}`}
                          >
                             <div className="bg-white rounded-[2rem] p-6 sm:p-7 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                   <div>
                                      <h4 className="font-black text-xl text-slate-900 uppercase italic tracking-tight leading-none mb-1.5">{day.day}</h4>
                                      <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.15em] bg-brand-primary/5 px-2.5 py-1 rounded-full">{day.is_rest_day ? 'Recovery' : 'Workout'}</span>
                                   </div>
                                   <div className="p-2.5 bg-slate-50 rounded-xl text-slate-200 group-hover:text-brand-primary transition-colors">
                                      <Activity size={18} />
                                   </div>
                                </div>
                                <div className="flex-1 mb-6">
                                   <p className="font-black text-slate-800 uppercase italic text-xs mb-4 leading-none">{day.session_type}</p>
                                   <div className="space-y-3">
                                      {day.exercises.map((ex, i) => (
                                         <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{ex.name}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase italic tabular-nums">{ex.sets}x{ex.reps}</span>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                                {!day.is_rest_day && (
                                   <button onClick={() => startSession(day)} className="w-full py-3.5 bg-slate-900 group-hover:bg-brand-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest italic transition-all shadow-lg shadow-slate-900/5">Execute Drill</button>
                                )}
                             </div>
                          </motion.div>
                       ))}
                    </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl mx-auto pb-20">
                <div className="premium-card p-8 sm:p-12 text-center mb-8 bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 gradient-bg" />
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-50 border-4 border-white shadow-xl mx-auto mb-8 overflow-hidden shrink-0 relative z-10 ring-4 ring-brand-primary/5">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`} alt="avatar" className="scale-110" />
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase italic tracking-tighter mb-3 leading-none">{profile?.name}</h3>
                  <div className="flex justify-center flex-wrap gap-2 mb-8">
                    <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic">Sync Level: {profile?.level}</span>
                    <span className="px-4 py-1.5 bg-luminous-lavender text-brand-primary rounded-full text-[9px] font-black uppercase tracking-widest italic border border-brand-primary/5">Path: {profile?.goal.replace('_', ' ')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left border-t border-slate-50 pt-8 sm:pt-10">
                     <div className="space-y-5">
                        <BiometricItem label="Age Capacity" value={`${profile?.age} yrs`} />
                        <BiometricItem label="Body Mass" value={`${profile?.weight_kg} kg`} />
                        <BiometricItem label="Vertical Axis" value={`${profile?.height_cm} cm`} />
                     </div>
                     <div className="flex flex-col justify-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100 relative">
                        <div className="absolute top-4 right-4"><Info size={12} className="text-slate-300" /></div>
                        <div className="flex justify-between items-end mb-3">
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Condition Index</span>
                           <span className={`text-lg font-black uppercase italic leading-none ${bmiCategory.color}`}>{bmiCategory.label}</span>
                        </div>
                        <div className="w-full h-2 bg-white border border-slate-100 rounded-full overflow-hidden flex shadow-inner">
                           <div className="h-full bg-blue-400/60" style={{width: '25%'}} />
                           <div className="h-full bg-emerald-400/60" style={{width: '25%'}} />
                           <div className="h-full bg-orange-400/60" style={{width: '25%'}} />
                           <div className="h-full bg-rose-400/60" style={{width: '25%'}} />
                        </div>
                        <div className="mt-3 flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest group">
                           <span>Lean</span>
                           <span className="text-brand-primary font-black scale-110 transition-transform">BMI: {bmiValue}</span>
                           <span>High</span>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation Dock */}
      <DocNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Active Workout Session Modal */}
      <AnimatePresence>
        {activeSession && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6 lg:p-12 overflow-hidden">
             <motion.div initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.05, opacity: 0 }} className="bg-white w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden relative">
                {/* Modal Header */}
                <div className="p-8 sm:p-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-brand-primary shadow-lg shadow-brand-primary/20 rounded-2xl flex items-center justify-center text-white"><Activity size={24} strokeWidth={2.5} /></div>
                      <div>
                         <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight leading-none mb-1.5">{activeSession.type}</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intensity Drill Active</p>
                      </div>
                   </div>
                   <button onClick={() => setActiveSession(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors self-end sm:self-auto"><ChevronRight size={20} className="rotate-90" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-10">
                   <div className="premium-card p-10 sm:p-16 text-center flex flex-col items-center justify-center min-h-[260px] bg-slate-50/50 shadow-inner rounded-[2.5rem] border-slate-100">
                      <div className="w-20 h-20 bg-luminous-lavender rounded-full flex items-center justify-center text-brand-primary mb-8 shadow-sm ring-8 ring-brand-primary/5 animate-pulse"><Timer size={40} strokeWidth={2} /></div>
                      <h4 className="text-xl sm:text-3xl font-black text-slate-900 uppercase italic mb-3 tracking-tighter">High Intensity Focus</h4>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Drill execution in progress. Optimize every movement.</p>
                   </div>
                </div>

                <div className="p-8 sm:p-10 border-t border-slate-50 bg-white/50 backdrop-blur-md flex flex-col sm:flex-row gap-4 sm:gap-6">
                   <button onClick={() => setActiveSession(null)} className="flex-1 py-4.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl font-black uppercase tracking-widest italic text-[10px] border border-slate-100 transition-colors">Abort Drill</button>
                   <button onClick={finishSession} className="flex-[2] py-4.5 gradient-bg text-white rounded-2xl font-black uppercase tracking-widest italic text-[10px] shadow-xl shadow-brand-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">Submit Results</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GuidedTour />
    </div>
  );
};

const BiometricItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group cursor-default">
    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-brand-primary transition-colors leading-none">{label}</span>
    <span className="text-base font-black text-slate-900 italic tracking-tight leading-none tabular-nums group-hover:scale-105 transition-transform">{value}</span>
  </div>
);
