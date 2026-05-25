import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../service/home-service';
import { BasketService } from '../../service/basket-service';
import { SeoService } from '../../service/seo-service';
import { TranslateService } from '@ngx-translate/core';
import { TranslateApiService } from '../../service/translate-api-service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {

  books: any[] = [];
  originalBooks: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  showAuthModal: boolean = false;
  selectedBook: any = null;

  constructor(
    private homeService: HomeService,
    private basketService: BasketService,
    private router: Router,
    private seo: SeoService,
    private translate: TranslateService,
    private translateApi: TranslateApiService
  ) {}

  ngOnInit() {
    this.seo.setHomePage();
    this.loadBooks();

    this.translate.onLangChange.subscribe(() => {
      if (this.originalBooks.length > 0) {
        this.applyTranslation();
      }
    });
  }

  loadBooks() {
    this.homeService.getBooks().subscribe((res: any) => {
      this.originalBooks = res;
      this.books = res;
      this.applyTranslation();
      if (this.books.length > 0) {
        this.seo.setBookOfMonth(this.books[0]);
      }
    });
  }

  applyTranslation() {
    const lang = this.translate.currentLang || 'en';
    if (lang === 'en') {
      this.books = [...this.originalBooks];
      return;
    }

    const requests = this.originalBooks.map(book => {
      const title$ = this.translateApi.translate(book.title || '', lang);
      const author$ = this.translateApi.translate(book.bookDetails?.author || '', lang);
      const description$ = this.translateApi.translate(book.bookDetails?.description || '', lang);

      return forkJoin([title$, author$, description$]).pipe(
        map(([title, author, description]) => ({
          ...book,
          title,
          bookDetails: {
            ...book.bookDetails,
            author,
            description
          }
        }))
      );
    });

    forkJoin(requests).subscribe(translatedBooks => {
      this.books = translatedBooks;
    });
  }

  openQuickView(book: any) { this.selectedBook = book; }
  closeQuickView() { this.selectedBook = null; }

  addToCart(book: any) {
    // ── Stock check ──────────────────────────────────────
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
      error: (err) => console.log('Basket error:', err)
    });
  }

  closeModal() { this.showAuthModal = false; }
  goToLogin() { this.showAuthModal = false; this.router.navigate(['/auth']); }
  goToRegister() { this.showAuthModal = false; this.router.navigate(['/auth'], { queryParams: { mode: 'register' } }); }
  goToStory() { this.router.navigate(['/about']); }
}