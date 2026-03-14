import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../service/seo-service';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class Auth {
  isRightPanelActive = false;
  showVerify = false;

  loginData: any = {};
  registerData: any = {};

  loginMessage = '';
  loginSuccess = false;

  registerMessage = '';
  registerSuccess = false;

  verifyCode = '';
  verifyMessage = '';
  verifySuccess = false;

  registeredUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private seo: SeoService
  ) {}

  activateSignUp() {
    this.isRightPanelActive = true;
  }

  activateSignIn() {
    this.isRightPanelActive = false;
  }

  onLogin() {
    this.seo.setAuthPage();
    this.loginMessage = '';
    this.loginSuccess = false;

    if (!this.loginData.email || !this.loginData.password) {
      this.loginMessage = 'Please fill in all fields.';
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('userEmail', this.loginData.email);
        window.dispatchEvent(new Event('storage'));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loginSuccess = false;
        this.loginMessage = err.error?.message || err.error || 'Invalid email or password.';
      },
    });
  }

  onRegister() {
    this.registerMessage = '';
    this.registerSuccess = false;

    if (!this.registerData.fullName || !this.registerData.email || !this.registerData.password) {
      this.registerMessage = 'Please fill in all required fields.';
      return;
    }

    this.authService.register({
      lastName: this.registerData.fullName,
      email: this.registerData.email,
      phone: this.registerData.phone || '',
      password: this.registerData.password,
    }).subscribe({
      next: (res: any) => {
        this.registerSuccess = true;
        this.registerMessage = 'Check your email for the verification code.';
        this.registeredUserId = res.userId;
        this.showVerify = true;
      },
      error: (err) => {
        this.registerSuccess = false;
        this.registerMessage = err.error?.message || err.error || 'Registration failed. Email may already be in use.';
      },
    });
  }

  onVerify() {
    if (!this.registeredUserId) return;
    this.verifyMessage = '';
    this.verifySuccess = false;

    if (!this.verifyCode) {
      this.verifyMessage = 'Please enter the verification code.';
      return;
    }

    if (this.verifyCode.trim().length !== 6) {
      this.verifyMessage = 'Code must be exactly 6 digits.';
      return;
    }

    if (!/^\d{6}$/.test(this.verifyCode.trim())) {
      this.verifyMessage = 'Code must contain digits only.';
      return;
    }

    this.authService.verifyUser(this.registeredUserId, this.verifyCode.trim()).subscribe({
      next: (res: any) => {
        if (res === 'User Is Verifyed') {
          this.verifySuccess = true;
          this.verifyMessage = 'Verified successfully!';
          setTimeout(() => {
            this.showVerify = false;
            this.isRightPanelActive = false;
          }, 1500);
        } else {
          this.verifySuccess = false;
          this.verifyMessage = 'Invalid verification code. Please try again.';
        }
      },
      error: (err) => {
        this.verifySuccess = false;
        this.verifyMessage = err.error?.message || err.error || 'Something went wrong.';
      },
    });
  }
}