import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/service/auth.service';
import { NotificationService } from '../../../core/service/notification.service';
import { loginSuccess, signupSuccess } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth implements OnInit {
  private readonly _notification = inject(NotificationService);
  private readonly _store = inject(Store);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  mode: 'login' | 'signup' = 'login';
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  ngOnInit() {
    this._route.data.subscribe(data => {
      this.mode = data['mode'] || 'login';
    });
  }

  get isLogin() {
    return this.mode === 'login';
  }

  get heading() {
    return this.isLogin ? 'Welcome back' : 'Create your account';
  }

  get subtitle() {
    return this.isLogin ? 'Sign in to your DraftPad account' : 'Start writing with DraftPad';
  }

  get submitLabel() {
    return this.isLogin ? 'Sign In' : 'Create Account';
  }

  get altText() {
    return this.isLogin ? 'Don\'t have an account?' : 'Already have an account?';
  }

  get altAction() {
    return this.isLogin ? 'Create one' : 'Sign in';
  }

  submit() {
    if (this.isLogin) {
      this.login();
    } else {
      this.signup();
    }
  }

  login() {
    this._authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this._store.dispatch(loginSuccess({ user: res.data.user, accessToken: res.data.accessToken }));
        this._notification.success('Welcome back to DraftPad!');
        this._router.navigate(['/home']);
      },
    });
  }

  signup() {
    this._authService.signup(this.name, this.email, this.password).subscribe({
      next: (res) => {
        this._notification.success(res.message);
        this._router.navigate(['/login']);
      }
    });
  }

  switchMode() {
    this._router.navigate([this.isLogin ? '/signup' : '/login']);
  }

  goToForgotPassword() {
    this._router.navigate(['/forgot-password']);
  }
}
