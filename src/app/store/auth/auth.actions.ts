import { createAction, props } from '@ngrx/store';
import { IAuthResponse } from '../../core/interface/auth.interface';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: IAuthResponse['user']; accessToken: string }>(),
);

export const signupSuccess = createAction(
  '[Auth] Signup Success',
  props<{ user: IAuthResponse['user']; accessToken: string }>(),
);

export const logout = createAction('[Auth] Logout');
