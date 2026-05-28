import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

/**
 * NoAuthGuard
 * თუ user უკვე logged in არის, /auth გვერდზე არ უნდა შეეძლოს შესვლა.
 * → /profile-ზე გადამისამართება
 */
@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return true;
    }

    this.router.navigate(['/profile']);
    return false;
  }
}