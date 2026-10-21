import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { BookTitle, UserAccount } from '../../../models/libraria.models';
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

interface ParsedRow {
  index: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

@Component({
  selector: 'app-bulk-import',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2 class="page-title mb-1">Bulk Operations & Data Import Wizard</h2>
          <p class="text-secondary small mb-0">
            Client-side CSV batch parser with schema validation, duplicate protection, and automated inventory generation.
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-saas-secondary btn-sm" (click)="downloadTemplate()">
            <i class="bi bi-file-earmark-arrow-down me-1"></i> Download Sample CSV
          </button>
        </div>
      </div>

      <!-- Entity Switcher Tabs (Segmented Control) -->
      <div class="role-tabs-bar mb-4" style="max-width: 440px;">
        <button 
          type="button" 
          class="role-tab-btn"
          [class.active]="activeEntity === 'books'"
          (click)="switchEntity('books')">
          <i class="bi bi-book me-1"></i> Books & Inventory
        </button>
        <button 
          type="button" 
          class="role-tab-btn"
          [class.active]="activeEntity === 'members'"
          (click)="switchEntity('members')">
          <i class="bi bi-people me-1"></i> Student & Faculty Roster
        </button>
      </div>

      <!-- Upload Zone Card -->
      <div class="card-saas p-4 mb-4">
        <div 
          class="upload-dropzone text-center p-5"
          [class.drag-over]="isDragging"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onFileDrop($event)">
          <i class="bi bi-cloud-arrow-up display-4 text-primary mb-3 d-inline-block"></i>
          <h5 class="fw-bold mb-1">Upload {{ activeEntity === 'books' ? 'Book Collection' : 'Member Directory' }} CSV</h5>
          <p class="text-secondary small mb-3">
            Drag and drop your UTF-8 encoded <code>.csv</code> file here, or click to browse.
          </p>
          <input 
            type="file" 
            #fileInput 
            accept=".csv,text/csv" 
            class="d-none" 
            (change)="onFileSelected($event)">
          <button type="button" class="btn btn-saas-primary btn-sm px-4" (click)="fileInput.click()">
            <i class="bi bi-folder2-open me-1"></i> Select Local File
          </button>
          <div class="mt-3 xsmall text-muted" *ngIf="uploadedFileName">
            Selected: <strong class="text-primary">{{ uploadedFileName }}</strong> ({{ uploadedFileSize }})
          </div>
        </div>
      </div>

      <!-- Import Stats if Parsed -->
      <div class="row g-3 mb-4" *ngIf="parsedRows().length > 0">
        <div class="col-12 col-sm-4">
          <app-stat-card 
            title="Total Detected Rows" 
            [value]="parsedRows().length" 
            icon="bi-table" 
            variant="blue">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-4">
          <app-stat-card 
            title="Ready for Import" 
            [value]="validCount()" 
            icon="bi-check2-circle" 
            variant="success">
          </app-stat-card>
        </div>
        <div class="col-12 col-sm-4">
          <app-stat-card 
            title="Validation Warnings / Errors" 
            [value]="invalidCount()" 
            icon="bi-exclamation-triangle" 
            variant="danger">
          </app-stat-card>
        </div>
      </div>

      <!-- Preview Table & Action -->
      <div class="card-saas overflow-hidden mb-4" *ngIf="parsedRows().length > 0">
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between bg-surface-hover">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-bold small text-uppercase">Parsed Data Preview</span>
            <span class="badge bg-success-subtle text-success small">{{ validCount() }} Valid</span>
            <span class="badge bg-danger-subtle text-danger small" *ngIf="invalidCount() > 0">{{ invalidCount() }} Issues</span>
          </div>
          <button 
            type="button" 
            class="btn btn-saas-primary btn-sm px-3" 
            [disabled]="validCount() === 0 || isImporting"
            (click)="executeImport()">
            <span *ngIf="isImporting" class="spinner-border spinner-border-sm me-1"></span>
            <i *ngIf="!isImporting" class="bi bi-cloud-check me-1"></i>
            Commit {{ validCount() }} Valid Records
          </button>
        </div>

        <div class="table-responsive">
          <table class="table-saas w-100 mb-0">
            <thead>
              <tr>
                <th style="width: 50px;">#</th>
                <th>Validation Status</th>
                <th *ngFor="let col of previewHeaders()">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of parsedRows()" [class.table-danger-subtle]="!row.isValid">
                <td>{{ row.index }}</td>
                <td>
                  <span *ngIf="row.isValid" class="badge-status badge-success">
                    <i class="bi bi-check-lg me-1"></i> Valid
                  </span>
                  <div *ngIf="!row.isValid" class="d-flex flex-column gap-1">
                    <span class="badge-status badge-danger">Rejected</span>
                    <span class="xsmall text-danger fw-semibold" *ngFor="let err of row.errors">
                      • {{ err }}
                    </span>
                  </div>
                </td>
                <td *ngFor="let col of previewHeaders()">
                  <span class="small">{{ row.data[col] || '-' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
    .upload-dropzone {
      border: 1.5px dashed var(--border-strong);
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      transition: all var(--transition-fast);
      cursor: pointer;
    }
    .upload-dropzone:hover,
    .upload-dropzone.drag-over {
      border-color: var(--border-focus);
      background: var(--brand-blue-subtle);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.18);
    }
    .table-danger-subtle {
      background-color: rgba(216, 76, 90, 0.04);
    }
    .xsmall {
      font-size: 0.725rem;
    }
  `]
})
export class BulkImportComponent {
  mockData = inject(MockDataService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  activeEntity: 'books' | 'members' = 'books';
  isDragging = false;
  isImporting = false;
  uploadedFileName: string = '';
  uploadedFileSize: string = '';

  previewHeaders = signal<string[]>([]);
  parsedRows = signal<ParsedRow[]>([]);

  switchEntity(entity: 'books' | 'members') {
    this.activeEntity = entity;
    this.uploadedFileName = '';
    this.parsedRows.set([]);
    this.previewHeaders.set([]);
  }

  downloadTemplate() {
    let csv = '';
    let filename = '';
    if (this.activeEntity === 'books') {
      csv = 'Title,Authors,ISBN,Publisher,Year,Copies,Category,Shelf\r\n' +
        '"Clean Architecture","Robert C. Martin","978-0134494166","Prentice Hall",2017,3,"Software Engineering","Stack CS-05"\r\n' +
        '"Refactoring UI","Adam Wathan, Steve Schoger","978-1098100131","Self-Published",2018,2,"Design","Stack DES-01"\r\n' +
        '"Computer Architecture: A Quantitative Approach","John L. Hennessy, David A. Patterson","978-0128119051","Morgan Kaufmann",2019,4,"Computer Science","Stack CS-08"\r\n';
      filename = 'libraria_books_template.csv';
    } else {
      csv = 'Name,Username,Email,Phone,Role,Department,StudentID\r\n' +
        '"Dr. Nathan Drake","ndrake","ndrake@libraria.org","+1 555-400-001","faculty","Archaeology & History","FAC-ARC-01"\r\n' +
        '"Elena Fisher","efisher","efisher@libraria.org","+1 555-400-002","student","Journalism & Media","STU-2024-5001"\r\n';
      filename = 'libraria_members_template.csv';
    }

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.toast.show(`Downloaded ${filename}`, 'info');
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  onFileDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      this.processFile(e.dataTransfer.files[0]);
    }
  }

  onFileSelected(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      this.processFile(e.target.files[0]);
    }
  }

  private processFile(file: File) {
    this.uploadedFileName = file.name;
    this.uploadedFileSize = (file.size / 1024).toFixed(1) + ' KB';

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      this.parseCsvContent(text);
    };
    reader.readAsText(file);
  }

  // Safe CSV parser handling quoted commas and CRLF
  private parseCsvContent(content: string) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      this.toast.show('The selected CSV file appears to be empty or has no data rows.', 'danger');
      return;
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    this.previewHeaders.set(headers);

    const existingIsbns = new Set(this.mockData.books().map(b => b.isbn.replace(/-/g, '')));
    const existingEmails = new Set(this.mockData.users().map(u => u.email.toLowerCase()));
    const seenFileKeys = new Set<string>();

    const rows: ParsedRow[] = [];

    for (let r = 1; r < lines.length; r++) {
      const values = parseLine(lines[r]);
      const rowData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowData[h] = values[idx] || '';
      });

      const errors: string[] = [];

      if (this.activeEntity === 'books') {
        const title = rowData['Title'] || rowData['title'];
        const isbn = rowData['ISBN'] || rowData['isbn'];
        const authors = rowData['Authors'] || rowData['Author'] || rowData['authors'];

        if (!title) errors.push('Missing Title (Required)');
        if (!authors) errors.push('Missing Author(s) (Required)');
        if (!isbn) {
          errors.push('Missing ISBN (Required)');
        } else {
          const cleanIsbn = isbn.replace(/-/g, '');
          if (existingIsbns.has(cleanIsbn)) {
            errors.push(`ISBN ${isbn} already catalogued in system.`);
          }
          if (seenFileKeys.has(cleanIsbn)) {
            errors.push(`Duplicate ISBN in this CSV file.`);
          }
          seenFileKeys.add(cleanIsbn);
        }
      } else {
        const name = rowData['Name'] || rowData['name'];
        const email = rowData['Email'] || rowData['email'];
        if (!name) errors.push('Missing Member Name');
        if (!email) {
          errors.push('Missing Email Address');
        } else {
          const cleanEmail = email.toLowerCase();
          if (existingEmails.has(cleanEmail)) {
            errors.push(`Email ${email} is already registered.`);
          }
          if (seenFileKeys.has(cleanEmail)) {
            errors.push(`Duplicate email in file.`);
          }
          seenFileKeys.add(cleanEmail);
        }
      }

      rows.push({
        index: r,
        data: rowData,
        isValid: errors.length === 0,
        errors
      });
    }

    this.parsedRows.set(rows);
    this.toast.show(`Parsed ${rows.length} rows (${rows.filter(r => r.isValid).length} valid).`, 'info');
  }

  validCount(): number {
    return this.parsedRows().filter(r => r.isValid).length;
  }

  invalidCount(): number {
    return this.parsedRows().filter(r => !r.isValid).length;
  }

  executeImport() {
    const validRows = this.parsedRows().filter(r => r.isValid);
    if (validRows.length === 0) return;

    this.isImporting = true;
    const actor = this.auth.currentUser();
    const actorName = actor?.name || 'Administrator';
    const actorRole = (actor?.role || 'super_admin') as any;

    setTimeout(() => {
      let importedCount = 0;

      if (this.activeEntity === 'books') {
        validRows.forEach(row => {
          const d = row.data;
          const authors = (d['Authors'] || d['Author'] || 'Unknown').split(',').map(a => a.trim());
          const copiesCount = parseInt(d['Copies'] || '2', 10) || 2;
          this.mockData.saveBookTitle({
            title: d['Title'] || 'Imported Book',
            authors,
            isbn: d['ISBN'] || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            publisher: d['Publisher'] || 'Academic Press',
            publication_year: parseInt(d['Year'] || '2023', 10) || 2023,
            categories: [d['Category'] || 'General'],
            shelf_location: d['Shelf'] || 'General Stacks',
            total_copies: copiesCount,
            available_copies: copiesCount,
            library_id: 1
          }, actorName, actorRole);
          importedCount++;
        });
      } else {
        validRows.forEach(row => {
          const d = row.data;
          const newId = this.mockData.users().length ? Math.max(...this.mockData.users().map(u => u.id)) + 1 : 1;
          const role = (d['Role']?.toLowerCase() === 'faculty' ? 'faculty' : 'student') as any;
          const newUser: UserAccount = {
            id: newId,
            name: d['Name'] || 'New Member',
            username: d['Username'] || `user_${newId}`,
            email: d['Email'] || `member${newId}@libraria.org`,
            phone: d['Phone'] || '+1 (555) 000-0000',
            role,
            role_display: role === 'faculty' ? 'Faculty Member' : 'Student Scholar',
            department: d['Department'] || 'General Studies',
            student_id_no: d['StudentID'] || `STU-2024-${1000 + newId}`,
            library_id: 1,
            library_name: 'Central Academic Library',
            is_active: true,
            max_loans: role === 'faculty' ? 12 : 5,
            max_renewals: role === 'faculty' ? 5 : 2,
            created_at: new Date().toISOString().split('T')[0]
          };
          this.mockData.users.update(list => [...list, newUser]);
          importedCount++;
        });
      }

      this.isImporting = false;
      this.toast.show(`Successfully committed ${importedCount} records to the database!`, 'success');
      this.mockData.logAuditEvent(
        actorName,
        actorRole,
        'BULK_IMPORT',
        this.activeEntity === 'books' ? 'Book' : 'Member',
        importedCount,
        `Imported ${importedCount} ${this.activeEntity} via CSV Batch Wizard`
      );
      this.parsedRows.set([]);
      this.uploadedFileName = '';
    }, 400);
  }
}
