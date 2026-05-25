import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BOOK_API } from './api';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private api = `${BOOK_API}/get-book-tolist`;

  constructor(private http: HttpClient) {}

  getBooks(): Observable<any> {
    return this.http.get(this.api);
  }
}