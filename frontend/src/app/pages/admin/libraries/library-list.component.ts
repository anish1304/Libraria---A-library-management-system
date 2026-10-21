import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LibraryService, Library } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-library-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    ConfirmationModalComponent, 
    LoadingSkeletonComponent, 
    EmptyStateComponent
  ],
  template: `
    <div class="library-management-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">Library Branches</h3>
          <p class="text-secondary mb-0">Manage campus branches, locations, and institutional book allocations.</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="badge bg-primary-subtle text-primary py-2 px-3 fw-bold">
            Total Branches: {{ filteredLibraries().length }}
          </span>
          <button type="button" class="btn-saas-primary" (click)="openAddModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      <!-- Search & Layout Toggle Toolbar -->
      <div class="saas-card p-3 mb-4">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div class="input-with-icon" style="max-width: 380px; width: 100%;">
            <i class="bi bi-search"></i>
            <input type="text" 
                   class="form-control-saas" 
                   [(ngModel)]="searchQuery" 
                   (ngModelChange)="applySearch()" 
                   placeholder="Search branches by name or city...">
          </div>

          <div class="d-flex align-items-center gap-2">
            <button type="button" 
                    class="btn-icon-custom" 
                    [class.active-view]="viewMode === 'grid'"
                    (click)="viewMode = 'grid'" 
                    title="Grid Card View">
              <i class="bi bi-grid-fill"></i>
            </button>
            <button type="button" 
                    class="btn-icon-custom" 
                    [class.active-view]="viewMode === 'table'"
                    (click)="viewMode = 'table'" 
                    title="Data Table View">
              <i class="bi bi-list-ul"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()">
        <app-loading-skeleton type="cards" [count]="3"></app-loading-skeleton>
      </div>

      <!-- Empty State -->
      <div class="saas-card" *ngIf="!loading() && filteredLibraries().length === 0">
        <app-empty-state 
          icon="bi-building-x" 
          title="No branch libraries found" 
          message="No campus library matches your search query."
          actionText="Add First Branch"
          (actionClick)="openAddModal()">
        </app-empty-state>
      </div>

      <!-- Grid Cards View -->
      <div *ngIf="!loading() && filteredLibraries().length > 0 && viewMode === 'grid'" class="row g-4">
        <div *ngFor="let lib of filteredLibraries()" class="col-lg-4 col-md-6">
          <div class="saas-card library-card h-100 d-flex flex-column">
            <div class="library-card-top p-4 flex-grow-1">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div class="library-icon-box">
                  <i class="bi bi-building"></i>
                </div>
                <div class="d-flex gap-1">
                  <button type="button" class="btn-icon-custom btn-sm" (click)="openEditModal(lib)" title="Edit Branch">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button type="button" class="btn-icon-custom btn-sm text-danger" (click)="promptDelete(lib)" title="Delete Branch">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <h5 class="fw-bold mb-1">{{ lib.name }}</h5>
              <div class="text-primary small fw-semibold mb-3">
                <i class="bi bi-geo-alt-fill me-1"></i>{{ lib.city }}
              </div>

              <p class="text-secondary small mb-3 address-text">
                {{ lib.address }}
              </p>
            </div>

            <div class="library-card-footer px-4 py-3 border-top bg-surface-hover d-flex align-items-center justify-content-between">
              <span class="text-secondary small">
                Registered: {{ lib.created_at | date:'mediumDate' }}
              </span>
              <span class="badge bg-success-subtle text-success small">Operational</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div *ngIf="!loading() && filteredLibraries().length > 0 && viewMode === 'table'" class="saas-table-container">
        <table class="saas-table">
          <thead>
            <tr>
              <th>Branch Name</th>
              <th>City</th>
              <th>Address</th>
              <th>Established Date</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lib of filteredLibraries()">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="library-icon-sm">
                    <i class="bi bi-building"></i>
                  </div>
                  <span class="fw-bold">{{ lib.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge bg-primary-subtle text-primary">{{ lib.city }}</span>
              </td>
              <td class="text-secondary">{{ lib.address }}</td>
              <td>{{ lib.created_at | date:'mediumDate' }}</td>
              <td class="text-end">
                <div class="d-inline-flex gap-1">
                  <button type="button" class="btn-icon-custom" (click)="openEditModal(lib)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button type="button" class="btn-icon-custom text-danger" (click)="promptDelete(lib)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit Library Modal -->
      <div *ngIf="showModal" class="modal-backdrop-custom" (click)="onBackdropClick($event)">
        <div class="modal-dialog-custom">
          <div class="modal-header-custom">
            <h5 class="mb-0 fw-bold">{{ editingId ? 'Edit Library Branch' : 'Add New Library Branch' }}</h5>
            <button type="button" class="btn-icon-custom" (click)="closeModal()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="modal-body-custom">
              <div class="mb-3">
                <label class="form-label-custom">Branch Name *</label>
                <input id="lib-name" 
                       type="text" 
                       class="form-control-saas" 
                       formControlName="name" 
                       placeholder="e.g. Science & Technology Library">
                <div *ngIf="form.get('name')?.touched && form.get('name')?.invalid" class="text-danger small mt-1">
                  Branch name is required.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label-custom">City / Campus Location *</label>
                <input id="lib-city" 
                       type="text" 
                       class="form-control-saas" 
                       formControlName="city" 
                       placeholder="e.g. North Campus">
                <div *ngIf="form.get('city')?.touched && form.get('city')?.invalid" class="text-danger small mt-1">
                  City or campus location is required.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label-custom">Physical Address *</label>
                <textarea id="lib-address" 
                          class="form-control-saas" 
                          formControlName="address" 
                          rows="3" 
                          placeholder="e.g. Building 4, Floor 2, University Avenue"></textarea>
                <div *ngIf="form.get('address')?.touched && form.get('address')?.invalid" class="text-danger small mt-1">
                  Address is required.
                </div>
              </div>
            </div>

            <div class="modal-footer-custom">
              <button type="button" class="btn-saas-secondary" (click)="closeModal()">
                Cancel
              </button>
              <button id="lib-submit" type="submit" class="btn-saas-primary" [disabled]="saving()">
                <span *ngIf="saving()" class="spinner-border spinner-border-sm me-2"></span>
                {{ saving() ? 'Saving...' : (editingId ? 'Update Branch' : 'Create Branch') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <app-confirmation-modal
        [isOpen]="isDeleteModalOpen"
        title="Delete Library Branch"
        [message]="'Are you sure you want to delete &quot;' + (libraryToDelete?.name || '') + '&quot;? Books and students assigned to this branch must be reassigned first.'"
        confirmText="Delete Branch"
        [isDanger]="true"
        (confirm)="executeDelete()"
        (cancel)="isDeleteModalOpen = false">
      </app-confirmation-modal>
    </div>
  `,
  styles: [`
    .library-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      background-color: var(--brand-blue-subtle);
      color: var(--brand-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }
    .library-icon-sm {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background-color: var(--brand-blue-subtle);
      color: var(--brand-blue);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
    .address-text {
      line-height: 1.5;
      min-height: 42px;
    }
    .active-view {
      background-color: var(--brand-blue-subtle) !important;
      color: var(--brand-blue) !important;
      border-color: var(--brand-blue) !important;
    }
  `]
})
export class LibraryListComponent implements OnInit {
  allLibraries = signal<Library[]>([]);
  filteredLibraries = signal<Library[]>([]);
  loading = signal(true);
  saving = signal(false);

