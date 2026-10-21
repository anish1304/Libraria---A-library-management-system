import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MockDataService } from '../../../services/mock-data.service';
import { ToastService } from '../../../services/toast.service';
import { PaymentModalComponent, PaymentModalData } from '../../../shared/payment-modal/payment-modal.component';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: 'standard' | 'premium' | 'research';
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  isPopular?: boolean;
  bookLimit: number;
  renewalLimit: string;
  features: PlanFeature[];
}

@Component({
  selector: 'app-student-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentModalComponent],
  template: `
    <div class="subscriptions-page">
      <!-- Hero Header -->
      <div class="text-center max-w-700 mx-auto mb-5">
        <span class="badge-plan-hero mb-2">
          <i class="bi bi-gem me-1"></i> MEMBERSHIP TIERS & SUBSCRIPTIONS
        </span>
        <h1 class="page-headline mb-3">Empower Your Academic Journey</h1>
        <p class="text-secondary lead-text mb-4">
          Upgrade your reading privileges with expanded concurrent book borrowing limits, 
          priority hold queues, 1-click renewals, and verified reader recognition.
        </p>

        <!-- Billing Period Toggle -->
        <div class="billing-toggle-container">
          <button 
            type="button" 
            class="toggle-btn" 
            [class.active]="billingCycle() === 'monthly'"
            (click)="billingCycle.set('monthly')">
            Monthly Billing
          </button>
          <button 
            type="button" 
            class="toggle-btn" 
            [class.active]="billingCycle() === 'yearly'"
            (click)="billingCycle.set('yearly')">
            Annual Billing
            <span class="badge-discount ms-1">Save 20%</span>
          </button>
        </div>
      </div>

      <!-- Current Membership Banner -->
      <div class="current-plan-card glass-card mb-5">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="tier-icon-circle">
              <i class="bi bi-shield-check"></i>
            </div>
            <div>
              <div class="text-secondary small fw-bold text-uppercase">Active Membership</div>
              <h4 class="mb-1 text-primary fw-bold">{{ getCurrentPlanName() }}</h4>
              <div class="text-secondary small">
                Account ID: <strong>#{{ currentStudent()?.student_id || 'STU-1001' }}</strong> &middot; 
                Borrowing Quota: <strong>{{ getCurrentBookLimit() }} volumes</strong> &middot; 
                Status: <span class="badge-status badge-success">Active &amp; Verified</span>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <a routerLink="/student/payments" class="btn-saas-secondary">
              <i class="bi bi-receipt me-1"></i> Payment History
            </a>
          </div>
        </div>
      </div>

      <!-- Pricing Plans Grid -->
      <div class="row g-4 mb-5 align-items-stretch">
        <div class="col-lg-4" *ngFor="let plan of plans">
          <div class="pricing-card glass-card h-100" [class.popular]="plan.isPopular" [class.active-tier]="isCurrentPlan(plan.id)">
            <!-- Popular Badge -->
            <div class="popular-ribbon" *ngIf="plan.isPopular">
              <i class="bi bi-stars me-1"></i> MOST POPULAR
            </div>

            <!-- Current Plan Badge -->
            <div class="active-ribbon" *ngIf="isCurrentPlan(plan.id)">
              <i class="bi bi-check-circle-fill me-1"></i> CURRENT PLAN
            </div>

            <div class="plan-header">
              <div class="plan-badge-pill mb-2">{{ plan.badge || 'TIER' }}</div>
              <h3 class="plan-title mb-1">{{ plan.name }}</h3>
              <p class="plan-tagline text-secondary small mb-3">{{ plan.tagline }}</p>

              <!-- Price Box -->
              <div class="price-display mb-3">
                <span class="currency">$</span>
                <span class="amount">{{ getPrice(plan) }}</span>
                <span class="period">/ {{ billingCycle() === 'monthly' ? 'month' : 'year' }}</span>
              </div>
              <div class="billing-note small text-secondary" *ngIf="billingCycle() === 'yearly' && plan.yearlyPrice > 0">
                Billed annually (\${{ plan.yearlyPrice }}/yr)
              </div>
              <div class="billing-note small text-secondary" *ngIf="plan.monthlyPrice === 0">
                Free for all registered students
              </div>
            </div>

            <div class="plan-divider"></div>

            <!-- Quota Highlights -->
            <div class="quota-highlights mb-4">
              <div class="quota-row">
                <i class="bi bi-book-half text-primary me-2"></i>
                <span>Max Active Loans: <strong>{{ plan.bookLimit }} Books</strong></span>
              </div>
              <div class="quota-row">
                <i class="bi bi-arrow-repeat text-indigo me-2"></i>
                <span>Loan Renewals: <strong>{{ plan.renewalLimit }}</strong></span>
              </div>
            </div>

            <!-- Feature List -->
            <ul class="feature-list mb-4">
              <li *ngFor="let feat of plan.features" [class.disabled-feat]="!feat.included">
                <i [class]="feat.included ? 'bi bi-check-circle-fill text-success me-2' : 'bi bi-x-circle text-muted me-2'"></i>
                <span [class.text-muted]="!feat.included">{{ feat.text }}</span>
              </li>
            </ul>

            <!-- CTA Button -->
            <div class="plan-footer mt-auto">
              <button 
                *ngIf="!isCurrentPlan(plan.id)"
                type="button" 
                class="btn-upgrade w-100" 
                [class.btn-popular]="plan.isPopular"
                (click)="onSelectPlan(plan)">
                <i class="bi bi-credit-card-2-front me-2"></i>
                {{ plan.monthlyPrice === 0 ? 'Select Free Tier' : 'Upgrade with Razorpay' }}
              </button>

              <button 
                *ngIf="isCurrentPlan(plan.id)"
                type="button" 
                class="btn-current w-100" 
                disabled>
                <i class="bi bi-shield-check me-2"></i> Current Active Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Guarantee & FAQ Section -->
      <div class="row g-4 mb-5">
        <div class="col-md-4">
          <div class="feature-perk-card glass-card p-4 text-center">
            <div class="perk-icon mb-3"><i class="bi bi-lightning-charge-fill"></i></div>
            <h5>Instant Activation</h5>
            <p class="text-secondary small mb-0">Your upgraded borrowing limits and priority status activate instantly across campus branches.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="feature-perk-card glass-card p-4 text-center">
            <div class="perk-icon mb-3"><i class="bi bi-shield-lock-fill"></i></div>
            <h5>256-Bit SSL Gateway</h5>
            <p class="text-secondary small mb-0">Payments are securely processed with verified digital receipts, UPI QR codes, and card protection.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="feature-perk-card glass-card p-4 text-center">
            <div class="perk-icon mb-3"><i class="bi bi-arrow-counterclockwise"></i></div>
            <h5>Cancel Anytime</h5>
            <p class="text-secondary small mb-0">Switch plans or revert to the standard scholar tier at any time without penalty or hidden fees.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Razorpay-Style Payment Gateway Modal -->
    <app-payment-modal
      *ngIf="showPaymentModal() && paymentModalData()"
      [data]="paymentModalData()!"
      (close)="showPaymentModal.set(false)"
      (paymentSuccess)="onPaymentCompleted($event)">
    </app-payment-modal>
  `,
  styles: [`
    .subscriptions-page {
      padding: 1.5rem 0 3rem 0;
    }
    .max-w-700 {
      max-width: 700px;
    }
    .badge-plan-hero {
      display: inline-flex;
      align-items: center;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(129, 140, 248, 0.3);
      color: #818CF8;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
    }
    .page-headline {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .lead-text {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .billing-toggle-container {
      display: inline-flex;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 9999px;
      padding: 4px;
      gap: 4px;
      box-shadow: var(--shadow-sm);
    }
    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
    }
    .toggle-btn.active {
      background: var(--brand-blue);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .badge-discount {
      background: #10B981;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 9999px;
    }
    .current-plan-card {
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg);
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 1px solid rgba(129, 140, 248, 0.25);
    }
    .tier-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(129, 140, 248, 0.4);
      color: #818CF8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .pricing-card {
      position: relative;
      padding: 2.25rem 2rem;
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      overflow: hidden;
    }
    .pricing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
    }
    .pricing-card.popular {
      border: 2px solid var(--brand-blue);
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.25);
    }
    .pricing-card.active-tier {
      border: 2px solid #10B981;
    }
    .popular-ribbon {
      position: absolute;
      top: 0;
      right: 2rem;
      background: var(--brand-blue);
      color: #fff;
      font-size: 0.675rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
    .active-ribbon {
      position: absolute;
      top: 0;
      right: 2rem;
      background: #10B981;
      color: #fff;
      font-size: 0.675rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
    .plan-badge-pill {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--brand-blue-hover);
    }
    .plan-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .price-display {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }
    .price-display .currency {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .price-display .amount {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }
    .price-display .period {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .plan-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 1.5rem 0;
    }
    .quota-highlights {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.875rem;
    }
    .feature-list li {
      display: flex;
      align-items: flex-start;
    }
    .disabled-feat {
      opacity: 0.5;
    }
    .btn-upgrade {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      font-weight: 600;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-upgrade:hover {
      background: var(--brand-blue-subtle);
      border-color: var(--brand-blue);
      color: var(--brand-blue-hover);
    }
    .btn-popular {
      background: var(--brand-blue);
      color: #ffffff;
      border-color: var(--brand-blue);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .btn-popular:hover {
      background: var(--brand-blue-hover);
      color: #ffffff;
    }
    .btn-current {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10B981;
      font-weight: 600;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-pill);
      cursor: default;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .perk-icon {
      font-size: 2rem;
      color: var(--brand-blue-hover);
    }
  `]
})
export class StudentSubscriptionsComponent {
  auth = inject(AuthService);
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  billingCycle = signal<'monthly' | 'yearly'>('monthly');
  showPaymentModal = signal<boolean>(false);
  selectedPlanForPayment = signal<SubscriptionPlan | null>(null);

