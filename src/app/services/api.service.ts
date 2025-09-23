import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(this.API + url, { withCredentials: true })
      .pipe(catchError(this.handle));
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(this.API + url, body, { withCredentials: true })
      .pipe(catchError(this.handle));
  }

  private handle(err: HttpErrorResponse) {
    const msg = (err.error && (err.error.error || err.error.message)) || err.message || 'Request failed';
    return throwError(() => ({ ...err, message: msg }));
  }
}