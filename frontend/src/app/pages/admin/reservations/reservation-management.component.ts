import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ReservationRecord, ReservationStatus } from '../../../models/libraria.models';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent,
    EmptyStateComponent,
    StatCardComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Reservation & Waitlist Queue</h2>
          <p class="text-secondary small mb-0">
            Monitor patron hold requests, allocate incoming returns, and manage pickup staging.
          </p>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Total Holds Placed" 
            [value]="totalHolds()" 
            icon="bi-bookmark-check" 
            variant="blue">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Waiting in Queue" 
            [value]="waitingCount()" 
            icon="bi-hourglass-split" 
            variant="warning">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Ready for Pickup" 
            [value]="readyCount()" 
            icon="bi-box-seam" 
            variant="success">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <app-stat-card 
            title="Active Branches" 
            [value]="mockData.libraries().length" 
            icon="bi-building" 
            variant="default">
          </app-stat-card>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="card-saas mb-4 p-3">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-with-icon">
              <i class="bi bi-search"></i>
              <input 
                type="text" 
                class="form-control-saas" 
                placeholder="Search by title, patron, or hold ID..." 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="applyFilter()">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-control-saas" [(ngModel)]="statusFilter" (change)="applyFilter()">
              <option value="ALL">All Statuses</option>
              <option value="Waiting">Waiting in Queue</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select form-control-saas" [(ngModel)]="branchFilter" (change)="applyFilter()">
              <option [value]="0">All Branches</option>
              <option *ngFor="let branch of mockData.libraries()" [value]="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-2 text-md-end">
            <button class="btn btn-saas-secondary btn-sm w-100" (click)="resetFilters()">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card-saas overflow-hidden">
        <div class="table-responsive">
          <table class="table-saas w-100 mb-0">
            <thead>
              <tr>
                <th>Hold ID</th>
                <th>Book Title & Author</th>
                <th>Borrower</th>
                <th>Pickup Library</th>
                <th>Placed Date</th>
                <th>Queue Position</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let res of filteredList()">
                <td>
                  <span class="font-monospace small fw-bold text-primary">#RES-{{ res.id }}</span>
                </td>
                <td>
                  <div class="fw-bold text-primary">{{ res.book_title }}</div>
                  <div class="xsmall text-secondary">{{ res.book_author }}</div>
                </td>
                <td>
                  <div class="fw-medium">{{ res.member_name }}</div>
                  <div class="xsmall text-secondary">{{ res.member_email }}</div>
                </td>
                <td>
                  <span class="small">{{ res.library_name }}</span>
                </td>
                <td>
                  <span class="small">{{ res.reservation_date }}</span>
                  <div class="xsmall text-secondary" *ngIf="res.expiry_date">
                    Exp: {{ res.expiry_date }}
                  </div>
                </td>
                <td>
                  <span 
                    class="badge-status" 
                    [ngClass]="res.queue_position === 1 ? 'badge-primary' : 'badge-secondary'">
                    Priority #{{ res.queue_position }}
                  </span>
                </td>
                <td>
                  <app-status-badge 
                    [status]="res.status" 
                    [type]="mapBadgeType(res.status)">
                  </app-status-badge>
                </td>
                <td class="text-end">
                  <div class="dropdown d-inline-block">
                    <button 
                      *ngIf="res.status === 'Waiting'" 
                      class="btn btn-sm btn-saas-secondary py-1 px-2 me-1"
                      (click)="markReady(res)"
                      title="Notify member that book is ready">
                      <i class="bi bi-box-seam me-1"></i> Stage Pickup
                    </button>

                    <button 
                      *ngIf="res.status === 'Ready for Pickup'" 
                      class="btn btn-sm btn-saas-primary py-1 px-2 me-1"
                      (click)="fulfillHold(res)"
                      title="Issue copy and complete hold">
                      <i class="bi bi-check-circle me-1"></i> Fulfill Hold
                    </button>

                    <button 
                      *ngIf="res.status === 'Waiting' || res.status === 'Ready for Pickup'" 
                      class="btn btn-sm btn-saas-secondary py-1 px-2 text-danger"
                      (click)="confirmCancel(res)"
                      title="Cancel reservation">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <app-empty-state 
          *ngIf="filteredList().length === 0"
          icon="bi-bookmark-dash"
          title="No reservations found"
          description="There are currently no hold requests matching the selected filter criteria.">
        </app-empty-state>
      </div>
    </div>

    <!-- Confirmation Modal for Cancellation -->
    <app-confirmation-modal
      [isOpen]="showCancelModal"
      title="Cancel Reservation Hold"
      [message]="'Are you sure you want to cancel the hold on ' + (selectedReservation?.book_title || '') + ' for ' + (selectedReservation?.member_name || '') + '?'"
      confirmText="Yes, Cancel Hold"
      confirmVariant="danger"
      (confirm)="doCancel()"
      (cancel)="showCancelModal = false">
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
  `]
})
export class ReservationManagementComponent {
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  searchQuery: string = '';
  statusFilter: string = 'ALL';
  branchFilter: number = 0;

  filteredList = signal<ReservationRecord[]>([]);
  showCancelModal: boolean = false;
  selectedReservation: ReservationRecord | null = null;

  constructor() {
    this.applyFilter();
  }

  totalHolds(): number {
    return this.mockData.reservations().length;
  }

  waitingCount(): number {
    return this.mockData.reservations().filter(r => r.status === 'Waiting').length;
  }

  readyCount(): number {
    return this.mockData.reservations().filter(r => r.status === 'Ready for Pickup').length;
  }

  applyFilter() {
    let list = this.mockData.reservations();
    if (this.statusFilter !== 'ALL') {
      list = list.filter(r => r.status === this.statusFilter);
    }
    if (Number(this.branchFilter) !== 0) {
      list = list.filter(r => r.library_id === Number(this.branchFilter));
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(r =>
        r.book_title.toLowerCase().includes(q) ||
        r.member_name.toLowerCase().includes(q) ||
        r.member_email.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    }
    this.filteredList.set(list);
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.branchFilter = 0;
    this.applyFilter();
  }

  mapBadgeType(status: ReservationStatus): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'Ready for Pickup': return 'success';
      case 'Waiting': return 'warning';
      case 'Cancelled': return 'danger';
      case 'Fulfilled': return 'info';
      default: return 'secondary';
    }
  }

  markReady(res: ReservationRecord) {
    const actor = this.auth.currentUser();
    const result = this.mockData.updateReservationStatus(
      res.id,
      'Ready for Pickup',
      actor?.name || 'Staff Librarian',
      (actor?.role || 'librarian') as any
    );
    if (result.success) {
      this.toast.show(`Reservation staged! Patron ${res.member_name} notified for pickup.`, 'success');
      this.applyFilter();
    }
  }

  fulfillHold(res: ReservationRecord) {
    const actor = this.auth.currentUser();
    // Mark hold fulfilled
    this.mockData.updateReservationStatus(
      res.id,
      'Fulfilled',
      actor?.name || 'Staff Librarian',
      (actor?.role || 'librarian') as any
    );
    this.toast.show(`Reservation marked as Fulfilled. Book handed over to ${res.member_name}.`, 'success');
    this.applyFilter();
  }

  confirmCancel(res: ReservationRecord) {
    this.selectedReservation = res;
    this.showCancelModal = true;
  }

  doCancel() {
    if (!this.selectedReservation) return;
    const actor = this.auth.currentUser();
    this.mockData.updateReservationStatus(
      this.selectedReservation.id,
      'Cancelled',
      actor?.name || 'Staff Librarian',
      (actor?.role || 'librarian') as any
    );
    this.toast.show('Reservation cancelled.', 'info');
    this.showCancelModal = false;
    this.selectedReservation = null;
    this.applyFilter();
  }
}
