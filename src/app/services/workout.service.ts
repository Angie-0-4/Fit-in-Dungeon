import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Workout {
  _id: string;
  name: string;
  equipment?: string;
  difficulty?: string;
  muscleGroup?: string;
  type?: string;
  exerciseType?: string;
  riskLevel?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly base = 'http://localhost:3000/api/workouts';

  constructor(private http: HttpClient) {}

  
  list(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.base);
  }

  
  get(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.base}/${id}`);
  }

 
  create(ex: Partial<Workout>): Observable<Workout> {
    return this.http.post<Workout>(this.base, ex);
  }

  
  update(id: string, ex: Partial<Workout>): Observable<Workout> {
    return this.http.put<Workout>(`${this.base}/${id}`, ex);
  }

  
  remove(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/${id}`);
  }
}
