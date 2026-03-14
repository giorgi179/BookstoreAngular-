import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private api = 'https://localhost:7023/api';

  constructor(private http: HttpClient) {}

  subscribeNewsletter(email: string): Observable<any> {
    return this.http.post(`${this.api}/User/subscribe-newsletter`, JSON.stringify(email), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}