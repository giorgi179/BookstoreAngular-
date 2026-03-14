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

const routes: Routes = [
  { path: 'home',       component: Home },
  { path: 'basket',     component: Basket },
  { path: 'about',      component: About },
  { path: 'bookstore',  component: Bookstore },
  { path: 'cardSystem', component: CardSystem },
  { path: 'contact',    component: Contact },
  { path: 'admin-login', component: AdminLogin },
  {
    path        : 'admin-panel',
    component   : AdminPanel,
    canActivate : [AuthGuard],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./component/auth/auth').then(m => m.Auth),
  },
  {
    path: 'profile',
    loadComponent: () => import('./component/profile/profile').then(m => m.Profile),
  },
  {
    path: 'change-password',
    loadComponent: () => import('./component/change-password/change-password').then(m => m.ChangePassword),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}