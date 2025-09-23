
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';

import authRouter from './routes/auth.js';
import workoutsRouter from './routes/workouts.js'; 

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(session({
  secret: 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

await mongoose.connect('mongodb://localhost:27017/muscle', { dbName: 'muscle' });
console.log('MongoDB connected');


app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter); 

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log('API running http://localhost:3000'));