import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './component/home/home';
import { Basket } from './component/basket/basket';
import { About } from './component/about/about';
import { Bookstore } from './component/bookstore/bookstore';
import { CardSystem } from './component/card-system/card-system';
import { Contact } from './component/contact/contact';
import { AdminLogin } from './component/admin-login/admin-login';
import { AdminPanel } from './component/admin-panel/admin-panel';
import { AuthGuard } from './guards/auth-guard';
import { UserAuthGuard } from './guards/user-auth-guard-guard';
import { NoAuthGuard } from './guards/no-auth-guard-guard';
import { AdminNoAuthGuard } from './guards/admin-no-auth-guard-guard';

const routes: Routes = [
  { path: 'home',      component: Home },
  { path: 'about',     component: About },
  { path: 'bookstore', component: Bookstore },
  { path: 'contact',   component: Contact },

  // ── User-protected routes (userId localStorage-ში უნდა იყოს) ──
  {
    path        : 'basket',
    component   : Basket,
    canActivate : [UserAuthGuard],
  },
  {
    path        : 'cardSystem',
    component   : CardSystem,
    canActivate : [UserAuthGuard],
  },

  // ── Auth page (logged-in user-ი /profile-ზე გადადის) ──
  {
    path         : 'auth',
    canActivate  : [NoAuthGuard],
    loadComponent: () => import('./component/auth/auth').then(m => m.Auth),
  },

  // ── User lazy-loaded protected routes ──
  {
    path         : 'profile',
    canActivate  : [UserAuthGuard],
    loadComponent: () => import('./component/profile/profile').then(m => m.Profile),
  },
  {
    path         : 'change-password',
    canActivate  : [UserAuthGuard],
    loadComponent: () => import('./component/change-password/change-password').then(m => m.ChangePassword),
  },

  // ── Admin routes ──
  {
    path        : 'admin-login',
    component   : AdminLogin,
    canActivate : [AdminNoAuthGuard],   // logged-in admin → /admin-panel
  },
  {
    path        : 'admin-panel',
    component   : AdminPanel,
    canActivate : [AuthGuard],          // არა-admin → /admin-login
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}