  plans: SubscriptionPlan[] = [
    {
      id: 'standard',
      name: 'Standard Scholar',
      tagline: 'Essential academic access for undergraduate coursework and daily study.',
      monthlyPrice: 0,
      yearlyPrice: 0,
      badge: 'STARTER',
      bookLimit: 3,
      renewalLimit: '1 Time (14 Days)',
      features: [
        { text: 'Borrow up to 3 physical books concurrently', included: true },
        { text: '1-time loan renewal per volume (+14d)', included: true },
        { text: 'Standard hold reservation waitlist', included: true },
        { text: 'Verified student book review privileges', included: true },
        { text: 'Priority collection waitlist queue', included: false },
        { text: 'Inter-library branch courier dispatch', included: false },
        { text: 'Unlimited digital research journal downloads', included: false },
      ]
    },
    {
      id: 'premium',
      name: 'Premium Scholar',
      tagline: 'Ideal for honors candidates, thesis research, and avid readers.',
      monthlyPrice: 9.99,
      yearlyPrice: 99.00,
      badge: 'RECOMMENDED',
      isPopular: true,
      bookLimit: 8,
      renewalLimit: '3 Times (42 Days)',
      features: [
        { text: 'Borrow up to 8 physical books concurrently', included: true },
        { text: 'Up to 3 consecutive loan renewals (+42d total)', included: true },
        { text: 'Priority hold queue placement over standard tier', included: true },
        { text: 'Verified Scholar reviewer badge in catalogue', included: true },
        { text: 'Instant SMS & WhatsApp overdue reminders', included: true },
        { text: 'Inter-library branch courier dispatch', included: false },
        { text: 'Unlimited digital research journal downloads', included: false },
      ]
    },
    {
      id: 'research',
      name: 'Research Fellow',
      tagline: 'Comprehensive doctoral, faculty, and multi-campus research privileges.',
      monthlyPrice: 19.99,
      yearlyPrice: 199.00,
      badge: 'VIP ACCESS',
      bookLimit: 20,
      renewalLimit: 'Unlimited Renewals',
      features: [
        { text: 'Borrow up to 20 physical books concurrently', included: true },
        { text: 'Unlimited loan renewals (as long as no holds pending)', included: true },
        { text: 'Instant VIP priority in all hold queues', included: true },
        { text: 'Inter-library campus delivery courier to your desk', included: true },
        { text: 'Unlimited digital paper & journal archive downloads', included: true },
        { text: 'Verified Fellow golden badge in reader reviews', included: true },
        { text: 'Dedicated academic librarian consultation', included: true },
      ]
    }
  ];

