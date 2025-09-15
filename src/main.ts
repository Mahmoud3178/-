// ✅ main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/services/auth.service';

bootstrapApplication(AppComponent, appConfig).then(async (appRef) => {
  const authService = appRef.injector.get(AuthService);
  await authService.init(); // ✅ ننتظر قراءة بيانات المستخدم أولاً
});

