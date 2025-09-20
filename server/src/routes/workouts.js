import { Router } from 'express';
import { Workout } from '../models/Workout.js';

const router = Router();

router.get('/', async (_req, res) => {
  const list = await Workout.find({}).sort({ name: 1 }).lean();
  res.json(list);
});

export default router;