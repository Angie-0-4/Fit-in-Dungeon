import 'dotenv/config';
import express from 'express';
import session from 'cookie-session';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';

const app = express();

// Middleware
app.use(express.json());
app.use(
  session({
    name: 'fid_sess',
    secret: process.env.SESSION_SECRET || 'muscleland-secret',
    sameSite: 'lax',
    maxAge: 7 * 24 * 3600 * 1000, // 7 Tage
  })
);

// MongoDB verbinden
await connectDB(process.env.MONGODB_URI);

// nach: await connectDB(process.env.MONGODB_URI);
import workoutsRouter from './routes/workouts.js';

app.use('/api/workouts', workoutsRouter);

// Health + Root
app.get('/', (_req, res) => res.send('✅ Server läuft, Mongo verbunden!'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// --- In-Memory-User (über Neustart weg) ---
const users = []; // [{ username, passwordHash }]

// REGISTER: POST /api/auth/register  { username, password }
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const exists = users.find(u => u.username.toLowerCase() === String(username).toLowerCase());
  if (exists) return res.status(409).json({ error: 'username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username: String(username), passwordHash });
  res.status(201).json({ message: 'Registered!' });
});

// LOGIN: POST /api/auth/login  { username, password } -> { user }
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const user = users.find(u => u.username.toLowerCase() === String(username).toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Wrong password' });

  req.session.user = { username: user.username };
  res.json({ user: req.session.user });
});

// ME: GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user: req.session.user });
});

// LOGOUT: POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out' });
});

// EINMAL listen, ganz unten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API running http://localhost:${PORT}`);
});
