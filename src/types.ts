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
  rest_seconds?: number;
  muscle_group?: string;
  difficulty?: number;
}

export interface WorkoutDay {
  day: string;
  session_type: string;
  exercises: Exercise[];
  is_rest_day?: boolean;
}

export interface WeeklyPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  sessions: WorkoutDay[];
  start_date: string;
  end_date: string;
}

export interface SessionLog {
  id: string;
  user_id: string;
  type: string;
  duration_mins: number;
  calories_burned: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: string;
  completed: boolean;
  notes: string;
}

export interface AppState {
  profile: UserProfile | null;
  sessions: SessionLog[];
  currentPlan: WeeklyPlan | null;
  loading: boolean;
}
