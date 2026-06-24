import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../../core/service/auth.service';
import { logout } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-header',
  imports: [RouterModule, FormsModule, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly _store = inject(Store<{ auth: { user: { id: string; name: string; email: string } | null; accessToken: string | null } }>);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  protected searchQuery = '';
  protected showDropdown = false;

  protected user$ = this._store.select(state => state.auth.user);

  protected onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this._router.navigate(['/home'], { queryParams: { search: q } });
    } else {
      this._router.navigate(['/home']);
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown() {
    this.showDropdown = false;
  }

  async onLogout() {
    try {
      await lastValueFrom(this._authService.logout());
    } catch {
      // Proceed with local logout even if API call fails
    }
    this._store.dispatch(logout());
    this._router.navigate(['/login']);
  }
}
