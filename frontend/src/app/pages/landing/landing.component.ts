import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '../../shared/brand-logo/brand-logo.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, BrandLogoComponent],
  template: `
    <div class="landing-page-root">
      <!-- Ambient Animated Glow Orbs in Background -->
      <div class="ambient-glow orb-1" aria-hidden="true"></div>
      <div class="ambient-glow orb-2" aria-hidden="true"></div>
      <div class="ambient-glow orb-3" aria-hidden="true"></div>

      <!-- Minimalist Sticky Navigation Bar -->
      <nav class="landing-navbar">
        <div class="landing-container d-flex align-items-center justify-content-between">
          <app-brand-logo size="md" [showTagline]="false"></app-brand-logo>

          <div class="nav-links d-none d-md-flex align-items-center gap-4">
            <a href="#overview" class="nav-anchor">Overview</a>
            <a href="#capabilities" class="nav-anchor">Capabilities</a>
            <a href="#subscriptions" class="nav-anchor">Subscriptions</a>
            <a href="#payments" class="nav-anchor">Digital Gateway</a>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button type="button" 
                    class="btn-icon-custom" 
                    (click)="themeService.toggleTheme()" 
                    [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'">
              <i [class]="themeService.isDark() ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill'"></i>
            </button>

            <!-- Refined Glass Pill Switcher for Portal Access -->
            <div class="nav-auth-pill">
              <a routerLink="/student/login" class="nav-pill-item" title="Student Reading Portal">
                <i class="bi bi-mortarboard me-1"></i>
                <span>Student</span>
              </a>
              <div class="nav-pill-divider"></div>
              <a routerLink="/admin/login" class="nav-pill-item nav-pill-primary" title="Staff Workspace">
                <i class="bi bi-shield-lock me-1"></i>
                <span>Staff</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section with Layered 3D Visual & Interactive Gateways -->
      <section id="overview" class="hero-section">
        <div class="landing-container">
          <div class="row align-items-center g-5">
            <div class="col-lg-6 hero-text-col">
              <div class="hero-badge animate-badge">
                <span class="badge-dot pulse-dot"></span>
                <span>Academic Library Intelligence &middot; v2.0</span>
              </div>
              
              <h1 class="hero-headline">
                Effortless knowledge circulation &amp; research.
              </h1>
              
              <p class="hero-subtitle">
                A unified, luminous operating system designed for modern institutions &mdash; simplifying book cataloguing, physical circulation, and student reading.
              </p>

              <!-- Streamlined Dual Role Gateways with 3D Holographic Icons -->
              <div class="portal-gateway-grid mt-4">
                <a routerLink="/student/login" class="gateway-card student-gateway" title="Enter Student Portal">
                  <div class="gateway-icon-wrap">
                    <img src="/images/student_portal_icon.jpg" alt="Student Reading Portal Logo Emblem" class="gateway-3d-img" />
                    <div class="icon-ambient-glow violet-glow"></div>
                  </div>
                  <div class="gateway-content">
                    <div class="gateway-header">
                      <span class="gateway-title">Student Portal</span>
                      <span class="gateway-badge violet-pill">Reader Hub</span>
                    </div>
                    <p class="gateway-desc">Search catalogue, track active loans &amp; return dates</p>
                  </div>
                  <div class="gateway-action-arrow">
                    <i class="bi bi-arrow-right"></i>
                  </div>
                </a>

                <a routerLink="/admin/login" class="gateway-card admin-gateway" title="Enter Staff Console">
                  <div class="gateway-icon-wrap">
                    <img src="/images/admin_portal_icon.jpg" alt="Staff &amp; Admin Console Logo Emblem" class="gateway-3d-img" />
                    <div class="icon-ambient-glow indigo-glow"></div>
                  </div>
                  <div class="gateway-content">
                    <div class="gateway-header">
                      <span class="gateway-title">Staff &amp; Admin</span>
                      <span class="gateway-badge indigo-pill">Console</span>
                    </div>
                    <p class="gateway-desc">Circulation desk, book inventory &amp; reporting</p>
                  </div>
                  <div class="gateway-action-arrow">
                    <i class="bi bi-arrow-right"></i>
                  </div>
                </a>
              </div>
            </div>

            <!-- Hero Layered Visual & Live Circulation Preview -->
            <div class="col-lg-6 hero-visual-col">
              <div class="hero-preview-frame">
                <div class="preview-glow"></div>
                <div class="preview-card glass-specular">
                  <!-- Mock Header with Live Status Dot -->
                  <div class="preview-card-header d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                      <span class="preview-dot dot-red"></span>
                      <span class="preview-dot dot-yellow"></span>
                      <span class="preview-dot dot-green"></span>
                      <span class="small text-secondary ms-2 fw-medium">libraria.internal/circulation</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <span class="radar-dot"></span>
                      <span class="badge-status badge-success">Engine Online</span>
                    </div>
                  </div>

                  <!-- Integrated Realistic Academic Library Visual -->
                  <div class="preview-banner-container">
                    <img src="/images/library_hero_glass.jpg" alt="University Library Quiet Study Environment" class="preview-banner-img" />
                    <div class="preview-banner-overlay"></div>
                    <div class="preview-banner-caption">
                      <div class="d-flex align-items-center justify-content-between w-100">
                        <span class="badge-glass-sm"><i class="bi bi-geo-alt-fill me-1"></i> Central Campus Library</span>
                        <span class="caption-tag">Quiet Study &amp; Circulation</span>
                      </div>
                    </div>
                  </div>

                  <!-- Mock Metrics Grid -->
                  <div class="preview-card-body">
                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <div class="preview-mini-stat">
                          <span class="text-secondary small">Total Catalog</span>
                          <div class="d-flex align-items-baseline gap-2">
                            <h4 class="mb-0 fw-bold">1,248</h4>
                            <span class="text-success small fw-semibold"><i class="bi bi-check2"></i> Synced</span>
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="preview-mini-stat">
                          <span class="text-secondary small">Active Loans</span>
                          <div class="d-flex align-items-baseline gap-2">
                            <h4 class="mb-0 fw-bold">342</h4>
                            <span class="text-primary small fw-semibold"><i class="bi bi-lightning-charge-fill"></i> Real-time</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Mock Real-time Circulation Row -->
                    <div class="preview-list-box">
                      <div class="preview-list-item d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-3">
                          <div class="book-cover-mock" style="width: 32px; height: 42px;">BK</div>
                          <div>
                            <div class="fw-bold small text-truncate" style="max-width: 170px;">Clean Architecture</div>
                            <div class="text-secondary" style="font-size: 0.72rem;">Alex Johnson &middot; Due in 4d</div>
                          </div>
                        </div>
                        <span class="badge-status badge-warning" style="font-size: 0.7rem;">Issued</span>
                      </div>

                      <div class="preview-list-item d-flex align-items-center justify-content-between mt-2">
                        <div class="d-flex align-items-center gap-3">
                          <div class="book-cover-mock" style="width: 32px; height: 42px; background: linear-gradient(135deg, #1e3a8a, #3b82f6);">PY</div>
                          <div>
                            <div class="fw-bold small text-truncate" style="max-width: 170px;">Designing Data-Intensive Apps</div>
                            <div class="text-secondary" style="font-size: 0.72rem;">Central Campus Library</div>
                          </div>
                        </div>
                        <span class="badge-status badge-success" style="font-size: 0.7rem;">Returned</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating Accent Glass Badge -->
                <div class="floating-badge-stat">
                  <div class="d-flex align-items-center gap-2">
                    <div class="floating-icon-glow"><i class="bi bi-shield-check"></i></div>
                    <div>
                      <div class="fw-bold small" style="color: var(--text-primary)">Enterprise Security</div>
                      <div class="text-secondary" style="font-size: 0.7rem;">Role-based access enforced</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Focused Capabilities Section with Ambient Hover Glow -->
      <section id="capabilities" class="capabilities-section py-5">
        <div class="landing-container">
          <div class="text-center mb-5">
            <h2 class="section-title">Core Capabilities</h2>
            <p class="section-subtitle">Engineered specifically for academic librarians and modern student researchers.</p>
          </div>

          <div class="row g-4">
            <div class="col-md-4">
              <div class="capability-card">
                <div class="capability-icon" style="background: var(--brand-blue-subtle); color: var(--brand-blue);">
                  <i class="bi bi-book"></i>
                </div>
                <h5>Cataloguing &amp; Multi-Branch</h5>
                <p>Maintain accurate physical book inventories, ISBN registrations, and multi-campus library branch allocations seamlessly.</p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="capability-card">
                <div class="capability-icon" style="background: var(--color-success-bg); color: var(--color-success);">
                  <i class="bi bi-arrow-left-right"></i>
                </div>
                <h5>Frictionless Issue &amp; Return</h5>
                <p>One-click circulation workflow with live copy decrementing, automated overdue tracking, and discrepancy-free auditing.</p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="capability-card">
                <div class="capability-icon" style="background: var(--brand-violet-subtle); color: var(--brand-violet);">
                  <i class="bi bi-mortarboard"></i>
                </div>
                <h5>Student Reading Experience</h5>
                <p>Empower students to discover titles, verify real-time copy availability, monitor active loans, and review reading history.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Membership & Subscriptions Section -->
      <section id="subscriptions" class="subscriptions-section py-5">
        <div class="landing-container">
          <div class="text-center mb-5">
            <span class="badge-glass-section mb-2">
              <i class="bi bi-gem me-1"></i> MEMBERSHIP TIERS
            </span>
            <h2 class="section-title">Academic Plans &amp; Borrowing Privileges</h2>
            <p class="section-subtitle">Tailored concurrent loan capacities, priority hold queues, and verified reader recognition.</p>
          </div>

          <div class="row g-4 justify-content-center">
            <!-- Standard Plan -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-pricing-card glass-specular h-100">
                <div class="card-tier-badge">STARTER</div>
                <h4 class="fw-bold mb-1">Standard Scholar</h4>
                <p class="text-secondary small mb-3">Essential academic borrowing for undergrad study.</p>
                <div class="pricing-val mb-3">
                  <span class="price-num">Free</span>
                  <span class="price-period text-secondary">/ forever</span>
                </div>
                <ul class="pricing-perks-list mb-4">
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Borrow 3 books concurrently</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> 1-Click loan renewal (+14d)</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Verified student reviews</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Standard hold queue access</li>
                </ul>
                <div class="mt-auto">
                  <a routerLink="/student/login" class="btn-landing-tier w-100 text-center d-block">
                    Get Started Free
                  </a>
                </div>
              </div>
            </div>

            <!-- Premium Plan -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-pricing-card glass-specular popular-tier h-100">
                <div class="popular-ribbon-landing">MOST POPULAR</div>
                <div class="card-tier-badge text-primary">RECOMMENDED</div>
                <h4 class="fw-bold mb-1">Premium Scholar</h4>
                <p class="text-secondary small mb-3">Designed for honors candidates and avid researchers.</p>
                <div class="pricing-val mb-3">
                  <span class="price-num">$9.99</span>
                  <span class="price-period text-secondary">/ month</span>
                </div>
                <ul class="pricing-perks-list mb-4">
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Borrow 8 books concurrently</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Up to 3 renewals (+42d)</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Priority hold waitlist queue</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Verified Scholar badge</li>
                </ul>
                <div class="mt-auto">
                  <a routerLink="/student/login" class="btn-landing-tier btn-tier-popular w-100 text-center d-block">
                    <i class="bi bi-stars me-1"></i> Upgrade to Premium
                  </a>
                </div>
              </div>
            </div>

            <!-- Research Fellow -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-pricing-card glass-specular h-100">
                <div class="card-tier-badge text-indigo">VIP FELLOW</div>
                <h4 class="fw-bold mb-1">Research Fellow</h4>
                <p class="text-secondary small mb-3">Doctoral candidates, faculty &amp; multi-branch access.</p>
                <div class="pricing-val mb-3">
                  <span class="price-num">$19.99</span>
                  <span class="price-period text-secondary">/ month</span>
                </div>
                <ul class="pricing-perks-list mb-4">
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Borrow 20 books concurrently</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Unlimited loan renewals</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Instant VIP queue clearance</li>
                  <li><i class="bi bi-check-circle-fill text-success me-2"></i> Inter-library campus delivery</li>
                </ul>
                <div class="mt-auto">
                  <a routerLink="/student/login" class="btn-landing-tier w-100 text-center d-block">
                    Join as Fellow
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Digital Payment Gateway Section -->
      <section id="payments" class="payments-section py-5">
        <div class="landing-container">
          <div class="row align-items-center g-5">
            <div class="col-lg-6">
              <span class="badge-glass-section mb-2">
                <i class="bi bi-shield-lock-fill me-1"></i> RAZORPAY INTEGRATION
              </span>
              <h2 class="section-title mb-3">Frictionless Digital Payments &amp; Instant Clearance</h2>
              <p class="text-secondary lead-text mb-4">
                Settle overdue loan circulation fines and upgrade membership tiers via modern, secure digital payment channels. 
                All transactions generate verified, printable digital clearance certificates in real time.
              </p>

              <div class="payment-features-grid">
                <div class="p-feat-item">
                  <div class="p-feat-icon"><i class="bi bi-qr-code-scan"></i></div>
                  <div>
                    <h6 class="fw-bold mb-1">Instant UPI &amp; Dynamic QR</h6>
                    <p class="text-secondary small mb-0">Scan and pay with any UPI app (GPay, PhonePe, Paytm) for 3-second clearance.</p>
                  </div>
                </div>
                <div class="p-feat-item">
                  <div class="p-feat-icon"><i class="bi bi-credit-card-2-front"></i></div>
                  <div>
                    <h6 class="fw-bold mb-1">Credit &amp; Debit Cards</h6>
                    <p class="text-secondary small mb-0">Full Visa, Mastercard, and RuPay support with 256-bit bank-grade encryption.</p>
                  </div>
                </div>
                <div class="p-feat-item">
                  <div class="p-feat-icon"><i class="bi bi-receipt-cutoff"></i></div>
                  <div>
                    <h6 class="fw-bold mb-1">Verified Audit Receipts</h6>
                    <p class="text-secondary small mb-0">Official receipt numbers generated with timestamp stamps for no-dues clearance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <!-- Interactive Payment Gateway Mock Preview Card -->
              <div class="payment-mock-card glass-specular p-4">
                <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-subtle">
                  <div class="d-flex align-items-center gap-2">
                    <span class="gateway-live-badge"><i class="bi bi-check-circle-fill me-1"></i> Razorpay Secure</span>
                  </div>
                  <span class="font-monospace small text-secondary">ID: PAY-2026-X892</span>
                </div>

                <div class="p-3 rounded mb-3" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle)">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-secondary small">Transaction Purpose</span>
                    <span class="fw-semibold small">Circulation Fine Clearance</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-secondary small">Payable Amount</span>
                    <span class="fs-4 fw-bold text-success">$5.00</span>
                  </div>
                </div>

                <!-- Channel Selector Pills -->
                <div class="d-flex gap-2 mb-3">
                  <div class="channel-pill active"><i class="bi bi-qr-code me-1"></i> UPI QR</div>
                  <div class="channel-pill"><i class="bi bi-credit-card me-1"></i> Card</div>
                  <div class="channel-pill"><i class="bi bi-bank me-1"></i> NetBanking</div>
                </div>

                <!-- Mock QR Box -->
                <div class="text-center p-3 rounded mb-3" style="background: #ffffff; color: #000000; border-radius: 12px;">
                  <div class="font-monospace fw-bold small text-dark mb-1">SCAN WITH ANY UPI APP</div>
                  <div class="d-flex justify-content-center my-2">
                    <div style="width: 80px; height: 80px; background: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 2.2rem;">
                      <i class="bi bi-qr-code"></i>
                    </div>
                  </div>
                  <div class="small text-muted" style="font-size: 0.72rem;">libraria.campus&#64;okhdfcbank</div>
                </div>

                <a routerLink="/student/login" class="btn-landing-tier btn-tier-popular w-100 text-center d-block">
                  <i class="bi bi-shield-check me-1"></i> Enter Student Portal to Pay
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Clean Minimal Footer -->
      <footer class="landing-footer py-4">
        <div class="landing-container">
          <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <app-brand-logo size="sm" [showTagline]="false"></app-brand-logo>
            <div class="small text-secondary text-center text-md-end">
              &copy; 2026 LIBRARIA Systems &middot; Midnight Indigo Glass Edition
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page-root {
      background-color: var(--bg-page);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow-x: hidden;
    }

    /* Ambient Background Glowing Orbs */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(80px);
      z-index: 0;
      opacity: 0.45;
    }
    .orb-1 {
      width: 480px;
      height: 480px;
      top: -60px;
      left: -80px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(99, 102, 241, 0) 70%);
      animation: orbDrift1 16s ease-in-out infinite alternate;
    }
    .orb-2 {
      width: 420px;
      height: 420px;
      top: 15%;
      right: -60px;
      background: radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, rgba(167, 139, 250, 0) 70%);
      animation: orbDrift2 20s ease-in-out infinite alternate;
    }
    .orb-3 {
      width: 500px;
      height: 500px;
      bottom: 10%;
      left: 20%;
      background: radial-gradient(circle, rgba(103, 232, 249, 0.15) 0%, rgba(103, 232, 249, 0) 70%);
      animation: orbDrift1 24s ease-in-out infinite alternate-reverse;
    }

    @keyframes orbDrift1 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, 30px) scale(1.1); }
      100% { transform: translate(-30px, 50px) scale(0.95); }
    }
    @keyframes orbDrift2 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-40px, -30px) scale(1.08); }
      100% { transform: translate(30px, -20px) scale(0.92); }
    }

    .landing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      width: 100%;
      position: relative;
      z-index: 1;
    }

    /* Navbar */
    .landing-navbar {
      height: 76px;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      background: var(--bg-header);
      border-bottom: 1px solid var(--border-subtle);
      z-index: 1000;
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      transition: background 0.25s ease;
    }
    .nav-anchor {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
      text-decoration: none;
    }
    .nav-anchor:hover {
      color: var(--brand-blue-hover);
    }

    /* Refined Glass Pill Switcher */
    .nav-auth-pill {
      display: inline-flex;
      align-items: center;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 3px;
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      transition: all var(--transition-fast);
    }
    .nav-auth-pill:hover {
      border-color: var(--border-strong);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
    .nav-pill-item {
      display: inline-flex;
      align-items: center;
      padding: 0.4rem 0.85rem;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-pill);
      transition: all var(--transition-fast);
    }
    .nav-pill-item:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.08);
    }
    .nav-pill-primary {
      background: var(--brand-blue);
      color: #ffffff !important;
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
    }
    .nav-pill-primary:hover {
      background: var(--brand-blue-hover);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.6);
      transform: translateY(-1px);
    }
    .nav-pill-divider {
      width: 1px;
      height: 16px;
      background: var(--border-subtle);
      margin: 0 2px;
    }

    /* Hero Section */
    .hero-section {
      padding: 5rem 0 4rem 0;
      position: relative;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-pill);
      background-color: var(--brand-blue-subtle);
      color: var(--brand-blue-hover);
      border: 1px solid rgba(129, 140, 248, 0.3);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      margin-bottom: 1.5rem;
      backdrop-filter: var(--glass-blur-sm);
      -webkit-backdrop-filter: var(--glass-blur-sm);
      box-shadow: 0 2px 10px rgba(129, 140, 248, 0.15);
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
      animation: pulseRadar 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
    }
    @keyframes pulseRadar {
      0% { transform: scale(0.9); opacity: 0.9; }
      50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 12px var(--color-success); }
      100% { transform: scale(0.9); opacity: 0.9; }
    }

    .hero-headline {
      font-size: clamp(2.25rem, 5vw, 3.4rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
    }
    .hero-subtitle {
      font-size: 1.125rem;
      line-height: 1.6;
      color: var(--text-secondary);
      max-width: 520px;
    }

    /* Portal Gateway Grid (With 3D Icons & Shimmer) */
    .portal-gateway-grid {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      max-width: 480px;
    }
    .gateway-card {
      display: flex;
      align-items: center;
      gap: 1.1rem;
      padding: 1.15rem 1.35rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      text-decoration: none;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-glass);
    }
    /* Subtle Specular Sheen on Hover */
    .gateway-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      transition: left 0.7s ease;
      pointer-events: none;
    }
    .gateway-card:hover::before {
      left: 100%;
    }
    .gateway-card:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow: var(--shadow-xl);
      border-color: var(--border-strong);
    }

    /* 3D Icon Container */
    .gateway-icon-wrap {
      width: 56px;
      height: 56px;
      min-width: 56px;
      border-radius: var(--radius-md);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }
    .gateway-3d-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: inherit;
      transition: transform 0.35s ease;
    }
    .gateway-card:hover .gateway-3d-img {
      transform: scale(1.08);
    }
    .icon-ambient-glow {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0.3;
      filter: blur(12px);
    }
    .violet-glow {
      background: var(--brand-violet);
    }
    .indigo-glow {
      background: var(--brand-blue);
    }

    .gateway-content {
      flex: 1;
      min-width: 0;
    }
    .gateway-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.25rem;
    }
    .gateway-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .gateway-badge {
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-pill);
    }
    .violet-pill {
      background: var(--brand-violet-subtle);
      color: var(--brand-violet);
      border: 1px solid rgba(167, 139, 250, 0.3);
    }
    .indigo-pill {
      background: var(--brand-blue-subtle);
      color: var(--brand-blue-hover);
      border: 1px solid rgba(129, 140, 248, 0.3);
    }
    .gateway-desc {
      font-size: 0.815rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gateway-action-arrow {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
      transition: all var(--transition-fast);
      font-size: 0.95rem;
    }
    .gateway-card:hover .gateway-action-arrow {
      background: var(--brand-blue);
      border-color: var(--brand-blue);
      color: #ffffff;
      transform: translateX(4px);
    }
    .student-gateway:hover {
      border-color: rgba(167, 139, 250, 0.45);
      box-shadow: 0 12px 32px rgba(167, 139, 250, 0.15);
    }
    .admin-gateway:hover {
      border-color: rgba(129, 140, 248, 0.45);
      box-shadow: 0 12px 32px rgba(129, 140, 248, 0.15);
    }

    /* Hero Preview Frame with Floating Animation */
    .hero-preview-frame {
      position: relative;
      animation: heroFloat 8s ease-in-out infinite alternate;
    }
    @keyframes heroFloat {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-7px); }
    }

    .preview-glow {
      position: absolute;
      top: 5%;
      right: 5%;
      width: 90%;
      height: 90%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(167, 139, 250, 0.12) 60%, transparent 100%);
      filter: blur(55px);
      z-index: 1;
      pointer-events: none;
    }
    .preview-card {
      background: var(--bg-surface-elevated);
      backdrop-filter: var(--glass-blur-heavy);
      -webkit-backdrop-filter: var(--glass-blur-heavy);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      position: relative;
      z-index: 2;
      overflow: hidden;
    }
    .preview-card-header {
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--border-subtle);
    }
    .preview-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }

    .radar-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #34D399;
      box-shadow: 0 0 6px #34D399;
      animation: pulseRadar 1.8s infinite cubic-bezier(0.4, 0, 0.6, 1);
    }

    /* Integrated Realistic Academic Library Visual */
    .preview-banner-container {
      position: relative;
      height: 220px;
      overflow: hidden;
      border-bottom: 1px solid var(--border-subtle);
    }
    .preview-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 40%;
      transition: transform 0.6s ease;
    }
    .preview-card:hover .preview-banner-img {
      transform: scale(1.03);
    }
    .preview-banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(11, 16, 32, 0.05) 0%, rgba(11, 16, 32, 0.70) 100%);
    }
    .preview-banner-caption {
      position: absolute;
      bottom: 0.85rem;
      left: 1.25rem;
      right: 1.25rem;
      z-index: 3;
    }
    .badge-glass-sm {
      background: rgba(11, 16, 32, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: var(--brand-blue-hover);
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-pill);
      font-size: 0.72rem;
      font-weight: 700;
    }
    .caption-tag {
      font-size: 0.72rem;
      color: rgba(241, 245, 249, 0.85);
      font-weight: 500;
      background: rgba(0, 0, 0, 0.35);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-pill);
    }

    .preview-card-body {
      padding: 1.25rem;
    }
    .preview-mini-stat {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.85rem;
      transition: all var(--transition-fast);
    }
    .preview-mini-stat:hover {
      background: var(--bg-surface-elevated);
      border-color: var(--border-strong);
    }
    .preview-list-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.75rem;
    }
    .preview-list-item {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.8rem;
    }

    /* Floating Accent Badge */
    .floating-badge-stat {
      position: absolute;
      bottom: -16px;
      left: -16px;
      background: var(--bg-surface-elevated);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-xl);
      padding: 0.75rem 1rem;
      z-index: 4;
      animation: badgeFloat 6s ease-in-out infinite alternate-reverse;
    }
    @keyframes badgeFloat {
      0% { transform: translateY(0px); }
      100% { transform: translateY(5px); }
    }
    .floating-icon-glow {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background-color: var(--color-success-bg);
      color: var(--color-success);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      box-shadow: 0 0 12px rgba(52, 211, 153, 0.25);
    }

    /* Section Typography */
    .section-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .section-subtitle {
      font-size: 1.05rem;
      color: var(--text-secondary);
      max-width: 580px;
      margin: 0 auto;
    }

    /* Capabilities Section */
    .capabilities-section {
      border-top: 1px solid var(--border-subtle);
      position: relative;
    }
    .capability-card {
      background: var(--bg-surface);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.85rem;
      height: 100%;
      box-shadow: var(--shadow-glass);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }
    .capability-card:hover {
      box-shadow: var(--shadow-xl);
      border-color: var(--border-strong);
      transform: translateY(-4px);
    }
    .capability-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      margin-bottom: 1.25rem;
      border: 1px solid var(--border-subtle);
      transition: transform 0.3s ease;
    }
    .capability-card:hover .capability-icon {
      transform: scale(1.1);
    }
    .capability-card h5 {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.6rem;
      color: var(--text-primary);
    }
    .capability-card p {
      font-size: 0.885rem;
      color: var(--text-secondary);
      margin-bottom: 0;
      line-height: 1.6;
    }

    /* Subscriptions & Pricing Section */
    .badge-glass-section {
      display: inline-flex;
      align-items: center;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(129, 140, 248, 0.25);
      color: #818CF8;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
    }
    .landing-pricing-card {
      position: relative;
      padding: 2.25rem 2rem;
      border-radius: var(--radius-xl);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      transition: all var(--transition-normal);
      overflow: hidden;
    }
    .landing-pricing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      border-color: rgba(129, 140, 248, 0.4);
    }
    .popular-tier {
      border: 2px solid var(--brand-blue);
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
      box-shadow: 0 8px 30px rgba(99, 102, 241, 0.25);
    }
    .popular-ribbon-landing {
      position: absolute;
      top: 0;
      right: 2rem;
      background: var(--brand-blue);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
    .card-tier-badge {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-tertiary);
      margin-bottom: 0.5rem;
    }
    .pricing-val {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .price-num {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }
    .pricing-perks-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      font-size: 0.875rem;
    }
    .btn-landing-tier {
      background: var(--bg-surface-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      font-weight: 600;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-pill);
      text-decoration: none;
      transition: all var(--transition-fast);
      display: inline-block;
    }
    .btn-landing-tier:hover {
      background: var(--brand-blue-subtle);
      border-color: var(--brand-blue);
      color: var(--brand-blue-hover);
    }
    .btn-tier-popular {
      background: var(--brand-blue);
      color: #ffffff;
      border-color: var(--brand-blue);
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .btn-tier-popular:hover {
      background: var(--brand-blue-hover);
      color: #ffffff;
    }

    /* Payment Gateway Section Styles */
    .payment-features-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .p-feat-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .p-feat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--brand-blue-subtle);
      color: var(--brand-blue-hover);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .payment-mock-card {
      background: linear-gradient(135deg, rgba(23, 35, 61, 0.95) 0%, rgba(11, 16, 32, 0.98) 100%);
      border: 1px solid rgba(129, 140, 248, 0.3);
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .gateway-live-badge {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10B981;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 9999px;
    }
    .channel-pill {
      flex: 1;
      text-align: center;
      padding: 0.5rem 0.25rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      font-size: 0.775rem;
      font-weight: 600;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
    }
    .channel-pill.active {
      background: var(--brand-blue-subtle);
      border-color: var(--brand-blue);
      color: var(--brand-blue-hover);
    }

    /* Footer */
    .landing-footer {
      background: var(--bg-header);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-top: 1px solid var(--border-subtle);
      margin-top: auto;
      position: relative;
      z-index: 1;
    }

    /* Accessibility / Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      .ambient-glow,
      .hero-preview-frame,
      .floating-badge-stat,
      .pulse-dot,
      .radar-dot {
        animation: none !important;
      }
      .gateway-card,
      .capability-card {
        transition: none !important;
      }
    }
  `]
})
export class LandingComponent {
  constructor(public themeService: ThemeService) {}
}
