import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SeoService } from '../../service/seo-service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-change-password',
  standalone: true,
imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.scss'],
})
export class ChangePassword {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  private api = 'https://localhost:7023/api/User';

  constructor(
    private http: HttpClient,
    private router: Router,
    private seo: SeoService,
  ) {}
  ngOnInit() {
    this.seo.setChangePasswordPage();
  }
  submit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'New password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const email = localStorage.getItem('userEmail');
    if (!email) {
      this.router.navigate(['/auth']);
      return;
    }

    this.isLoading = true;

    this.http
      .put<any>(
        `${this.api}/cange-password?email=${email}&axaliparoli=${this.newPassword}&dzveliparoli=${this.oldPassword}`,
        {},
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully!';
          this.isLoading = false;
          this.oldPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Something went wrong.';
          this.isLoading = false;
        },
      });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
