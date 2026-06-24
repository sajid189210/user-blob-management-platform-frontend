import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IAuthResponse, IResponse } from '../interface/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _authUrl = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<IResponse<IAuthResponse>> {
    return this._http.post<IResponse<IAuthResponse>>(
      `${this._authUrl}/login`,
      { email, password },
      { withCredentials: true },
    );
  }

  signup(name: string, email: string, password: string): Observable<IResponse> {
    return this._http.post<IResponse>(`${this._authUrl}/signup`, { name, email, password });
  }

  logout(): Observable<IResponse> {
    return this._http.post<IResponse>(
      `${this._authUrl}/logout`,
      {},
      { withCredentials: true },
    );
  }

  refreshToken(): Observable<IResponse<IAuthResponse>> {
    return this._http.post<IResponse<IAuthResponse>>(
      `${this._authUrl}/refresh-token`,
      {},
      { withCredentials: true },
    );
  }
}
