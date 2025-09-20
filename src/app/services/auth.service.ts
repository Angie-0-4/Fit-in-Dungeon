// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface SessionUser { username: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: SessionUser | null = null;

  constructor(private api: ApiService) {
    // <- Persistenz beim App-Start
    const saved = localStorage.getItem('currentUser');
    if (saved) this.currentUser = JSON.parse(saved);
  }

  register(data: { username: string; password: string }): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/api/auth/register', data);
  }

  login(data: { username: string; password: string }): Observable<{ user: SessionUser }> {
    return this.api.post<{ user: SessionUser }>('/api/auth/login', data).pipe(
      tap(res => {
        this.currentUser = res.user;
        localStorage.setItem('currentUser', JSON.stringify(res.user)); // persistieren
      })
    );
  }

  me(): Observable<{ user: SessionUser }> {
    return this.api.get<{ user: SessionUser }>('/api/auth/me').pipe(
      tap(res => {
        this.currentUser = res.user;
        localStorage.setItem('currentUser', JSON.stringify(res.user));
      })
    );
  }

  logout(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/api/auth/logout', {}).pipe(
      tap(() => {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
      })
    );
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }
}