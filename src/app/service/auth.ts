import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = "https://localhost:7023/api/User";

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.api}/register`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(data: any) {
    return this.http.post(`${this.api}/login`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  verifyUser(id: number, code: string) {
    return this.http.post(
      `${this.api}/verify-user?id=${id}&code=${code}`,
      {},
      { responseType: 'text' }
    ).pipe(
      catchError(err => throwError(() => err))
    );
  }
}