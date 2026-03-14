import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit {

  private apiUser    = 'https://myapiproject-production-bece.up.railway.app/api/User';
  private apiPayment = 'https://myapiproject-production-bece.up.railway.app/api/Payment';

  // ── User state ───────────────────────────────────────────────────────────────
  userId       = 0;
  userEmail    = '';
  userName     = '';
  userPhone    = '';
  currentPhoto = '';
  isVerified   = false;

  // ── UI state ─────────────────────────────────────────────────────────────────
  activeTab      = 'info';
  isLoading      = false;
  successMsg     = '';
  errorMsg       = '';
  photoModalOpen = false;

  // ── Profile edit ──────────────────────────────────────────────────────────────
  editMode  = false;
  editName  = '';
  editPhone = '';

  // ── Cards ─────────────────────────────────────────────────────────────────────
  allCards    : any[] = [];
  editingCard : any   = null;
  showCardForm        = false;

  cardForm    = { number: '', holder: '', expiry: '', cvv: '', address: '' };
  cardErrors  = { number: '', holder: '', expiry: '', cvv: '', address: '' };
  cardTouched = { number: false, holder: false, expiry: false, cvv: false, address: false };

  // ── Payment history ───────────────────────────────────────────────────────────
  payments: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  ngOnInit() {
    const id    = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail') ?? localStorage.getItem('email') ?? '';
    if (!id) { this.router.navigate(['/auth']); return; }
    this.userId    = +id;
    this.userEmail = email;
    this.loadUser(email);
    this.loadPhoto(email);
  }

  // ── Load user + merge cards ───────────────────────────────────────────────────

  loadUser(email: string) {
    this.http.get<any>(`${this.apiUser}/get-user?email=${email}`).subscribe({
      next : (res) => {
        this.userName   = res.fullName   ?? '';
        this.userPhone  = res.phone      ?? '';
        this.isVerified = res.isVerified ?? false;
        this.editName   = this.userName;
        this.editPhone  = this.userPhone;
        this.mergeCards(res);
      },
      error: () => this.mergeCards(null),
    });
  }

  mergeCards(userRes: any) {
    this.http.get<any[]>(`${this.apiPayment}/user/${this.userId}`).subscribe({
      next: (payments) => {
        const cards: any[] = [];
        const seen = new Set<string>();

        // 1. Primary card from User API (single saved card)
        if (userRes?.savedCardMasked) {
          const last4 = userRes.savedCardMasked.slice(-4);
          seen.add(last4);
          cards.push({
            id      : 'user-primary',
            source  : 'user',
            primary : true,
            masked  : userRes.savedCardMasked,
            holder  : userRes.savedCardHolder ?? '',
            expiry  : userRes.savedCardExpiry ?? '',
            address : '',
            brand   : (userRes.savedCardBrand ?? '').toLowerCase(),
          });
        }

        // 2. Unique cards from Payment history
        (payments ?? []).forEach((p: any) => {
          const raw   = (p.cardNumber ?? '').replace(/\s/g, '');
          const last4 = raw.slice(-4);
          if (!last4 || seen.has(last4)) return;
          seen.add(last4);
          cards.push({
            id      : `pay-${p.id}`,
            source  : 'payment',
            primary : false,
            masked  : p.cardNumber     ?? '',
            holder  : p.cardHolderName ?? '',
            expiry  : p.expiryDate     ?? '',
            address : p.exactAddress   ?? '',
            brand   : raw.startsWith('4') ? 'visa'
                    : raw.startsWith('5') ? 'mastercard' : '',
          });
        });

        this.allCards = cards;
      },
      error: () => {
        // fallback: only primary card
        this.allCards = userRes?.savedCardMasked ? [{
          id      : 'user-primary',
          source  : 'user',
          primary : true,
          masked  : userRes.savedCardMasked,
          holder  : userRes.savedCardHolder ?? '',
          expiry  : userRes.savedCardExpiry ?? '',
          address : '',
          brand   : (userRes.savedCardBrand ?? '').toLowerCase(),
        }] : [];
      },
    });
  }

  loadPhoto(email: string) {
    this.http.get(`${this.apiUser}/get-photo?email=${email}`, { responseType: 'text' }).subscribe({
      next: (url) => { this.currentPhoto = url.replace(/^"|"$/g, ''); },
      error: ()   => { this.currentPhoto = ''; },
    });
  }

  // ── Profile edit ──────────────────────────────────────────────────────────────

  startEdit()  { this.editName = this.userName; this.editPhone = this.userPhone; this.editMode = true; }
  cancelEdit() { this.editMode = false; }

  saveProfile() {
    if (!this.editName.trim()) { this.showError('Name cannot be empty'); return; }
    this.isLoading = true;
    this.http.put(`${this.apiUser}/update-profile`, {
      userId: this.userId, fullName: this.editName, phone: this.editPhone,
    }).subscribe({
      next: () => {
        this.userName  = this.editName;
        this.userPhone = this.editPhone;
        this.editMode  = false;
        this.isLoading = false;
        this.showSuccess('Profile updated successfully!');
      },
      error: () => { this.isLoading = false; this.showError('Failed to update profile.'); },
    });
  }

  // ── Photo ─────────────────────────────────────────────────────────────────────

  openPhotoModal()  { this.photoModalOpen = true; }
  closePhotoModal() { this.photoModalOpen = false; }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.isLoading = true;
    const fd = new FormData();
    fd.append('userId', this.userId.toString());
    fd.append('file', file);
    this.http.post<{ imageUrl: string }>(`${this.apiUser}/upload-photo`, fd).subscribe({
      next: (res) => {
        this.currentPhoto = res.imageUrl;
        this.isLoading    = false;
        this.closePhotoModal();
        this.showSuccess('Photo updated!');
      },
      error: () => { this.isLoading = false; this.showError('Failed to upload photo.'); },
    });
  }

  getDefaultAvatar(): string {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23e0d5c5'/%3E%3Ccircle cx='60' cy='45' r='20' fill='%238a7d6b'/%3E%3Cellipse cx='60' cy='95' rx='30' ry='20' fill='%238a7d6b'/%3E%3C/svg%3E`;
  }

  onImgError(e: Event) { (e.target as HTMLImageElement).src = this.getDefaultAvatar(); }

  // ── Card form ─────────────────────────────────────────────────────────────────

  resetCardForm(prefill?: any) {
    this.cardForm    = {
      number  : prefill?.masked  ?? '',
      holder  : prefill?.holder  ?? this.userName,
      expiry  : prefill?.expiry  ?? '',
      cvv     : '',
      address : prefill?.address ?? '',
    };
    this.cardErrors  = { number: '', holder: '', expiry: '', cvv: '', address: '' };
    this.cardTouched = { number: false, holder: false, expiry: false, cvv: false, address: false };
  }

  openAddCardForm() {
    this.editingCard  = null;
    this.resetCardForm();
    this.showCardForm = true;
  }

  openEditCardForm(card: any) {
    this.editingCard  = card;
    this.resetCardForm(card);
    this.showCardForm = true;
  }

  closeCardForm() {
    this.showCardForm = false;
    this.editingCard  = null;
  }

  // ── Validation ────────────────────────────────────────────────────────────────

  formatCardNumber(e: Event) {
    const input = e.target as HTMLInputElement;
    const v = input.value.replace(/\D/g, '').substring(0, 16);
    this.cardForm.number    = v.replace(/(.{4})/g, '$1 ').trim();
    this.cardTouched.number = true;
    this.validateCardNumber();
  }

  formatExpiry(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    this.cardForm.expiry    = v;
    this.cardTouched.expiry = true;
    this.validateExpiry();
  }

  formatCvv(e: Event) {
    const input = e.target as HTMLInputElement;
    this.cardForm.cvv    = input.value.replace(/\D/g, '').substring(0, 3);
    this.cardTouched.cvv = true;
    this.validateCvv();
  }

  validateCardNumber() {
    const raw = this.cardForm.number.replace(/\s/g, '');
    if (!raw)                 this.cardErrors.number = 'Card number is required';
    else if (raw.length < 16) this.cardErrors.number = 'Must be 16 digits';
    else                      this.cardErrors.number = '';
  }

  validateHolder() {
    this.cardTouched.holder = true;
    this.cardErrors.holder  = !this.cardForm.holder.trim() ? 'Name is required' : '';
  }

  validateExpiry() {
    const v = this.cardForm.expiry;
    if (!v)                         { this.cardErrors.expiry = 'Expiry is required'; return; }
    if (!/^\d{2}\/\d{2}$/.test(v)) { this.cardErrors.expiry = 'Format: MM/YY'; return; }
    const [mm, yy] = v.split('/').map(Number);
    if (mm < 1 || mm > 12)          { this.cardErrors.expiry = 'Invalid month'; return; }
    const now  = new Date();
    const curY = now.getFullYear() % 100;
    const curM = now.getMonth() + 1;
    if (yy < curY || (yy === curY && mm < curM)) { this.cardErrors.expiry = 'Card expired'; return; }
    this.cardErrors.expiry = '';
  }

  validateCvv() {
    this.cardTouched.cvv = true;
    if (!this.cardForm.cvv)                this.cardErrors.cvv = 'CVV is required';
    else if (this.cardForm.cvv.length < 3) this.cardErrors.cvv = 'Must be 3 digits';
    else                                   this.cardErrors.cvv = '';
  }

  validateAddress() {
    this.cardTouched.address = true;
    this.cardErrors.address  = !this.cardForm.address.trim() ? 'Address is required' : '';
  }

  get cardFormValid(): boolean {
    return !this.cardErrors.number  && !!this.cardForm.number
        && !this.cardErrors.holder  && !!this.cardForm.holder
        && !this.cardErrors.expiry  && !!this.cardForm.expiry
        && !this.cardErrors.cvv     && !!this.cardForm.cvv
        && !this.cardErrors.address && !!this.cardForm.address;
  }

  get cardBrand(): string {
    const n = this.cardForm.number.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5')) return 'mastercard';
    return '';
  }

  // ── Save card ─────────────────────────────────────────────────────────────────

  saveCard() {
    this.cardTouched = { number: true, holder: true, expiry: true, cvv: true, address: true };
    this.validateCardNumber();
    this.validateHolder();
    this.validateExpiry();
    this.validateCvv();
    this.validateAddress();
    if (!this.cardFormValid) return;

    this.isLoading = true;

    if (this.editingCard?.source === 'user') {
      // Update primary card via User API (save-card replaces)
      this.http.put(`${this.apiUser}/save-card`, {
        userId     : this.userId,
        cardNumber : this.cardForm.number,
        cardHolder : this.cardForm.holder,
        expiry     : this.cardForm.expiry,
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeCardForm();
          this.loadUser(this.userEmail);
          this.showSuccess('Card updated!');
        },
        error: () => { this.isLoading = false; this.showError('Failed to update card.'); },
      });
    } else {
      // Add new card via Payment API (amount=0 → just saves the card info)
      this.http.post(`${this.apiPayment}/pay`, null, {
        params: {
          userId         : this.userId.toString(),
          cardNumber     : this.cardForm.number,
          cardHolderName : this.cardForm.holder,
          expiryDate     : this.cardForm.expiry,
          cvv            : this.cardForm.cvv,
          exactAddress   : this.cardForm.address,
          amount         : '0',
        }
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeCardForm();
          this.loadUser(this.userEmail);
          this.showSuccess('Card saved!');
        },
        error: () => { this.isLoading = false; this.showError('Failed to save card.'); },
      });
    }
  }

  // ── Remove card ───────────────────────────────────────────────────────────────

