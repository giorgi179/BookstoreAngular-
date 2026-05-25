import { Component, signal, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('StepisSualeduriProeqtiAngular');

  showNav = true;
  private hideNavRoutes = ['/admin-panel', '/admin-login'];

  constructor(
    private translate: TranslateService,
    private router: Router
  ) {
    const savedLang = localStorage.getItem('lang') || 'en';
    translate.setDefaultLang('en');
    translate.use(savedLang);
  }

  ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.showNav = !this.hideNavRoutes.some(route =>
          e.urlAfterRedirects.startsWith(route)
        );
      });
  }
}