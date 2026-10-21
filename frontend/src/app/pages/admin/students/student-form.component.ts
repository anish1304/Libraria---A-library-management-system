import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StudentService } from '../../../services/student.service';
import { LibraryService, Library } from '../../../services/library.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="student-form-page" style="max-width: 760px; margin: 0 auto;">
      <div class="mb-4">
        <a routerLink="/admin/students" class="btn-saas-secondary btn-sm py-1 mb-3">
          <i class="bi bi-arrow-left me-1"></i> Back to Student Directory
        </a>
        <h3 class="fw-bold mb-1">{{ isEdit ? 'Update Student Profile' : 'Enroll New Student Member' }}</h3>
        <p class="text-secondary mb-0">
          {{ isEdit ? 'Modify student contact information, branch assignment, or account status.' : 'Register a new student and generate login credentials for the Student Portal.' }}
        </p>
      </div>

      <div class="saas-card p-4">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Personal Information Section -->
          <h6 class="fw-bold text-uppercase text-secondary mb-3 small" style="letter-spacing: 0.05em;">
            1. Personal &amp; Campus Identification
          </h6>

          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label-custom">Full Name *</label>
              <input id="stu-name" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="name" 
                     placeholder="e.g. Alex Johnson">
              <div *ngIf="form.get('name')?.touched && form.get('name')?.invalid" class="text-danger small mt-1">
                Full name is required.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Student ID *</label>
              <input id="stu-id" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="student_id" 
                     placeholder="e.g. STU-2026-042" 
                     [readonly]="isEdit">
              <div *ngIf="form.get('student_id')?.touched && form.get('student_id')?.invalid" class="text-danger small mt-1">
                Student ID is required.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Institutional Email *</label>
              <input id="stu-email" 
                     type="email" 
                     class="form-control-saas" 
                     formControlName="email" 
                     placeholder="student@university.edu">
              <div *ngIf="form.get('email')?.touched && form.get('email')?.invalid" class="text-danger small mt-1">
                Valid email is required.
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Contact Telephone</label>
              <input id="stu-phone" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="phone" 
                     placeholder="e.g. +1 555-019-2834">
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Residential Street Address</label>
              <input id="stu-address" 
                     type="text" 
                     class="form-control-saas" 
                     formControlName="address" 
                     placeholder="e.g. 142 Beacon St, Apt 3B, Boston, MA">
            </div>

            <div class="col-md-6">
              <label class="form-label-custom">Designated Campus Branch *</label>
              <select id="stu-library" class="form-select-saas" formControlName="library">
                <option value="">Select branch library...</option>
                <option *ngFor="let lib of libraries()" [value]="lib.id">{{ lib.name }} ({{ lib.city }})</option>
              </select>
              <div *ngIf="form.get('library')?.touched && form.get('library')?.invalid" class="text-danger small mt-1">
                Please assign the student to a campus branch.
              </div>
            </div>
          </div>

          <!-- Credentials Section for New Students -->
          <ng-container *ngIf="!isEdit">
            <h6 class="fw-bold text-uppercase text-secondary mb-3 small pt-3 border-top" style="letter-spacing: 0.05em; border-color: var(--border-subtle) !important;">
              2. Student Portal Login Credentials
            </h6>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label-custom">Portal Username *</label>
                <input id="stu-username" 
                       type="text" 
                       class="form-control-saas" 
                       formControlName="username" 
                       placeholder="e.g. alex.j">
                <div *ngIf="form.get('username')?.touched && form.get('username')?.invalid" class="text-danger small mt-1">
                  Portal username is required.
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label-custom">Temporary Access Password *</label>
                <input id="stu-password" 
                       type="password" 
                       class="form-control-saas" 
                       formControlName="password" 
                       placeholder="Min 8 characters">
                <div *ngIf="form.get('password')?.touched && form.get('password')?.invalid" class="text-danger small mt-1">
                  Password (min 8 chars) is required.
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Status Section for Existing Students -->
          <ng-container *ngIf="isEdit">
            <h6 class="fw-bold text-uppercase text-secondary mb-3 small pt-3 border-top" style="letter-spacing: 0.05em; border-color: var(--border-subtle) !important;">
              2. Account Membership Status
            </h6>
            <div class="mb-4">
              <label class="form-label-custom">Account Status</label>
              <select class="form-select-saas" formControlName="is_active">
                <option [ngValue]="true">Active (Permitted to borrow books)</option>
                <option [ngValue]="false">Suspended / Inactive</option>
              </select>
            </div>
          </ng-container>

          <!-- Form Actions -->
          <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top" style="border-color: var(--border-subtle) !important;">
            <a routerLink="/admin/students" class="btn-saas-secondary">
              Cancel
            </a>
            <button id="stu-submit" 
                    type="submit" 
                    class="btn-saas-primary" 
                    [disabled]="saving()">
              <span *ngIf="saving()" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving() ? 'Saving Profile...' : (isEdit ? 'Update Student' : 'Enroll Student') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class StudentFormComponent implements OnInit {
  form: FormGroup;
  libraries = signal<Library[]>([]);
  saving = signal(false);
  isEdit = false;
  studentId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private libraryService: LibraryService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      student_id: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      library: ['', Validators.required],
      username: [''],
      password: [''],
      is_active: [true],
    });
  }

  ngOnInit() {
    this.libraryService.getLibraries().subscribe(libs => this.libraries.set(libs));
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.studentId = +id;
      this.studentService.getStudent(this.studentId).subscribe({
        next: (student) => {
          this.form.patchValue({
            name: student.name,
            student_id: student.student_id,
            email: student.email,
            phone: student.phone || '',
            address: student.address || '',
            library: student.library,
            is_active: student.is_active,
          });
        },
        error: () => {
          this.toast.error('Failed to load student profile.');
          this.router.navigate(['/admin/students']);
        }
      });
    } else {
      this.form.get('username')?.setValidators(Validators.required);
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('username')?.updateValueAndValidity();
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const data = this.form.value;

    if (this.isEdit && this.studentId) {
      this.studentService.updateStudent(this.studentId, data).subscribe({
        next: () => {
          this.toast.success('Student profile updated successfully.');
          this.router.navigate(['/admin/students']);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to update student profile.');
          this.saving.set(false);
        }
      });
    } else {
      this.studentService.createStudent(data).subscribe({
        next: () => {
          this.toast.success(`Student "${data.name}" enrolled successfully.`);
          this.router.navigate(['/admin/students']);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to enroll student. Username or Student ID may already exist.');
          this.saving.set(false);
        }
      });
    }
  }
}
