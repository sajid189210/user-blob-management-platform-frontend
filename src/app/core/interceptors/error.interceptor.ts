import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { NotificationService } from '../service/notification.service';
import { loginSuccess, logout } from '../../store/auth/auth.actions';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This resource already exists.',
  422: 'The provided data is invalid.',
  429: 'Too many requests. Please try again later.',
  500: 'Something went wrong. Please try again later.',
  502: 'Server is temporarily unavailable. Please try again.',
  503: 'Server is temporarily unavailable. Please try again.',
};

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<boolean | null>(null);

function refreshTokens(store: Store, authService: AuthService, router: Router, notification: NotificationService) {
  isRefreshing = true;
  refreshSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap((res) => {
      isRefreshing = false;
      store.dispatch(loginSuccess({ user: res.data.user, accessToken: res.data.accessToken }));
      refreshSubject.next(true);
      return [true];
    }),
    catchError((refreshErr) => {
      isRefreshing = false;
      authService.logout().subscribe({ error: () => {} });
      store.dispatch(logout());
      router.navigate(['/login']);
      notification.error('Session expired. Please log in again.');
      refreshSubject.next(false);
      return throwError(() => refreshErr);
    }),
  );
}

function retryWithNewToken(req: HttpRequest<unknown>, next: HttpHandlerFn, store: Store) {
  let token = '';
  store.select((state: any) => state.auth?.accessToken).pipe(take(1)).subscribe(t => token = t);
  const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(cloned);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const router = inject(Router);
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401
        && !req.url.includes('/auth/login')
        && !req.url.includes('/auth/signup')
        && !req.url.includes('/auth/refresh-token')
      ) {
        if (!isRefreshing) {
          return refreshTokens(store, authService, router, notification).pipe(
            switchMap(() => retryWithNewToken(req, next, store)),
          );
        }

        return refreshSubject.pipe(
          filter(result => result !== null),
          take(1),
          switchMap((result) => {
            if (result) {
              return retryWithNewToken(req, next, store);
            }
            return throwError(() => err);
          }),
        );
      }

      const status = err.status;
      let message = err.error?.message ?? err.message;
      if (!message || status >= 500) {
        message = ERROR_MESSAGES[status] ?? 'An unexpected error occurred.';
      }
      notification.error(message);
      return throwError(() => err);
    }),
  );
};
