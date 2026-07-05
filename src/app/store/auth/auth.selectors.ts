import { createSelector, createFeatureSelector } from '@ngrx/store';
import { IAuthState } from './auth.state';

export const selectIAuthState = createFeatureSelector<IAuthState>('auth');

export const selectAccessToken = createSelector(
  selectIAuthState,
  (state) => state.accessToken,
);

export const selectUser = createSelector(
  selectIAuthState,
  (state) => state.user,
);

export const selectIsAuthenticated = createSelector(
  selectAccessToken,
  (token) => token !== null,
);
