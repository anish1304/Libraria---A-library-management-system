import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../services/mock-data.service';
import { ToastService } from '../../../services/toast.service';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

export type ReportType = 
  | 'circulation' 
  | 'overdue' 
  | 'inventory' 
  | 'popular' 
  | 'categories' 
  | 'members' 
  | 'reservations' 
  | 'fines' 
  | 'branches';

@Component({
  selector: 'app-report-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent, EmptyStateComponent],
  template: `
    <div class="page-container print-area">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 no-print">
        <div>
          <h2 class="page-title mb-1">Institutional Reporting & Analytics Studio</h2>
          <p class="text-secondary small mb-0">
            Generate verifiable operational audits, distribution reports, and client-side CSV exports.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-saas-secondary btn-sm" (click)="triggerPrint()">
            <i class="bi bi-printer me-1"></i> Print / PDF Layout
          </button>
          <button type="button" class="btn btn-saas-primary btn-sm" (click)="exportToCsv()">
            <i class="bi bi-download me-1"></i> Export Filtered CSV
          </button>
        </div>
      </div>

      <!-- Controls Panel -->
      <div class="card-saas mb-4 p-3 no-print">
        <div class="row g-3 align-items-center">
          <!-- Report Type Selector -->
          <div class="col-12 col-md-4">
            <label class="form-label-custom mb-1">Select Report Type</label>
            <select class="form-select form-control-saas" [(ngModel)]="activeReport" (change)="onReportChange()">
              <option value="circulation">1. Circulation Activity Report</option>
              <option value="overdue">2. Overdue Loans & Default Risk Report</option>
              <option value="inventory">3. Physical Copy Inventory Report</option>
              <option value="popular">4. Most Popular Titles Ranking</option>
              <option value="categories">5. Category-Wise Distribution Report</option>
              <option value="members">6. Member Borrowing Activity Report</option>
              <option value="reservations">7. Reservations & Waitlist Report</option>
              <option value="fines">8. Fines & Penalty Revenue Summary</option>
              <option value="branches">9. Branch Operations Comparison</option>
            </select>
          </div>

          <!-- Branch Filter -->
          <div class="col-6 col-md-3">
            <label class="form-label-custom mb-1">Library Scope</label>
            <select class="form-select form-control-saas" [(ngModel)]="selectedBranch" (change)="generateReport()">
              <option [value]="0">All University Libraries</option>
              <option *ngFor="let b of mockData.libraries()" [value]="b.id">{{ b.name }}</option>
            </select>
          </div>

          <!-- Date Range -->
          <div class="col-6 col-md-3">
            <label class="form-label-custom mb-1">Reporting Period</label>
            <select class="form-select form-control-saas" [(ngModel)]="dateRange" (change)="generateReport()">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Current Academic Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <!-- Refresh -->
          <div class="col-12 col-md-2 d-flex align-items-end">
            <button class="btn btn-saas-secondary btn-sm w-100" (click)="generateReport()">
              <i class="bi bi-arrow-repeat me-1"></i> Refresh Data
            </button>
          </div>
        </div>
      </div>

      <!-- Report Metadata Strip -->
      <div class="report-meta-strip mb-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <span class="fw-bold text-primary">{{ getReportTitle() }}</span>
            <span class="mx-2 text-muted">•</span>
            <span class="text-secondary small">Scope: {{ getBranchName() }}</span>
            <span class="mx-2 text-muted">•</span>
            <span class="text-secondary small">Period: {{ getPeriodLabel() }}</span>
          </div>
          <div class="text-secondary small">
            Generated: <strong>{{ generatedDate }}</strong> • Records: <strong>{{ tableRows().length }}</strong>
          </div>
        </div>
      </div>

      <!-- Report Dynamic KPIs -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-md-3" *ngFor="let kpi of reportKpis()">
          <app-stat-card 
            [title]="kpi.title" 
            [value]="kpi.value" 
            [icon]="kpi.icon" 
            [variant]="kpi.variant">
          </app-stat-card>
        </div>
      </div>

      <!-- Main Data Table Card -->
      <div class="card-saas overflow-hidden mb-4">
        <div class="card-header-clean p-3 border-bottom d-flex align-items-center justify-content-between">
          <div class="fw-bold small text-uppercase letter-spacing-1 text-secondary">
            Tabular Report Detail ({{ tableRows().length }} rows)
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-saas w-100 mb-0">
            <thead>
              <tr>
                <th *ngFor="let col of tableHeaders()">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of tableRows()">
                <td *ngFor="let cell of row; let first = first">
                  <span [class.fw-bold]="first" [class.text-primary]="first">{{ cell }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state 
          *ngIf="tableRows().length === 0"
          icon="bi-file-earmark-bar-graph"
          title="No data available"
          description="There are no records matching the selected parameters for this reporting category.">
        </app-empty-state>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .report-meta-strip {
      background: var(--bg-surface-hover);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
    }
    .letter-spacing-1 {
      letter-spacing: 0.06em;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      .saas-sidebar, .saas-header {
        display: none !important;
      }
      .saas-main-container {
        margin-left: 0 !important;
        padding: 0 !important;
      }
      .print-area {
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
      }
    }
  `]
})
export class ReportStudioComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  activeReport: ReportType = 'circulation';
  selectedBranch: number = 0;
  dateRange: string = 'all';
  generatedDate: string = new Date().toLocaleString();

  tableHeaders = signal<string[]>([]);
  tableRows = signal<string[][]>([]);
  reportKpis = signal<{ title: string; value: string | number; icon: string; variant: any }[]>([]);

  constructor() {
    this.generateReport();
  }

  onReportChange() {
    this.generateReport();
  }

  getReportTitle(): string {
    switch (this.activeReport) {
      case 'circulation': return 'Circulation & Lending Register';
      case 'overdue': return 'Overdue Loans & Risk Assessment';
      case 'inventory': return 'Physical Copy Holdings & Asset Condition';
      case 'popular': return 'High-Demand & Circulation Frequency Ranking';
      case 'categories': return 'Disciplinary Subject Distribution';
      case 'members': return 'Patron Borrowing Activity & Quota Analysis';
      case 'reservations': return 'Hold Queue & Waitlist Fulfillment';
      case 'fines': return 'Fines & Revenue Settlement Statement';
      case 'branches': return 'Multi-Branch Comparative Performance';
    }
  }

  getBranchName(): string {
    if (Number(this.selectedBranch) === 0) return 'All Campus Libraries';
    const b = this.mockData.libraries().find(l => l.id === Number(this.selectedBranch));
    return b ? b.name : 'All Libraries';
  }

  getPeriodLabel(): string {
    switch (this.dateRange) {
      case '7': return 'Last 7 Days';
      case '30': return 'Last 30 Days';
      case '90': return 'Last 90 Days';
      case '365': return 'Academic Year';
      default: return 'Complete Archive';
    }
  }

  generateReport() {
    this.generatedDate = new Date().toLocaleString();
    const branchId = Number(this.selectedBranch);

    switch (this.activeReport) {
      case 'circulation':
        this.buildCirculationReport(branchId);
        break;
      case 'overdue':
        this.buildOverdueReport(branchId);
        break;
      case 'inventory':
        this.buildInventoryReport(branchId);
        break;
      case 'popular':
        this.buildPopularBooksReport(branchId);
        break;
      case 'categories':
        this.buildCategoryReport(branchId);
        break;
      case 'members':
        this.buildMemberActivityReport(branchId);
        break;
      case 'reservations':
        this.buildReservationsReport(branchId);
        break;
      case 'fines':
        this.buildFinesReport(branchId);
        break;
      case 'branches':
        this.buildBranchComparisonReport();
        break;
    }
  }

  // --- REPORT BUILDERS ---

  private buildCirculationReport(branchId: number) {
    let loans = this.mockData.loans();
    if (branchId !== 0) loans = loans.filter(l => l.library_id === branchId);

    const activeCount = loans.filter(l => l.status === 'Issued').length;
    const returnedCount = loans.filter(l => l.status === 'Returned').length;
    const overdueCount = loans.filter(l => l.is_overdue).length;

    this.reportKpis.set([
      { title: 'Total Circulation Events', value: loans.length, icon: 'bi-arrow-left-right', variant: 'blue' },
      { title: 'Currently on Loan', value: activeCount, icon: 'bi-journal-check', variant: 'warning' },
      { title: 'Successfully Returned', value: returnedCount, icon: 'bi-check-circle', variant: 'success' },
      { title: 'Overdue Flags', value: overdueCount, icon: 'bi-exclamation-triangle', variant: 'danger' }
    ]);

    this.tableHeaders.set(['Loan ID', 'Title', 'Borrower', 'Barcode', 'Issued Date', 'Due Date', 'Status', 'Days Overdue']);
    this.tableRows.set(loans.map(l => [
      `#LN-${l.id}`,
      l.book_title,
      l.member_name,
      l.copy_barcode,
      l.issue_date,
      l.due_date,
      l.status,
      l.overdue_days > 0 ? `${l.overdue_days} days` : 'On schedule'
    ]));
  }

  private buildOverdueReport(branchId: number) {
    let overdue = this.mockData.loans().filter(l => l.is_overdue && l.status === 'Issued');
    if (branchId !== 0) overdue = overdue.filter(l => l.library_id === branchId);

    const totalFines = overdue.reduce((sum, l) => sum + (l.fine_amount || (l.overdue_days * 1.5)), 0);

    this.reportKpis.set([
      { title: 'Active Overdue Loans', value: overdue.length, icon: 'bi-exclamation-triangle-fill', variant: 'danger' },
      { title: 'Cumulative Unpaid Penalties', value: `$${totalFines.toFixed(2)}`, icon: 'bi-cash-coin', variant: 'warning' },
      { title: 'Max Days Overdue', value: overdue.length ? `${Math.max(...overdue.map(l => l.overdue_days))} days` : '0 days', icon: 'bi-clock-history', variant: 'blue' },
      { title: 'Affected Borrowers', value: new Set(overdue.map(l => l.member_id)).size, icon: 'bi-people', variant: 'default' }
    ]);

    this.tableHeaders.set(['Loan ID', 'Book Title', 'Borrower', 'Student/ID', 'Email', 'Due Date', 'Days Overdue', 'Accrued Penalty']);
    this.tableRows.set(overdue.map(l => [
      `#LN-${l.id}`,
      l.book_title,
      l.member_name,
      l.member_id_no,
      l.member_email,
      l.due_date,
      `${l.overdue_days} days`,
      `$${(l.overdue_days * 1.5).toFixed(2)}`
    ]));
  }

  private buildInventoryReport(branchId: number) {
    let copies = this.mockData.copies();
    if (branchId !== 0) copies = copies.filter(c => c.library_id === branchId);

    const available = copies.filter(c => c.status === 'Available').length;
    const issued = copies.filter(c => c.status === 'Issued').length;
    const mint = copies.filter(c => c.condition === 'Mint').length;

    this.reportKpis.set([
      { title: 'Physical Copy Inventory', value: copies.length, icon: 'bi-book', variant: 'blue' },
      { title: 'Available on Stacks', value: available, icon: 'bi-check2-all', variant: 'success' },
      { title: 'Circulating Offsite', value: issued, icon: 'bi-arrow-right', variant: 'warning' },
      { title: 'Mint / Optimal Condition', value: mint, icon: 'bi-gem', variant: 'default' }
    ]);

    this.tableHeaders.set(['Accession #', 'Barcode', 'Book ID', 'Library Branch', 'Shelf Location', 'Condition', 'Status', 'Acquired']);
    this.tableRows.set(copies.map(c => [
      c.accession_no,
      c.barcode,
      `Title #${c.book_id}`,
      c.library_name,
      c.shelf_location,
      c.condition,
      c.status,
      c.acquisition_date
    ]));
  }

  private buildPopularBooksReport(branchId: number) {
    let books = [...this.mockData.books()];
    if (branchId !== 0) books = books.filter(b => b.library_id === branchId);
    books.sort((a, b) => b.popularity_score - a.popularity_score);

    this.reportKpis.set([
      { title: 'Catalogued Titles', value: books.length, icon: 'bi-journal-text', variant: 'blue' },
      { title: 'Highest Score', value: books[0]?.popularity_score || 0, icon: 'bi-star-fill', variant: 'warning' },
      { title: 'Top Ranked Title', value: books[0]?.title?.substring(0, 18) + '...' || 'None', icon: 'bi-trophy', variant: 'success' },
      { title: 'Zero Stock Titles', value: books.filter(b => b.available_copies === 0).length, icon: 'bi-shield-exclamation', variant: 'danger' }
    ]);

    this.tableHeaders.set(['Rank', 'Title', 'Authors', 'ISBN', 'Category', 'Demand Score', 'Total Copies', 'Available']);
    this.tableRows.set(books.map((b, i) => [
      `#${i + 1}`,
      b.title,
      b.authors.join(', '),
      b.isbn,
      b.categories[0] || 'General',
      `${b.popularity_score} / 100`,
      `${b.total_copies} copies`,
      `${b.available_copies} avail`
    ]));
  }

  private buildCategoryReport(branchId: number) {
    let books = this.mockData.books();
    if (branchId !== 0) books = books.filter(b => b.library_id === branchId);

    const catMap = new Map<string, { count: number; copies: number; available: number }>();
    books.forEach(b => {
      const cat = b.categories[0] || 'Uncategorized';
      const existing = catMap.get(cat) || { count: 0, copies: 0, available: 0 };
      catMap.set(cat, {
        count: existing.count + 1,
        copies: existing.copies + b.total_copies,
        available: existing.available + b.available_copies
      });
    });

    const categories = Array.from(catMap.entries());

    this.reportKpis.set([
      { title: 'Academic Categories', value: categories.length, icon: 'bi-tags', variant: 'blue' },
      { title: 'Largest Category', value: categories.sort((a,b) => b[1].count - a[1].count)[0]?.[0] || 'None', icon: 'bi-collection', variant: 'success' },
      { title: 'Total Volume Holdings', value: books.reduce((s, b) => s + b.total_copies, 0), icon: 'bi-layers', variant: 'default' },
      { title: 'Catalog Breadth Ratio', value: `${(books.length / (categories.length || 1)).toFixed(1)} books/cat`, icon: 'bi-pie-chart', variant: 'warning' }
    ]);

    this.tableHeaders.set(['Category Name', 'Title Count', 'Total Physical Copies', 'Available Now', 'Circulation Share']);
    this.tableRows.set(categories.map(([name, stat]) => [
      name,
      `${stat.count} titles`,
      `${stat.copies} copies`,
      `${stat.available} available`,
      `${stat.copies > 0 ? (((stat.copies - stat.available) / stat.copies) * 100).toFixed(1) : 0}% on loan`
    ]));
  }

  private buildMemberActivityReport(branchId: number) {
    let users = this.mockData.users().filter(u => u.role === 'student' || u.role === 'faculty');
    if (branchId !== 0) users = users.filter(u => u.library_id === branchId);

    const loans = this.mockData.loans();

    this.reportKpis.set([
      { title: 'Registered Scholars', value: users.length, icon: 'bi-mortarboard', variant: 'blue' },
      { title: 'Active Borrowers', value: users.filter(u => loans.some(l => l.member_id === u.id && l.status === 'Issued')).length, icon: 'bi-person-check', variant: 'success' },
      { title: 'Faculty Members', value: users.filter(u => u.role === 'faculty').length, icon: 'bi-award', variant: 'warning' },
      { title: 'Deactivated Accounts', value: users.filter(u => !u.is_active).length, icon: 'bi-person-x', variant: 'danger' }
    ]);

    this.tableHeaders.set(['Member ID', 'Full Name', 'Role', 'Department', 'Active Loans', 'Max Quota', 'Account Status']);
    this.tableRows.set(users.map(u => {
      const activeLoans = loans.filter(l => l.member_id === u.id && l.status === 'Issued').length;
      return [
        u.student_id_no || `MEM-${u.id}`,
        u.name,
        u.role_display,
        u.department || 'General',
        `${activeLoans} books`,
        `${u.max_loans} limit`,
        u.is_active ? 'Active' : 'Suspended'
      ];
    }));
  }

  private buildReservationsReport(branchId: number) {
    let res = this.mockData.reservations();
    if (branchId !== 0) res = res.filter(r => r.library_id === branchId);

    this.reportKpis.set([
      { title: 'Total Hold Requests', value: res.length, icon: 'bi-bookmark-check', variant: 'blue' },
      { title: 'Waiting in Queue', value: res.filter(r => r.status === 'Waiting').length, icon: 'bi-hourglass-split', variant: 'warning' },
      { title: 'Ready for Pickup', value: res.filter(r => r.status === 'Ready for Pickup').length, icon: 'bi-box-seam', variant: 'success' },
      { title: 'Cancelled / Expired', value: res.filter(r => r.status === 'Cancelled' || r.status === 'Expired').length, icon: 'bi-x-circle', variant: 'danger' }
    ]);

    this.tableHeaders.set(['Hold ID', 'Title', 'Patron', 'Branch', 'Hold Date', 'Queue Position', 'Status']);
    this.tableRows.set(res.map(r => [
      `#RES-${r.id}`,
      r.book_title,
      r.member_name,
      r.library_name,
      r.reservation_date,
      `Priority #${r.queue_position}`,
      r.status
    ]));
  }

  private buildFinesReport(branchId: number) {
    const fines = this.mockData.fines();
    const pendingSum = fines.filter(f => f.status === 'Pending').reduce((s, f) => s + f.amount, 0);
    const paidSum = fines.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);

    this.reportKpis.set([
      { title: 'Outstanding Balance', value: `$${pendingSum.toFixed(2)}`, icon: 'bi-cash-stack', variant: 'danger' },
      { title: 'Collected Revenue', value: `$${paidSum.toFixed(2)}`, icon: 'bi-check2-circle', variant: 'success' },
      { title: 'Total Penalties Issued', value: fines.length, icon: 'bi-receipt', variant: 'blue' },
      { title: 'Waived Sum', value: `$${fines.filter(f => f.status === 'Waived').reduce((s, f) => s + f.amount, 0).toFixed(2)}`, icon: 'bi-slash-circle', variant: 'default' }
    ]);

    this.tableHeaders.set(['Fine ID', 'Borrower', 'Book Title', 'Overdue Days', 'Penalty Amount', 'Status', 'Receipt']);
    this.tableRows.set(fines.map(f => [
      `#FIN-${f.id}`,
      f.member_name,
      f.book_title,
      `${f.overdue_days} days`,
      `$${f.amount.toFixed(2)}`,
      f.status,
      f.receipt_no || 'Pending'
    ]));
  }

  private buildBranchComparisonReport() {
    const libraries = this.mockData.libraries();
    const books = this.mockData.books();
    const copies = this.mockData.copies();
    const loans = this.mockData.loans();

    this.reportKpis.set([
      { title: 'Total Campus Branches', value: libraries.length, icon: 'bi-building', variant: 'blue' },
      { title: 'Network Physical Copies', value: copies.length, icon: 'bi-stack', variant: 'default' },
      { title: 'Network Active Loans', value: loans.filter(l => l.status === 'Issued').length, icon: 'bi-arrow-left-right', variant: 'warning' },
      { title: 'Operational Status', value: '100% Online', icon: 'bi-check-circle', variant: 'success' }
    ]);

    this.tableHeaders.set(['Branch Code', 'Branch Name', 'City / Location', 'Titles Held', 'Copies', 'Active Loans', 'Hours']);
    this.tableRows.set(libraries.map(b => {
      const bBooks = books.filter(book => book.library_id === b.id).length;
      const bCopies = copies.filter(c => c.library_id === b.id).length;
      const bLoans = loans.filter(l => l.library_id === b.id && l.status === 'Issued').length;
      return [
        b.code,
        b.name,
        b.city,
        `${bBooks} titles`,
        `${bCopies} copies`,
        `${bLoans} on loan`,
        b.opening_hours
      ];
    }));
  }

  // --- CSV EXPORT GENERATOR ---

  exportToCsv() {
    const headers = this.tableHeaders();
    const rows = this.tableRows();
    if (rows.length === 0) {
      this.toast.show('No rows to export for the selected filter.', 'warning');
      return;
    }

    // Escape CSV values
    const escapeCsv = (val: string) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csvContent = headers.map(escapeCsv).join(',') + '\r\n';
    rows.forEach(row => {
      csvContent += row.map(escapeCsv).join(',') + '\r\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('href', url);
    link.setAttribute('download', `LIBRARIA_${this.activeReport}_report_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toast.show(`Exported ${rows.length} records to CSV!`, 'success');
  }

  triggerPrint() {
    window.print();
  }
}
