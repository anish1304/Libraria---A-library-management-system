import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastNotificationComponent } from './shared/toast-notification/toast-notification.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastNotificationComponent],
  template: `
    <router-outlet />
    <app-toast-notification />
  `,
})
export class App {
  // ThemeService injected to ensure theme initialization on boot
  private themeService = inject(ThemeService);
}
