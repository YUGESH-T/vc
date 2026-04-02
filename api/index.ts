import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserProfile, WeeklyPlan as IWeeklyPlan, SessionLog as ISessionLog } from '../src/types';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || '';
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected for Vercel'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Schemas
const ProfileSchema = new mongoose.Schema({
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
}, { strict: false });

const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: String,
  type: String,
  duration_mins: Number,
  calories_burned: Number,
  intensity: String,
  timestamp: String,
  notes: String,
  completed: Boolean,
}, { strict: false });

const PlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: String,
  title: String,
  description: String,
  sessions: [Object],
  start_date: String,
  end_date: String,
}, { strict: false });

interface IProfile extends mongoose.Document {
  id: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  goal: string;
  level: string;
  days_per_week: number;
  available_equipment: string[];
  injuries: string[];
  created_at: string;
  updated_at: string;
}

interface ISessionDoc extends mongoose.Document {
  id: string;
  user_id: string;
  type: string;
  duration_mins: number;
  calories_burned: number;
  intensity: string;
  timestamp: string;
  notes: string;
  completed: boolean;
}

interface IPlanDoc extends mongoose.Document {
  id: string;
  user_id: string;
  title: string;
  description: string;
  sessions: any[];
  start_date: string;
  end_date: string;
}

const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
const Session = mongoose.models.Session || mongoose.model<ISessionDoc>('Session', SessionSchema);
const Plan = mongoose.models.Plan || mongoose.model<IPlanDoc>('Plan', PlanSchema);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Luminous API Operational', timestamp: new Date().toISOString() });
});

// Profile Endpoints
app.get('/api/profile/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Database processing error' });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { id: req.body.id },
      { ...req.body, updated_at: new Date().toISOString() },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize profile' });
  }
});

// Session Endpoints
app.get('/api/sessions/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.params.userId }).sort({ timestamp: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// Plan Endpoints
app.get('/api/plans/:userId', async (req, res) => {
  try {
    const plans = await Plan.find({ user_id: req.params.userId }).sort({ start_date: -1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate plan' });
  }
});

// Export for Vercel
export default app;
