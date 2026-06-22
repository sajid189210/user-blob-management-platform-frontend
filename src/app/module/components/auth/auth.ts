import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth implements OnInit {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  mode: 'login' | 'signup' = 'login';
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
  }

  signup() {
  }

  switchMode() {
    this._router.navigate([this.isLogin ? '/signup' : '/login']);
  }

  goToForgotPassword() {
    this._router.navigate(['/forgot-password']);
  }
}
