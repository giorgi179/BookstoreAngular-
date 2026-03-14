import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { Navbar } from './component/navbar/navbar';
import { Home } from './component/home/home';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Footer } from './component/footer/footer';
import { Basket } from './component/basket/basket';
import { About } from './component/about/about';
import { Bookstore } from './component/bookstore/bookstore';
import { Profile } from './component/profile/profile';
import { ChangePassword } from './component/change-password/change-password';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CardSystem } from './component/card-system/card-system';
import { Contact } from './component/contact/contact';
import { AdminLogin } from './component/admin-login/admin-login';
import { AdminPanel } from './component/admin-panel/admin-panel';

// ── Interceptor ──────────────────────────────
import { AuthInterceptor } from './interceptors/auth-interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    App,
    Home,
    Footer,
    Basket,
    About,
    CardSystem,
    Contact,
    AdminLogin,
    AdminPanel,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    Navbar,
    Bookstore,
    Profile,
    ChangePassword,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide    : TranslateLoader,
        useFactory : HttpLoaderFactory,
        deps       : [HttpClient],
      },
    }),
    TranslateModule,
  ],
  providers: [
    // ── ეს დაამატე ──────────────────────────
    {
      provide  : HTTP_INTERCEPTORS,
      useClass : AuthInterceptor,
      multi    : true,
    },
  ],
  bootstrap: [App],
})
export class AppModule {}