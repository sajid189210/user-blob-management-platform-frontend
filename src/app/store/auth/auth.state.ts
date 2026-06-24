import { IAuthResponse } from "../../core/interface/auth.interface";

export interface AuthState {
  user: IAuthResponse['user'] | null;
  accessToken: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
};
