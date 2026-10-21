import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaymentModalData {
  title: string;
  purpose: string;
  amount: number;
  fineId?: number;
  planTier?: 'standard' | 'premium' | 'fellow';
  memberName: string;
  memberIdNo: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-modal-backdrop" (click)="onBackdropClick($event)">
      <div class="payment-modal-card">
        <!-- Razorpay / Gateway Header -->
        <div class="payment-header">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="gateway-logo-badge">
                <i class="bi bi-shield-fill-check"></i>
              </div>
              <div>
                <h6 class="mb-0 fw-bold text-white">LIBRARIA PayGateway</h6>
                <span class="gateway-subtag">256-Bit SSL Encrypted &middot; Razorpay Verified</span>
              </div>
            </div>
            <button type="button" class="btn-close-payment" (click)="close.emit()" [disabled]="processing()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Payment Flow Body -->
        <div class="payment-body" *ngIf="!receipt()">
          <!-- Summary Banner -->
          <div class="amount-banner mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="text-secondary small d-block">{{ data.purpose }}</span>
                <span class="fw-semibold text-white small">Patron: {{ data.memberName }} ({{ data.memberIdNo }})</span>
              </div>
              <div class="text-end">
                <span class="text-secondary small d-block">Amount Due</span>
                <div class="amount-display">\${{ data.amount.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- Payment Method Selector Tabs -->
          <div class="payment-tabs mb-3">
            <button 
              type="button" 
              class="payment-tab-btn" 
              [class.active]="selectedMethod === 'UPI'"
              (click)="selectedMethod = 'UPI'">
              <i class="bi bi-qr-code-scan me-1"></i> UPI / QR
            </button>
            <button 
              type="button" 
              class="payment-tab-btn" 
              [class.active]="selectedMethod === 'CARD'"
              (click)="selectedMethod = 'CARD'">
              <i class="bi bi-credit-card-2-front me-1"></i> Card
            </button>
            <button 
              type="button" 
              class="payment-tab-btn" 
              [class.active]="selectedMethod === 'NETBANKING'"
              (click)="selectedMethod = 'NETBANKING'">
              <i class="bi bi-bank me-1"></i> Net Banking
            </button>
          </div>

          <!-- Tab 1: UPI / QR -->
          <div *ngIf="selectedMethod === 'UPI'" class="method-panel text-center py-2">
            <div class="qr-box mx-auto mb-2">
              <!-- Visual Mock QR Canvas -->
              <div class="mock-qr-pattern">
                <i class="bi bi-qr-code fs-1 text-primary"></i>
              </div>
            </div>
            <p class="text-secondary small mb-2">Scan with Google Pay, PhonePe, Paytm, or any UPI App</p>
            <div class="upi-id-pill">
              <span class="font-monospace text-primary">libraria.pay&#64;icici</span>
              <span class="badge bg-success-subtle text-success ms-2">Active</span>
            </div>
          </div>

          <!-- Tab 2: Credit / Debit Card -->
          <div *ngIf="selectedMethod === 'CARD'" class="method-panel py-2">
            <div class="mb-2">
              <label class="form-label-custom">Cardholder Name</label>
              <input type="text" class="form-control-saas" [(ngModel)]="cardName" placeholder="Full name on card" />
            </div>
            <div class="mb-2">
              <label class="form-label-custom">Card Number</label>
              <div class="input-with-icon">
                <i class="bi bi-credit-card"></i>
                <input type="text" class="form-control-saas" [(ngModel)]="cardNumber" placeholder="4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8920" />
              </div>
            </div>
            <div class="row g-2">
              <div class="col-7">
                <label class="form-label-custom">Expiry Date</label>
                <input type="text" class="form-control-saas" [(ngModel)]="cardExpiry" placeholder="MM / YY" />
              </div>
              <div class="col-5">
                <label class="form-label-custom">CVV / CVC</label>
                <input type="password" class="form-control-saas" [(ngModel)]="cardCvv" placeholder="&bull;&bull;&bull;" maxlength="4" />
              </div>
            </div>
          </div>

          <!-- Tab 3: Net Banking -->
          <div *ngIf="selectedMethod === 'NETBANKING'" class="method-panel py-2">
            <label class="form-label-custom">Select Bank</label>
            <select class="form-select form-control-saas mb-3" [(ngModel)]="selectedBank">
              <option value="HDFC">HDFC Bank</option>
              <option value="ICICI">ICICI Bank</option>
              <option value="SBI">State Bank of India</option>
              <option value="AXIS">Axis Bank</option>
              <option value="CHASE">JPMorgan Chase</option>
              <option value="CITI">Citibank Academic</option>
            </select>
            <div class="p-2 rounded bg-surface-hover small text-secondary">
              <i class="bi bi-info-circle text-primary me-1"></i> You will be redirected to the bank's secure authorization page.
            </div>
          </div>

          <!-- Security note -->
          <div class="d-flex align-items-center justify-content-between small text-secondary border-top pt-3 mt-3">
            <span><i class="bi bi-lock-fill text-success me-1"></i> PCI-DSS Level 1 Compliant</span>
            <span>Fee: $0.00</span>
          </div>

          <!-- Pay CTA Button -->
          <div class="mt-3">
            <button 
              type="button" 
              class="btn-pay-now" 
              (click)="triggerPayment()" 
              [disabled]="processing()">
              <span *ngIf="!processing()">
                <i class="bi bi-shield-lock-fill me-1"></i>
                Pay \${{ data.amount.toFixed(2) }} Securely
              </span>
              <span *ngIf="processing()" class="d-flex align-items-center justify-content-center gap-2">
                <span class="spinner-border spinner-border-sm" role="status"></span>
                <span>Connecting to Payment Gateway...</span>
              </span>
            </button>
          </div>
        </div>

        <!-- Success Screen / Tax Clearance Receipt -->
        <div class="payment-body text-center py-4" *ngIf="receipt()">
          <div class="receipt-success-icon mb-3">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <h5 class="fw-bold text-white mb-1">Payment Authorized &amp; Settled</h5>
          <p class="text-secondary small mb-3">Official transaction receipt issued for your institutional records.</p>

          <div class="receipt-box text-start p-3 mb-3">
            <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
              <span class="text-secondary small">Receipt No:</span>
              <span class="font-monospace small fw-bold text-primary">{{ receipt()?.receipt_no }}</span>
            </div>
            <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
              <span class="text-secondary small">Transaction ID:</span>
              <span class="font-monospace small text-white">{{ receipt()?.transaction_id }}</span>
            </div>
            <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
              <span class="text-secondary small">Purpose:</span>
              <span class="small fw-semibold text-white">{{ receipt()?.purpose }}</span>
            </div>
            <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
              <span class="text-secondary small">Paid By:</span>
              <span class="small text-white">{{ receipt()?.member_name }} ({{ receipt()?.member_id_no }})</span>
            </div>
            <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
              <span class="text-secondary small">Payment Method:</span>
              <span class="small text-white">{{ receipt()?.payment_method }}</span>
            </div>
            <div class="d-flex justify-content-between py-1 pt-2">
              <span class="text-secondary small">Total Paid:</span>
              <span class="fw-bold fs-6 text-success">\${{ receipt()?.amount.toFixed(2) }}</span>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="button" class="btn btn-saas-secondary flex-grow-1" (click)="printReceipt()">
              <i class="bi bi-printer me-1"></i> Print Receipt
            </button>
            <button type="button" class="btn btn-saas-primary flex-grow-1" (click)="completePayment()">
              <i class="bi bi-check2 me-1"></i> Close &amp; Return
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(11, 16, 32, 0.75);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }
    .payment-modal-card {
      width: 100%;
      max-width: 480px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalSlideUp {
      from { transform: translateY(20px) scale(0.97); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    .payment-header {
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(167, 139, 250, 0.15) 100%);
      border-bottom: 1px solid var(--border-subtle);
    }
    .gateway-logo-badge {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--brand-blue);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
    }
    .gateway-subtag {
      font-size: 0.72rem;
      color: var(--brand-blue-hover);
      letter-spacing: 0.02em;
    }
    .btn-close-payment {
      background: transparent;
      border: none;
      color: var(--text-tertiary);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }
    .btn-close-payment:hover {
      color: var(--text-primary);
    }
    .payment-body {
      padding: 1.25rem;
    }
    .amount-banner {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
    }
    .amount-display {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--brand-blue-hover);
      line-height: 1.1;
    }
    .payment-tabs {
      display: flex;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 3px;
      gap: 3px;
    }
    .payment-tab-btn {
      flex: 1;
      padding: 0.45rem 0.5rem;
      font-size: 0.785rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: transparent;
      border: none;
      border-radius: var(--radius-pill);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .payment-tab-btn.active {
      background: var(--brand-blue);
      color: #fff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }
    .qr-box {
      width: 130px;
      height: 130px;
      background: #ffffff;
      border-radius: var(--radius-md);
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    .mock-qr-pattern {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 6px;
    }
    .upi-id-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.3rem 0.85rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      font-size: 0.825rem;
    }
    .btn-pay-now {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-violet) 100%);
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      border: none;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .btn-pay-now:hover:not(:disabled) {
      filter: brightness(1.1);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
      transform: translateY(-1px);
    }
    .btn-pay-now:disabled {
      opacity: 0.75;
      cursor: not-allowed;
    }
    .receipt-success-icon {
      font-size: 3rem;
      color: var(--color-success);
      filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.4));
    }
    .receipt-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
  `]
})
export class PaymentModalComponent {
  @Input({ required: true }) data!: PaymentModalData;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();

  selectedMethod: 'UPI' | 'CARD' | 'NETBANKING' = 'UPI';
  selectedBank = 'HDFC';
  cardName = 'Alexandria Morgan';
  cardNumber = '4532 •••• •••• 8920';
  cardExpiry = '08/28';
  cardCvv = '•••';

  processing = signal(false);
  receipt = signal<any>(null);

  triggerPayment() {
    this.processing.set(true);

    // Simulate authentic payment processing delay (1.2s)
    setTimeout(() => {
      const methodLabel = this.selectedMethod === 'UPI' ? 'UPI / QR' 
                        : this.selectedMethod === 'CARD' ? 'Credit/Debit Card' 
                        : 'Net Banking';

      const receiptData = {
        receipt_no: `RZP-PAY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        transaction_id: `txn_${Math.random().toString(36).substring(2, 11)}`,
        amount: this.data.amount,
        purpose: this.data.purpose,
        payment_method: methodLabel,
        paid_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
        member_name: this.data.memberName,
        member_id_no: this.data.memberIdNo,
        fineId: this.data.fineId,
        planTier: this.data.planTier
      };

      this.receipt.set(receiptData);
      this.processing.set(false);
      this.paymentSuccess.emit(receiptData);
    }, 1200);
  }

  printReceipt() {
    window.print();
  }

  completePayment() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('payment-modal-backdrop') && !this.processing()) {
      this.close.emit();
    }
  }
}
