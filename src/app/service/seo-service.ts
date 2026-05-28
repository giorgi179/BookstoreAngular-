import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class SeoService {

  private baseUrl = 'https://yoursite.com';

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ========== HOME ==========
  setHomePage() {
    this.setTitle('GIORGI. Publishers | Bestselling Books Online');
    this.setMeta(
      'Discover bestselling books at BINK Publishers. Browse our curated collection of recommended books and find your next great read.',
      'books, bestsellers, recommended books, online bookstore, BINK publishers'
    );
    this.setOG(
      'GIORGI. Publishers | Bestselling Books Online',
      'Discover bestselling books at BINK Publishers.',
      `${this.baseUrl}/home`,
      'website'
    );
    this.setTwitter(
      'GIORGI. Publishers | Bestselling Books Online',
      'Discover bestselling books at BINK Publishers.'
    );
    this.setCanonical(`${this.baseUrl}/home`);
    this.setRobots('index, follow');
    this.setBookstoreStructuredData();
  }

  // ========== BOOKSTORE ==========
  setBookstorePage() {
    this.setTitle('Bookstore | Browse All Books - GIORGI. Publishers');
    this.setMeta(
      'Browse our full collection of books at BINK Publishers. Find bestsellers, new arrivals and recommended reads.',
      'bookstore, browse books, buy books online, BINK publishers'
    );
    this.setOG(
      'Bookstore | Browse All Books - GIORGI. Publishers',
      'Browse our full collection of books at BINK Publishers.',
      `${this.baseUrl}/bookstore`,
      'website'
    );
    this.setTwitter(
      'Bookstore | Browse All Books - GIORGI. Publishers',
      'Browse our full collection of books at BINK Publishers.'
    );
    this.setCanonical(`${this.baseUrl}/bookstore`);
    this.setRobots('index, follow');
  }

  // ========== ABOUT ==========
  setAboutPage() {
    this.setTitle('Our Story | GIORGI. Publishers');
    this.setMeta(
      'Learn about BINK Publishers and our passion for connecting readers with great books. Discover our story.',
      'about BINK publishers, our story, book publisher'
    );
    this.setOG(
      'Our Story | GIORGI. Publishers',
      'Learn about BINK Publishers and our passion for connecting readers with great books.',
      `${this.baseUrl}/about`,
      'website'
    );
    this.setTwitter(
      'Our Story | GIORGI. Publishers',
      'Learn about BINK Publishers and our passion for connecting readers with great books.'
    );
    this.setCanonical(`${this.baseUrl}/about`);
    this.setRobots('index, follow');
  }

  // ========== BASKET ==========
  setBasketPage() {
    this.setTitle('Your Basket | GIORGI. Publishers');
    this.setMeta('View and manage your selected books in your basket.', '');
    this.setRobots('noindex, nofollow');
    this.setCanonical(`${this.baseUrl}/basket`);
  }

  // ========== AUTH ==========
  setAuthPage() {
    this.setTitle('Sign In or Register | GIORGI. Publishers');
    this.setMeta('Sign in or create your BINK Publishers account to start shopping.', '');
    this.setRobots('noindex, nofollow');
    this.setCanonical(`${this.baseUrl}/auth`);
  }

  // ========== PROFILE ==========
  setProfilePage() {
    this.setTitle('My Profile | GIORGI. Publishers');
    this.setMeta('Manage your BINK Publishers profile and order history.', '');
    this.setRobots('noindex, nofollow');
    this.setCanonical(`${this.baseUrl}/profile`);
  }

  // ========== CHANGE PASSWORD ==========
  setChangePasswordPage() {
    this.setTitle('Change Password | GIORGI. Publishers');
    this.setMeta('Update your BINK Publishers account password securely.', '');
    this.setRobots('noindex, nofollow');
    this.setCanonical(`${this.baseUrl}/change-password`);
  }

  // ========== BOOK OF THE MONTH (Structured Data) ==========
  setBookOfMonth(book: any) {
    if (!book) return;
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      author: {
        '@type': 'Person',
        name: book.bookDetails?.author || book.author || ''
      },
      publisher: {
        '@type': 'Organization',
        name: book.bookDetails?.publisher || 'GIORGI. Publishers'
      },
      isbn: book.isbn || '',
      numberOfPages: book.bookDetails?.pageCount || '',
      inLanguage: book.bookDetails?.language || 'en',
      datePublished: book.bookDetails?.publishedDate || '',
      image: book.bookUrl || '',
      offers: {
        '@type': 'Offer',
        price: book.price,
        priceCurrency: 'USD',
        availability: book.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'GIORGI. Publishers'
        }
      }
    });
  }

  // ========== PRIVATE HELPERS ==========
  private setTitle(title: string) {
    this.title.setTitle(title);
  }

  private setMeta(description: string, keywords: string) {
    this.meta.updateTag({ name: 'description', content: description });
    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    }
  }

  private setOG(title: string, description: string, url: string, type: string) {
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: 'GIORGI. Publishers' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });
  }

  private setTwitter(title: string, description: string) {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  private setRobots(content: string) {
    this.meta.updateTag({ name: 'robots', content });
  }

  private setCanonical(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) existing.remove();
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  private setStructuredData(data: object) {
    if (!isPlatformBrowser(this.platformId)) return;
    const existing = document.getElementById('structured-data');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  private setBookstoreStructuredData() {
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'BookStore',
      name: 'GIORGI. Publishers',
      url: this.baseUrl,
      description: 'Online bookstore with curated bestsellers and recommended reads.'
    });
  }
}