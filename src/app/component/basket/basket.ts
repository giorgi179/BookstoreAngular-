import { Component, OnInit } from '@angular/core';
import { BasketService } from '../../service/basket-service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SeoService } from '../../service/seo-service';
import { PAYMENT_API, USER_API } from '../../service/api';

@Component({
  selector    : 'app-basket',
  standalone  : false,
  templateUrl : './basket.html',
  styleUrl    : './basket.scss',
})
export class Basket implements OnInit {
  baskets       : any[]  = [];
  allItems      : any[]  = [];
  userId        : number = 0;
  email         : string = '';
  isLoading     : boolean = false;
  successMessage: string = '';
  errorMessage  : string = '';

  // ── Saved cards ───────────────────────────────
  savedCards     : any[]    = [];
  showCardPicker  = false;
  selectedCard   : any      = null;

  private apiUser    = USER_API;
  private apiPayment = PAYMENT_API;

  constructor(
    private basketService: BasketService,
    private http          : HttpClient,
    private router        : Router,
    private seo           : SeoService,
  ) {}

  ngOnInit() {
    this.seo.setBasketPage();
    const id = localStorage.getItem('userId');
    const em = localStorage.getItem('email')
            || localStorage.getItem('userEmail')
            || localStorage.getItem('user_email')
            || localStorage.getItem('Email')
            || '';

    if (!id) { this.router.navigate(['/auth']); return; }

    this.userId = +id;
    this.email  = em;
    this.loadBaskets();
    this.loadSavedCards();
  }

  // ── Basket ────────────────────────────────────

