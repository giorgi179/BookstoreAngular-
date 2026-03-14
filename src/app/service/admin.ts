import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Admin {
  private api = 'https://localhost:7023/api/admin';
  private baseApi = 'https://localhost:7023/api';

  constructor(private http: HttpClient) {}

  // ── Auth ──────────────────────────────────────

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { email, password });
  }

  saveToken(token: string): void {
    sessionStorage.setItem('admin_token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('admin_token');
  }

  logout(): void {
    sessionStorage.removeItem('admin_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ── Dashboard ─────────────────────────────────

  getDashboard(): Observable<any> {
    return this.http.get(`${this.api}/dashboard`);
  }

  // ── Books ─────────────────────────────────────

  getBooks(): Observable<any> {
    return this.http.get(`${this.api}/books`);
  }

  createBook(book: any): Observable<any> {
    return this.http.post(`${this.api}/books`, book);
  }

  updateBook(id: number, book: any): Observable<any> {
    return this.http.put(`${this.api}/books/${id}`, book);
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.api}/books/${id}`);
  }

  // ── Users ─────────────────────────────────────

  getUsers(): Observable<any> {
    return this.http.get(`${this.api}/users`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.api}/users/${id}`);
  }

  verifyUser(id: number): Observable<any> {
    return this.http.patch(`${this.api}/users/${id}/verify`, {});
  }

  // ── Messages ──────────────────────────────────

  getMessages(): Observable<any> {
    return this.http.get(`${this.api}/messages`);
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.api}/messages/${id}`);
  }

  // ── Baskets ───────────────────────────────────

  getBaskets(): Observable<any> {
    return this.http.get(`${this.baseApi}/Basket/get-baskets`);
  }

  // ── Payments ──────────────────────────────────

  getPayments(): Observable<any> {
    return this.http.get(`${this.baseApi}/Payment/all`);
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.baseApi}/Payment/${id}`);
  }
  // ── User saved cards ───────────────────────
  getUserSavedCards(): Observable<any> {
    return this.http.get(`${this.api}/users`);
  }
  getOrders(): Observable<any> {
    return this.http.get(`${this.baseApi}/Payment/all`);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.baseApi}/Payment/${id}`);
  }
}
