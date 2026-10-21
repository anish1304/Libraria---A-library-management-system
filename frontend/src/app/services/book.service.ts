import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';
import { BookTitle, BookCopy } from '../models/libraria.models';

export interface Book {
  id: number;
  title: string;
  subtitle?: string;
  author: string;
  authors?: string[];
  isbn: string;
  isbn13?: string;
  publisher?: string;
  publication_year?: number;
  edition?: string;
  language?: string;
  categories?: string[];
  description?: string;
  format?: string;
  pages?: number;
  shelf_location?: string;
  total_copies: number;
  available_copies: number;
  library: number;
  library_name: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(
    private http: HttpClient,
    private mockData: MockDataService
  ) {}

  private mapTitleToBook(b: BookTitle): Book {
    return {
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      author: b.authors.join(', '),
      authors: b.authors,
      isbn: b.isbn,
      isbn13: b.isbn13,
      publisher: b.publisher,
      publication_year: b.publication_year,
      edition: b.edition,
      language: b.language,
      categories: b.categories,
      description: b.description,
      format: b.format,
      pages: b.pages,
      shelf_location: b.shelf_location,
      total_copies: b.total_copies,
      available_copies: b.available_copies,
      library: b.library_id,
      library_name: b.library_name,
      created_at: b.created_at
    };
  }

  getBooks(search?: string, library?: number): Observable<Book[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (library) params = params.set('library', library.toString());

    return this.http.get<Book[]>(this.apiUrl + '/', { params }).pipe(
      catchError(() => {
        // Fallback to in-memory mock store
        let list = this.mockData.books();
        if (library) {
          list = list.filter(b => b.library_id === Number(library));
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(b =>
            b.title.toLowerCase().includes(s) ||
            b.isbn.toLowerCase().includes(s) ||
            b.authors.some(a => a.toLowerCase().includes(s)) ||
            (b.categories && b.categories.some(c => c.toLowerCase().includes(s)))
          );
        }
        return of(list.map(b => this.mapTitleToBook(b)));
      })
    );
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}/`).pipe(
      catchError(() => {
        const found = this.mockData.books().find(b => b.id === Number(id));
        if (found) {
          return of(this.mapTitleToBook(found));
        }
        return of(this.mapTitleToBook(this.mockData.books()[0]));
      })
    );
  }

  createBook(data: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.apiUrl + '/', data).pipe(
      catchError(() => {
        const authors = data.author ? data.author.split(',').map(a => a.trim()) : (data.authors || ['Unknown Author']);
        const titlePayload: Partial<BookTitle> = {
          title: data.title,
          subtitle: data.subtitle,
          isbn: data.isbn,
          authors,
          publisher: data.publisher,
          publication_year: data.publication_year,
          edition: data.edition,
          language: data.language,
          categories: data.categories,
          description: data.description,
          shelf_location: data.shelf_location,
          total_copies: Number(data.total_copies || 1),
          library_id: Number(data.library || 1)
        };
        const created = this.mockData.saveBookTitle(titlePayload, 'Dr. Arthur Pendelton', 'super_admin');
        return of(this.mapTitleToBook(created));
      })
    );
  }

  updateBook(id: number, data: Partial<Book>): Observable<Book> {
    return this.http.patch<Book>(`${this.apiUrl}/${id}/`, data).pipe(
      catchError(() => {
        const authors = data.author ? data.author.split(',').map(a => a.trim()) : data.authors;
        const titlePayload: Partial<BookTitle> = {
          id: Number(id),
          title: data.title,
          subtitle: data.subtitle,
          isbn: data.isbn,
          authors: authors,
          publisher: data.publisher,
          publication_year: data.publication_year,
          edition: data.edition,
          language: data.language,
          categories: data.categories,
          description: data.description,
          shelf_location: data.shelf_location,
          total_copies: data.total_copies !== undefined ? Number(data.total_copies) : undefined,
          library_id: data.library !== undefined ? Number(data.library) : undefined
        };
        const updated = this.mockData.saveBookTitle(titlePayload, 'Dr. Arthur Pendelton', 'super_admin');
        return of(this.mapTitleToBook(updated));
      })
    );
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      catchError(() => {
        this.mockData.deleteBookTitle(Number(id), 'Dr. Arthur Pendelton', 'super_admin');
        return of(undefined);
      })
    );
  }

  // Physical copies helper
  getCopies(bookId: number): BookCopy[] {
    return this.mockData.copies().filter(c => c.book_id === Number(bookId));
  }

  addCopy(bookId: number, libraryId: number, shelfLocation: string, condition: 'Mint' | 'Good' | 'Fair' | 'Damaged'): BookCopy {
    return this.mockData.addPhysicalCopy(bookId, libraryId, shelfLocation, condition, 'Dr. Arthur Pendelton', 'super_admin');
  }

  updateCopyStatus(copyId: number, status: any, condition: any): void {
    this.mockData.updateCopyStatus(copyId, status, condition);
  }
}
