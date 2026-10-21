import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';

export interface DashboardStats {
  total_books: number;
  total_copies: number;
  available_copies: number;
  total_students: number;
  total_libraries: number;
  issued_books: number;
  overdue_books: number;
  pending_reservations: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats/`).pipe(
      catchError(() => {
        const books = this.mockData.books();
        const copies = this.mockData.copies();
        const users = this.mockData.users();
        const loans = this.mockData.loans();
        const libraries = this.mockData.libraries();
        const reservations = this.mockData.reservations();

        const totalCopies = copies.length || books.reduce((acc, b) => acc + (b.total_copies || 0), 0);
        const availableCopies = copies.filter(c => c.status === 'Available').length ||
          books.reduce((acc, b) => acc + (b.available_copies || 0), 0);
        const issuedBooks = loans.filter(l => l.status === 'Issued').length;
        const overdueBooks = loans.filter(l => l.status === 'Issued' && l.is_overdue).length;
        const pendingReservations = reservations.filter(r => r.status === 'Waiting' || r.status === 'Ready for Pickup').length;

        const stats: DashboardStats = {
          total_books: books.length,
          total_copies: totalCopies,
          available_copies: availableCopies,
          total_students: users.filter(u => u.role === 'student' || u.role === 'faculty').length,
          total_libraries: libraries.length,
          issued_books: issuedBooks,
          overdue_books: overdueBooks,
          pending_reservations: pendingReservations
        };
        return of(stats);
      })
    );
  }
}
