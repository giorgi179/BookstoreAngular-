import { Component } from '@angular/core';
import { FooterService } from '../../service/footer-service';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  email: string = '';
  agreed: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private footerService: FooterService) {}

  subscribe() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email && !this.agreed) {
      this.errorMessage = 'Please enter your email and agree to the newsletter.';
      return;
    }
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    if (!this.agreed) {
      this.errorMessage = 'Please agree to the newsletter.';
      return;
    }

    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.errorMessage = 'You must be registered to subscribe to the newsletter.';
      return;
    }

    this.isLoading = true;

    this.footerService.subscribeNewsletter(this.email).subscribe({
      next: (res) => {
        this.successMessage = 'You have successfully subscribed to our newsletter!';
        this.email = '';
        this.agreed = false;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.errorMessage = 'User not found. Please register first.';
        } else if (err.status === 400) {
          this.errorMessage = 'User not verified. Please verify your account first.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again later.';
        }
        this.isLoading = false;
      },
    });
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
