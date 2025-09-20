import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Typ, wie er aus Mongo kommt */
export interface Workout {
  _id: string;
  name: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscleGroup: string;
  type: 'Push' | 'Pull' | 'Legs' | 'Core' | 'Full Body' | 'Conditioning';
  exerciseType: 'Strength' | 'Hypertrophy' | 'Mobility' | 'Endurance';
  riskLevel: 'Low' | 'Medium' | 'High';
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  constructor(private http: HttpClient) {}
  list(): Observable<Workout[]> {
    return this.http.get<Workout[]>('/api/workouts');
  }
}