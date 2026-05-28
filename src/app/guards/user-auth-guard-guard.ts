import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userId = localStorage.getItem('userId');
    if (userId) return true;
    this.router.navigate(['/auth']);
    return false;
  }
}