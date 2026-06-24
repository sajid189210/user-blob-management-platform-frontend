import { Routes } from '@angular/router';
import { Auth } from './module/components/auth/auth';
import { Home } from './module/components/home/home';
import { PostDetail } from './module/components/post-detail/post-detail';
import { MyPosts } from './module/components/my-posts/my-posts';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: 'login', component: Auth, data: { mode: 'login' }, canActivate: [guestGuard] },
  { path: 'signup', component: Auth, data: { mode: 'signup' }, canActivate: [guestGuard] },
  
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'my-posts', component: MyPosts, canActivate: [authGuard] },
  { path: 'favorites', component: Home, canActivate: [authGuard] },
  { path: 'post/:id', component: PostDetail, canActivate: [authGuard] },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
