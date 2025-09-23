
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export type Gender = 'sir' | 'lady';

export interface SessionUser {
  id: string;
  username: string;
  gender: Gender | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser: SessionUser | null;

  constructor(private api: ApiService) {
    const saved = localStorage.getItem('currentUser');
    this.currentUser = saved ? JSON.parse(saved) : null;
  }


  private save(u: SessionUser | null): void {
    this.currentUser = u;
    if (u) localStorage.setItem('currentUser', JSON.stringify(u));
    else   localStorage.removeItem('currentUser');
  }

 
  register(data: { username: string; password: string; gender?: Gender }): Observable<{ message: string; user?: SessionUser }> {
    return this.api.post<{ message: string; user?: SessionUser }>('/api/auth/register', data)
      .pipe(
        tap(res => { if (res.user) this.save(res.user); })
      );
  }

 
  login(data: { username: string; password: string }): Observable<{ user: SessionUser }> {
    return this.api.post<{ user: SessionUser }>('/api/auth/login', data)
      .pipe(
        tap(res => this.save(res.user)),
        catchError(err => { this.save(null); return throwError(() => err); })
      );
  }


  me(): Observable<{ user: SessionUser }> {
    return this.api.get<{ user: SessionUser }>('/api/auth/me')
      .pipe(tap(res => this.save(res.user)));
  }

 
  logout(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/api/auth/logout', {})
      .pipe(tap(() => this.save(null)));
  }

 
  setGender(gender: Gender): Observable<{ user: SessionUser }> {
    return this.api.post<{ user: SessionUser }>('/api/auth/gender', { gender })
      .pipe(tap(res => this.save(res.user)));
  }

 
  isLoggedIn(): boolean { return !!this.currentUser; }
}