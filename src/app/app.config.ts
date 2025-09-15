import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors,withFetch } from '@angular/common/http'; // ✅ استورد withInterceptors
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor.ts.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),

provideHttpClient(
  withFetch(), // ✅ أضف دي
  withInterceptors([
    authInterceptor
  ])
)
  ]
};
