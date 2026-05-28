import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

/**
 * AdminNoAuthGuard
 * თუ admin უკვე logged in არის, /admin-login გვერდზე არ უნდა შეეძლოს შესვლა.
 * → /admin-panel-ზე გადამისამართება
 */
@Injectable({ providedIn: 'root' })
export class AdminNoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('admin_token');
    const isValidJwt = token ? token.split('.').length === 3 : false;

    if (!isValidJwt) {
      return true;
    }

    this.router.navigate(['/admin-panel']);
    return false;
  }
}