import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BrandLogoComponent],
  template: `
    <div class="auth-split-layout">
      <!-- Left Editorial Visual Panel -->
      <div class="auth-visual-panel">
        <div class="visual-decor-glow"></div>
        <div class="visual-panel-content">
          <div class="visual-brand">
            <app-brand-logo variant="variant-white" size="lg" [showTagline]="true"></app-brand-logo>
          </div>

          <div class="visual-main-text">
            <div class="editorial-badge">
              <span class="badge-dot"></span>
              <span>ADMINISTRATIVE CONSOLE</span>
            </div>
            <h1 class="visual-heading">Your library, under control.</h1>
            <p class="visual-subtext">
              Real-time inventory coordination, student circulation management, and institutional audit compliance in a single unified cockpit.
            </p>
          </div>

          <!-- Decorative Geometric Books Art -->
          <div class="visual-art-box">
            <svg viewBox="0 0 420 180" fill="none" xmlns="http://www.w3.org/2000/svg" class="art-svg">
              <rect x="30" y="90" width="100" height="70" rx="6" fill="#203154" stroke="#3157D5" stroke-width="1.5"/>
              <rect x="42" y="105" width="76" height="40" rx="3" fill="#17233D"/>
              <line x1="52" y1="120" x2="105" y2="120" stroke="#4F75F8" stroke-width="2" stroke-linecap="round"/>
              <line x1="52" y1="130" x2="85" y2="130" stroke="#7357E8" stroke-width="2" stroke-linecap="round"/>

              <rect x="150" y="50" width="120" height="110" rx="8" fill="#1C2B4E" stroke="#7357E8" stroke-width="1.5"/>
              <rect x="165" y="70" width="90" height="70" rx="4" fill="#0D172A"/>
              <circle cx="210" cy="100" r="14" fill="#3157D5" fill-opacity="0.3"/>
              <path d="M205 100L209 104L216 96" stroke="#4F75F8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

              <rect x="290" y="75" width="100" height="85" rx="6" fill="#203154" stroke="#3157D5" stroke-width="1.5"/>
              <line x1="305" y1="95" x2="375" y2="95" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
              <line x1="305" y1="110" x2="350" y2="110" stroke="#64748B" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- Editorial Quote -->
          <div class="editorial-quote-box">
            <p class="quote-text">"I have always imagined that Paradise will be a kind of library."</p>
            <span class="quote-author">â€” Jorge Luis Borges</span>
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
            <h2 class="auth-form-title">Administrator Workspace</h2>
            <p class="auth-form-subtitle">Enter your system credentials to access the institution console.</p>
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
                <i class="bi bi-key-fill text-primary"></i>
                <span class="small fw-semibold">Quick Demo Login: <strong>admin</strong></span>
              </div>
              <span class="badge bg-primary-subtle text-primary small">Click to autofill</span>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Username Input -->
            <div class="mb-3">
              <label class="form-label-custom">Administrator Username</label>
              <div class="input-with-icon">
                <i class="bi bi-person"></i>
                <input id="admin-username" 
                       type="text" 
                       class="form-control-saas" 
                       formControlName="username" 
                       placeholder="e.g. admin" 
                       autocomplete="username">
              </div>
              <div class="text-danger small mt-1" *ngIf="form.get('username')?.touched && form.get('username')?.invalid">
                Username is required.
              </div>
            </div>

            <!-- Password Input with Toggle -->
            <div class="mb-3">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <label class="form-label-custom mb-0">Password</label>
              </div>
              <div class="input-with-icon position-relative">
                <i class="bi bi-lock"></i>
                <input id="admin-password" 
                       [type]="showPassword() ? 'text' : 'password'" 
                       class="form-control-saas pe-5" 
                       formControlName="password" 
                       placeholder="Enter your security password" 
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
                <input class="form-check-input" type="checkbox" id="rememberMe">
                <label class="form-check-label small text-secondary" for="rememberMe">
                  Stay signed in on this device
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <button id="admin-login-btn" 
                    type="submit" 
                    class="btn-saas-primary w-100 justify-content-center py-2 fs-6" 
                    [disabled]="loading()">
              <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading() ? 'Authenticating...' : 'Sign In to Workspace' }}
            </button>
          </form>

          <div class="auth-switch-box mt-4 text-center">
            <span class="small text-secondary">Student looking for your portal? </span>
            <a routerLink="/student/login" class="small fw-bold">Sign In as Student</a>
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
    .auth-visual-panel {
      flex: 1.1;
      background: linear-gradient(145deg, rgba(11, 16, 32, 0.85) 0%, rgba(17, 24, 43, 0.75) 60%, rgba(23, 33, 58, 0.65) 100%);
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
      background: radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(167, 139, 250, 0.08) 60%, transparent 100%);
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
    .editorial-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.28rem 0.85rem;
      border-radius: var(--radius-pill);
      background-color: rgba(99, 102, 241, 0.15);
      color: #818CF8;
      font-size: 0.725rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      margin-bottom: 1.25rem;
      border: 1px solid rgba(129, 140, 248, 0.3);
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
      color: #94A3B8;
      font-size: 1.05rem;
      line-height: 1.6;
      max-width: 460px;
    }
    .art-svg {
      width: 100%;
      max-width: 380px;
      height: auto;
      margin: 1.5rem 0;
      filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.35));
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
      color: #7DA2FF;
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
      color: var(--brand-blue-hover);
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
      border: 1px dashed rgba(129, 140, 248, 0.45);
      border-radius: var(--radius-sm);
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .demo-credential-pill:hover {
      background: var(--bg-surface-hover);
      border-color: var(--border-focus);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.20);
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
export class AdminLoginComponent {
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
      username: 'admin',
      password: 'Admin@1234'
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

    this.auth.adminLogin(username, password).subscribe({
      next: () => {
        this.router.navigate(['/admin/dashboard']).then((success) => {
          this.loading.set(false);
          if (success === false) {
            this.error.set('Could not transition to dashboard. Please click Sign In again.');
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
