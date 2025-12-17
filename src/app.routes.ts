
import { Routes } from '@angular/router';
import { RoleGuard } from './guards/role.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { OperatorLayoutComponent } from './layouts/operator-layout/operator-layout.component';
import { UserHomeComponent } from './components/user/home/home.component';
import { UserPassesComponent } from './components/user/passes/passes.component';
import { UserProfileComponent } from './components/user/profile/profile.component';
import { OperatorDashboardComponent } from './components/operator/dashboard/dashboard.component';
import { OperatorLiveViewComponent } from './components/operator/live-view/live-view.component';
import { OperatorStatsComponent } from './components/operator/stats/stats.component';
import { OperatorProfileComponent } from './components/operator/profile/profile.component';
import { UserBookingComponent } from './components/user/booking/booking.component';
import { UserPaymentComponent } from './components/user/payment/payment.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent }
    ]
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    children: [
      { path: 'home', component: UserHomeComponent },
      { path: 'passes', component: UserPassesComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'booking/:lotId', component: UserBookingComponent },
      { path: 'payment/:bookingId', component: UserPaymentComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'operator',
    component: OperatorLayoutComponent,
    children: [
      { path: 'dashboard', component: OperatorDashboardComponent },
      { path: 'live-view', component: OperatorLiveViewComponent },
      { path: 'stats', component: OperatorStatsComponent },
      { path: 'profile', component: OperatorProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'superadmin',
    component: OperatorLayoutComponent, // Reusing Layout for now
    canActivate: [RoleGuard],
    data: { roles: ['superadmin'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/superadmin/dashboard/dashboard.component').then(m => m.SuperAdminDashboardComponent) }
    ]
  },
  {
    path: 'admin',
    component: OperatorLayoutComponent, // Reusing Layout for now
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superadmin'] },
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
