import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

interface UserData {
  email: string;
  role: 'client' | 'provider';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // الحالة اللحظية لتسجيل الدخول
  isLoggedIn$ = new BehaviorSubject<boolean>(false);

  // بيانات المستخدم
  user$ = new BehaviorSubject<UserData | null>(null);

  constructor() {}

  /**
   * تهيئة الخدمة عند بدء التطبيق (تُستدعى من main.ts)
   */
  init(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isBrowser) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
          this.isLoggedIn$.next(true);
          this.user$.next(JSON.parse(user));
        } else {
          this.isLoggedIn$.next(false);
          this.user$.next(null);
        }
      }
      resolve();
    });
  }

  /**
   * تسجيل الدخول وتحديث الحالة
   */
  login(token: string, userData: UserData): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }

    this.isLoggedIn$.next(true);
    this.user$.next(userData);
  }

  /**
   * تسجيل الخروج وتفريغ البيانات
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    this.isLoggedIn$.next(false);
    this.user$.next(null);
  }

  /**
   * جلب المستخدم الحالي (غير لحظي)
   */
  getUser(): UserData | null {
    if (!this.isBrowser) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserRole(): 'client' | 'provider' | null {
    const user = this.getUser();
    return user?.role ?? null;
  }

  getUserEmail(): string | null {
    const user = this.getUser();
    return user?.email ?? null;
  }

  isAuthenticated(): boolean {
    return this.isBrowser && !!localStorage.getItem('token');
  }
}
