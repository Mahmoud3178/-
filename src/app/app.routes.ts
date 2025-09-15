import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { RegisterVerifyComponent } from './auth/register-verify/register-verify.component';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ForgotVerifyComponent } from './auth/forgot-verify/forgot-verify.component';

import { BookComponent } from './clint/book/book.component';
import { SearchComponent } from './clint/search/search.component';
import { PaymentCompleteComponent } from './clint/payment-complete/payment-complete.component';
import { OrderComponent } from './clint/order/order.component';
import { NotificationsComponent } from './clint/notifications/notifications.component';
import { ProfileComponent } from './clint/profile/profile.component';

import { HeroComponent } from './pages/hero/hero.component';
import { OffersComponent } from './pages/offers/offers.component';
import { FeaturesComponent } from './pages/features/features.component';
import { ServicesComponent } from './pages/services/services.component';
import { HowToOrderComponent } from './pages/how-to-order/how-to-order.component';
import { TestimonialsComponent } from './pages/testimonials/testimonials.component';
import { HomeComponent } from './pages/home/home.component';
import { AsksComponent } from './pages/asks/asks.component';
import { TermsComponent } from './pages/terms/terms.component';
import { CallUsComponent } from './pages/call-us/call-us.component';
import { BookAppointmentComponent } from './clint/book-appointment/book-appointment.component';
import { ServiceProvideComponent } from './serviceProvide/service-provide/service-provide.component';
import { ProvideStatusComponent } from './serviceProvide/provide-status/provide-status.component';
import { ProviderHomeComponent } from './serviceProvide/provider-home/provider-home.component';
import { WalletComponent } from './serviceProvide/wallet/wallet.component';
import { AppointmentsComponent } from './serviceProvide/appointments/appointments.component';
import { ChatsComponent } from './serviceProvide/chats/chats.component';
import { RatingsComponent } from './serviceProvide/ratings/ratings.component';
import { PreviousWorkComponent } from './serviceProvide/previous-work/previous-work.component';
import { OverviewComponent } from './serviceProvide/overview/overview.component';
import { EditProfileComponent } from './serviceProvide/edit-profile/edit-profile.component';
import { ChangePasswordComponent } from './serviceProvide/change-password/change-password.component';
import { ProviderNotificationsComponent } from './serviceProvide/provider-notifications/provider-notifications.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ChatUserComponent } from './clint/chat-user/chat-user.component';
import { ChatTechnicalComponent } from './serviceProvide/chat-technical/chat-technical.component';


export const routes: Routes = [
  // ✅ الصفحة الرئيسية (Landing Page)
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent)
  },

  // ✅ أقسام الصفحة
  {
    path: 'hero',
    loadComponent: () =>
      import('./pages/hero/hero.component').then(m => m.HeroComponent)
  },
  {
    path: 'offers',
    loadComponent: () =>
      import('./pages/offers/offers.component').then(m => m.OffersComponent)
  },
  {
    path: 'features',
    loadComponent: () =>
      import('./pages/features/features.component').then(m => m.FeaturesComponent)
  },
  {
    path: 'srvices',
    loadComponent: () =>
      import('./pages/services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'how',
    loadComponent: () =>
      import('./pages/how-to-order/how-to-order.component').then(m => m.HowToOrderComponent)
  },
  {
    path: 'testimonials',
    loadComponent: () =>
      import('./pages/testimonials/testimonials.component').then(m => m.TestimonialsComponent)
  },
  {
    path: 'call-us',
    loadComponent: () =>
      import('./pages/call-us/call-us.component').then(m => m.CallUsComponent)
  },

  // ✅ صفحات auth
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'register/verify',
    loadComponent: () =>
      import('./auth/register-verify/register-verify.component').then(m => m.RegisterVerifyComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'forgot-password/verify',
    loadComponent: () =>
      import('./auth/forgot-verify/forgot-verify.component').then(m => m.ForgotVerifyComponent)
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./serviceProvide/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // ✅ صفحات العميل
  {
    path: 'book',
    loadComponent: () =>
      import('./clint/book/book.component').then(m => m.BookComponent)
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./clint/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'c-p',
    loadComponent: () =>
      import('./clint/payment-complete/payment-complete.component').then(m => m.PaymentCompleteComponent)
  },
  {
    path: 'order',
    loadComponent: () =>
      import('./clint/order/order.component').then(m => m.OrderComponent)
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./clint/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./clint/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'book-appointment',
    loadComponent: () =>
      import('./clint/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
  },
  {
    path: 'chat-user',
    loadComponent: () =>
      import('./clint/chat-user/chat-user.component').then(m => m.ChatUserComponent)
  },

  // ✅ صفحات مقدم الخدمة
  {
    path: 'service-provider',
    loadComponent: () =>
      import('./serviceProvide/service-provide/service-provide.component').then(m => m.ServiceProvideComponent)
  },
  {
    path: 'status-provider',
    loadComponent: () =>
      import('./serviceProvide/provide-status/provide-status.component').then(m => m.ProvideStatusComponent)
  },
  {
    path: 'provider-home',
    loadComponent: () =>
      import('./serviceProvide/provider-home/provider-home.component').then(m => m.ProviderHomeComponent)
  },
  {
    path: 'wallet',
    loadComponent: () =>
      import('./serviceProvide/wallet/wallet.component').then(m => m.WalletComponent)
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./serviceProvide/appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  {
    path: 'chats',
    loadComponent: () =>
      import('./serviceProvide/chats/chats.component').then(m => m.ChatsComponent)
  },
  {
    path: 'ratings',
    loadComponent: () =>
      import('./serviceProvide/ratings/ratings.component').then(m => m.RatingsComponent)
  },
  {
    path: 'previos-work',
    loadComponent: () =>
      import('./serviceProvide/previous-work/previous-work.component').then(m => m.PreviousWorkComponent)
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./serviceProvide/overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'edit-profile',
    loadComponent: () =>
      import('./serviceProvide/edit-profile/edit-profile.component').then(m => m.EditProfileComponent)
  },
  {
    path: 'service-provider-change-pass',
    loadComponent: () =>
      import('./serviceProvide/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },
  {
    path: 'provider-notifications',
    loadComponent: () =>
      import('./serviceProvide/provider-notifications/provider-notifications.component').then(m => m.ProviderNotificationsComponent)
  },
  {
    path: 'chat-technical',
    loadComponent: () =>
      import('./serviceProvide/chat-technical/chat-technical.component').then(m => m.ChatTechnicalComponent)
  },

  // ✅ Footer routes
  {
    path: 'asks',
    loadComponent: () =>
      import('./pages/asks/asks.component').then(m => m.AsksComponent)
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./pages/terms/terms.component').then(m => m.TermsComponent)
  },

  // ✅ fallback route
  { path: '**', redirectTo: '' }
];
