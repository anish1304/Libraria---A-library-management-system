import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../../services/book.service';
import { LibraryService, Library } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    StatusBadgeComponent, 
    LoadingSkeletonComponent, 
    EmptyStateComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="book-management-page">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">Book Inventory</h3>
          <p class="text-secondary mb-0">Manage cataloguing, stock counts, and branch allocations.</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="badge bg-primary-subtle text-primary py-2 px-3 fw-bold">
            Total Books: {{ filteredBooks().length }}
          </span>
          <a routerLink="/admin/books/new" class="btn-saas-primary">
            <i class="bi bi-plus-lg"></i>
            <span>Add New Book</span>
          </a>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="saas-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-lg-4 col-md-6">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input id="book-search" 
                     type="text" 
                     class="form-control-saas" 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="applyFilters()" 
                     placeholder="Search title, author, or ISBN...">
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <select class="form-select-saas" [(ngModel)]="selectedLibrary" (ngModelChange)="applyFilters()">
              <option value="">All Library Branches</option>
              <option *ngFor="let lib of libraries()" [value]="lib.id">{{ lib.name }} ({{ lib.city }})</option>
            </select>
          </div>

          <div class="col-lg-3 col-md-6">
            <select class="form-select-saas" [(ngModel)]="availabilityFilter" (ngModelChange)="applyFilters()">
              <option value="">All Availability</option>
              <option value="available">In Stock (Available > 0)</option>
              <option value="unavailable">Out of Stock (0 Available)</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6 text-lg-end">
            <button type="button" class="btn-saas-secondary w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div class="saas-card" *ngIf="loading()">
        <app-loading-skeleton type="table" [count]="5"></app-loading-skeleton>
      </div>

      <!-- Empty State -->
      <div class="saas-card" *ngIf="!loading() && filteredBooks().length === 0">
        <app-empty-state 
          icon="bi-book" 
          title="No books match criteria" 
          message="Try adjusting your search terms or clearing your library branch filter."
          actionText="Add New Book"
          actionLink="/admin/books/new">
        </app-empty-state>
      </div>

      <!-- Books Data Table -->
      <div class="saas-table-container" *ngIf="!loading() && filteredBooks().length > 0">
        <table class="saas-table">
          <thead>
            <tr>
              <th>Book Details</th>
              <th>ISBN</th>
              <th>Branch</th>
              <th>Total Copies</th>
              <th>Available</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let book of filteredBooks()">
              <!-- Book & Author -->
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="book-cover-mock" [style.background]="getCoverGradient(book.id)">
                    {{ getInitials(book.title) }}
                  </div>
                  <div>
                    <div class="fw-bold fs-6">{{ book.title }}</div>
                    <div class="text-secondary small">{{ book.author }}</div>
                  </div>
                </div>
              </td>

              <!-- ISBN -->
              <td>
                <span class="font-monospace small px-2 py-1 bg-surface-hover border rounded">
                  {{ book.isbn }}
                </span>
              </td>

              <!-- Library -->
              <td>
                <span class="fw-medium text-secondary">
                  <i class="bi bi-building me-1 small"></i>{{ book.library_name }}
                </span>
              </td>

              <!-- Total Copies -->
              <td class="fw-semibold">{{ book.total_copies }}</td>

              <!-- Available Copies -->
              <td>
                <div class="d-flex align-items-center gap-2">
                  <span class="fw-bold" [class.text-success]="book.available_copies > 0" [class.text-danger]="book.available_copies === 0">
                    {{ book.available_copies }}
                  </span>
                  <span class="text-tertiary small">/ {{ book.total_copies }}</span>
                </div>
              </td>

              <!-- Status Badge -->
              <td>
                <app-status-badge 
                  [status]="book.available_copies > 0 ? 'Available' : 'Out of Stock'"
                  [text]="book.available_copies > 0 ? 'Available' : 'Out of Stock'">
                </app-status-badge>
              </td>

              <!-- Row Actions -->
              <td class="text-end">
                <div class="d-inline-flex gap-1">
                  <!-- View Details Button -->
                  <button type="button" class="btn-icon-custom" (click)="viewBook(book)" title="View Details">
                    <i class="bi bi-eye"></i>
                  </button>
                  <!-- Edit Button -->
                  <a [routerLink]="['/admin/books/edit', book.id]" class="btn-icon-custom text-primary" title="Edit Book">
                    <i class="bi bi-pencil"></i>
                  </a>
                  <!-- Delete Button -->
                  <button type="button" class="btn-icon-custom text-danger" (click)="promptDelete(book)" title="Delete Book">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Book View Details Modal -->
      <div *ngIf="selectedBookForView" class="modal-backdrop-custom" (click)="closeViewModal($event)">
        <div class="modal-dialog-custom">
          <div class="modal-header-custom">
            <h5 class="mb-0 fw-bold">Book Specification</h5>
            <button type="button" class="btn-icon-custom" (click)="selectedBookForView = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body-custom">
            <div class="d-flex gap-3 mb-4">
              <div class="book-cover-mock" style="width: 58px; height: 80px; font-size: 0.9rem;" [style.background]="getCoverGradient(selectedBookForView.id)">
                {{ getInitials(selectedBookForView.title) }}
              </div>
              <div>
                <h4 class="fw-bold mb-1">{{ selectedBookForView.title }}</h4>
                <div class="text-secondary fs-6 mb-2">By {{ selectedBookForView.author }}</div>
                <app-status-badge 
                  [status]="selectedBookForView.available_copies > 0 ? 'Available' : 'Out of Stock'">
                </app-status-badge>
              </div>
            </div>

            <div class="row g-3 py-2 border-top border-bottom my-2">
              <div class="col-6">
                <span class="text-secondary small d-block">ISBN Standard Code</span>
                <span class="font-monospace fw-bold">{{ selectedBookForView.isbn }}</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Branch Allocation</span>
                <span class="fw-bold">{{ selectedBookForView.library_name }}</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Total Inventory</span>
                <span class="fw-bold">{{ selectedBookForView.total_copies }} copies</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Currently Available</span>
                <span class="fw-bold text-success">{{ selectedBookForView.available_copies }} copies</span>
              </div>
            </div>
          </div>
          <div class="modal-footer-custom">
            <a [routerLink]="['/admin/books/edit', selectedBookForView.id]" class="btn-saas-secondary" (click)="selectedBookForView = null">
              <i class="bi bi-pencil me-1"></i> Edit Book
            </a>
            <button type="button" class="btn-saas-primary" (click)="selectedBookForView = null">
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirmation-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Book"
        [message]="'Are you sure you want to delete &quot;' + (bookToDelete?.title || '') + '&quot;? This will remove all inventory records for this title.'"
        confirmText="Delete Book"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirmation-modal>
    </div>
  `
})
export class BookListComponent implements OnInit {
  allBooks = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  libraries = signal<Library[]>([]);
  loading = signal(true);

  searchQuery = '';
  selectedLibrary = '';
  availabilityFilter = '';

  selectedBookForView: Book | null = null;
  isDeleteModalOpen = false;
  bookToDelete: Book | null = null;

  constructor(
    private bookService: BookService,
    private libraryService: LibraryService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadLibraries();
    this.loadBooks();
  }

  loadLibraries() {
    this.libraryService.getLibraries().subscribe({
      next: (libs) => this.libraries.set(libs),
    });
  }

  loadBooks() {
    this.loading.set(true);
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.allBooks.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load book collection.');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let result = [...this.allBooks()];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      result = result.filter(b => 
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        b.isbn.toLowerCase().includes(query)
      );
    }

    if (this.selectedLibrary) {
      result = result.filter(b => b.library === +this.selectedLibrary);
    }

    if (this.availabilityFilter === 'available') {
      result = result.filter(b => b.available_copies > 0);
    } else if (this.availabilityFilter === 'unavailable') {
      result = result.filter(b => b.available_copies === 0);
    }

    this.filteredBooks.set(result);
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedLibrary = '';
    this.availabilityFilter = '';
    this.applyFilters();
  }

  viewBook(book: Book) {
    this.selectedBookForView = book;
  }

  closeViewModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.selectedBookForView = null;
    }
  }

  promptDelete(book: Book) {
    this.bookToDelete = book;
    this.isDeleteModalOpen = true;
  }

  executeDelete() {
    if (!this.bookToDelete) return;
    const id = this.bookToDelete.id;
    const title = this.bookToDelete.title;
    this.isDeleteModalOpen = false;

    this.bookService.deleteBook(id).subscribe({
      next: () => {
        this.toast.success(`"${title}" deleted successfully.`);
        this.loadBooks();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to delete book. Active loans may exist.');
      }
    });
  }

  getInitials(title: string): string {
    return (title || 'BK').substring(0, 2).toUpperCase();
  }

  getCoverGradient(id: number): string {
    const gradients = [
      'linear-gradient(135deg, #17233D 0%, #2A3B5C 100%)',
      'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #312E81 0%, #6366F1 100%)',
      'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
      'linear-gradient(135deg, #701A75 0%, #D946EF 100%)',
    ];
    return gradients[id % gradients.length];
  }
}
