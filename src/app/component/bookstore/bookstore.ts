import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HomeService } from '../../service/home-service';
import { BasketService } from '../../service/basket-service';
import { SeoService } from '../../service/seo-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-bookstore',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './bookstore.html',
  styleUrls: ['./bookstore.scss'],
})
export class Bookstore implements OnInit {
  allBooks: any[] = [];
  filteredBooks: any[] = [];
  showAuthModal = false;
  successMessage = '';
  errorMessage = '';

  minPrice = 0;
  maxPrice = 200;
  selectedMinPrice = 0;
  selectedMaxPrice = 200;

  searchQuery = '';
  priceOpen = true;
  sidebarOpen = false;

  readonly PAGE_SIZE = 8;
  currentPage = 0;

  get pagedBooks(): any[] {
    const start = this.currentPage * this.PAGE_SIZE;
    return this.filteredBooks.slice(start, start + this.PAGE_SIZE);
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBooks.length / this.PAGE_SIZE));
  }
  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }
  goToPage(i: number): void { this.currentPage = i; }

  constructor(
    private bookService: HomeService,
    private basketService: BasketService,
    private router: Router,
    private seo: SeoService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.seo.setBookstorePage();
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getBooks().subscribe({
      next: (res: any[]) => {
        this.allBooks = res;
        const prices = res.map((b: any) => b.price || 0);
        this.minPrice = Math.floor(Math.min(...prices));
        this.maxPrice = Math.ceil(Math.max(...prices));
        this.selectedMinPrice = this.minPrice;
        this.selectedMaxPrice = this.maxPrice;
        this.applyFilters();
      },
      error: () => console.error('Failed to load books'),
    });
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredBooks = this.allBooks.filter((b: any) => {
      const inPrice = b.price >= this.selectedMinPrice && b.price <= this.selectedMaxPrice;
      const inSearch = !q
        || b.title?.toLowerCase().includes(q)
        || b.bookDetails?.author?.toLowerCase().includes(q)
        || b.bookDetails?.description?.toLowerCase().includes(q)
        || b.bookDetails?.publisher?.toLowerCase().includes(q);
      return inPrice && inSearch;
    });
    this.currentPage = 0;
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }

  onPriceChange() {
    if (this.selectedMinPrice > this.selectedMaxPrice)
      this.selectedMaxPrice = this.selectedMinPrice;
    this.applyFilters();
  }

  removePriceFilter() {
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.selectedMinPrice = this.minPrice;
    this.selectedMaxPrice = this.maxPrice;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== ''
      || this.selectedMinPrice !== this.minPrice
      || this.selectedMaxPrice !== this.maxPrice;
  }

  get hasPriceFilter(): boolean {
    return this.selectedMinPrice !== this.minPrice || this.selectedMaxPrice !== this.maxPrice;
  }

  addToCart(book: any) {
    // ── Out of stock guard ───────────────────────────────
    if (!book.stock || book.stock <= 0) {
      this.translate.get('OUT_OF_STOCK').subscribe(msg => {
        this.errorMessage = `"${book.title}" — ${msg}`;
      });
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) { this.showAuthModal = true; return; }

    this.basketService.addToBasket(+userId, book.id, 1).subscribe({
      next: () => {
        this.translate.get('ADDED_TO_BASKET').subscribe(msg => {
          this.successMessage = `"${book.title}" ${msg}`;
        });
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => console.error(err),
    });
  }

  selectedBook: any = null;
  openQuickView(book: any) { this.selectedBook = book; }
  closeQuickView() { this.selectedBook = null; }
  closeModal() { this.showAuthModal = false; }
  goToLogin() { this.closeModal(); this.router.navigate(['/auth']); }
  goToRegister() { this.closeModal(); this.router.navigate(['/auth'], { queryParams: { mode: 'register' } }); }
}