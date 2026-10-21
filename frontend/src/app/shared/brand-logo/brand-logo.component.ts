import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="linkUrl" class="brand-logo-container" [ngClass]="['size-' + size, variant]">
      <div class="logo-mark">
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
          <rect width="36" height="36" rx="9" fill="url(#brandGrad)" />
          <!-- Architectural Open Book Monogram -->
          <path d="M18 11.5V26.5M18 11.5C15.8 9.8 12.2 9.5 9 10.8V25.2C12.2 24 15.8 24.3 18 26.5M18 11.5C20.2 9.8 23.8 9.5 27 10.8V25.2C23.8 24 20.2 24.3 18 26.5" 
                stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stop-color="#6366F1" />
              <stop offset="1" stop-color="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="brand-text" *ngIf="variant !== 'compact'">
        <span class="brand-name">LIBRARIA</span>
        <span class="brand-tagline" *ngIf="showTagline">Intelligently organized</span>
      </div>
    </a>
  `,
  styles: [`
    .brand-logo-container {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      user-select: none;
      transition: opacity 150ms ease;
    }
    .brand-logo-container:hover {
      opacity: 0.92;
    }
    .logo-mark {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-svg {
      width: 32px;
      height: 32px;
      display: block;
      filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.35));
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .brand-name {
      font-family: var(--font-heading, 'Plus Jakarta Sans', sans-serif);
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }
    .brand-tagline {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-top: 2px;
    }

    /* Size variants */
    .size-sm .logo-svg { width: 26px; height: 26px; }
    .size-sm .brand-name { font-size: 1.05rem; }

    .size-lg .logo-svg { width: 40px; height: 40px; }
    .size-lg .brand-name { font-size: 1.5rem; }

    .size-xl .logo-svg { width: 48px; height: 48px; }
    .size-xl .brand-name { font-size: 1.85rem; }

    /* Light on dark variant */
    .variant-white .brand-name {
      color: #FFFFFF;
    }
    .variant-white .brand-tagline {
      color: rgba(255, 255, 255, 0.7);
    }
  `]
})
export class BrandLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() variant: 'default' | 'compact' | 'variant-white' = 'default';
  @Input() showTagline: boolean = false;
  @Input() linkUrl: string = '/';
}
