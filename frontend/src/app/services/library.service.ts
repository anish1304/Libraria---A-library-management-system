import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';
import { LibraryBranch } from '../models/libraria.models';

export interface Library {
  id: number;
  name: string;
  code?: string;
  address: string;
  city: string;
  contact_email?: string;
  contact_phone?: string;
  opening_hours?: string;
  status?: string;
  total_books?: number;
  active_members?: number;
  current_loans?: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private apiUrl = `${environment.apiUrl}/libraries`;

  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  private mapBranchToLibrary(b: LibraryBranch): Library {
    return {
      id: b.id,
      name: b.name,
      code: b.code,
      address: b.address,
      city: b.city,
      contact_email: b.contact_email,
      contact_phone: b.contact_phone,
      opening_hours: b.opening_hours,
      status: b.status,
      total_books: b.total_books,
      active_members: b.active_members,
      current_loans: b.current_loans,
      created_at: b.created_at
    };
  }

  getLibraries(): Observable<Library[]> {
    return this.http.get<Library[]>(this.apiUrl + '/').pipe(
      catchError(() => {
        return of(this.mockData.libraries().map(b => this.mapBranchToLibrary(b)));
      })
    );
  }

  createLibrary(data: Partial<Library>): Observable<Library> {
    return this.http.post<Library>(this.apiUrl + '/', data).pipe(
      catchError(() => {
        const newId = this.mockData.libraries().length ? Math.max(...this.mockData.libraries().map(l => l.id)) + 1 : 1;
        const newBranch: LibraryBranch = {
          id: newId,
          name: data.name || 'New Branch',
          code: data.code || `LIB-${newId}`,
          address: data.address || '',
          city: data.city || 'Metropolis',
          contact_email: data.contact_email || 'branch@libraria.edu',
          contact_phone: data.contact_phone || '+1 (555) 000-0000',
          opening_hours: data.opening_hours || 'Mon-Fri 08:00 - 20:00',
          status: 'Active',
          total_books: 0,
          active_members: 0,
          current_loans: 0,
          created_at: new Date().toISOString().split('T')[0]
        };
        this.mockData.libraries.update(list => [...list, newBranch]);
        return of(this.mapBranchToLibrary(newBranch));
      })
    );
  }

  updateLibrary(id: number, data: Partial<Library>): Observable<Library> {
    return this.http.patch<Library>(`${this.apiUrl}/${id}/`, data).pipe(
      catchError(() => {
        let updated: LibraryBranch | null = null;
        this.mockData.libraries.update(list => list.map(l => {
          if (l.id === Number(id)) {
            updated = { ...l, ...data } as LibraryBranch;
            return updated;
          }
          return l;
        }));
        return of(this.mapBranchToLibrary(updated!));
      })
    );
  }

  deleteLibrary(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      catchError(() => {
        this.mockData.libraries.update(list => list.filter(l => l.id !== Number(id)));
        return of(undefined);
      })
    );
  }
}