  searchQuery = '';
  viewMode: 'grid' | 'table' = 'grid';

  showModal = false;
  editingId: number | null = null;
  form: FormGroup;

  isDeleteModalOpen = false;
  libraryToDelete: Library | null = null;

  constructor(
    private fb: FormBuilder, 
    private libraryService: LibraryService,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadLibraries();
  }

  loadLibraries() {
    this.loading.set(true);
    this.libraryService.getLibraries().subscribe({
      next: (data) => {
        this.allLibraries.set(data);
        this.applySearch();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load libraries.');
        this.loading.set(false);
      }
    });
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredLibraries.set([...this.allLibraries()]);
      return;
    }
    this.filteredLibraries.set(
      this.allLibraries().filter(lib => 
        lib.name.toLowerCase().includes(q) || lib.city.toLowerCase().includes(q)
      )
    );
  }

  openAddModal() {
    this.form.reset();
    this.editingId = null;
    this.showModal = true;
  }

  openEditModal(lib: Library) {
    this.editingId = lib.id;
    this.form.patchValue({
      name: lib.name,
      city: lib.city,
      address: lib.address,
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.form.reset();
    this.editingId = null;
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.closeModal();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const data = this.form.value;

    if (this.editingId) {
      this.libraryService.updateLibrary(this.editingId, data).subscribe({
        next: () => {
          this.toast.success('Library branch updated successfully.');
          this.closeModal();
          this.loadLibraries();
          this.saving.set(false);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to update library.');
          this.saving.set(false);
        }
      });
    } else {
      this.libraryService.createLibrary(data).subscribe({
        next: () => {
          this.toast.success(`Branch "${data.name}" created successfully.`);
          this.closeModal();
          this.loadLibraries();
          this.saving.set(false);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to create library.');
          this.saving.set(false);
        }
      });
    }
  }

  promptDelete(lib: Library) {
    this.libraryToDelete = lib;
    this.isDeleteModalOpen = true;
  }

  executeDelete() {
    if (!this.libraryToDelete) return;
    const id = this.libraryToDelete.id;
    const name = this.libraryToDelete.name;
    this.isDeleteModalOpen = false;

    this.libraryService.deleteLibrary(id).subscribe({
      next: () => {
        this.toast.success(`Branch "${name}" deleted.`);
        this.loadLibraries();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Cannot delete library with existing books or students.');
      }
    });
  }
}
