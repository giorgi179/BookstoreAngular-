import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private api = 'https://localhost:7023/api';

  constructor(private http: HttpClient) {}

  getBaskets(userId: number): Observable<any> {
    return this.http.get(`${this.api}/BasketItem/get-baskets?userId=${userId}`);
  }

  addToBasket(userId: number, bookId: number, quantity: number): Observable<any> {
    return this.http.post(
      `${this.api}/BasketItem/add-basket?userId=${userId}&bookId=${bookId}&quantity=${quantity}`,
      {},
    );
  }

  deleteBasketItem(id: number): Observable<any> {
    return this.http.delete(`${this.api}/BasketItem/delete-basket?id=${id}`);
  }

  updateBasketItem(basketId: number, bookId: number, quantity: number): Observable<any> {
    return this.http.put(
      `${this.api}/BasketItem/update-basket-item?basketId=${basketId}&bookId=${bookId}&quantity=${quantity}`,
      {},
    );
  }

  clearBasket(userId: number): Observable<any> {
    return this.http.delete(`${this.api}/BasketItem/clear-basket?userId=${userId}`);
  }

  buyItem(bookId: number, email: string, quantity: number, price: number): Observable<any> {
    return this.http.post(
      `${this.api}/User/post-buy?bookId=${bookId}&raodenoba=${quantity}&email=${encodeURIComponent(email)}&price=${price}`,
      {},
    );
  }
}