  loadBaskets() {
    this.isLoading = true;
    this.basketService.getBaskets(this.userId).subscribe({
      next: (res) => {
        this.baskets  = res;
        this.allItems = res.flatMap((b: any) =>
          b.items.map((item: any) => ({ ...item, basketId: b.id }))
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load basket.';
        this.isLoading    = false;
      },
    });
  }

  get totalPrice(): number {
    return this.allItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  increaseQuantity(item: any) {
    const maxStock = item.book?.stock ?? item.stock ?? 9999;
    if (item.quantity >= maxStock) {
      this.errorMessage = `"${item.book?.title}" — maximum available quantity is ${maxStock}.`;
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }
    item.quantity++;
    this.basketService.updateBasketItem(item.basketId, item.bookId, item.quantity).subscribe();
  }

  decreaseQuantity(item: any) {
    if (item.quantity <= 1) return;
    item.quantity--;
    this.basketService.updateBasketItem(item.basketId, item.bookId, item.quantity).subscribe();
  }

  removeItem(item: any) {
    this.basketService.deleteBasketItem(item.id).subscribe({
      next : () => this.loadBaskets(),
      error: () => (this.errorMessage = 'Failed to remove item.'),
    });
  }

  clearAll() {
    this.basketService.clearBasket(this.userId).subscribe({
      next : () => { this.baskets = []; this.allItems = []; },
      error: () => (this.errorMessage = 'Failed to clear basket.'),
    });
  }

  // ── Load saved cards (User API + Payment API) ──

  loadSavedCards() {
    const cards: any[] = [];
    const seen  = new Set<string>();

    // 1. User API primary card
    this.http.get<any>(`${this.apiUser}/get-user?email=${this.email}`).subscribe({
      next: (user) => {
        if (user?.savedCardMasked) {
          const last4 = user.savedCardMasked.slice(-4);
          seen.add(last4);
          cards.push({
            source  : 'user',
            masked  : user.savedCardMasked,
            holder  : user.savedCardHolder ?? '',
            expiry  : user.savedCardExpiry  ?? '',
            brand   : (user.savedCardBrand  ?? '').toLowerCase(),
            cvv     : '',
            address : '',
          });
        }

        // 2. Payment API unique cards
        this.http.get<any[]>(`${this.apiPayment}/user/${this.userId}`).subscribe({
          next: (payments) => {
            (payments ?? []).forEach((p: any) => {
              const raw   = (p.cardNumber ?? '').replace(/\s/g, '');
              const last4 = raw.slice(-4);
              if (!last4 || seen.has(last4)) return;
              seen.add(last4);
              cards.push({
                source  : 'payment',
                masked  : p.cardNumber     ?? '',
                holder  : p.cardHolderName ?? '',
                expiry  : p.expiryDate     ?? '',
                address : p.exactAddress   ?? '',
                brand   : raw.startsWith('4') ? 'visa'
                        : raw.startsWith('5') ? 'mastercard' : '',
                cvv     : '',
              });
            });
            this.savedCards = cards;
          },
          error: () => { this.savedCards = cards; },
        });
      },
      error: () => {
        // fallback: only payment cards
        this.http.get<any[]>(`${this.apiPayment}/user/${this.userId}`).subscribe({
          next: (payments) => {
            (payments ?? []).forEach((p: any) => {
              const raw = (p.cardNumber ?? '').replace(/\s/g, '');
              cards.push({
                source  : 'payment',
                masked  : p.cardNumber     ?? '',
                holder  : p.cardHolderName ?? '',
                expiry  : p.expiryDate     ?? '',
                address : p.exactAddress   ?? '',
                brand   : raw.startsWith('4') ? 'visa'
                        : raw.startsWith('5') ? 'mastercard' : '',
                cvv     : '',
              });
            });
            this.savedCards = cards;
          },
          error: () => { this.savedCards = []; },
        });
      },
    });
  }

  // ── Buy Now logic ─────────────────────────────

  onBuyNow() {
    if (this.savedCards.length === 0) {
      // ბარათი არ არის → card-system-ზე გადამისამართება
      this.router.navigate(['/cardSystem']);
      return;
    }

    if (this.savedCards.length === 1) {
      // ერთი ბარათია → პირდაპირ გადახდა
      this.selectedCard = this.savedCards[0];
      this.buyAll();
      return;
    }

    // ორი+ ბარათია → modal გამოჩნდეს
    this.showCardPicker = true;
  }

  selectCardAndBuy(card: any) {
    this.selectedCard   = card;
    this.showCardPicker = false;
    this.buyAll();
  }

  closeCardPicker() {
    this.showCardPicker = false;
  }

  // ── buyAll ────────────────────────────────────

 buyAll() {
  if (!this.selectedCard) return;

  const freshEmail = localStorage.getItem('email')
                  || localStorage.getItem('userEmail')
                  || this.email;

  if (!freshEmail) {
    this.errorMessage = 'Email not found. Please login again.';
    return;
  }

  this.isLoading      = true;
  this.errorMessage   = '';
  this.successMessage = '';

  // 1. post-buy — stock დაიკლოს + email გაიგზავნოს
  const buyRequests = this.allItems.map(item =>
    this.basketService.buyItem(
      item.bookId, freshEmail, item.quantity, item.price
    ).toPromise()
  );

  Promise.all(buyRequests)
    .then(() => {
      // 2. Payment ცხრილში ჩაწეროს — Orders tab-ში გამოჩნდეს
      const paymentRequests = this.allItems.map(item =>
        this.http.post(`${this.apiPayment}/pay`, null, {
          params: {
            userId         : this.userId.toString(),
            cardNumber     : this.selectedCard.masked,
            cardHolderName : this.selectedCard.holder,
            expiryDate     : this.selectedCard.expiry,
            cvv            : this.selectedCard.cvv || '***',
            exactAddress   : this.selectedCard.address || '—',
            amount         : (item.price * item.quantity).toFixed(2),
          }
        }).toPromise()
      );
      return Promise.all(paymentRequests);
    })
    .then(() => {
      this.basketService.clearBasket(this.userId).subscribe({
        next: () => {
          this.successMessage = 'Purchase successful! Check your email.';
          this.errorMessage   = '';
          this.baskets        = [];
          this.allItems       = [];
          this.isLoading      = false;
          setTimeout(() => (this.successMessage = ''), 5000);
        },
        error: () => {
          this.successMessage = 'Purchase successful! Check your email.';
          this.isLoading      = false;
          setTimeout(() => (this.successMessage = ''), 5000);
        },
      });
    })
    .catch((err) => {
      this.isLoading = false;
      const serverMsg = err?.error;
      if (typeof serverMsg === 'string') {
        if (serverMsg.includes('araswori') || serverMsg.includes('Out of stock')) {
          this.errorMessage = 'Not enough stock for one or more items.';
        } else if (serverMsg.includes('User not found')) {
          this.errorMessage = 'User not found. Please login again.';
        } else if (serverMsg.includes('Book not found')) {
          this.errorMessage = 'One or more books were not found.';
        } else {
          this.errorMessage = serverMsg;
        }
      } else {
        this.errorMessage = 'Purchase failed. Please try again.';
      }
      setTimeout(() => (this.errorMessage = ''), 4000);
    });
}

  goToCardSystem() { this.router.navigate(['/cardSystem']); }
}