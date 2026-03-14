import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  };

  loading = false;
  successMsg = '';
  errorMsg = '';

  private api = 'https://myapiproject-production-bece.up.railway.app/api/User';

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    const params: any = {
      firstName: this.formData.firstName,
      email: this.formData.email,
      massage: this.formData.message
    };

    if (this.formData.lastName?.trim()) {
      params.lastName = this.formData.lastName;
    }

    this.http.post(`${this.api}/user-massage`, null, { params })
      .subscribe({
        next: () => {
          this.successMsg = 'CONTACT_SUCCESS';
          this.formData = { firstName: '', lastName: '', email: '', message: '' };
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = err.status === 404
            ? 'CONTACT_ERR_404'
            : 'CONTACT_ERR_GENERAL';
          this.loading = false;
        }
      });
  }
}