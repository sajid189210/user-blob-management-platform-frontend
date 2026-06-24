import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import { loginSuccess, signupSuccess, logout } from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(loginSuccess, (state, { user, accessToken }): AuthState => ({
    ...state,
    user,
    accessToken,
  })),

  on(signupSuccess, (state, { user, accessToken }): AuthState => ({
    ...state,
    user,
    accessToken,
  })),

  on(logout, (): AuthState => initialAuthState),
);
