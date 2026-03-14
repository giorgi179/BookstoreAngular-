import { Component, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('StepisSualeduriProeqtiAngular');

  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang') || 'en';
    translate.setDefaultLang('en');
    translate.use(savedLang);
  }
}