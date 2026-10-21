import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';
import { LoanRecord } from '../models/libraria.models';

export interface Loan {
  id: number;
  book: number;
  book_title: string;
  book_author: string;
  book_isbn?: string;
  copy_id?: number;
  copy_barcode?: string;
  student: number;
  student_name: string;
  student_id_no: string;
  student_email?: string;
  library_name?: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: 'Issued' | 'Returned';
  is_overdue: boolean;
  overdue_days?: number;
  renewal_count?: number;
  max_renewals?: number;
  fine_amount?: number;
  fine_paid?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(
    private http: HttpClient,
    private mockData: MockDataService,
    private auth: AuthService
  ) {}

  private mapRecordToLoan(r: LoanRecord): Loan {
    return {
      id: r.id,
      book: r.book_id,
      book_title: r.book_title,
      book_author: r.book_author,
      book_isbn: r.book_isbn,
      copy_id: r.copy_id,
      copy_barcode: r.copy_barcode,
      student: r.member_id,
      student_name: r.member_name,
      student_id_no: r.member_id_no,
      student_email: r.member_email,
      library_name: r.library_name,
      issue_date: r.issue_date,
      due_date: r.due_date,
      return_date: r.return_date,
      status: r.status,
      is_overdue: r.is_overdue,
      overdue_days: r.overdue_days,
      renewal_count: r.renewal_count,
      max_renewals: r.max_renewals,
      fine_amount: r.fine_amount,
      fine_paid: r.fine_paid
    };
  }

  getLoans(statusFilter?: string, overdue?: boolean): Observable<Loan[]> {
    let params = new HttpParams();
    if (statusFilter) params = params.set('status', statusFilter);
    if (overdue) params = params.set('overdue', 'true');

    return this.http.get<Loan[]>(this.apiUrl + '/', { params }).pipe(
      catchError(() => {
        let list = this.mockData.loans();
        if (statusFilter) {
          list = list.filter(l => l.status.toLowerCase() === statusFilter.toLowerCase());
        }
        if (overdue) {
          list = list.filter(l => l.is_overdue);
        }
        return of(list.map(l => this.mapRecordToLoan(l)));
      })
    );
  }

  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${environment.apiUrl}/my-loans/`).pipe(
      catchError(() => {
        const currentUser = this.auth.currentUser();
        const memberId = currentUser?.id || 5; // Default to Alexandria Morgan if not logged in
        const list = this.mockData.loans().filter(l => l.member_id === memberId);
        return of(list.map(l => this.mapRecordToLoan(l)));
      })
    );
  }

  issueBook(bookId: number, studentId: number, dueDate: string, copyBarcode?: string): Observable<Loan> {
    const actor = this.auth.currentUser();
    const actorName = actor?.name || 'Staff Librarian';
    const actorRole = (actor?.role === 'admin' ? 'super_admin' : 'librarian') as any;

    // Find available copy barcode if not explicitly supplied
    let barcodeToUse = copyBarcode;
    if (!barcodeToUse) {
      const availableCopy = this.mockData.copies().find(c => c.book_id === Number(bookId) && c.status === 'Available');
      barcodeToUse = availableCopy?.barcode || 'BC-1001';
    }

    return this.http.post<Loan>(`${this.apiUrl}/issue/`, {
      book_id: bookId,
      student_id: studentId,
      due_date: dueDate
    }).pipe(
      catchError(() => {
        const res = this.mockData.issueLoan(
          Number(bookId),
          barcodeToUse!,
          Number(studentId),
          dueDate,
          actorName,
          actorRole
        );
        if (res.success && res.loan) {
          return of(this.mapRecordToLoan(res.loan));
        }
        throw new Error(res.message);
      })
    );
  }

  returnBook(loanId: number): Observable<Loan> {
    const actor = this.auth.currentUser();
    const actorName = actor?.name || 'Staff Librarian';
    const actorRole = (actor?.role === 'admin' ? 'super_admin' : 'librarian') as any;

    return this.http.post<Loan>(`${this.apiUrl}/${loanId}/return/`, {}).pipe(
      catchError(() => {
        const res = this.mockData.returnLoan(Number(loanId), actorName, actorRole);
        if (res.success && res.loan) {
          return of(this.mapRecordToLoan(res.loan));
        }
        throw new Error(res.message);
      })
    );
  }

  renewBook(loanId: number): Observable<Loan> {
    const actor = this.auth.currentUser();
    const actorName = actor?.name || 'Member Self-Service';
    const actorRole = (actor?.role || 'student') as any;

    return this.http.post<Loan>(`${this.apiUrl}/${loanId}/renew/`, {}).pipe(
      catchError(() => {
        const res = this.mockData.renewLoan(Number(loanId), actorName, actorRole);
        if (res.success) {
          const updated = this.mockData.loans().find(l => l.id === Number(loanId));
          if (updated) return of(this.mapRecordToLoan(updated));
        }
        throw new Error(res.message);
      })
    );
  }
}
