import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ThemeService } from '../../../services/theme.service';
import { SystemSettings } from '../../../models/libraria.models';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Institutional Administration & Policies</h2>
          <p class="text-secondary small mb-0">
            Define global lending limits, penalty rates, hold expiration intervals, and demo sandbox parameters.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-saas-secondary btn-sm text-danger" (click)="showResetModal = true">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Demo Sandbox
          </button>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="saveSettings()">
        <div class="row g-4">
          <!-- Left Column: Organization Profile & Policies -->
          <div class="col-12 col-lg-8">
            <!-- Organization Profile -->
            <div class="card-saas p-4 mb-4">
              <h5 class="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                <i class="bi bi-building"></i> Organization & Institution Identity
              </h5>
              <div class="row g-3">
                <div class="col-12 col-md-7">
                  <label class="form-label-custom">Institution Name</label>
                  <input type="text" class="form-control-saas" formControlName="org_name">
                </div>
                <div class="col-12 col-md-5">
                  <label class="form-label-custom">Default Primary Library</label>
                  <select class="form-select form-control-saas" formControlName="default_library_id">
                    <option *ngFor="let b of mockData.libraries()" [value]="b.id">{{ b.name }}</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label-custom">Platform Mission Tagline</label>
                  <input type="text" class="form-control-saas" formControlName="org_tagline">
                </div>
              </div>
            </div>

            <!-- Lending & Circulation Policies -->
            <div class="card-saas p-4 mb-4">
              <h5 class="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                <i class="bi bi-calendar2-range"></i> Circulation & Renewal Quotas
              </h5>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Student Default Loan Period (Days)</label>
                  <div class="input-group">
                    <input type="number" class="form-control form-control-saas" formControlName="default_loan_days_student">
                    <span class="input-group-text small">days</span>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Faculty Default Loan Period (Days)</label>
                  <div class="input-group">
                    <input type="number" class="form-control form-control-saas" formControlName="default_loan_days_faculty">
                    <span class="input-group-text small">days</span>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Student Max Renewals Allowed</label>
                  <input type="number" class="form-control-saas" formControlName="max_renewals_student">
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Faculty Max Renewals Allowed</label>
                  <input type="number" class="form-control-saas" formControlName="max_renewals_faculty">
                </div>

                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Student Max Concurrent Loans</label>
                  <input type="number" class="form-control-saas" formControlName="max_active_loans_student">
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Faculty Max Concurrent Loans</label>
                  <input type="number" class="form-control-saas" formControlName="max_active_loans_faculty">
                </div>
              </div>
            </div>

            <!-- Fines & Holds Policies -->
            <div class="card-saas p-4 mb-4">
              <h5 class="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                <i class="bi bi-cash-coin"></i> Penalties & Reservation Holds
              </h5>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Overdue Fine Rate (Per Day)</label>
                  <div class="input-group">
                    <span class="input-group-text small">$</span>
                    <input type="number" step="0.25" class="form-control form-control-saas" formControlName="daily_fine_rate">
                    <span class="input-group-text small">/day</span>
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <label class="form-label-custom">Hold Pickup Expiration Window</label>
                  <div class="input-group">
                    <input type="number" class="form-control form-control-saas" formControlName="reservation_expiry_days">
                    <span class="input-group-text small">days</span>
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" id="autoWaitlist" formControlName="enable_waitlist_auto_promote">
                    <label class="form-check-label fw-semibold" for="autoWaitlist">
                      Auto-promote Next Patron in Queue When Copy Is Returned
                    </label>
                    <div class="small text-secondary">
                      When enabled, returns automatically transition position #1 hold requests into "Ready for Pickup".
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Save CTA Button -->
            <div class="d-flex justify-content-end">
              <button type="submit" class="btn btn-saas-primary btn-lg px-5">
                <i class="bi bi-check2-circle me-1"></i> Save Configuration Changes
              </button>
            </div>
          </div>

          <!-- Right Column: System Status & Demo Controls -->
          <div class="col-12 col-lg-4">
            <!-- Summary Live Sandbox Card -->
            <div class="card-saas p-4 mb-4">
              <h6 class="fw-bold mb-3 text-uppercase xsmall text-secondary letter-spacing-1">
                Active Sandbox Profile
              </h6>
              <div class="d-flex flex-column gap-3">
                <div class="p-3 bg-surface-hover rounded">
                  <div class="xsmall text-secondary">Catalog Volumes</div>
                  <div class="fs-5 fw-bold text-primary">{{ mockData.books().length }} Titles • {{ mockData.copies().length }} Copies</div>
                </div>
                <div class="p-3 bg-surface-hover rounded">
                  <div class="xsmall text-secondary">Registered Network</div>
                  <div class="fs-5 fw-bold text-primary">{{ mockData.users().length }} Members • {{ mockData.libraries().length }} Branches</div>
                </div>
                <div class="p-3 bg-surface-hover rounded">
                  <div class="xsmall text-secondary">Circulation State</div>
                  <div class="fs-5 fw-bold text-primary">{{ activeLoansCount() }} Active Loans • {{ overdueCount() }} Overdue</div>
                </div>
              </div>
            </div>

            <!-- System Reset Danger Zone -->
            <div class="card-saas p-4 border-danger-subtle">
              <h6 class="fw-bold mb-2 text-danger d-flex align-items-center gap-2">
                <i class="bi bi-shield-exclamation"></i> Demo Sandbox Reset
              </h6>
              <p class="small text-secondary mb-3">
                Restore the sample database to its clean initial state with 35+ titles, 70+ physical copies, 4 libraries, and fresh loan records.
              </p>
              <button type="button" class="btn btn-saas-secondary w-100 btn-sm text-danger" (click)="showResetModal = true">
                <i class="bi bi-arrow-repeat me-1"></i> Reset to Factory Seed Data
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Confirmation Modal for Sandbox Reset -->
    <app-confirmation-modal
      [isOpen]="showResetModal"
      title="Reset Entire Demo Database?"
      message="This will re-seed all catalogue titles, physical copies, loans, fines, and reservations to factory defaults. Any custom records created during testing will be replaced."
      confirmText="Yes, Reset Everything"
      confirmVariant="danger"
      (confirm)="doReset()"
      (cancel)="showResetModal = false">
    </app-confirmation-modal>
  `,
  styles: [`
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .xsmall {
      font-size: 0.725rem;
    }
    .letter-spacing-1 {
      letter-spacing: 0.06em;
    }
    .border-danger-subtle {
      border: 1px solid rgba(216, 76, 90, 0.3) !important;
    }
  `]
})
export class SystemSettingsComponent {
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  themeService = inject(ThemeService);
  fb = inject(FormBuilder);

  form: FormGroup;
  showResetModal = false;

  constructor() {
    const s = this.mockData.settings();
    this.form = this.fb.group({
      org_name: [s.org_name, Validators.required],
      org_tagline: [s.org_tagline],
      default_library_id: [s.default_library_id],
      default_loan_days_student: [s.default_loan_days_student, [Validators.required, Validators.min(1)]],
      default_loan_days_faculty: [s.default_loan_days_faculty, [Validators.required, Validators.min(1)]],
      max_renewals_student: [s.max_renewals_student, Validators.required],
      max_renewals_faculty: [s.max_renewals_faculty, Validators.required],
      max_active_loans_student: [s.max_active_loans_student, Validators.required],
      max_active_loans_faculty: [s.max_active_loans_faculty, Validators.required],
      daily_fine_rate: [s.daily_fine_rate, [Validators.required, Validators.min(0)]],
      reservation_expiry_days: [s.reservation_expiry_days, [Validators.required, Validators.min(1)]],
      enable_waitlist_auto_promote: [s.enable_waitlist_auto_promote]
    });
  }

  activeLoansCount(): number {
    return this.mockData.loans().filter(l => l.status === 'Issued').length;
  }

  overdueCount(): number {
    return this.mockData.loans().filter(l => l.is_overdue).length;
  }

  saveSettings() {
    if (this.form.invalid) return;
    const actor = this.auth.currentUser();
    this.mockData.updateSettings(
      this.form.value,
      actor?.name || 'Administrator',
      (actor?.role || 'super_admin') as any
    );
    this.toast.show('System settings and borrowing policies successfully updated!', 'success');
  }

  doReset() {
    this.mockData.resetToFactoryDefaults();
    this.showResetModal = false;
    this.toast.show('Sandbox successfully reset to factory seed data!', 'info');
    // Refresh form values
    const s = this.mockData.settings();
    this.form.patchValue(s);
  }
}
