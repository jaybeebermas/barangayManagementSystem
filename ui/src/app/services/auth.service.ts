import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/graphql';
  private readonly router = inject(Router);
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(!!localStorage.getItem('auth_token'));

  constructor(private http: HttpClient) {
    this.checkAuth();
    // Monitor session expiration every 30 seconds
    setInterval(() => this.checkAuth(), 30000);
  }

  login(username: string, password: string): Observable<any> {
    const query = `
      mutation Login($username: String!, $password: String!) {
        login(input: { username: $username, password: $password }) {
          status
          message
          token
          user {
            id
            username
            first_name
            last_name
            email
            role
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: { username, password }
    }).pipe(
      tap(response => {
        const data = response.data?.login;
        if (data && data.status === 'SUCCESS') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_timestamp', Date.now().toString());
          this.currentUser.set(data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  register(input: any): Observable<any> {
    const query = `
      mutation Register($username: String!, $first_name: String!, $last_name: String!, $email: String!, $password: String!) {
        register(input: { 
          username: $username, 
          first_name: $first_name, 
          last_name: $last_name, 
          email: $email, 
          password: $password 
        }) {
          status
          message
          token
          user {
            id
            username
            first_name
            last_name
            email
            role
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, {
      query,
      variables: input
    }).pipe(
      tap(response => {
        const data = response.data?.register;
        if (data && data.status === 'SUCCESS') {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_timestamp', Date.now().toString());
          this.currentUser.set(data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): Observable<any> {
    const query = `
      mutation {
        logout {
          status
          message
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query }).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_timestamp');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        // Even if server call fails, clear local state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_timestamp');
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  checkAuth(): void {
    const token = localStorage.getItem('auth_token');
    const timestampStr = localStorage.getItem('auth_timestamp');

    if (!token) {
      this.logout().subscribe();
      return;
    }

    // If timestamp is missing but token is present, initialize it (migration)
    if (!timestampStr) {
      localStorage.setItem('auth_timestamp', Date.now().toString());
      return this.checkAuth();
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const expiry = 30 * 60 * 1000;
    const elapsed = now - timestamp;

    if (elapsed > expiry) {
      console.warn('Session expired (5 minute limit).');
      this.logout().subscribe();
      return;
    }

    // Refresh timestamp to extend session (sliding expiration)
    localStorage.setItem('auth_timestamp', now.toString());

    const query = `
      query {
        me {
          id
          username
          first_name
          last_name
          email
          role
        }
      }
    `;

    this.http.post<any>(this.apiUrl, { query }).subscribe({
      next: (response) => {
        if (response.data?.me) {
          this.currentUser.set(response.data.me);
          this.isAuthenticated.set(true);
        } else {
          console.error('Session invalid on server.');
          this.logout().subscribe();
        }
      },
      error: (err) => {
        console.error('Auth check failed:', err);
        // Only logout if it's an auth error (401), not a network error
        if (err.status === 401 || err.status === 403) {
          this.logout().subscribe();
        }
      }
    });
  }
}
