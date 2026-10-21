import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError, switchMap, map, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';

export interface UserInfo {
  id: number;
  username: string;
  is_staff: boolean;
  role: 'admin' | 'librarian' | 'student' | 'faculty';
  display_role?: string;
  name?: string;
  student_name?: string;
  student_id?: string;
  student_pk?: number;
  library?: number;
  library_name?: string;
  email?: string;
  department?: string;
  membership_tier?: 'standard' | 'premium' | 'research';
}

const AUTH_STORAGE_KEY = 'libraria_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUser = signal<UserInfo | null>(null);
  isLoading = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private mockData: MockDataService
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser.set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not restore auth session:', e);
    }
  }

  private persistSession(user: UserInfo | null): void {
    this.currentUser.set(user);
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  adminLogin(username: string, password?: string): Observable<UserInfo> {
    this.isLoading.set(true);
    // Explicitly reset prior session to prevent guard redirect loops
    this.persistSession(null);

    return this.http.post<any>(`${this.apiUrl}/auth/admin-login/`, { username, password }).pipe(
      timeout(5000),
      map(res => {
        const userInfo: UserInfo = {
          id: res.id || 1,
          username: res.username || username,
          name: res.name || 'System Administrator',
          role: 'admin',
          is_staff: true,
          display_role: res.display_role || 'Super Administrator',
          email: res.email || 'admin@library.com'
        };
        this.persistSession(userInfo);
        this.isLoading.set(false);
        return userInfo;
      }),
      catchError(err => {
        this.isLoading.set(false);
        // If the backend returned an explicit auth error (400, 401, 403), propagate it
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          throw err;
        }
        // Fallback to offline mock authentication only if server is completely offline / timed out
        const mockUser = this.authenticateMockUser(username, ['super_admin', 'librarian']);
        this.persistSession(mockUser);
        return of(mockUser);
      })
    );
  }

  studentLogin(username: string, password?: string): Observable<UserInfo> {
    this.isLoading.set(true);
    this.persistSession(null);

    return this.http.post<any>(`${this.apiUrl}/auth/student-login/`, { username, password }).pipe(
      timeout(5000),
      map(res => {
        const userInfo: UserInfo = {
          id: res.id,
          username: res.username || username,
          role: 'student',
          name: res.name || res.student_name || 'Student',
          student_name: res.student_name || res.name || 'Student',
          student_id: res.student_id,
          student_pk: res.student_pk || res.id,
          library: res.library,
          library_name: res.library_name,
          email: res.email,
          is_staff: false,
          display_role: res.display_role || 'Registered Student Scholar'
        };
        this.persistSession(userInfo);
        this.isLoading.set(false);
        return userInfo;
      }),
      catchError(err => {
        this.isLoading.set(false);
        if (err.status === 400 || err.status === 401 || err.status === 403) {
          throw err;
        }
        const mockUser = this.authenticateMockUser(username, ['student', 'faculty']);
        this.persistSession(mockUser);
        return of(mockUser);
      })
    );
  }

  // Direct 1-click demo login helper for seamless switching
  demoLoginAs(role: 'admin' | 'librarian' | 'student' | 'faculty'): UserInfo {
    let username = 'admin';
    if (role === 'librarian') username = 'librarian';
    if (role === 'faculty') username = 'faculty';
    if (role === 'student') username = 'student';

    const user = this.authenticateMockUser(username, [role === 'admin' ? 'super_admin' : role]);
    this.persistSession(user);
    return user;
  }

  private authenticateMockUser(username: string, allowedRoles: string[]): UserInfo {
    const users = this.mockData.users();
    const cleanUsername = username.trim().toLowerCase();

    let account = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (!account) {
      // Find default matching role
      account = users.find(u => allowedRoles.includes(u.role)) || users[0];
    }

    const isStaff = account.role === 'super_admin' || account.role === 'librarian';
    const mappedRole: 'admin' | 'librarian' | 'student' | 'faculty' =
      account.role === 'super_admin' ? 'admin' : (account.role as any);

    return {
      id: account.id,
      username: account.username,
      name: account.name,
      student_name: account.name,
      student_id: account.student_id_no || `MEM-${account.id}`,
      student_pk: account.id,
      email: account.email,
      department: account.department,
      is_staff: isStaff,
      role: mappedRole,
      display_role: account.role_display,
      library: account.library_id,
      library_name: account.library_name
    };
  }

  logout(): Observable<any> {
    this.persistSession(null);
    return this.http.post(`${this.apiUrl}/auth/logout/`, {}).pipe(
      tap(() => {
        this.router.navigate(['/']);
      }),
      catchError(() => {
        this.router.navigate(['/']);
        return of(null);
      })
    );
  }

  loadCurrentUser(): Observable<UserInfo> {
    if (this.currentUser()) {
      return of(this.currentUser()!);
    }
    this.isLoading.set(true);
    return this.http.get<UserInfo>(`${this.apiUrl}/auth/me/`).pipe(
      tap(user => {
        this.persistSession(user);
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.isLoading.set(false);
        if (this.currentUser()) {
          return of(this.currentUser()!);
        }
        return of(this.demoLoginAs('admin'));
      })
    );
  }

  isAdmin(): boolean {
    const u = this.currentUser();
    return u?.role === 'admin' || u?.role === 'librarian' || u?.is_staff === true;
  }

  isLibrarian(): boolean {
    const u = this.currentUser();
    return u?.role === 'librarian';
  }

  isStudent(): boolean {
    const u = this.currentUser();
    return u?.role === 'student' || u?.role === 'faculty';
  }

  isFaculty(): boolean {
    const u = this.currentUser();
    return u?.role === 'faculty';
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
