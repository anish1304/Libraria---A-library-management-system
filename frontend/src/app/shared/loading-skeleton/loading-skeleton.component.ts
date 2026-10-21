import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Table Rows Skeleton -->
    <div *ngIf="type === 'table'" class="skeleton-table">
      <div *ngFor="let item of items" class="skeleton-table-row">
        <div class="skeleton-pulse" style="width: 40px; height: 40px; border-radius: 6px;"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div class="skeleton-pulse" style="width: 45%; height: 16px;"></div>
          <div class="skeleton-pulse" style="width: 25%; height: 12px;"></div>
        </div>
        <div class="skeleton-pulse" style="width: 80px; height: 14px;"></div>
        <div class="skeleton-pulse" style="width: 90px; height: 24px; border-radius: 20px;"></div>
        <div class="skeleton-pulse" style="width: 32px; height: 32px; border-radius: 6px;"></div>
      </div>
    </div>

    <!-- Cards Skeleton -->
    <div *ngIf="type === 'cards'" class="row g-3">
      <div *ngFor="let item of items" class="col-md-4 col-sm-6">
        <div class="saas-card p-3">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="skeleton-pulse" style="width: 48px; height: 48px; border-radius: 8px;"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
              <div class="skeleton-pulse" style="width: 60%; height: 16px;"></div>
              <div class="skeleton-pulse" style="width: 40%; height: 12px;"></div>
            </div>
          </div>
          <div class="skeleton-pulse mb-2" style="width: 100%; height: 14px;"></div>
          <div class="skeleton-pulse" style="width: 75%; height: 14px;"></div>
        </div>
      </div>
    </div>

    <!-- General Text Lines Skeleton -->
    <div *ngIf="type === 'text'" style="display: flex; flex-direction: column; gap: 10px;">
      <div *ngFor="let item of items" class="skeleton-pulse" [style.height.px]="16" [style.width.%]="(item % 2 === 0 ? 85 : 65)"></div>
    </div>
  `,
  styles: [`
    .skeleton-table {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;
    }
    .skeleton-table-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'table' | 'cards' | 'text' = 'table';
  @Input() count: number = 4;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i + 1);
  }
}
