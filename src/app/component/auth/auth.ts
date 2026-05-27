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

  // ─── FORGOT PASSWORD ───────────────────────────
  forgotStep = 0;        // 0=login, 1=email input, 2=code+newpass
  forgotEmail = '';
  forgotMessage = '';
  forgotSuccess = false;

  resetCode = '';
  resetNewPassword = '';
  resetMessage = '';
  resetSuccess = false;
  // ───────────────────────────────────────────────

  constructor(
    private authService: AuthService,
    private router: Router,
    private seo: SeoService
  ) {}

  activateSignUp() { this.isRightPanelActive = true; }
  activateSignIn() { this.isRightPanelActive = false; }

  startForgotPassword() {
    this.forgotStep = 1;
    this.forgotEmail = '';
    this.forgotMessage = '';
    this.forgotSuccess = false;
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
        this.registerMessage = err.error?.message || err.error || 'Registration failed.';
      },
    });
  }

  onVerify() {
    if (!this.registeredUserId) return;
    this.verifyMessage = '';
    this.verifySuccess = false;

    if (!this.verifyCode) { this.verifyMessage = 'Please enter the verification code.'; return; }
    if (this.verifyCode.trim().length !== 6) { this.verifyMessage = 'Code must be exactly 6 digits.'; return; }
    if (!/^\d{6}$/.test(this.verifyCode.trim())) { this.verifyMessage = 'Code must contain digits only.'; return; }

    this.authService.verifyUser(this.registeredUserId, this.verifyCode.trim()).subscribe({
      next: (res: any) => {
        if (res === 'User Is Verifyed') {
          this.verifySuccess = true;
          this.verifyMessage = 'Verified successfully!';
          setTimeout(() => { this.showVerify = false; this.isRightPanelActive = false; }, 1500);
        } else {
          this.verifyMessage = 'Invalid verification code. Please try again.';
        }
      },
      error: (err) => {
        this.verifyMessage = err.error?.message || err.error || 'Something went wrong.';
      },
    });
  }

  // ნაბიჯი 1: email-ზე კოდის გაგზავნა
  onForgotPassword() {
    this.forgotMessage = '';
    this.forgotSuccess = false;

    if (!this.forgotEmail) {
      this.forgotMessage = 'Please enter your email.';
      return;
    }

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.forgotSuccess = true;
        this.forgotMessage = 'Reset code sent! Check your email.';
        setTimeout(() => {
          this.forgotStep = 2;
          this.forgotMessage = '';
        }, 1500);
      },
      error: (err) => {
        this.forgotSuccess = false;
        this.forgotMessage = err.error?.message || 'Something went wrong.';
      },
    });
  }

  // ნაბიჯი 2: კოდი + ახალი პაროლი
  onResetPassword() {
    this.resetMessage = '';
    this.resetSuccess = false;

    if (!this.resetCode || !this.resetNewPassword) {
      this.resetMessage = 'Please fill in all fields.';
      return;
    }

    if (this.resetCode.trim().length !== 6) {
      this.resetMessage = 'Code must be exactly 6 digits.';
      return;
    }

    if (this.resetNewPassword.length < 6) {
      this.resetMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.authService.resetPassword(this.forgotEmail, this.resetCode.trim(), this.resetNewPassword).subscribe({
      next: () => {
        this.resetSuccess = true;
        this.resetMessage = 'Password reset successfully! You can now sign in.';
        setTimeout(() => {
          this.forgotStep = 0;
          this.resetCode = '';
          this.resetNewPassword = '';
          this.resetMessage = '';
        }, 2000);
      },
      error: (err) => {
        this.resetSuccess = false;
        this.resetMessage = err.error?.message || 'Invalid or expired code.';
      },
    });
  }
}