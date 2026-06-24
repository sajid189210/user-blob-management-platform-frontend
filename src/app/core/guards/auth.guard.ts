import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { NotificationService } from '../service/notification.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const toastr = inject(NotificationService);
  let isAuthenticated = false;

  store.select(selectIsAuthenticated).pipe(take(1)).subscribe(v => isAuthenticated = v);

  if (!isAuthenticated) {
    toastr.error('Login is required.');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
