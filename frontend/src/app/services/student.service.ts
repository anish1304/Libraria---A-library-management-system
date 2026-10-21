import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';
import { UserAccount } from '../models/libraria.models';

export interface Student {
  id: number;
  user_id?: number;
  username?: string;
  student_id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role?: string;
  department?: string;
  library: number;
  library_name: string;
  is_active: boolean;
  max_loans?: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  private mapUserToStudent(u: UserAccount): Student {
    return {
      id: u.id,
      user_id: u.id,
      username: u.username,
      student_id: u.student_id_no || `MEM-${u.id}`,
      name: u.name,
      email: u.email,
      phone: u.phone,
      address: u.address || '',
      role: u.role,
      department: u.department,
      library: u.library_id,
      library_name: u.library_name,
      is_active: u.is_active,
      max_loans: u.max_loans,
      created_at: u.created_at
    };
  }

  getStudents(search?: string, roleFilter?: string): Observable<Student[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);

    return this.http.get<Student[]>(this.apiUrl + '/', { params }).pipe(
      catchError(() => {
        let list = this.mockData.users();
        if (roleFilter && roleFilter !== 'all') {
          list = list.filter(u => u.role === roleFilter);
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(u =>
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            (u.student_id_no && u.student_id_no.toLowerCase().includes(s)) ||
            (u.department && u.department.toLowerCase().includes(s))
          );
        }
        return of(list.map(u => this.mapUserToStudent(u)));
      })
    );
  }

  createStudent(data: any): Observable<Student> {
    return this.http.post<Student>(this.apiUrl + '/', data).pipe(
      catchError(() => {
        const newId = this.mockData.users().length ? Math.max(...this.mockData.users().map(u => u.id)) + 1 : 1;
        const branch = this.mockData.libraries().find(l => l.id === Number(data.library)) || this.mockData.libraries()[0];
        const newUser: UserAccount = {
          id: newId,
          username: data.username || `user_${newId}`,
          name: data.name || 'New Member',
          email: data.email || `member${newId}@libraria.org`,
          phone: data.phone || '+1 (555) 000-0000',
          role: data.role || 'student',
          role_display: data.role === 'faculty' ? 'Faculty Member' : 'Student Scholar',
          student_id_no: data.student_id || `STU-2024-${1000 + newId}`,
          department: data.department || 'General Studies',
          library_id: branch.id,
          library_name: branch.name,
          is_active: data.is_active !== undefined ? data.is_active : true,
          max_loans: data.role === 'faculty' ? 12 : 5,
          max_renewals: data.role === 'faculty' ? 5 : 2,
          created_at: new Date().toISOString().split('T')[0]
        };
        this.mockData.users.update(list => [...list, newUser]);
        return of(this.mapUserToStudent(newUser));
      })
    );
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}/`).pipe(
      catchError(() => {
        const found = this.mockData.users().find(u => u.id === Number(id));
        if (found) {
          return of(this.mapUserToStudent(found));
        }
        return of(this.mapUserToStudent(this.mockData.users()[0]));
      })
    );
  }

  updateStudent(id: number, data: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.apiUrl}/${id}/`, data).pipe(
      catchError(() => {
        let updated: UserAccount | null = null;
        this.mockData.users.update(list => list.map(u => {
          if (u.id === Number(id)) {
            updated = {
              ...u,
              name: data.name ?? u.name,
              email: data.email ?? u.email,
              phone: data.phone ?? u.phone,
              student_id_no: data.student_id ?? u.student_id_no,
              is_active: data.is_active ?? u.is_active,
              department: data.department ?? u.department,
              library_id: data.library ? Number(data.library) : u.library_id
            };
            return updated;
          }
          return u;
        }));
        return of(this.mapUserToStudent(updated!));
      })
    );
  }
}
