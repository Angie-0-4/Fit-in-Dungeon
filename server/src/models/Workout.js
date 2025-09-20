import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  equipment: String,
  difficulty: String,
  muscleGroup: String,
  type: String,
  exerciseType: String,
  riskLevel: String
}, { timestamps: true });

export const Workout = mongoose.model('Workout', workoutSchema);