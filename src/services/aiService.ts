import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WeeklyPlan, SessionLog } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateWorkoutPlan(
  profile: UserProfile,
  weekNumber: number,
  previousLogs: SessionLog[] = [],
  previousPlan?: WeeklyPlan
): Promise<WeeklyPlan> {
  const model = "gemini-3.1-pro-preview";
  
  const lastWeekCompletion = previousLogs.length > 0 
    ? previousLogs.reduce((acc, log) => acc + log.session_completion_pct, 0) / previousLogs.length 
    : 0;

  const prompt = `
    You are an expert personal trainer and sports scientist.
    Generate a structured weekly workout plan for the following user:
    ${JSON.stringify({
      goal: profile.goal,
      level: profile.level,
      days_per_week: profile.days_per_week,
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      injuries: profile.injuries,
      available_equipment: profile.available_equipment,
      week_number: weekNumber,
      last_week_completion_pct: lastWeekCompletion,
    })}

    Constraints:
    - If injuries are present, avoid exercises that strain those areas.
    - If equipment is limited, only use available equipment.
    - Adapt the plan based on last week's completion percentage (${lastWeekCompletion}%).
    - If completion was > 85%, increase difficulty slightly.
    - If completion was < 60%, decrease difficulty.
    - Provide 7 days of schedule, marking rest days as is_rest_day: true.
    - Return ONLY a JSON object matching the WeeklyPlan interface.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            week_number: { type: Type.NUMBER },
            generated_at: { type: Type.STRING },
            goal_snapshot: { type: Type.STRING },
            level_snapshot: { type: Type.STRING },
            adaptation_notes: { type: Type.STRING },
            next_week_hint: { type: Type.STRING },
            version: { type: Type.NUMBER },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  session_type: { type: Type.STRING },
                  is_rest_day: { type: Type.BOOLEAN },
                  estimated_duration_mins: { type: Type.NUMBER },
                  estimated_calories: { type: Type.NUMBER },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        rest_seconds: { type: Type.NUMBER },
                        muscle_group: { type: Type.STRING },
                        difficulty: { type: Type.NUMBER },
                        calories_per_set_approx: { type: Type.NUMBER },
                        form_tip: { type: Type.STRING },
                      },
                      required: ["name", "sets", "reps", "rest_seconds", "muscle_group", "difficulty", "calories_per_set_approx", "form_tip"]
                    }
                  }
                },
                required: ["day", "session_type", "exercises", "estimated_duration_mins", "estimated_calories"]
              }
            }
          },
          required: ["week_number", "generated_at", "goal_snapshot", "level_snapshot", "days", "adaptation_notes", "next_week_hint", "version"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as WeeklyPlan;
  } catch (error) {
    console.error("AI Plan Generation Error:", error);
    // Fallback logic if AI fails
    return createFallbackPlan(profile, weekNumber);
  }
}

function createFallbackPlan(profile: UserProfile, weekNumber: number): WeeklyPlan {
  // Simple rule-based fallback
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const workoutDays = days.map((day, index) => {
    const isRest = index % 2 !== 0;
    return {
      day,
      session_type: isRest ? "Rest" : "General Fitness",
      is_rest_day: isRest,
      estimated_duration_mins: isRest ? 0 : 45,
      estimated_calories: isRest ? 0 : 300,
      exercises: isRest ? [] : [
        {
          name: "Push Ups",
          sets: 3,
          reps: "10-12",
          rest_seconds: 60,
          muscle_group: "Chest",
          difficulty: 3,
          calories_per_set_approx: 10,
          form_tip: "Keep your back straight"
        }
      ]
    };
  });

  return {
    week_number: weekNumber,
    generated_at: new Date().toISOString(),
    goal_snapshot: profile.goal,
    level_snapshot: profile.level,
    days: workoutDays,
    adaptation_notes: "Generated using fallback logic due to connection issues.",
    next_week_hint: "Keep it up!",
    version: 1
  };
}
