import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FitnessGoal, FitnessLevel, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, User, Target, Activity, ShieldAlert, Sparkles, ChevronLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { setProfile } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    weight_kg: 70,
    height_cm: 170,
    goal: 'weight_loss',
    level: 'beginner',
    days_per_week: 3,
    available_equipment: [],
    injuries: [],
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      const profile: UserProfile = {
        ...formData as UserProfile,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleItem = (field: 'available_equipment' | 'injuries', item: string) => {
    const current = formData[field] || [];
    if (current.includes(item)) {
      updateField(field, current.filter(i => i !== item));
    } else {
      updateField(field, [...current, item]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '1.5s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full premium-card p-1 shadow-2xl relative z-10"
      >
        <div className="bg-white rounded-[1.95rem] p-10 lg:p-14">
            <div className="mb-12">
              <div className="flex justify-between items-center mb-10">
                 {step > 1 ? (
                    <button onClick={handleBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                       <ChevronLeft size={24} />
                    </button>
                 ) : <div className="w-10" />}
                 
                 <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className={`h-2 transition-all duration-500 rounded-full ${i === step ? 'w-8 bg-brand-primary' : 'w-2 bg-slate-100'}`}
                      />
                    ))}
                 </div>
                 
                 <div className="w-10" />
              </div>

              <div className="text-center">
                 <div className="w-16 h-16 bg-luminous-lavender rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-sm">
                    <Sparkles size={32} />
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 italic uppercase">
                    {step === 1 && "Initialization"}
                    {step === 2 && "Primary Objective"}
                    {step === 3 && "Operational Level"}
                    {step === 4 && "Final Synchronization"}
                 </h1>
                 <p className="text-slate-500 font-medium text-lg">
                    {step === 1 && "Start your luminous wellness journey."}
                    {step === 2 && "Select your core fitness destination."}
                    {step === 3 && "Assess your current tactical readiness."}
                    {step === 4 && "Configure final parameters for processing."}
                 </p>
              </div>
            </div>

            <div className="space-y-10 min-h-[320px]">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={step}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ duration: 0.3 }}
                 >
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="group">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 group-focus-within:text-brand-primary transition-colors">Identification</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => updateField('name', e.target.value)}
                            className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-lg transition-all"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Chrono Age</label>
                            <input 
                              type="number" 
                              value={formData.age}
                              onChange={e => updateField('age', parseInt(e.target.value))}
                              className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-lg transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Mass Index (kg)</label>
                            <input 
                              type="number" 
                              value={formData.weight_kg}
                              onChange={e => updateField('weight_kg', parseInt(e.target.value))}
                              className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-lg transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Alt Vertical (cm)</label>
                          <input 
                            type="number" 
                            value={formData.height_cm}
                            onChange={e => updateField('height_cm', parseInt(e.target.value))}
                            className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-lg transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-1 gap-4">
                        {(['weight_loss', 'muscle_gain', 'endurance', 'flexibility'] as FitnessGoal[]).map(goal => (
                          <button
                            key={goal}
                            onClick={() => updateField('goal', goal)}
                            className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${formData.goal === goal ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                          >
                            {formData.goal === goal && <div className="absolute top-0 right-0 p-4"><div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" /></div>}
                            <span className="block font-black text-lg uppercase italic tracking-tight text-slate-900">{goal.replace('_', ' ')}</span>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Strategic Path</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="grid grid-cols-1 gap-4">
                        {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map(level => (
                          <button
                            key={level}
                            onClick={() => updateField('level', level)}
                            className={`p-6 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${formData.level === level ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                          >
                            {formData.level === level && <div className="absolute top-0 right-0 p-4"><div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" /></div>}
                            <span className="block font-black text-lg uppercase italic tracking-tight text-slate-900">{level} level</span>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Capacity</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-8">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Available Arsenal</label>
                          <div className="flex flex-wrap gap-2">
                            {['Dumbbells', 'Barbell', 'Bench', 'Resistance Bands', 'None'].map(eq => (
                              <button
                                key={eq}
                                onClick={() => toggleItem('available_equipment', eq)}
                                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.available_equipment?.includes(eq) ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                {eq}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Known Structural Vulnerabilities</label>
                          <div className="flex flex-wrap gap-2">
                            {['Knee', 'Lower Back', 'Shoulder', 'Wrist', 'None'].map(inj => (
                              <button
                                key={inj}
                                onClick={() => toggleItem('injuries', inj)}
                                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${formData.injuries?.includes(inj) ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                {inj}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4">
                          <div className="flex justify-between items-center mb-4 ml-2">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Temporal Allocation</label>
                             <span className="text-sm font-black text-brand-primary uppercase italic">{formData.days_per_week} Cycles / Week</span>
                          </div>
                          <input 
                            type="range" 
                            min="2" max="6" 
                            value={formData.days_per_week}
                            onChange={e => updateField('days_per_week', parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                          />
                        </div>
                      </div>
                    )}
                 </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-14">
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.name}
                className="w-full py-6 gradient-bg text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] italic flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {step === 4 ? "Synchronize Now" : "Execute Next Phase"}
                <ArrowRight size={24} strokeWidth={3} />
              </button>
              <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mt-6">Secure Luminous Protocol v1.4.2</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
