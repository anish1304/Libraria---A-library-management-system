import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, Book } from '../../../services/book.service';
import { LibraryService, Library } from '../../../services/library.service';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { BookReview } from '../../../models/libraria.models';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-book-catalogue',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    StatusBadgeComponent, 
    LoadingSkeletonComponent, 
    EmptyStateComponent
  ],
  template: `
    <div class="student-catalogue-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">Library Book Catalogue &amp; Collections</h3>
          <p class="text-secondary mb-0">Explore academic collections, read peer reviews, place waitlist holds, and verify shelf copies.</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary-subtle text-primary py-2 px-3 fw-bold">
            Available Titles: {{ filteredBooks().length }}
          </span>
        </div>
      </div>

      <!-- Hierarchical Category / Genre Bar -->
      <div class="genre-category-bar mb-3 p-2 saas-card">
        <div class="d-flex align-items-center gap-2 overflow-auto py-1">
          <span class="text-secondary small fw-bold text-uppercase px-2 text-nowrap">
            <i class="bi bi-diagram-3-fill me-1 text-primary"></i> Genres:
          </span>
          <button 
            type="button" 
            class="genre-chip" 
            [class.active]="selectedCategory === 'ALL'"
            (click)="selectCategory('ALL')">
            All Collections
          </button>
          <button 
            *ngFor="let cat of availableCategories" 
            type="button" 
            class="genre-chip" 
            [class.active]="selectedCategory === cat"
            (click)="selectCategory(cat)">
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="saas-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-lg-4 col-md-6">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input type="text" 
                     class="form-control-saas" 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="applyFilters()" 
                     placeholder="Search title, author, or ISBN...">
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <select class="form-select-saas" [(ngModel)]="selectedLibrary" (ngModelChange)="applyFilters()">
              <option value="">All Campus Branches</option>
              <option *ngFor="let lib of libraries()" [value]="lib.id">{{ lib.name }} ({{ lib.city }})</option>
            </select>
          </div>

          <div class="col-lg-3 col-md-6">
            <select class="form-select-saas" [(ngModel)]="availabilityFilter" (ngModelChange)="applyFilters()">
              <option value="">All Availability</option>
              <option value="available">Available for Loan Only</option>
              <option value="unavailable">Checked Out Only (Hold Eligible)</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6 d-flex align-items-center justify-content-end gap-2">
            <button type="button" 
                    class="btn-icon-custom" 
                    [class.active-view]="viewMode === 'grid'"
                    (click)="viewMode = 'grid'" 
                    title="Grid Cards View">
              <i class="bi bi-grid-fill"></i>
            </button>
            <button type="button" 
                    class="btn-icon-custom" 
                    [class.active-view]="viewMode === 'table'"
                    (click)="viewMode = 'table'" 
                    title="List Table View">
              <i class="bi bi-list-ul"></i>
            </button>
            <button type="button" class="btn-saas-secondary" (click)="resetFilters()" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()">
        <app-loading-skeleton type="cards" [count]="6"></app-loading-skeleton>
      </div>

      <!-- Empty State -->
      <div class="saas-card" *ngIf="!loading() && filteredBooks().length === 0">
        <app-empty-state 
          icon="bi-journal-x" 
          title="No books found" 
          message="No volumes match your search or branch selection. Try clearing your search filters."
          actionText="Reset Search"
          (actionClick)="resetFilters()">
        </app-empty-state>
      </div>

      <!-- Visual Card Grid View -->
      <div *ngIf="!loading() && filteredBooks().length > 0 && viewMode === 'grid'" class="row g-4">
        <div *ngFor="let book of filteredBooks()" class="col-xl-3 col-lg-4 col-md-6">
          <div class="saas-card book-card h-100 d-flex flex-column position-relative">
            <!-- Card Header with Cover Graphic -->
            <div class="book-card-cover p-3 d-flex align-items-center justify-content-between" [style.background]="getCoverGradient(book.id)">
              <div class="book-cover-large">
                <i class="bi bi-book-half fs-2 text-white opacity-75"></i>
              </div>
              <div class="d-flex align-items-center gap-2">
                <!-- 1-Click Wishlist Toggle -->
                <button 
                  type="button" 
                  class="btn-wishlist-toggle" 
                  (click)="toggleWishlist(book, $event)" 
                  [title]="isWishlisted(book.id) ? 'Remove from Wishlist' : 'Add to Wishlist'">
                  <i [class]="isWishlisted(book.id) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart text-white'"></i>
                </button>

                <span class="badge" [ngClass]="book.available_copies > 0 ? 'bg-success text-white' : 'bg-warning text-dark'">
                  {{ book.available_copies > 0 ? book.available_copies + ' In Stock' : 'Hold Queue' }}
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-3 flex-grow-1 d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="genre-pill-micro">{{ getBookCategory(book) }}</span>
                <!-- Verified Rating Stars -->
                <div class="d-flex align-items-center gap-1 small text-warning">
                  <i class="bi bi-star-fill" style="font-size: 0.75rem;"></i>
                  <span class="fw-bold" style="font-size: 0.8rem;">{{ getRating(book) }}</span>
                  <span class="text-tertiary" style="font-size: 0.7rem;">({{ getReviewCount(book) }})</span>
                </div>
              </div>

              <h6 class="fw-bold mb-1 text-truncate" [title]="book.title">{{ book.title }}</h6>
              <div class="text-secondary small mb-2 text-truncate">{{ book.author }}</div>

              <div class="mt-auto pt-2 border-top border-subtle d-flex align-items-center justify-content-between small">
                <span class="text-secondary text-truncate" style="max-width: 140px;">
                  <i class="bi bi-building me-1"></i>{{ book.library_name }}
                </span>
                <span class="font-monospace text-tertiary" style="font-size: 0.75rem;">
                  {{ book.isbn }}
                </span>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="p-3 pt-0 d-flex gap-2">
              <button 
                type="button" 
                class="btn-saas-secondary flex-grow-1 py-1 justify-content-center text-primary" 
                (click)="openDetails(book)">
                <i class="bi bi-info-circle me-1"></i> Details &amp; Reviews
              </button>

              <!-- If 0 copies available: Direct 1-Click Hold / Reserve -->
              <button 
                *ngIf="book.available_copies === 0" 
                type="button" 
                class="btn btn-warning btn-sm py-1 px-2" 
                (click)="reserveBook(book, $event)" 
                title="Reserve / Join Waitlist">
                <i class="bi bi-bookmark-plus-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div *ngIf="!loading() && filteredBooks().length > 0 && viewMode === 'table'" class="saas-table-container">
        <table class="saas-table">
          <thead>
            <tr>
              <th>Title &amp; Author</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Campus Branch</th>
              <th>Available Copies</th>
              <th>Stock Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let book of filteredBooks()">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="book-cover-mock" style="width: 28px; height: 38px; font-size: 0.6rem;" [style.background]="getCoverGradient(book.id)">
                    BK
                  </div>
                  <div>
                    <div class="fw-bold">{{ book.title }}</div>
                    <div class="text-secondary small">{{ book.author }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-surface-hover border">{{ getBookCategory(book) }}</span>
              </td>
              <td>
                <span class="text-warning small fw-bold">
                  <i class="bi bi-star-fill me-1"></i>{{ getRating(book) }}
                </span>
              </td>
              <td>
                <span class="text-secondary"><i class="bi bi-building me-1"></i>{{ book.library_name }}</span>
              </td>
              <td>
                <span class="fw-bold" [class.text-success]="book.available_copies > 0" [class.text-danger]="book.available_copies === 0">
                  {{ book.available_copies }}
                </span>
                <span class="text-tertiary small">/ {{ book.total_copies }}</span>
              </td>
              <td>
                <app-status-badge 
                  [status]="book.available_copies > 0 ? 'Available' : 'Out of Stock'">
                </app-status-badge>
              </td>
              <td class="text-end">
                <div class="d-flex align-items-center justify-content-end gap-2">
                  <button type="button" class="btn-icon-custom" (click)="toggleWishlist(book, $event)" [title]="isWishlisted(book.id) ? 'Remove Wishlist' : 'Add Wishlist'">
                    <i [class]="isWishlisted(book.id) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart'"></i>
                  </button>
                  <button type="button" class="btn-icon-custom" (click)="openDetails(book)" title="View Details">
                    <i class="bi bi-info-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Comprehensive Book Details & Verified Reader Reviews Modal -->
      <div *ngIf="selectedBook" class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom modal-lg-custom">
          <!-- Modal Header -->
          <div class="modal-header-custom">
            <div class="d-flex align-items-center gap-3">
              <h5 class="mb-0 fw-bold">Catalogue Volume Record</h5>
              <span class="badge bg-surface-hover border small">{{ getBookCategory(selectedBook) }}</span>
            </div>
            <button type="button" class="btn-icon-custom" (click)="selectedBook = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Modal Tabs (Overview vs Reviews) -->
          <div class="modal-nav-tabs px-4 pt-3">
            <button 
              type="button" 
              class="modal-tab-btn" 
              [class.active]="activeTab === 'overview'" 
              (click)="activeTab = 'overview'">
              <i class="bi bi-book-half me-1"></i> Overview &amp; Shelf Stock
            </button>
            <button 
              type="button" 
              class="modal-tab-btn" 
              [class.active]="activeTab === 'reviews'" 
              (click)="activeTab = 'reviews'">
              <i class="bi bi-chat-square-text me-1"></i> Verified Reader Reviews ({{ getReviews(selectedBook.id).length }})
            </button>
          </div>

          <!-- Modal Body Tab 1: Overview & Specs -->
          <div class="modal-body-custom" *ngIf="activeTab === 'overview'">
            <div class="d-flex gap-4 mb-4">
              <div class="book-cover-mock flex-shrink-0" style="width: 72px; height: 100px; font-size: 1.1rem;" [style.background]="getCoverGradient(selectedBook.id)">
                BK
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 class="fw-bold mb-1">{{ selectedBook.title }}</h4>
                    <div class="text-secondary fs-6 mb-2">Author: <strong>{{ selectedBook.author }}</strong></div>
                  </div>
                  <div class="d-flex align-items-center gap-1 p-2 rounded bg-surface-hover text-warning">
                    <i class="bi bi-star-fill"></i>
                    <span class="fw-bold">{{ getRating(selectedBook) }}</span>
                    <span class="text-secondary small">/ 5.0</span>
                  </div>
                </div>

                <app-status-badge 
                  [status]="selectedBook.available_copies > 0 ? 'Available' : 'Out of Stock'"
                  [text]="selectedBook.available_copies > 0 ? (selectedBook.available_copies + ' Physical Copies Available') : 'Currently All Checked Out (Hold Eligible)'">
                </app-status-badge>
              </div>
            </div>

            <!-- Technical Specifications Grid -->
            <div class="row g-3 py-3 border-top border-bottom my-2">
              <div class="col-sm-6 col-md-3">
                <span class="text-secondary small d-block">ISBN Standard Code</span>
                <span class="font-monospace fw-bold">{{ selectedBook.isbn }}</span>
              </div>
              <div class="col-sm-6 col-md-3">
                <span class="text-secondary small d-block">Library Branch</span>
                <span class="fw-bold">{{ selectedBook.library_name }}</span>
              </div>
              <div class="col-sm-6 col-md-3">
                <span class="text-secondary small d-block">Copies on Shelf</span>
                <span class="fw-bold text-success">{{ selectedBook.available_copies }} In Stock</span>
              </div>
              <div class="col-sm-6 col-md-3">
                <span class="text-secondary small d-block">Shelf Call Number</span>
                <span class="fw-bold font-monospace text-primary">QA.76.73 / {{ selectedBook.id }}</span>
              </div>
            </div>

            <!-- Synopsis & Description -->
            <div class="my-3">
              <h6 class="fw-bold small text-uppercase text-secondary mb-1">Synopsis &amp; Research Scope</h6>
              <p class="small text-secondary mb-0 line-height-lg">
                {{ selectedBook.description || 'Comprehensive syllabus text for graduate and undergraduate scholars. Covers theoretical foundations, industry best practices, and verified reference materials.' }}
              </p>
            </div>

            <!-- Action Guide -->
            <div class="mt-3 p-3 bg-surface-hover rounded d-flex align-items-center justify-content-between">
              <div>
                <span class="small fw-semibold text-white d-block">Circulation Availability</span>
                <span class="small text-secondary" *ngIf="selectedBook.available_copies > 0">
                  Ready for immediate check-out at <strong>{{ selectedBook.library_name }}</strong> desk.
                </span>
                <span class="small text-warning" *ngIf="selectedBook.available_copies === 0">
                  Currently checked out. Place a hold to reserve the next returned physical copy.
                </span>
              </div>

              <!-- Reserve Hold Action -->
              <button 
                *ngIf="selectedBook.available_copies === 0" 
                type="button" 
                class="btn btn-warning btn-sm" 
                (click)="reserveBook(selectedBook)">
                <i class="bi bi-bookmark-check-fill me-1"></i> Place Reservation Hold
              </button>
            </div>
          </div>

          <!-- Modal Body Tab 2: Verified Reader Reviews -->
          <div class="modal-body-custom" *ngIf="activeTab === 'reviews'">
            <!-- Ratings Breakdown Summary -->
            <div class="p-3 bg-surface-hover rounded mb-4 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-3">
                <div class="display-6 fw-bold text-warning">{{ getRating(selectedBook) }}</div>
                <div>
                  <div class="d-flex text-warning mb-1">
                    <i class="bi bi-star-fill me-1" *ngFor="let s of [1,2,3,4,5]"></i>
                  </div>
                  <span class="small text-secondary">Based on {{ getReviews(selectedBook.id).length }} verified student reviews</span>
                </div>
              </div>
              <span class="badge bg-success-subtle text-success small fw-semibold">
                <i class="bi bi-shield-check me-1"></i> 100% Verified Readers
              </span>
            </div>

            <!-- Add Review Form -->
            <div class="add-review-card p-3 mb-4 border rounded">
              <h6 class="fw-bold small mb-2 text-white">Leave Your Reader Feedback &amp; Rating</h6>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="small text-secondary">Your Rating:</span>
                <div class="star-rating-selector">
                  <button 
                    *ngFor="let star of [1,2,3,4,5]" 
                    type="button" 
                    class="star-btn" 
                    [class.active]="star <= newRating"
                    (click)="newRating = star">
                    <i class="bi" [class.bi-star-fill]="star <= newRating" [class.bi-star]="star > newRating"></i>
                  </button>
                </div>
                <span class="small text-warning fw-bold ms-1">{{ newRating }} / 5</span>
              </div>
              <div class="mb-2">
                <textarea 
                  class="form-control-saas" 
                  rows="2" 
                  [(ngModel)]="newComment" 
                  placeholder="Share your thoughts on the clarity, syllabus relevance, or key takeaways of this volume...">
                </textarea>
              </div>
              <button 
                type="button" 
                class="btn-saas-primary btn-sm" 
                (click)="submitReview(selectedBook.id)" 
                [disabled]="!newComment.trim()">
                <i class="bi bi-send-fill me-1"></i> Publish Review
              </button>
            </div>

            <!-- List of Reviews -->
            <div class="reviews-list">
              <div *ngFor="let rev of getReviews(selectedBook.id)" class="review-item p-3 mb-2 rounded bg-surface">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <div class="d-flex align-items-center gap-2">
                    <div class="review-avatar">{{ rev.member_name.charAt(0) }}</div>
                    <div>
                      <span class="fw-semibold small text-white">{{ rev.member_name }}</span>
                      <span class="text-tertiary small ms-2">&middot; {{ rev.created_at }}</span>
                    </div>
                  </div>
                  <div class="d-flex text-warning small">
                    <i class="bi bi-star-fill me-1" *ngFor="let i of getStarArray(rev.rating)"></i>
                  </div>
                </div>
                <p class="small text-secondary mb-0 mt-2">{{ rev.comment }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer-custom d-flex justify-content-between">
            <button 
              type="button" 
              class="btn btn-saas-secondary btn-sm" 
              (click)="toggleWishlist(selectedBook)">
              <i [class]="isWishlisted(selectedBook.id) ? 'bi bi-heart-fill text-danger me-1' : 'bi bi-heart me-1'"></i>
              {{ isWishlisted(selectedBook.id) ? 'Saved in Wishlist' : 'Add to Wishlist' }}
            </button>
            <button type="button" class="btn-saas-primary btn-sm px-4" (click)="selectedBook = null">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card {
      transition: transform var(--transition-fast), box-shadow var(--transition-normal), border-color var(--transition-normal);
      border-radius: var(--radius-md);
    }
    .book-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-strong);
    }
    .book-card-cover {
      height: 95px;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      color: #FFFFFF;
      position: relative;
    }
    .btn-wishlist-toggle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-wishlist-toggle:hover {
      transform: scale(1.15);
      background: rgba(0, 0, 0, 0.6);
    }
    .genre-pill-micro {
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--brand-blue-hover);
    }
    .active-view {
      background-color: var(--brand-blue-subtle) !important;
      color: var(--brand-blue-hover) !important;
      border-color: var(--brand-blue-hover) !important;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.25);
    }
    .genre-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.3rem 0.85rem;
      border-radius: var(--radius-pill);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .genre-chip:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--border-strong);
    }
    .genre-chip.active {
      background: var(--brand-blue);
      color: #ffffff;
      border-color: var(--brand-blue);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .modal-lg-custom {
      max-width: 680px !important;
    }
    .modal-nav-tabs {
      display: flex;
      gap: 1rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .modal-tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.5rem 0.25rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .modal-tab-btn.active {
      color: var(--brand-blue-hover);
      border-bottom-color: var(--brand-blue);
    }
    .star-rating-selector {
      display: flex;
      gap: 3px;
    }
    .star-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0 2px;
    }
    .star-btn.active {
      color: #fbbf24;
    }
    .review-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--brand-blue-subtle);
      color: var(--brand-blue-hover);
      font-weight: 700;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class BookCatalogueComponent implements OnInit {
  bookService = inject(BookService);
  libraryService = inject(LibraryService);
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  allBooks = signal<Book[]>([]);
  filteredBooks = signal<Book[]>([]);
  libraries = signal<Library[]>([]);
  loading = signal(true);

  searchQuery = '';
  selectedLibrary = '';
  availabilityFilter = '';
  selectedCategory = 'ALL';
  viewMode: 'grid' | 'table' = 'grid';

  selectedBook: Book | null = null;
  activeTab: 'overview' | 'reviews' = 'overview';

  newRating = 5;
  newComment = '';

  availableCategories = [
    'Computer Science',
    'Software Architecture',
    'AI & Data Systems',
    'Humanities & Literature',
    'Physics & Sciences',
    'Business & Economics'
  ];

  // In-memory reviews map
  reviewsMap: { [bookId: number]: BookReview[] } = {
    1: [
      { id: 101, book_id: 1, member_name: 'Alex Johnson', rating: 5, comment: 'Essential reference for clean code and solid software engineering principles.', created_at: '2026-09-12' },
      { id: 102, book_id: 1, member_name: 'Maya Lin', rating: 4, comment: 'Great architectural insights, especially for decoupled microservices.', created_at: '2026-10-02' }
    ],
    2: [
      { id: 201, book_id: 2, member_name: 'Marcus Vance', rating: 5, comment: 'The holy grail of distributed databases, stream processing, and scalability.', created_at: '2026-08-25' }
    ]
  };

  ngOnInit() {
    this.libraryService.getLibraries().subscribe(libs => this.libraries.set(libs));
    this.loadBooks();
  }

  loadBooks() {
    this.loading.set(true);
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.allBooks.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
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

    if (this.selectedCategory !== 'ALL') {
      result = result.filter(b => {
        const cat = this.getBookCategory(b);
        return cat.toLowerCase().includes(this.selectedCategory.toLowerCase());
      });
    }

    this.filteredBooks.set(result);
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedLibrary = '';
    this.availabilityFilter = '';
    this.selectedCategory = 'ALL';
    this.applyFilters();
  }

  openDetails(book: Book) {
    this.selectedBook = book;
    this.activeTab = 'overview';
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.selectedBook = null;
    }
  }

  getBookCategory(book: Book): string {
    if (book.categories && book.categories.length) return book.categories[0];
    const catMap = ['Computer Science', 'Software Architecture', 'AI & Data Systems', 'Physics & Sciences', 'Humanities & Literature'];
    return catMap[book.id % catMap.length];
  }

  getRating(book: Book): number {
    const revs = this.getReviews(book.id);
    if (!revs.length) return 4.8;
    const sum = revs.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / revs.length).toFixed(1));
  }

  getReviewCount(book: Book): number {
    return this.getReviews(book.id).length || 12;
  }

  getReviews(bookId: number): BookReview[] {
    return this.reviewsMap[bookId] || [
      { id: 991, book_id: bookId, member_name: 'Verified Scholar', rating: 5, comment: 'Highly recommended reading material for campus courses and semester exams.', created_at: '2026-10-10' }
    ];
  }

  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  submitReview(bookId: number) {
    if (!this.newComment.trim()) return;
    const user = this.auth.currentUser();
    const author = user?.name || 'Student Reader';

    const newRev: BookReview = {
      id: Date.now(),
      book_id: bookId,
      member_name: author,
      rating: this.newRating,
      comment: this.newComment.trim(),
      created_at: new Date().toISOString().split('T')[0]
    };

    if (!this.reviewsMap[bookId]) {
      this.reviewsMap[bookId] = [];
    }
    this.reviewsMap[bookId] = [newRev, ...this.reviewsMap[bookId]];

    this.mockData.addBookReview(bookId, author, this.newRating, this.newComment);
    this.newComment = '';
    this.newRating = 5;
    this.toast.show('Thank you! Your verified review has been published.', 'success');
  }

  isWishlisted(bookId: number): boolean {
    const list = this.mockData.readingLists().find(r => r.name.includes('Want to Read') || r.name.includes('Wishlist'));
    return list ? list.book_ids.includes(bookId) : false;
  }

  toggleWishlist(book: Book, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const isAdded = this.mockData.toggleBookWishlist(book.id);
    this.toast.show(
      isAdded ? `"${book.title}" added to your Wishlist!` : `"${book.title}" removed from your Wishlist.`,
      isAdded ? 'success' : 'info'
    );
  }

  reserveBook(book: Book, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const user = this.auth.currentUser();
    const memberId = user?.id || 1;
    const res = this.mockData.createReservation(book.id, memberId, book.library || 1);
    if (res.success) {
      this.toast.show(res.message, 'success');
    } else {
      this.toast.show(res.message, 'warning');
    }
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
