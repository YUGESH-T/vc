export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  goal: FitnessGoal;
  level: FitnessLevel;
  days_per_week: number;
  available_equipment: string[];
  injuries: string[];
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  muscle_group: string;
  difficulty: number;
  calories_per_set_approx: number;
  form_tip: string;
  met_value?: number;
}

export interface WorkoutDay {
  day: string;
  session_type: string;
  exercises: Exercise[];
  estimated_duration_mins: number;
  estimated_calories: number;
  is_rest_day?: boolean;
}

export interface WeeklyPlan {
  week_number: number;
  generated_at: string;
  goal_snapshot: FitnessGoal;
  level_snapshot: FitnessLevel;
  days: WorkoutDay[];
  adaptation_notes: string;
  next_week_hint: string;
  version: number;
}

export interface ExerciseLog {
  name: string;
  planned_sets: number;
  completed_sets: number;
  reps_per_set: number[];
  weight_kg: number | null;
  notes: string | null;
  skipped: boolean;
}

export interface SessionLog {
  id: string;
  week_number: number;
  day_name: string;
  started_at: string;
  completed_at: string | null;
  exercises: ExerciseLog[];
  session_completion_pct: number;
  calories_burned: number;
}

export interface AppState {
  profile: UserProfile | null;
  weeklyPlans: WeeklyPlan[];
  sessionLogs: SessionLog[];
}
