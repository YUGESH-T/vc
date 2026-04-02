import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FitnessGoal, FitnessLevel, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';

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
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-50 overflow-y-auto">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 blur-[120px] rounded-full animate-float -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 blur-[120px] rounded-full animate-float -z-10" style={{ animationDelay: '1.5s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-1 relative overflow-hidden"
      >
        <div className="bg-white rounded-[2.4rem] p-8 md:p-12">
            <div className="mb-10 text-center">
              <div className="flex justify-between items-center mb-8 px-2">
                 {step > 1 ? (
                    <button onClick={handleBack} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                       <ChevronLeft size={20} />
                    </button>
                 ) : <div className="w-10" />}
                 
                 <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className={`h-1.5 transition-all duration-500 rounded-full ${i === step ? 'w-6 bg-brand-primary' : 'w-1.5 bg-slate-100'}`}
                      />
                    ))}
                 </div>
                 
                 <div className="w-10" />
              </div>

              <div className="w-14 h-14 bg-luminous-lavender rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-sm">
                <Sparkles size={28} />
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 italic uppercase leading-none">
                {step === 1 && "Welcome"}
                {step === 2 && "Your Goal"}
                {step === 3 && "Fitness Level"}
                {step === 4 && "Preferences"}
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                {step === 1 && "Let's build your personalized fitness profile."}
                {step === 2 && "What do you want to achieve?"}
                {step === 3 && "How would you describe your current level?"}
                {step === 4 && "Tell us about your equipment and injuries."}
              </p>
            </div>

            <div className="min-h-[280px]">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={step}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   className="space-y-6"
                 >
                    {step === 1 && (
                      <div className="space-y-5">
                        <div className="group">
                          <label className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-brand-primary transition-colors">Full Name</label>
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => updateField('name', e.target.value)}
                            className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-base sm:text-lg transition-all"
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Age</label>
                            <input 
                              type="number" 
                              value={formData.age}
                              onChange={e => updateField('age', parseInt(e.target.value))}
                              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-base sm:text-lg transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Weight (kg)</label>
                            <input 
                              type="number" 
                              value={formData.weight_kg}
                              onChange={e => updateField('weight_kg', parseInt(e.target.value))}
                              className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-base sm:text-lg transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Height (cm)</label>
                          <input 
                            type="number" 
                            value={formData.height_cm}
                            onChange={e => updateField('height_cm', parseInt(e.target.value))}
                            className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 outline-none font-bold text-base sm:text-lg transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(['weight_loss', 'muscle_gain', 'endurance', 'flexibility'] as FitnessGoal[]).map(goal => (
                          <button
                            key={goal}
                            onClick={() => updateField('goal', goal)}
                            className={`p-4 sm:p-5 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${formData.goal === goal ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                          >
                            <span className="block font-black text-sm sm:text-base uppercase italic tracking-tight text-slate-900">{goal.replace('_', ' ')}</span>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Goal Path</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="grid grid-cols-1 gap-3">
                        {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map(level => (
                          <button
                            key={level}
                            onClick={() => updateField('level', level)}
                            className={`p-5 rounded-3xl border-2 text-left transition-all ${formData.level === level ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                          >
                            <span className="block font-black text-base sm:text-lg uppercase italic tracking-tight text-slate-900">{level}</span>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Current Level</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Available Equipment</label>
                          <div className="flex flex-wrap gap-2">
                            {['Dumbbells', 'Barbell', 'Bench', 'Bands', 'None'].map(eq => (
                              <button
                                key={eq}
                                onClick={() => toggleItem('available_equipment', eq)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.available_equipment?.includes(eq) ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                {eq}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Any Injuries?</label>
                          <div className="flex flex-wrap gap-2">
                            {['Knee', 'Back', 'Shoulder', 'None'].map(inj => (
                              <button
                                key={inj}
                                onClick={() => toggleItem('injuries', inj)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.injuries?.includes(inj) ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                {inj}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-4">
                             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Frequency</label>
                             <span className="text-xs font-black text-brand-primary uppercase italic">{formData.days_per_week} Days / Week</span>
                          </div>
                          <input 
                            type="range" 
                            min="2" max="6" 
                            value={formData.days_per_week}
                            onChange={e => updateField('days_per_week', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand-primary"
                          />
                        </div>
                      </div>
                    )}
                 </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-10 sm:mt-12">
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.name}
                className="w-full py-5 sm:py-6 gradient-bg text-white rounded-[2rem] font-black text-base sm:text-lg uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {step === 4 ? "Start My Journey" : "Continue"}
                <ArrowRight size={20} className={step === 4 ? "animate-pulse" : ""} />
              </button>
              <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-5">Your data is safe with us</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};
