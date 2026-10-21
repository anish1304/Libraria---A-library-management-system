import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ReservationRecord } from '../../../models/libraria.models';
import { StatusBadgeComponent } from '../../../shared/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-student-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
          <h2 class="page-title mb-1">My Reserved Holds & Waitlists</h2>
          <p class="text-secondary small mb-0">
            Track queued titles, monitor waitlist priority, and view collection deadlines.
          </p>
        </div>
        <div>
          <a routerLink="/student/books" class="btn btn-saas-primary btn-sm">
            <i class="bi bi-search me-1"></i> Browse Catalog to Reserve
          </a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-4">
          <app-stat-card 
            title="Total Active Holds" 
            [value]="myReservations().length" 
            icon="bi-bookmark-check" 
            variant="blue">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-4">
          <app-stat-card 
            title="Ready for Collection" 
            [value]="readyCount()" 
            icon="bi-box-seam" 
            variant="success">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-4">
          <app-stat-card 
            title="Waiting in Queue" 
            [value]="waitingCount()" 
            icon="bi-hourglass-split" 
            variant="warning">
          </app-stat-card>
        </div>
      </div>

      <!-- Ready Alert Banner -->
      <div *ngIf="readyCount() > 0" class="alert alert-success d-flex align-items-center gap-3 mb-4">
        <i class="bi bi-bell-fill fs-4 flex-shrink-0"></i>
        <div>
          <div class="fw-bold">You have items ready for pickup!</div>
          <div class="small">
            Please visit the circulation desk with your student ID card before the collection expiration date.
          </div>
        </div>
      </div>

      <!-- List of Holds -->
      <div class="card-saas overflow-hidden">
        <div class="table-responsive" *ngIf="myReservations().length > 0">
          <table class="table-saas w-100 mb-0">
            <thead>
              <tr>
                <th>Hold ID</th>
                <th>Title & Author</th>
                <th>Pickup Location</th>
                <th>Requested On</th>
                <th>Queue Position</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let res of myReservations()">
                <td>
                  <span class="font-monospace small text-primary fw-bold">#RES-{{ res.id }}</span>
                </td>
                <td>
                  <div class="fw-bold text-primary">{{ res.book_title }}</div>
                  <div class="xsmall text-secondary">{{ res.book_author }}</div>
                </td>
                <td>
                  <div class="small fw-semibold">{{ res.library_name }}</div>
                  <div class="xsmall text-muted" *ngIf="res.notes">{{ res.notes }}</div>
                </td>
                <td>
                  <span class="small">{{ res.reservation_date }}</span>
                  <div class="xsmall text-danger fw-semibold" *ngIf="res.status === 'Ready for Pickup'">
                    Expires: {{ res.expiry_date }}
                  </div>
                </td>
                <td>
                  <span 
                    class="badge-status" 
                    [ngClass]="res.status === 'Ready for Pickup' ? 'badge-success' : 'badge-primary'">
                    {{ res.status === 'Ready for Pickup' ? 'Ready Now' : 'Queue #' + res.queue_position }}
                  </span>
                </td>
                <td>
                  <app-status-badge 
                    [status]="res.status" 
                    [type]="res.status === 'Ready for Pickup' ? 'success' : 'warning'">
                  </app-status-badge>
                </td>
                <td class="text-end">
                  <button 
                    *ngIf="res.status === 'Waiting' || res.status === 'Ready for Pickup'"
                    type="button" 
                    class="btn btn-saas-secondary btn-sm py-1 px-2 text-danger"
                    (click)="confirmCancel(res)"
                    title="Cancel this reservation">
                    <i class="bi bi-x-circle me-1"></i> Cancel Hold
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state 
          *ngIf="myReservations().length === 0"
          icon="bi-bookmark"
          title="No Active Reservations"
          description="You do not currently have any books on hold. Search the library catalog to place a hold on titles."
          actionText="Discover Books"
          actionLink="/student/books">
        </app-empty-state>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="showCancelModal"
      title="Cancel Book Hold"
      [message]="'Are you sure you want to cancel your reservation for ' + (selectedReservation?.book_title || '') + '?'"
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
export class StudentReservationsComponent {
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  showCancelModal = false;
  selectedReservation: ReservationRecord | null = null;

  myReservations(): ReservationRecord[] {
    const user = this.auth.currentUser();
    const memberId = user?.id || 5; // Alexandria Morgan by default
    return this.mockData.reservations().filter(
      r => r.member_id === memberId && (r.status === 'Waiting' || r.status === 'Ready for Pickup')
    );
  }

  readyCount(): number {
    return this.myReservations().filter(r => r.status === 'Ready for Pickup').length;
  }

  waitingCount(): number {
    return this.myReservations().filter(r => r.status === 'Waiting').length;
  }

  confirmCancel(res: ReservationRecord) {
    this.selectedReservation = res;
    this.showCancelModal = true;
  }

  doCancel() {
    if (!this.selectedReservation) return;
    const user = this.auth.currentUser();
    this.mockData.updateReservationStatus(
      this.selectedReservation.id,
      'Cancelled',
      user?.name || 'Alexandria Morgan',
      'student'
    );
    this.toast.show('Reservation hold cancelled.', 'info');
    this.showCancelModal = false;
    this.selectedReservation = null;
  }
}