  currentStudent() {
    return this.auth.currentUser();
  }

  getCurrentPlanName(): string {
    const student = this.currentStudent();
    const tier = student?.membership_tier || 'standard';
    const found = this.plans.find(p => p.id === tier);
    return found ? found.name : 'Standard Scholar';
  }

  getCurrentBookLimit(): number {
    const student = this.currentStudent();
    const tier = student?.membership_tier || 'standard';
    const found = this.plans.find(p => p.id === tier);
    return found ? found.bookLimit : 3;
  }

  isCurrentPlan(planId: string): boolean {
    const student = this.currentStudent();
    const currentTier = student?.membership_tier || 'standard';
    return currentTier === planId;
  }

  getPrice(plan: SubscriptionPlan): number {
    return this.billingCycle() === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  }

  getSelectedPlanPrice(): number {
    const plan = this.selectedPlanForPayment();
    if (!plan) return 0;
    return this.getPrice(plan);
  }

  onSelectPlan(plan: SubscriptionPlan) {
    if (plan.monthlyPrice === 0) {
      // Revert to free
      const user = this.currentStudent();
      if (user) {
        this.mockData.updateUserTier(user.id, 'standard');
        this.auth.currentUser.update(u => u ? { ...u, membership_tier: 'standard' } : u);
        this.toast.show('Plan switched to Standard Scholar Free Tier.', 'info');
      }
      return;
    }
    this.selectedPlanForPayment.set(plan);
    this.showPaymentModal.set(true);
  }

  paymentModalData = computed<PaymentModalData | null>(() => {
    const plan = this.selectedPlanForPayment();
    const student = this.currentStudent();
    if (!plan) return null;
    return {
      title: `${plan.name} Subscription`,
      purpose: `Upgrade to ${plan.name} (${this.billingCycle()} billing)`,
      amount: this.getPrice(plan),
      planTier: (plan.id === 'research' ? 'fellow' : plan.id) as any,
      memberName: student?.name || student?.student_name || 'Scholar Member',
      memberIdNo: student?.student_id || 'STU-1001'
    };
  });

  onPaymentCompleted(receipt: any) {
    const plan = this.selectedPlanForPayment();
    const user = this.currentStudent();
    if (plan && user) {
      this.mockData.updateUserTier(user.id, plan.id);
      this.auth.currentUser.update(u => u ? { ...u, membership_tier: plan.id as any } : u);
      this.toast.show(`Congratulations! Successfully upgraded to ${plan.name}.`, 'success');
    }
  }
}
