import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { FitnessGoal, FitnessLevel, UserProfile } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, User, Target, Activity, ShieldAlert } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8"
      >
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-1 w-full mx-1 rounded-full ${i <= step ? 'bg-brand-primary' : 'bg-slate-200'}`}
              />
            ))}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 1 && "Welcome! Let's get started"}
            {step === 2 && "What's your goal?"}
            {step === 3 && "Your fitness level"}
            {step === 4 && "Final details"}
          </h1>
          <p className="text-slate-500">We'll personalize your experience based on your profile.</p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none"
                  placeholder="Enter your name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => updateField('age', parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight_kg}
                    onChange={e => updateField('weight_kg', parseInt(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  value={formData.height_cm}
                  onChange={e => updateField('height_cm', parseInt(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-3">
              {(['weight_loss', 'muscle_gain', 'endurance', 'flexibility'] as FitnessGoal[]).map(goal => (
                <button
                  key={goal}
                  onClick={() => updateField('goal', goal)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.goal === goal ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <span className="block font-bold capitalize">{goal.replace('_', ' ')}</span>
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
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.level === level ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <span className="block font-bold capitalize">{level}</span>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {['Dumbbells', 'Barbell', 'Bench', 'Resistance Bands', 'None'].map(eq => (
                    <button
                      key={eq}
                      onClick={() => toggleItem('available_equipment', eq)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.available_equipment?.includes(eq) ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Injuries / Pain Areas</label>
                <div className="flex flex-wrap gap-2">
                  {['Knee', 'Lower Back', 'Shoulder', 'Wrist', 'None'].map(inj => (
                    <button
                      key={inj}
                      onClick={() => toggleItem('injuries', inj)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.injuries?.includes(inj) ? 'bg-brand-accent text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {inj}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Days per week</label>
                <input 
                  type="range" 
                  min="2" max="6" 
                  value={formData.days_per_week}
                  onChange={e => updateField('days_per_week', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>2 days</span>
                  <span>{formData.days_per_week} days</span>
                  <span>6 days</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={step === 1 && !formData.name}
            className="w-full py-4 gradient-bg text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {step === 4 ? "Create My Plan" : "Next Step"}
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
