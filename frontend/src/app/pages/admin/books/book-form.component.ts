import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../../../services/book.service';
import { LibraryService, Library } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="book-form-page" style="max-width: 720px; margin: 0 auto;">
      <!-- Breadcrumb Context & Header -->
      <div class="mb-4">
        <a routerLink="/admin/books" class="btn-saas-secondary btn-sm py-1 mb-3">
          <i class="bi bi-arrow-left me-1"></i> Back to Book Collection
        </a>
        <h3 class="fw-bold mb-1">{{ isEdit ? 'Update Book Specification' : 'Register New Book Title' }}</h3>
        <p class="text-secondary mb-0">
          {{ isEdit ? 'Modify catalogue metadata, ISBN, or stock quantities.' : 'Add a title to the institutional collection and designate a branch.' }}
        </p>
      </div>

      <!-- Main Form Card -->
      <div class="saas-card p-4">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Title & Author -->
          <div class="row g-3 mb-3">
            <div class="col-md-12">
              <label class="form-label-custom">Book Title *</label>
              <input id="book-title" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="title" 
                     placeholder="e.g. Introduction to Algorithms">
              <div *ngIf="form.get('title')?.touched && form.get('title')?.invalid" class="text-danger small mt-1">
                Book title is required.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Author(s) *</label>
              <input id="book-author" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="author" 
                     placeholder="e.g. Thomas H. Cormen">
              <div *ngIf="form.get('author')?.touched && form.get('author')?.invalid" class="text-danger small mt-1">
                Author name is required.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">ISBN Code *</label>
              <input id="book-isbn" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="isbn" 
                     placeholder="e.g. 978-0-262-03384-8">
              <div *ngIf="form.get('isbn')?.touched && form.get('isbn')?.invalid" class="text-danger small mt-1">
                Valid ISBN is required.
              </div>
            </div>
          </div>

          <!-- Library Branch & Copy Count -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label-custom">Branch Library *</label>
              <select id="book-library" class="form-select-saas" formControlName="library">
                <option value="">Select campus branch...</option>
                <option *ngFor="let lib of libraries()" [value]="lib.id">{{ lib.name }} ({{ lib.city }})</option>
              </select>
              <div *ngIf="form.get('library')?.touched && form.get('library')?.invalid" class="text-danger small mt-1">
                Please assign this book to a branch library.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Total Copies in Inventory *</label>
              <input id="book-copies" 
                     type="number" 
                     class="form-control-saas" 
                     formControlName="total_copies" 
                     min="1">
              <div class="text-secondary small mt-1">
                Initial available copies will match total copies.
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top" style="border-color: var(--border-subtle) !important;">
            <a routerLink="/admin/books" class="btn-saas-secondary">
              Cancel
            </a>
            <button id="book-submit" 
                    type="submit" 
                    class="btn-saas-primary" 
                    [disabled]="saving()">
              <span *ngIf="saving()" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving() ? 'Saving Changes...' : (isEdit ? 'Update Book' : 'Register Book') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BookFormComponent implements OnInit {
  form: FormGroup;
  libraries = signal<Library[]>([]);
  saving = signal(false);
  isEdit = false;
  bookId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private libraryService: LibraryService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', Validators.required],
      total_copies: [1, [Validators.required, Validators.min(1)]],
      library: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.libraryService.getLibraries().subscribe(libs => this.libraries.set(libs));
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.bookId = +id;
      this.bookService.getBook(this.bookId).subscribe({
        next: (book) => {
          this.form.patchValue({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            total_copies: book.total_copies,
            library: book.library,
          });
        },
        error: () => {
          this.toast.error('Failed to load book data.');
          this.router.navigate(['/admin/books']);
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const data = this.form.value;

    if (this.isEdit && this.bookId) {
      this.bookService.updateBook(this.bookId, data).subscribe({
        next: () => {
          this.toast.success(`Book updated successfully.`);
          this.router.navigate(['/admin/books']);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to update book.');
          this.saving.set(false);
        }
      });
    } else {
      this.bookService.createBook(data).subscribe({
        next: () => {
          this.toast.success(`Book "${data.title}" registered successfully.`);
          this.router.navigate(['/admin/books']);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to create book.');
          this.saving.set(false);
        }
      });
    }
  }
}