removeCard(card: any) {
  if (!confirm('Remove this card?')) return;

  if (card.source === 'user') {
    // Primary card — User API-დან წაშლა
    this.http.delete(`${this.apiUser}/remove-card?userId=${this.userId}`).subscribe({
      next: () => {
        this.allCards = this.allCards.filter(c => c.id !== card.id);
        this.showSuccess('Card removed.');
      },
      error: () => this.showError('Failed to remove card.'),
    });
  } else {
    // Payment card — Payment API-დან წაშლა
    // card.id = 'pay-123' → payment id = 123
    const paymentId = parseInt(card.id.toString().replace('pay-', ''), 10);

    if (!paymentId || isNaN(paymentId)) {
      this.allCards = this.allCards.filter(c => c.id !== card.id);
      return;
    }

    this.http.delete(`${this.apiPayment}/${paymentId}`).subscribe({
      next: () => {
        this.allCards = this.allCards.filter(c => c.id !== card.id);
        this.showSuccess('Card removed.');
      },
      error: () => this.showError('Failed to remove card.'),
    });
  }
}

  // ── Payment history ───────────────────────────────────────────────────────────

  loadPayments() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiPayment}/user/${this.userId}`).subscribe({
      next: (res) => { this.payments = res ?? []; this.isLoading = false; },
      error: ()   => { this.payments = [];         this.isLoading = false; },
    });
  }

  deletePayment(id: number) {
    if (!confirm('Delete this payment record?')) return;
    this.http.delete(`${this.apiPayment}/${id}`).subscribe({
      next: () => {
        this.payments = this.payments.filter(p => p.id !== id);
        this.showSuccess('Payment record deleted.');
      },
      error: () => this.showError('Failed to delete payment.'),
    });
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────────

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab !== 'card')    { this.showCardForm = false; this.editingCard = null; }
    if (tab === 'history') this.loadPayments();
    if (tab === 'card')    this.loadUser(this.userEmail);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  showSuccess(msg: string) {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => (this.successMsg = ''), 4000);
  }

  showError(msg: string) {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => (this.errorMsg = ''), 4000);
  }

  logout()             { localStorage.clear(); this.router.navigate(['/auth']); }
  goBack()             { this.router.navigate(['/home']); }
  goToChangePassword() { this.router.navigate(['/change-password']); }
}