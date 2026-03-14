import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasketService } from '../../service/basket-service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
})
export class Navbar implements OnInit, OnDestroy {
  isLoggedIn = false;
  basketCount: number = 0;
  menuOpen = false;
  currentLang = 'en';

  languages = [
    { code: 'ka', flag: '🇬🇪', label: 'ქართ' },
    { code: 'en', flag: '🇬🇧', label: 'ENG' },
    { code: 'ru', flag: '🇷🇺', label: 'РУС' },
    { code: 'tr', flag: '🇹🇷', label: 'TÜR' },
    { code: 'zh', flag: '🇨🇳', label: '中文' },
    { code: 'de', flag: '🇩🇪', label: 'DEU' },
  ];

  private routerSub!: Subscription;

  private storageListener = () => {
    this.checkLogin();
    this.loadBasketCount();
    this.cdr.detectChanges();
  };

  constructor(
    private router: Router,
    private basketService: BasketService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    this.currentLang = localStorage.getItem('lang') || 'en';
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  // დანარჩენი ყველაფერი იგივე დარჩეს...
  ngOnInit() {
    this.checkLogin();
    this.loadBasketCount();
    window.addEventListener('storage', this.storageListener);

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLogin();
        this.loadBasketCount();
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageListener);
    this.routerSub?.unsubscribe();
  }

  checkLogin() { this.isLoggedIn = !!localStorage.getItem('userId'); }

  loadBasketCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) { this.basketCount = 0; return; }
    this.basketService.getBaskets(+userId).subscribe({
      next: (res: any[]) => {
        this.basketCount = res.reduce(
          (sum, basket) => sum + basket.items.reduce((s: number, item: any) => s + item.quantity, 0), 0
        );
      },
      error: () => (this.basketCount = 0),
    });
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn = false;
    this.basketCount = 0;
    this.menuOpen = false;
    this.cdr.detectChanges();
    this.router.navigate(['/auth']);
  }
langMenuOpen = false;

getLangLabel(code: string): string {
  return this.languages.find(l => l.code === code)?.flag || '🌐';
}
  navigate(path: string) { this.router.navigate([path]); }
  goToAuth() { this.router.navigate(['/auth']); }
  goToHome() { this.router.navigate(['/home']); }
  goToStory() { this.router.navigate(['/about']); }
  goBooksStore() { this.router.navigate(['/bookstore']); }

  openMenu() { this.menuOpen = true; }
  closeMenu() { this.menuOpen = false; }

  goToEvents() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        const el = document.getElementById('events-section');
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          const start = window.scrollY;
          const distance = top - start;
          const duration = 1;
          let startTime: number | null = null;
          function step(timestamp: number) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            window.scrollTo(0, start + distance * progress);
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }
      }, 100);
    });
  }
}