import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  template: `
    <div class="auth-split-layout">
      <!-- Left Visual Panel (Student Edition: Warm Royal Blue / Violet) -->
      <div class="auth-visual-panel student-theme">
        <div class="visual-decor-glow"></div>
        <div class="visual-panel-content">
          <div class="visual-brand">
            <app-brand-logo variant="variant-white" size="lg" [showTagline]="true"></app-brand-logo>
          </div>

          <div class="visual-main-text">
            <div class="editorial-badge student-badge">
              <span class="badge-dot"></span>
              <span>STUDENT READER PORTAL</span>
            </div>
            <h1 class="visual-heading">Unlock your world of knowledge.</h1>
            <p class="visual-subtext">
              Browse campus catalogues, check real-time book availability, track borrowing due dates, and build your academic reading portfolio.
            </p>
          </div>

          <!-- Feature Cards Grid inside Left Panel -->
          <div class="student-feature-pill-grid">
            <div class="student-feature-chip">
              <i class="bi bi-search me-2"></i>
              <span>Instant Catalogue Search</span>
            </div>
            <div class="student-feature-chip">
              <i class="bi bi-bell me-2"></i>
              <span>Overdue Reminders</span>
            </div>
            <div class="student-feature-chip">
              <i class="bi bi-clock-history me-2"></i>
              <span>Borrowing History</span>
            </div>
          </div>

          <div class="editorial-quote-box">
            <p class="quote-text">"Reading is an act of civilization; itâ€™s one of the greatest acts of civilization."</p>
            <span class="quote-author">â€” Ray Bradbury</span>
          </div>
        </div>
      </div>

      <!-- Right Authentication Form Panel -->
      <div class="auth-form-panel">
        <div class="form-panel-wrapper">
          <!-- Back Link -->
          <div class="mb-4">
            <a routerLink="/" class="back-link">
              <i class="bi bi-arrow-left me-1"></i> Return to Homepage
            </a>
          </div>

          <div class="auth-header-box mb-4">
            <h2 class="auth-form-title">Student Sign In</h2>
            <p class="auth-form-subtitle">Enter your student username or registration ID to continue.</p>
          </div>

          <!-- Error Alert -->
          <div *ngIf="error()" class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <i class="bi bi-exclamation-circle-fill flex-shrink-0"></i>
            <div>{{ error() }}</div>
          </div>

          <!-- Quick Demo Credentials Filler -->
          <div class="demo-credential-pill mb-4" (click)="fillDemoCredentials()">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-mortarboard-fill text-info"></i>
                <span class="small fw-semibold">Quick Demo Login: <strong>student</strong></span>
              </div>
              <span class="badge bg-info-subtle text-info small">Click to autofill</span>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Username Input -->
            <div class="mb-3">
              <label class="form-label-custom">Username or Student ID</label>
              <div class="input-with-icon">
                <i class="bi bi-person-badge"></i>
                <input id="student-username" 
                       type="text" 
                       class="form-control-saas" 
                       formControlName="username" 
                       placeholder="e.g. student or STU001" 
                       autocomplete="username">
              </div>
              <div class="text-danger small mt-1" *ngIf="form.get('username')?.touched && form.get('username')?.invalid">
                Username or Student ID is required.
              </div>
            </div>

            <!-- Password Input with Toggle -->
            <div class="mb-3">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label-custom mb-0">Password</label>
              </div>
              <div class="input-with-icon position-relative">
                <i class="bi bi-lock"></i>
                <input id="student-password" 
                       [type]="showPassword() ? 'text' : 'password'" 
                       class="form-control-saas pe-5" 
                       formControlName="password" 
                       placeholder="Enter your student password" 
                       autocomplete="current-password">
                <button type="button" 
                        class="btn-pwd-toggle" 
                        (click)="showPassword.set(!showPassword())"
                        [title]="showPassword() ? 'Hide Password' : 'Show Password'">
                  <i [class]="showPassword() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div class="text-danger small mt-1" *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
                Password is required.
              </div>
            </div>

            <!-- Remember Me -->
            <div class="d-flex align-items-center justify-content-between mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="studentRememberMe">
                <label class="form-check-label small text-secondary" for="studentRememberMe">
                  Remember my account
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <button id="student-login-btn" 
                    type="submit" 
                    class="btn-saas-primary w-100 justify-content-center py-2 fs-6" 
                    style="background-color: var(--brand-violet); border-color: var(--brand-violet);"
                    [disabled]="loading()">
              <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading() ? 'Signing In...' : 'Access Student Portal' }}
            </button>
          </form>

          <div class="auth-switch-box mt-4 text-center">
            <span class="small text-secondary">Library administrator? </span>
            <a routerLink="/admin/login" class="small fw-bold">Admin Console Sign In</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-split-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-page);
    }

    /* Left Visual Panel */
    .auth-visual-panel.student-theme {
      flex: 1.1;
      background: linear-gradient(145deg, rgba(11, 16, 32, 0.85) 0%, rgba(17, 24, 43, 0.75) 50%, rgba(30, 27, 75, 0.65) 100%);
      backdrop-filter: var(--glass-blur-heavy);
      -webkit-backdrop-filter: var(--glass-blur-heavy);
      border-right: 1px solid var(--border-subtle);
      color: #FFFFFF;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3.5rem;
      overflow: hidden;
    }
    .visual-decor-glow {
      position: absolute;
      top: -80px;
      left: -80px;
      width: 480px;
      height: 480px;
      background: radial-gradient(circle, rgba(167, 139, 250, 0.22) 0%, rgba(99, 102, 241, 0.08) 60%, transparent 100%);
      filter: blur(55px);
      pointer-events: none;
    }
    .visual-panel-content {
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .editorial-badge.student-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.28rem 0.85rem;
      border-radius: var(--radius-pill);
      background-color: rgba(167, 139, 250, 0.15);
      color: var(--brand-violet);
      font-size: 0.725rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin-bottom: 1.25rem;
      border: 1px solid rgba(167, 139, 250, 0.35);
      backdrop-filter: var(--glass-blur-sm);
    }
    .visual-heading {
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.03em;
      line-height: 1.2;
      margin-bottom: 1rem;
    }
    .visual-subtext {
      color: #CBD5E1;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 460px;
    }
    .student-feature-pill-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 2rem 0;
    }
    .student-feature-chip {
      background: var(--bg-surface);
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 0.5rem 1rem;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
    }
    .editorial-quote-box {
      border-left: 2px solid rgba(255, 255, 255, 0.2);
      padding-left: 1.25rem;
    }
    .quote-text {
      font-style: italic;
      color: #CBD5E1;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }
    .quote-author {
      font-size: 0.8rem;
      color: #C4B5FD;
      font-weight: 600;
    }

    /* Right Form Panel */
    .auth-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      background: rgba(11, 16, 32, 0.75);
      backdrop-filter: var(--glass-blur-heavy);
      -webkit-backdrop-filter: var(--glass-blur-heavy);
    }
    .form-panel-wrapper {
      max-width: 420px;
      width: 100%;
    }
    .back-link {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
    }
    .back-link:hover {
      color: var(--brand-violet);
    }
    .auth-form-title {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .auth-form-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 0;
    }
    .demo-credential-pill {
      background: var(--bg-surface);
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      border: 1px dashed rgba(167, 139, 250, 0.45);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .demo-credential-pill:hover {
      background: var(--bg-surface-hover);
      border-color: var(--border-focus);
      box-shadow: 0 0 16px rgba(167, 139, 250, 0.20);
    }
    .demo-credential-pill:hover {
      background-color: var(--brand-violet-subtle);
    }
    .btn-pwd-toggle {
      position: absolute;
      right: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 0;
      font-size: 1.1rem;
    }
    .btn-pwd-toggle:hover {
      color: var(--text-primary);
    }

    /* Responsive */
    @media (max-width: 991px) {
      .auth-visual-panel {
        display: none;
      }
      .auth-form-panel {
        padding: 2.5rem 1.5rem;
      }
    }
  `]
})
export class StudentLoginComponent {
  form: FormGroup;
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  fillDemoCredentials() {
    this.form.patchValue({
      username: 'student',
      password: 'Student@1234'
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { username, password } = this.form.value;

    this.auth.studentLogin(username, password).subscribe({
      next: () => {
        this.router.navigate(['/student/dashboard']).then((success) => {
          this.loading.set(false);
          if (success === false) {
            this.error.set('Could not transition to student dashboard. Please click Sign In again.');
          }
        }).catch(() => {
          this.loading.set(false);
        });
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error || err.error?.detail || err.message || 'Authentication failed. Please verify credentials.';
        this.error.set(msg);
      }
    });
  }
}
