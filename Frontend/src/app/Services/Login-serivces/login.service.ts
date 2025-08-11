import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface LoginResponse {
  message: string;
  user?: { id: number; email: string; firstname: string };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/api/login';
  private isLoggedIn = false;
  private currentUser: LoginResponse['user'] | null = null;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.isLoggedIn = true;
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password }).pipe(
      tap(response => {
        if (response.user) {
          this.isLoggedIn = true;
          this.currentUser = response.user;
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }),
      map(response => !!response.user),
      catchError(err => {
        console.error('Login failed:', err);
        return of(false);
      })
    );
  }

  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedInUser() {
    return this.isLoggedIn;
  }
}
