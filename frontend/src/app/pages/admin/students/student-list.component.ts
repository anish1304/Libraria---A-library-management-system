import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../../services/student.service';
import { LibraryService, Library } from '../../../services/library.service';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    StatusBadgeComponent, 
    LoadingSkeletonComponent, 
    EmptyStateComponent
  ],
  template: `
    <div class="student-management-page">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 class="mb-1 fw-bold">Student Directory</h3>
          <p class="text-secondary mb-0">Manage registered readers, account credentials, and library branch enrollments.</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="badge bg-primary-subtle text-primary py-2 px-3 fw-bold">
            Total Enrolled: {{ filteredStudents().length }}
          </span>
          <a routerLink="/admin/students/new" class="btn-saas-primary">
            <i class="bi bi-person-plus me-1"></i>
            <span>Register Student</span>
          </a>
        </div>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="saas-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-lg-4 col-md-6">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input id="student-search" 
                     type="text" 
                     class="form-control-saas" 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="applyFilters()" 
                     placeholder="Search name, student ID, email...">
            </div>
          </div>

          <div class="col-lg-3 col-md-6">
            <select class="form-select-saas" [(ngModel)]="selectedLibrary" (ngModelChange)="applyFilters()">
              <option value="">All Branch Libraries</option>
              <option *ngFor="let lib of libraries()" [value]="lib.id">{{ lib.name }}</option>
            </select>
          </div>

          <div class="col-lg-3 col-md-6">
            <select class="form-select-saas" [(ngModel)]="selectedStatus" (ngModelChange)="applyFilters()">
              <option value="">All Account Statuses</option>
              <option value="active">Active Members</option>
              <option value="inactive">Suspended / Inactive</option>
            </select>
          </div>

          <div class="col-lg-2 col-md-6 text-lg-end">
            <button type="button" class="btn-saas-secondary w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="saas-card" *ngIf="loading()">
        <app-loading-skeleton type="table" [count]="5"></app-loading-skeleton>
      </div>

      <!-- Empty State -->
      <div class="saas-card" *ngIf="!loading() && filteredStudents().length === 0">
        <app-empty-state 
          icon="bi-people" 
          title="No students match criteria" 
          message="Adjust your filters or register a new student account."
          actionText="Register Student"
          actionLink="/admin/students/new">
        </app-empty-state>
      </div>

      <!-- Students Table -->
      <div class="saas-table-container" *ngIf="!loading() && filteredStudents().length > 0">
        <table class="saas-table">
          <thead>
            <tr>
              <th>Student Member</th>
              <th>Student ID</th>
              <th>Contact Details</th>
              <th>Branch Library</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filteredStudents()">
              <td>
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-initials avatar-student">
                    {{ getInitials(s.name) }}
                  </div>
                  <div>
                    <div class="fw-bold fs-6">{{ s.name }}</div>
                    <div class="text-secondary small">{{ s.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="font-monospace small px-2 py-1 bg-surface-hover border rounded">
                  {{ s.student_id }}
                </span>
              </td>
              <td>
                <div class="small fw-medium text-secondary">
                  <i class="bi bi-telephone me-1"></i>{{ s.phone || 'No phone recorded' }}
                </div>
                <div class="small text-secondary text-truncate" style="max-width: 200px;" *ngIf="s.address" [title]="s.address">
                  <i class="bi bi-geo-alt me-1"></i>{{ s.address }}
                </div>
              </td>
              <td>
                <span class="fw-medium text-secondary">
                  <i class="bi bi-building me-1 small"></i>{{ s.library_name }}
                </span>
              </td>
              <td>
                <app-status-badge 
                  [status]="s.is_active ? 'Active' : 'Inactive'" 
                  [text]="s.is_active ? 'Active' : 'Suspended'">
                </app-status-badge>
              </td>
              <td class="text-end">
                <div class="d-inline-flex gap-1">
                  <!-- View Profile Button -->
                  <button type="button" class="btn-icon-custom" (click)="viewStudent(s)" title="View Student Profile">
                    <i class="bi bi-eye"></i>
                  </button>
                  <!-- Edit Profile Button -->
                  <a [routerLink]="['/admin/students/edit', s.id]" class="btn-icon-custom text-primary" title="Edit Student">
                    <i class="bi bi-pencil"></i>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Student Details Modal -->
      <div *ngIf="selectedStudentForView" class="modal-backdrop-custom" (click)="closeViewModal($event)">
        <div class="modal-dialog-custom">
          <div class="modal-header-custom">
            <h5 class="mb-0 fw-bold">Student Profile Overview</h5>
            <button type="button" class="btn-icon-custom" (click)="selectedStudentForView = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-body-custom">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="avatar-initials avatar-student" style="width: 54px; height: 54px; font-size: 1.25rem;">
                {{ getInitials(selectedStudentForView.name) }}
              </div>
              <div>
                <h4 class="fw-bold mb-1">{{ selectedStudentForView.name }}</h4>
                <div class="text-secondary small mb-1">Registration ID: <strong>{{ selectedStudentForView.student_id }}</strong></div>
                <app-status-badge 
                  [status]="selectedStudentForView.is_active ? 'Active' : 'Inactive'" 
                  [text]="selectedStudentForView.is_active ? 'Account Active' : 'Account Suspended'">
                </app-status-badge>
              </div>
            </div>

            <div class="row g-3 py-3 border-top border-bottom my-2">
              <div class="col-6">
                <span class="text-secondary small d-block">Email Address</span>
                <span class="fw-bold">{{ selectedStudentForView.email }}</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Contact Phone</span>
                <span class="fw-bold">{{ selectedStudentForView.phone || '—' }}</span>
              </div>
              <div class="col-12" *ngIf="selectedStudentForView.address">
                <span class="text-secondary small d-block">Residential Address</span>
                <span class="fw-bold"><i class="bi bi-geo-alt me-1 text-primary"></i>{{ selectedStudentForView.address }}</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Enrolled Branch</span>
                <span class="fw-bold">{{ selectedStudentForView.library_name }}</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Registration Date</span>
                <span class="fw-bold">{{ selectedStudentForView.created_at | date:'mediumDate' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer-custom">
            <a [routerLink]="['/admin/students/edit', selectedStudentForView.id]" class="btn-saas-secondary" (click)="selectedStudentForView = null">
              <i class="bi bi-pencil me-1"></i> Edit Profile
            </a>
            <button type="button" class="btn-saas-primary" (click)="selectedStudentForView = null">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StudentListComponent implements OnInit {
  allStudents = signal<Student[]>([]);
  filteredStudents = signal<Student[]>([]);
  libraries = signal<Library[]>([]);
  loading = signal(true);

  searchQuery = '';
  selectedLibrary = '';
  selectedStatus = '';

  selectedStudentForView: Student | null = null;

  constructor(
    private studentService: StudentService,
    private libraryService: LibraryService
  ) {}

  ngOnInit() {
    this.libraryService.getLibraries().subscribe(libs => this.libraries.set(libs));
    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.allStudents.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters() {
    let result = [...this.allStudents()];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.student_id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
    }

    if (this.selectedLibrary) {
      result = result.filter(s => s.library === +this.selectedLibrary);
    }

    if (this.selectedStatus === 'active') {
      result = result.filter(s => s.is_active);
    } else if (this.selectedStatus === 'inactive') {
      result = result.filter(s => !s.is_active);
    }

    this.filteredStudents.set(result);
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedLibrary = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  viewStudent(student: Student) {
    this.selectedStudentForView = student;
  }

  closeViewModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.selectedStudentForView = null;
    }
  }

  getInitials(name: string): string {
    const parts = (name || 'ST').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name || 'ST').substring(0, 2).toUpperCase();
  }
}
