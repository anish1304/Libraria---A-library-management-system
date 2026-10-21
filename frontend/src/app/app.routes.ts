import { Routes } from '@angular/router';
import { adminGuard, studentGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin-login',
    redirectTo: 'admin/login',
    pathMatch: 'full',
  },
  {
    path: 'student/login',
    loadComponent: () => import('./pages/student-login/student-login.component').then(m => m.StudentLoginComponent),
  },
  {
    path: 'student-login',
    redirectTo: 'student/login',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'books', loadComponent: () => import('./pages/admin/books/book-list.component').then(m => m.BookListComponent) },
      { path: 'books/new', loadComponent: () => import('./pages/admin/books/book-form.component').then(m => m.BookFormComponent) },
      { path: 'books/edit/:id', loadComponent: () => import('./pages/admin/books/book-form.component').then(m => m.BookFormComponent) },
      { path: 'libraries', loadComponent: () => import('./pages/admin/libraries/library-list.component').then(m => m.LibraryListComponent) },
      { path: 'students', loadComponent: () => import('./pages/admin/students/student-list.component').then(m => m.StudentListComponent) },
      { path: 'students/new', loadComponent: () => import('./pages/admin/students/student-form.component').then(m => m.StudentFormComponent) },
      { path: 'students/edit/:id', loadComponent: () => import('./pages/admin/students/student-form.component').then(m => m.StudentFormComponent) },
      { path: 'loans', loadComponent: () => import('./pages/admin/loans/loan-management.component').then(m => m.LoanManagementComponent) },
      { path: 'issue-return', redirectTo: 'loans', pathMatch: 'full' },
      { path: 'reservations', loadComponent: () => import('./pages/admin/reservations/reservation-management.component').then(m => m.ReservationManagementComponent) },
      { path: 'fines', loadComponent: () => import('./pages/admin/fines/fine-management.component').then(m => m.FineManagementComponent) },
      { path: 'reports', loadComponent: () => import('./pages/admin/reports/report-studio.component').then(m => m.ReportStudioComponent) },
      { path: 'import', loadComponent: () => import('./pages/admin/import/bulk-import.component').then(m => m.BulkImportComponent) },
      { path: 'transactions', loadComponent: () => import('./pages/admin/transactions/transaction-history.component').then(m => m.TransactionHistoryComponent) },
      { path: 'audit', redirectTo: 'transactions', pathMatch: 'full' },
      { path: 'settings', loadComponent: () => import('./pages/admin/settings/system-settings.component').then(m => m.SystemSettingsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'student',
    canActivate: [studentGuard],
    loadComponent: () => import('./layouts/student-layout/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent) },
      { path: 'books', loadComponent: () => import('./pages/student/catalogue/book-catalogue.component').then(m => m.BookCatalogueComponent) },
      { path: 'my-loans', loadComponent: () => import('./pages/student/my-loans/my-loans.component').then(m => m.MyLoansComponent) },
      { path: 'my-books', redirectTo: 'my-loans', pathMatch: 'full' },
      { path: 'reservations', loadComponent: () => import('./pages/student/reservations/student-reservations.component').then(m => m.StudentReservationsComponent) },
      { path: 'reading-lists', loadComponent: () => import('./pages/student/reading-lists/reading-lists.component').then(m => m.ReadingListsComponent) },
      { path: 'subscriptions', loadComponent: () => import('./pages/student/subscriptions/student-subscriptions.component').then(m => m.StudentSubscriptionsComponent) },
      { path: 'membership', redirectTo: 'subscriptions', pathMatch: 'full' },
      { path: 'payments', loadComponent: () => import('./pages/student/payments/student-payments.component').then(m => m.StudentPaymentsComponent) },
      { path: 'fines', redirectTo: 'payments', pathMatch: 'full' },
      { path: 'history', loadComponent: () => import('./pages/student/history/student-history.component').then(m => m.StudentHistoryComponent) },
      { path: 'profile', loadComponent: () => import('./pages/student/profile/student-profile.component').then(m => m.StudentProfileComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
