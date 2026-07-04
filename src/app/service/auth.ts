import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { USER_API } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = USER_API;

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http
      .post(`${this.api}/register`, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  login(data: any) {
    return this.http
      .post(`${this.api}/login`, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  verifyUser(id: number, code: string) {
    return this.http
      .post(`${this.api}/verify-user?id=${id}&code=${code}`, {}, { responseType: 'text' })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // Get user to check verification code client-side (fallback)
  getUserById(id: number) {
    return this.http
      .get(`${this.api}/get-user-${id}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  // ახალი მეთოდები
  forgotPassword(email: string) {
    return this.http
      .post(`${this.api}/forgot-password`, { email })
      .pipe(catchError((err) => throwError(() => err)));
  }

  resetPassword(email: string, code: string, newPassword: string) {
    return this.http
      .post(`${this.api}/reset-password`, { email, code, newPassword })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
