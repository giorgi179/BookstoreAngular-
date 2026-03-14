import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('admin_token');

    const isValidJwt = token
      ? token.split('.').length === 3
      : false;

    if (isValidJwt) {
      return true;
    }

    sessionStorage.removeItem('admin_token');
    this.router.navigate(['/admin-login']);
    return false;
  }
}