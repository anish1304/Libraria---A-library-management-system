import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { MockDataService } from '../../../services/mock-data.service';
import { ThemeService } from '../../../services/theme.service';
import { ToastService } from '../../../services/toast.service';
import { PaymentModalComponent, PaymentModalData } from '../../../shared/payment-modal/payment-modal.component';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentModalComponent],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="page-title mb-1">Scholar Profile &amp; Library Privileges</h2>
        <p class="text-secondary small mb-0">
          Manage your contact credentials, institutional home library, borrowing tier, and display preferences.
        </p>
      </div>

      <div class="row g-4">
        <!-- Left: Profile Card -->
        <div class="col-12 col-lg-4">
          <div class="card-saas p-4 text-center mb-4">
            <div class="profile-avatar-circle mx-auto mb-3">
              {{ getInitials() }}
            </div>
            <h4 class="fw-bold mb-1 text-primary">{{ currentUser()?.name }}</h4>
            <div class="badge-status badge-primary mb-3">
              {{ currentTierBadge() }}
            </div>

            <div class="profile-meta-list text-start border-top pt-3">
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-secondary small">Institutional ID:</span>
                <span class="font-monospace small fw-bold">{{ currentUser()?.student_id }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-secondary small">Academic Dept:</span>
                <span class="small fw-semibold">{{ currentUser()?.department || 'Computing & AI' }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-bottom">
                <span class="text-secondary small">Primary Branch:</span>
                <span class="small fw-semibold">{{ currentUser()?.library_name }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="text-secondary small">Borrowing Limit:</span>
                <span class="badge-status badge-success">{{ currentLoanLimit() }} concurrent books</span>
              </div>
            </div>
          </div>

          <!-- Quick Membership Status Card -->
          <div class="card-saas p-3">
            <div class="d-flex align-items-center gap-3">
              <div class="tier-icon-wrap" [class.tier-fellow]="currentTier() === 'fellow'" [class.tier-premium]="currentTier() === 'premium'">
                <i class="bi bi-award-fill"></i>
              </div>
              <div>
                <span class="text-secondary small d-block">Active Membership</span>
                <span class="fw-bold text-white fs-6">{{ currentTierBadge() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Profile Form & Membership Tiers -->
        <div class="col-12 col-lg-8">
          <!-- Tiered Membership Plans (Spring Full Stack feature) -->
          <div class="card-saas p-4 mb-4">
            <h5 class="fw-bold mb-1 text-primary d-flex align-items-center gap-2">
              <i class="bi bi-star-fill text-warning"></i> Membership Tiers &amp; Borrowing Subscriptions
            </h5>
            <p class="text-secondary small mb-3">
              Elevate your borrowing allowances, loan durations, and hold priority with online payment checkout.
            </p>

            <div class="row g-3">
              <!-- Plan 1: Standard -->
              <div class="col-md-4">
                <div class="plan-card p-3 h-100 d-flex flex-column" [class.active-plan]="currentTier() === 'standard'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="plan-name">Standard</span>
                    <span class="badge bg-secondary-subtle text-secondary" *ngIf="currentTier() === 'standard'">Active</span>
                  </div>
                  <div class="plan-price mb-2">Free</div>
                  <ul class="plan-features list-unstyled small text-secondary flex-grow-1">
                    <li><i class="bi bi-check2 text-primary me-1"></i> 5 Concurrent Books</li>
                    <li><i class="bi bi-check2 text-primary me-1"></i> 14-Day Loan Period</li>
                    <li><i class="bi bi-check2 text-primary me-1"></i> Standard Waitlist Queue</li>
                  </ul>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-saas-secondary w-100" 
                    [disabled]="currentTier() === 'standard'"
                    (click)="switchTier('standard')">
                    {{ currentTier() === 'standard' ? 'Current Tier' : 'Downgrade' }}
                  </button>
                </div>
              </div>

              <!-- Plan 2: Premium Scholar -->
              <div class="col-md-4">
                <div class="plan-card p-3 h-100 d-flex flex-column border-primary" [class.active-plan]="currentTier() === 'premium'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="plan-name text-primary">Premium</span>
                    <span class="badge bg-primary-subtle text-primary" *ngIf="currentTier() === 'premium'">Active</span>
                  </div>
                  <div class="plan-price mb-2 text-primary">\$9.99<span class="fs-6 text-secondary fw-normal">/mo</span></div>
                  <ul class="plan-features list-unstyled small text-secondary flex-grow-1">
                    <li><i class="bi bi-check2 text-success me-1"></i> 8 Concurrent Books</li>
                    <li><i class="bi bi-check2 text-success me-1"></i> 30-Day Loan Period</li>
                    <li><i class="bi bi-check2 text-success me-1"></i> 3-Day Fine Grace Period</li>
                  </ul>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-saas-primary w-100" 
                    [disabled]="currentTier() === 'premium'"
                    (click)="openUpgradeModal('premium', 'Premium Scholar Membership Upgrade', 9.99)">
                    {{ currentTier() === 'premium' ? 'Current Tier' : 'Upgrade via Gateway' }}
                  </button>
                </div>
              </div>

              <!-- Plan 3: Research Fellow -->
              <div class="col-md-4">
                <div class="plan-card p-3 h-100 d-flex flex-column border-warning" [class.active-plan]="currentTier() === 'fellow'">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="plan-name text-warning">Fellow</span>
                    <span class="badge bg-warning-subtle text-warning" *ngIf="currentTier() === 'fellow'">Active</span>
                  </div>
                  <div class="plan-price mb-2 text-warning">\$19.99<span class="fs-6 text-secondary fw-normal">/mo</span></div>
                  <ul class="plan-features list-unstyled small text-secondary flex-grow-1">
                    <li><i class="bi bi-check2 text-warning me-1"></i> 15 Concurrent Books</li>
                    <li><i class="bi bi-check2 text-warning me-1"></i> 60-Day Loan Period</li>
                    <li><i class="bi bi-check2 text-warning me-1"></i> #1 Priority Hold Allocation</li>
                  </ul>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-warning w-100" 
                    [disabled]="currentTier() === 'fellow'"
                    (click)="openUpgradeModal('fellow', 'Research Fellow Fellowship Membership', 19.99)">
                    {{ currentTier() === 'fellow' ? 'Current Tier' : 'Upgrade via Gateway' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Contact Form -->
          <div class="card-saas p-4 mb-4">
            <h5 class="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <i class="bi bi-person-lines-fill"></i> Personal Contact Information
            </h5>
            <div class="row g-3">
              <div class="col-12 col-sm-6">
                <label class="form-label-custom">Full Legal Name</label>
                <input type="text" class="form-control-saas" [(ngModel)]="displayName">
              </div>
              <div class="col-12 col-sm-6">
                <label class="form-label-custom">University Email Address</label>
                <input type="email" class="form-control-saas" [(ngModel)]="email">
              </div>
              <div class="col-12 col-sm-6">
                <label class="form-label-custom">Mobile / Contact Phone</label>
                <input type="tel" class="form-control-saas" [(ngModel)]="phone">
              </div>
              <div class="col-12 col-sm-6">
                <label class="form-label-custom">Default Pickup Library</label>
                <select class="form-select form-control-saas" [(ngModel)]="preferredLibrary">
                  <option *ngFor="let branch of mockData.libraries()" [value]="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Display & Theme Preferences -->
          <div class="card-saas p-4 mb-4">
            <h5 class="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <i class="bi bi-palette"></i> Display &amp; Experience Preferences
            </h5>
            <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
              <div>
                <div class="fw-semibold">Color Scheme</div>
                <div class="small text-secondary">Switch between crisp light mode and high-contrast dark theme.</div>
              </div>
              <button 
                type="button" 
                class="btn btn-saas-secondary btn-sm"
                (click)="themeService.toggleTheme()">
                <i [class]="themeService.isDark() ? 'bi bi-sun-fill text-warning me-1' : 'bi bi-moon-stars-fill me-1'"></i>
                {{ themeService.isDark() ? 'Light Mode' : 'Dark Mode' }}
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-saas-primary btn-lg px-4" (click)="saveProfile()">
              <i class="bi bi-check2-circle me-1"></i> Update Profile Information
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Gateway Modal for Membership Upgrade -->
      <app-payment-modal 
        *ngIf="showPaymentModal" 
        [data]="paymentModalData!" 
        (close)="showPaymentModal = false"
        (paymentSuccess)="onPaymentSuccess($event)">
      </app-payment-modal>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .profile-avatar-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--brand-blue);
      color: #fff;
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .tier-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      background: var(--brand-blue-subtle);
      color: var(--brand-blue-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }
    .tier-fellow {
      background: rgba(251, 191, 36, 0.15) !important;
      color: #fbbf24 !important;
    }
    .tier-premium {
      background: var(--brand-violet-subtle) !important;
      color: var(--brand-violet) !important;
    }
    .plan-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    .plan-card:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
    }
    .plan-card.active-plan {
      background: var(--bg-surface-elevated);
      border-color: var(--brand-blue-hover);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.2);
    }
    .plan-name {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .plan-price {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
    }
  `]
})
export class StudentProfileComponent {
  auth = inject(AuthService);
  mockData = inject(MockDataService);
  themeService = inject(ThemeService);
  toast = inject(ToastService);

  displayName: string = '';
  email: string = '';
  phone: string = '+1 (555) 101-0005';
  preferredLibrary: number = 1;

  showPaymentModal = false;
  paymentModalData: PaymentModalData | null = null;

  constructor() {
    const user = this.auth.currentUser();
    this.displayName = user?.name || 'Alexandria Morgan';
    this.email = user?.email || 'student@libraria.org';
    this.preferredLibrary = user?.library || 1;
  }

  currentUser() {
    return this.auth.currentUser();
  }

  currentTier(): 'standard' | 'premium' | 'fellow' {
    const user = this.currentUser();
    return (user as any)?.membership_tier || 'standard';
  }

  currentTierBadge(): string {
    const tier = this.currentTier();
    return tier === 'fellow' ? 'Research Fellow' : tier === 'premium' ? 'Premium Scholar' : 'Standard Scholar';
  }

  currentLoanLimit(): number {
    const tier = this.currentTier();
    return tier === 'fellow' ? 15 : tier === 'premium' ? 8 : 5;
  }

  getInitials(): string {
    const parts = this.displayName.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.displayName.substring(0, 2).toUpperCase();
  }

  openUpgradeModal(tier: 'premium' | 'fellow', purpose: string, amount: number) {
    const user = this.currentUser();
    this.paymentModalData = {
      title: 'Upgrade Membership Tier',
      purpose: purpose,
      amount: amount,
      planTier: tier,
      memberName: user?.name || 'Alexandria Morgan',
      memberIdNo: user?.student_id || 'STU-2024-001'
    };
    this.showPaymentModal = true;
  }

  onPaymentSuccess(receipt: any) {
    this.mockData.processDigitalPayment({
      amount: receipt.amount,
      purpose: receipt.purpose,
      paymentMethod: receipt.payment_method,
      memberName: receipt.member_name,
      memberIdNo: receipt.member_id_no,
      planTier: receipt.planTier
    });

    const user = this.currentUser();
    if (user) {
      const updatedUser = {
        ...user,
        membership_tier: receipt.planTier,
        membership_badge: receipt.planTier === 'fellow' ? 'Research Fellow' : 'Premium Scholar'
      };
      this.auth.currentUser.set(updatedUser);
      localStorage.setItem('libraria_auth_user', JSON.stringify(updatedUser));
    }

    this.toast.show(`Membership upgraded to ${this.currentTierBadge()}! Receipt: ${receipt.receipt_no}`, 'success');
  }

  switchTier(tier: 'standard') {
    const user = this.currentUser();
    if (user) {
      const updatedUser = {
        ...user,
        membership_tier: tier,
        membership_badge: 'Standard Scholar'
      };
      this.auth.currentUser.set(updatedUser);
      localStorage.setItem('libraria_auth_user', JSON.stringify(updatedUser));
      this.toast.show('Switched to Standard Scholar tier.', 'info');
    }
  }

  saveProfile() {
    const user = this.auth.currentUser();
    if (!user) return;
    const branch = this.mockData.libraries().find(l => l.id === Number(this.preferredLibrary)) || this.mockData.libraries()[0];

    const updatedUser = {
      ...user,
      name: this.displayName,
      student_name: this.displayName,
      email: this.email,
      library: branch.id,
      library_name: branch.name
    };

    this.auth.currentUser.set(updatedUser);
    localStorage.setItem('libraria_auth_user', JSON.stringify(updatedUser));
    this.toast.show('Profile information successfully saved!', 'success');
  }
}
