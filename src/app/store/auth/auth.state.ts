import { IAuthResponse } from "../../core/interface/auth.interface";

export interface IAuthState {
  user: IAuthResponse['user'] | null;
  accessToken: string | null;
}

export const initialAuthState: IAuthState = {
  user: null,
  accessToken: null,
};
