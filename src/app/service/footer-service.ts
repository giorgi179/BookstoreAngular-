import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { USER_API } from './api';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private api = USER_API;

  constructor(private http: HttpClient) {}

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.api}/User/subscribe-newsletter`, JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}