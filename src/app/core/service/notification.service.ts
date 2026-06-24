import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _toastr = inject(ToastrService);

  success(message: string, title?: string) {
    this._toastr.success(message, title);
  }

  error(message: string, title?: string) {
    this._toastr.error(message, title);
  }

  info(message: string, title?: string) {
    this._toastr.info(message, title);
  }

  warning(message: string, title?: string) {
    this._toastr.warning(message, title);
  }
}
