import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Admin } from '../../service/admin';

@Component({
  selector: 'app-admin-login',
  standalone: false,
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private adminService: Admin, private router: Router) {}

  login(): void {
    if (!this.email || !this.password) {
      this.error = 'Please enter your username and password.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.adminService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.adminService.saveToken(res.token);
        this.router.navigate(['/admin-panel']);
      },
      error: () => {
        this.error = 'Invalid username or password.';
        this.loading = false;
      },
    });
  }
}