import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, inject, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/service/auth.service';
import { Store } from '@ngrx/store';
import { loginSuccess } from './store/auth/auth.actions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideStore({ auth: authReducer }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 3500,
      preventDuplicates: true,
      tapToDismiss: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      closeButton: true,
      newestOnTop: true,
      toastClass: 'ngx-toastr draftpad-toast',
    }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const store = inject(Store);

      return lastValueFrom(
        authService.refreshToken(),
      ).then((res) => {
        store.dispatch(loginSuccess({ user: res.data.user, accessToken: res.data.accessToken }));
      }).catch(() => {
        // No valid refresh token — stay logged out
      });
    }),
  ]
};
