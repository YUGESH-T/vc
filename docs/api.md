# Lumina Wellness API Documentation

## Profile Endpoints

### GET /api/profile
Description: Retrieve the latest user profile.

curl -X GET http://localhost:5000/api/profile

Sample Response (200):
{
  "id": "abc-123",
  "name": "John Doe",
  "age": 25,
  "weight_kg": 75,
  "height_cm": 180,
  "goal": "muscle_gain",
  "level": "intermediate",
  "days_per_week": 4,
  "available_equipment": ["Dumbbells", "Bench"],
  "injuries": [],
  "created_at": "2024-03-20T10:00:00Z",
  "updated_at": "2024-03-20T10:00:00Z"
}

### POST /api/profile
Description: Create or update a user profile.

curl -X POST http://localhost:5000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "id": "abc-123",
    "name": "John Doe",
    "age": 25,
    "weight_kg": 78,
    "height_cm": 180,
    "goal": "muscle_gain",
    "level": "intermediate",
    "days_per_week": 4,
    "available_equipment": ["Dumbbells", "Bench"],
    "injuries": []
  }'

Sample Response (200):
{ "id": "abc-123", "status": "updated" }

---

## Workout Plan Endpoints

### GET /api/plans
Description: Retrieve all weekly workout plans.

curl -X GET http://localhost:5000/api/plans

Sample Response (200):
[
  {
    "week_number": 1,
    "days": [...]
  }
]

### POST /api/plans
Description: Create or update a weekly workout plan.

curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "week_number": 1,
    "days": [...]
  }'

---

## Session Log Endpoints

### GET /api/sessions
Description: Personal workout session history.

curl -X GET http://localhost:5000/api/sessions

### POST /api/sessions
Description: Log a completed or active workout session.

curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid",
    "week_number": 1,
    "day_name": "Monday",
    "calories_burned": 350
  }'
