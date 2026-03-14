import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private api = "https://localhost:7023/api/Book/get-book-tolist";

  constructor(private http: HttpClient) {}

  getBooks(): Observable<any> {
    return this.http.get(this.api);
  }
}