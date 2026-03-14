import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BasketService } from '../../service/basket-service';

interface BasketItem {
  bookId: number;
  price: number;
  quantity: number;
  book?: any;
}

@Component({
  selector: 'app-card-system',
  standalone: false,
  templateUrl: './card-system.html',
  styleUrl: './card-system.scss',
})
export class CardSystem implements OnInit {
  private api    = 'https://localhost:7023/api/User';
  private payApi = 'https://localhost:7023/api/Payment';

  cardData = { number: '', name: '', expiry: '', cvv: '', address: '' };
  isFlipped = false;
  loading   = false;
  successMsg = '';
  errorMsg   = '';

  items: BasketItem[] = [];
  email  = '';
  userId = 0;

  errors  = { number: '', name: '', expiry: '', cvv: '', address: '' };
  touched = { number: false, name: false, expiry: false, cvv: false, address: false };

  constructor(
    private http: HttpClient,
    public router: Router,
    private basketService: BasketService
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('email')
              || localStorage.getItem('userEmail')
              || localStorage.getItem('user_email')
              || localStorage.getItem('Email')
              || '';

    const id = localStorage.getItem('userId');
    if (!id) { this.router.navigate(['/auth']); return; }
    this.userId = +id;
    this.loadBasket();
  }

  loadBasket() {
    this.basketService.getBaskets(this.userId).subscribe({
      next: (res: any[]) => {
        this.items = res.flatMap(b =>
          b.items.map((item: any) => ({ ...item, basketId: b.id }))
        );
      },
      error: () => { this.errorMsg = 'ERR_PAYMENT_FAILED'; }
    });
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  get cardDisplay(): string {
    const raw = this.cardData.number.replace(/\s/g, '');
    return raw.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
  }

  get cardBrand(): string {
    const n = this.cardData.number.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5')) return 'mastercard';
    return '';
  }

  get isFormValid(): boolean {
    return !this.errors.number  &&
           !this.errors.name    &&
           !this.errors.expiry  &&
           !this.errors.cvv     &&
           !this.errors.address &&
           !!this.cardData.number  &&
           !!this.cardData.name    &&
           !!this.cardData.expiry  &&
           !!this.cardData.cvv     &&
           !!this.cardData.address;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardData.number = value.replace(/(.{4})/g, '$1 ').trim();
    this.touched.number = true;
    this.validateNumber();
  }

  onNameInput(event: any) {
    const filtered = event.target.value.replace(/[^a-zA-Z\s]/g, '');
    this.cardData.name = filtered.toUpperCase();
    event.target.value = this.cardData.name;
    this.touched.name = true;
    this.validateName();
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    this.cardData.expiry = value;
    this.touched.expiry = true;
    this.validateExpiry();
  }

  onCvvInput(event: any) {
    const filtered = event.target.value.replace(/\D/g, '').substring(0, 3);
    this.cardData.cvv = filtered;
    event.target.value = filtered;
    this.touched.cvv = true;
    this.validateCvv();
  }

  onAddressInput(event: any) {
    this.cardData.address = event.target.value;
    this.touched.address = true;
    this.validateAddress();
  }

  validateNumber() {
    const raw = this.cardData.number.replace(/\s/g, '');
    if (!raw)                  this.errors.number = 'ERR_CARD_NUMBER_REQUIRED';
    else if (raw.length < 16)  this.errors.number = 'ERR_CARD_NUMBER_LENGTH';
    else                       this.errors.number = '';
  }

  validateName() {
    if (!this.cardData.name.trim())               this.errors.name = 'ERR_NAME_REQUIRED';
    else if (this.cardData.name.trim().length < 3) this.errors.name = 'ERR_NAME_SHORT';
    else                                           this.errors.name = '';
  }

  validateExpiry() {
    const val = this.cardData.expiry;
    if (!val) { this.errors.expiry = 'ERR_EXPIRY_REQUIRED'; return; }
    if (!/^\d{2}\/\d{2}$/.test(val)) { this.errors.expiry = 'ERR_EXPIRY_FORMAT'; return; }
    const [mm, yy] = val.split('/').map(Number);
    if (mm < 1 || mm > 12) { this.errors.expiry = 'ERR_EXPIRY_MONTH'; return; }
    const now = new Date();
    const currentYear  = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
      this.errors.expiry = 'ERR_EXPIRY_EXPIRED'; return;
    }
    this.errors.expiry = '';
  }

  validateCvv() {
    if (!this.cardData.cvv)               this.errors.cvv = 'ERR_CVV_REQUIRED';
    else if (this.cardData.cvv.length < 3) this.errors.cvv = 'ERR_CVV_LENGTH';
    else                                   this.errors.cvv = '';
  }

  validateAddress() {
    if (!this.cardData.address.trim())               this.errors.address = 'ERR_ADDRESS_REQUIRED';
    else if (this.cardData.address.trim().length < 5) this.errors.address = 'ERR_ADDRESS_SHORT';
    else                                              this.errors.address = '';
  }

  onPay() {
    this.touched = { number: true, name: true, expiry: true, cvv: true, address: true };
    this.validateNumber();
    this.validateName();
    this.validateExpiry();
    this.validateCvv();
    this.validateAddress();

    if (!this.isFormValid)       { this.errorMsg = 'ERR_FIX_ERRORS';    return; }
    if (!this.email)             { this.errorMsg = 'ERR_LOGIN_REQUIRED'; return; }
    if (this.items.length === 0) { this.errorMsg = 'ERR_BASKET_EMPTY';   return; }

    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    // Step 1: buy all books
    const buyRequests = this.items.map(item =>
      this.http.post(`${this.api}/post-buy`, null, {
        params: {
          bookId:    item.bookId.toString(),
          raodenoba: item.quantity.toString(),
          email:     this.email,
          price:     item.price.toString()
        }
      }).toPromise()
    );

    Promise.all(buyRequests)
      .then(() => {
        // Step 2: save payment record
        this.http.post(`${this.payApi}/pay`, null, {
          params: {
            userId:         this.userId.toString(),
            cardNumber:     this.cardData.number,
            cardHolderName: this.cardData.name,
            expiryDate:     this.cardData.expiry,
            cvv:            this.cardData.cvv,
            exactAddress:   this.cardData.address,
            amount:         this.total.toString()
          }
        }).subscribe();

        // Step 3: clear basket
        this.basketService.clearBasket(this.userId).subscribe();

        this.successMsg = 'SUCCESS_PAYMENT';
        this.items      = [];
        this.loading    = false;
        setTimeout(() => this.router.navigate(['/home']), 2500);
      })
      .catch(() => {
        this.errorMsg = 'ERR_PAYMENT_FAILED';
        this.loading  = false;
      });
  }
}