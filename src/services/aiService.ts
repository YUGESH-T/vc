import { WeeklyPlan, SessionLog, WorkoutDay, UserProfile } from "../types";
import { addDays } from "date-fns";

// We use GROQ for plan generation as the key is provided in the environment
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function generateWorkoutPlan(
  profile: UserProfile,
  previousLogs: SessionLog[] = [],
): Promise<WeeklyPlan> {
  const completedSessions = previousLogs.filter(l => l.completed).length;
  const completionRate = previousLogs.length > 0 ? completedSessions / previousLogs.length : 1;

  const prompt = `
    You are an expert personal trainer and sports scientist.
    Generate a structural fitness training plan for the following user:
    ${JSON.stringify({
      name: profile.name,
      goal: profile.goal,
      level: profile.level,
      days_per_week: profile.days_per_week,
      injuries: profile.injuries,
      available_equipment: profile.available_equipment,
      completion_rate: completionRate,
    })}

    Constraints:
    - If injuries are present, avoid exercises that strain those areas.
    - If equipment is limited, only use available equipment.
    - Return ONLY a JSON object matching the WeeklyPlan interface.
    - Focus on high-intensity drills and recovery intervals.

    Interface:
    interface WeeklyPlan {
      title: string;
      description: string;
      sessions: {
        day: string;
        session_type: string;
        is_rest_day: boolean;
        exercises: { name: string; sets: number; reps: string; }[];
      }[];
    }
  `;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a fitness expert. Output JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      ...result,
      id: crypto.randomUUID(),
      user_id: profile.id,
      start_date: new Date().toISOString(),
      end_date: addDays(new Date(), 7).toISOString(),
    } as WeeklyPlan;
  } catch (error) {
    console.error("AI Plan Generation Error:", error);
    return createFallbackPlan(profile);
  }
}

function createFallbackPlan(profile: UserProfile): WeeklyPlan {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sessions: WorkoutDay[] = days.map((day, index) => {
    // Distribute workouts based on days_per_week
    const isRest = index >= (profile.days_per_week || 3);
    return {
      day,
      session_type: isRest ? "Rest & Recovery" : "Luminous Drill",
      is_rest_day: isRest,
      exercises: isRest ? [] : [
        { name: "Push Ups", sets: 3, reps: "12-15" },
        { name: "Plank Hold", sets: 3, reps: "45s" },
        { name: "Squats", sets: 3, reps: "15" }
      ]
    };
  });

  return {
    id: crypto.randomUUID(),
    user_id: profile.id,
    title: "Baseline Sync V1",
    description: "Reliable fallback trajectory while the AI recalibrates.",
    sessions,
    start_date: new Date().toISOString(),
    end_date: addDays(new Date(), 7).toISOString(),
  };
}
