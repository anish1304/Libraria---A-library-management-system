import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ReadingList, BookTitle } from '../../../models/libraria.models';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-reading-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent, ConfirmationModalComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">My Curated Reading Lists</h2>
          <p class="text-secondary small mb-0">
            Organize seminar references, research bibliographies, and personal reading goals.
          </p>
        </div>
        <div>
          <button type="button" class="btn btn-saas-primary btn-sm" (click)="openCreateModal()">
            <i class="bi bi-folder-plus me-1"></i> Create New Reading List
          </button>
        </div>
      </div>

      <!-- Lists Tabs / Switcher -->
      <div class="row g-4">
        <!-- Sidebar Navigation of Lists -->
        <div class="col-12 col-md-4 col-xl-3">
          <div class="card-saas p-3">
            <div class="text-uppercase xsmall text-secondary fw-bold letter-spacing-1 mb-2 px-2">
              My Collections ({{ myLists().length }})
            </div>
            <div class="d-flex flex-column gap-1">
              <button 
                *ngFor="let list of myLists()" 
                type="button" 
                class="list-nav-item"
                [class.active]="selectedList()?.id === list.id"
                (click)="selectedList.set(list)">
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                  <i [class]="list.is_system ? 'bi bi-star-fill text-warning' : 'bi bi-folder2 text-primary'"></i>
                  <span class="text-truncate fw-semibold">{{ list.name }}</span>
                </div>
                <span class="badge bg-secondary-subtle text-secondary xsmall">
                  {{ list.book_ids.length }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content Area: Books in Active List -->
        <div class="col-12 col-md-8 col-xl-9">
          <div class="card-saas p-4" *ngIf="selectedList()">
            <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 border-bottom pb-3">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h4 class="fw-bold mb-0 text-primary">{{ selectedList()?.name }}</h4>
                  <span class="badge bg-primary-subtle text-primary small" *ngIf="selectedList()?.is_system">
                    Default List
                  </span>
                </div>
                <p class="text-secondary small mb-0 mt-1">{{ selectedList()?.description }}</p>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button 
                  *ngIf="!selectedList()?.is_system"
                  type="button" 
                  class="btn btn-saas-secondary btn-sm text-danger"
                  (click)="confirmDeleteList(selectedList()!)">
                  <i class="bi bi-trash3 me-1"></i> Delete List
                </button>
                <a routerLink="/student/books" class="btn btn-saas-secondary btn-sm text-primary">
                  <i class="bi bi-plus-lg me-1"></i> Add More Books
                </a>
              </div>
            </div>

            <!-- List Books Grid -->
            <div class="row g-3" *ngIf="booksInSelectedList().length > 0">
              <div class="col-12 col-lg-6" *ngFor="let book of booksInSelectedList()">
                <div class="book-list-card p-3 h-100 d-flex gap-3">
                  <div class="book-mini-cover">
                    <i class="bi bi-journal-bookmark fs-2 text-primary"></i>
                  </div>
                  <div class="d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <div class="fw-bold text-primary">{{ book.title }}</div>
                      <div class="xsmall text-secondary mb-1">By {{ book.authors.join(', ') }}</div>
                      <div class="d-flex flex-wrap gap-1 mb-2">
                        <span class="badge bg-surface-hover text-secondary xsmall border" *ngFor="let cat of book.categories">
                          {{ cat }}
                        </span>
                      </div>
                    </div>
                    <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                      <span class="xsmall fw-semibold" [ngClass]="book.available_copies > 0 ? 'text-success' : 'text-danger'">
                        {{ book.available_copies > 0 ? book.available_copies + ' available' : 'On hold / issued' }}
                      </span>
                      <button 
                        type="button" 
                        class="btn-remove-book text-danger" 
                        (click)="removeBookFromList(book.id)"
                        title="Remove from this list">
                        <i class="bi bi-x-circle me-1"></i> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <app-empty-state 
              *ngIf="booksInSelectedList().length === 0"
              icon="bi-book"
              title="This Reading List is Empty"
              description="Browse the library catalog and save books directly to this collection."
              actionText="Discover Books"
              actionLink="/student/books">
            </app-empty-state>
          </div>
        </div>
      </div>
    </div>

    <!-- Create List Modal -->
    <div class="custom-modal-backdrop" *ngIf="showCreateModal" (click)="showCreateModal = false">
      <div class="custom-modal-box" (click)="$event.stopPropagation()">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="fw-bold mb-0">Create New Reading List</h5>
          <button type="button" class="btn-close" (click)="showCreateModal = false"></button>
        </div>
        <div class="mb-3">
          <label class="form-label-custom">List Name</label>
          <input 
            type="text" 
            class="form-control-saas" 
            [(ngModel)]="newListName" 
            placeholder="e.g. Distributed Systems Seminar, Thesis Prep">
        </div>
        <div class="mb-4">
          <label class="form-label-custom">Description (Optional)</label>
          <textarea 
            class="form-control-saas" 
            rows="3" 
            [(ngModel)]="newListDesc" 
            placeholder="Add context or notes for this collection..."></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-saas-secondary btn-sm" (click)="showCreateModal = false">Cancel</button>
          <button type="button" class="btn btn-saas-primary btn-sm" [disabled]="!newListName.trim()" (click)="createList()">Create Collection</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Delete -->
    <app-confirmation-modal
      [isOpen]="showDeleteModal"
      title="Delete Reading List"
      [message]="'Are you sure you want to delete the list ' + (listToDelete?.name || '') + '?'"
      confirmText="Yes, Delete"
      confirmVariant="danger"
      (confirm)="doDeleteList()"
      (cancel)="showDeleteModal = false">
    </app-confirmation-modal>
  `,
  styles: [`
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .list-nav-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: none;
      background: none;
      border-radius: var(--radius-sm);
      text-align: left;
      color: var(--text-secondary);
      font-size: 0.85rem;
      transition: all 0.15s ease;
    }
    .list-nav-item:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }
    .list-nav-item.active {
      background: var(--accent-subtle);
      color: var(--accent);
    }
    .book-list-card {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      transition: border-color 0.15s;
    }
    .book-list-card:hover {
      border-color: var(--accent);
    }
    .book-mini-cover {
      width: 60px;
      height: 80px;
      border-radius: var(--radius-xs);
      background: var(--bg-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid var(--border-subtle);
    }
    .btn-remove-book {
      background: none;
      border: none;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .btn-remove-book:hover {
      text-decoration: underline;
    }
    .custom-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(2px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-modal-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      width: 90%;
      max-width: 480px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    .xsmall {
      font-size: 0.725rem;
    }
    .letter-spacing-1 {
      letter-spacing: 0.06em;
    }
  `]
})
export class ReadingListsComponent {
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  selectedList = signal<ReadingList | null>(null);

  showCreateModal = false;
  newListName = '';
  newListDesc = '';

  showDeleteModal = false;
  listToDelete: ReadingList | null = null;

  constructor() {
    const lists = this.myLists();
    if (lists.length > 0) {
      this.selectedList.set(lists[0]);
    }
  }

  myLists(): ReadingList[] {
    const user = this.auth.currentUser();
    const memberId = user?.id || 5;
    return this.mockData.readingLists().filter(l => l.member_id === memberId);
  }

  booksInSelectedList(): BookTitle[] {
    const list = this.selectedList();
    if (!list) return [];
    return this.mockData.books().filter(b => list.book_ids.includes(b.id));
  }

  openCreateModal() {
    this.newListName = '';
    this.newListDesc = '';
    this.showCreateModal = true;
  }

  createList() {
    if (!this.newListName.trim()) return;
    const user = this.auth.currentUser();
    const created = this.mockData.createReadingList(
      user?.id || 5,
      this.newListName.trim(),
      this.newListDesc.trim()
    );
    this.toast.show(`Created list "${created.name}"!`, 'success');
    this.showCreateModal = false;
    this.selectedList.set(created);
  }

  removeBookFromList(bookId: number) {
    const list = this.selectedList();
    if (!list) return;
    this.mockData.toggleBookInReadingList(list.id, bookId);
    this.toast.show('Removed book from reading list.', 'info');
    // Refresh selected list reference
    const updated = this.myLists().find(l => l.id === list.id);
    if (updated) this.selectedList.set(updated);
  }

  confirmDeleteList(list: ReadingList) {
    this.listToDelete = list;
    this.showDeleteModal = true;
  }

  doDeleteList() {
    if (!this.listToDelete) return;
    this.mockData.deleteReadingList(this.listToDelete.id);
    this.toast.show(`Deleted "${this.listToDelete.name}".`, 'info');
    this.showDeleteModal = false;
    this.listToDelete = null;
    const remaining = this.myLists();
    this.selectedList.set(remaining.length ? remaining[0] : null);
  }
}
