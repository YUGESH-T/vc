import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserProfile, WeeklyPlan as IWeeklyPlan, SessionLog as ISessionLog } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI not found in .env");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const profileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  age: Number,
  weight_kg: Number,
  height_cm: Number,
  goal: String,
  level: String,
  days_per_week: Number,
  available_equipment: [String],
  injuries: [String],
  created_at: String,
  updated_at: String,
});

const weeklyPlanSchema = new mongoose.Schema({
  week_number: Number,
  generated_at: String,
  goal_snapshot: String,
  level_snapshot: String,
  days: [mongoose.Schema.Types.Mixed],
  adaptation_notes: String,
  next_week_hint: String,
  version: Number,
}, { strict: false });

const sessionLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  week_number: Number,
  day_name: String,
  started_at: String,
  completed_at: String,
  exercises: [mongoose.Schema.Types.Mixed],
  session_completion_pct: Number,
  calories_burned: Number,
}, { strict: false });

const Profile = mongoose.model('Profile', profileSchema);
const WeeklyPlan = mongoose.model('WeeklyPlan', weeklyPlanSchema);
const SessionLog = mongoose.model('SessionLog', sessionLogSchema);

// API Routes

// Profile
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({ updated_at: -1 });
    res.json(profile || null);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const profileData = req.body;
    const profile = await Profile.findOneAndUpdate(
      { id: profileData.id },
      { ...profileData, updated_at: new Date().toISOString() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Weekly Plans
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await WeeklyPlan.find().sort({ week_number: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const planData = req.body;
    const plan = await WeeklyPlan.findOneAndUpdate(
      { week_number: planData.week_number },
      planData,
      { upsert: true, new: true }
    );
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Session Logs
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await SessionLog.find().sort({ started_at: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    const session = await SessionLog.findOneAndUpdate(
      { id: sessionData.id },
      sessionData,
      { upsert: true, new: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Reset Data
app.post('/api/reset', async (req, res) => {
  try {
    await Profile.deleteMany({});
    await WeeklyPlan.deleteMany({});
    await SessionLog.deleteMany({});
    res.json({ message: 'Data reset successfully' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
