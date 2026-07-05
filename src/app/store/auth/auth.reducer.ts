import { createReducer, on } from '@ngrx/store';
import { IAuthState, initialAuthState } from './auth.state';
import { loginSuccess, signupSuccess, logout } from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(loginSuccess, (state, { user, accessToken }): IAuthState => ({
    ...state,
    user,
    accessToken,
  })),

  on(signupSuccess, (state, { user, accessToken }): IAuthState => ({
    ...state,
    user,
    accessToken,
  })),

  on(logout, (): IAuthState => initialAuthState),
);
