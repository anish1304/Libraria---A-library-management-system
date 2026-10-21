import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    if (auth.isAdmin()) return true;
    return router.createUrlTree(['/admin/login']);
  }

  return auth.loadCurrentUser().pipe(
    map(user => {
      if (user.role === 'admin' || user.is_staff) return true;
      return router.createUrlTree(['/admin/login']);
    }),
    catchError(() => of(router.createUrlTree(['/admin/login'])))
  );
};

export const studentGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    if (auth.isStudent()) return true;
    return router.createUrlTree(['/student/login']);
  }

  return auth.loadCurrentUser().pipe(
    map(user => {
      if (user.role === 'student' || user.role === 'faculty') return true;
      return router.createUrlTree(['/student/login']);
    }),
    catchError(() => of(router.createUrlTree(['/student/login'])))
  );
};
