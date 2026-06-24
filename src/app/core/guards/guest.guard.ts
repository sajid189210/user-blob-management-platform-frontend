import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { loginSuccess } from '../../store/auth/auth.actions';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const store = inject(Store);
  const router = inject(Router);

  return authService.refreshToken().pipe(
    map((res) => {
      store.dispatch(loginSuccess({ user: res.data.user, accessToken: res.data.accessToken }));
      router.navigate(['/home']);
      return false;
    }),
    catchError(() => of(true)),
  );
};
