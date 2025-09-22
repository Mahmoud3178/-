import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
}

interface UserData {
  email: string;
  role: 'client' | 'provider' | 'User'; // دعم role اللي جاي من السيرفر
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  user$ = new BehaviorSubject<UserData | null>(null);

  constructor() {}

  async init(): Promise<void> {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('token');

    if (token) {
      const userData = this.decodeToken(token);
      if (userData) {
        this.isLoggedIn$.next(true);
        this.user$.next(userData);
      } else {
        this.clearStorage();
      }
    } else {
      this.clearStorage();
    }
  }

  login(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
    const userData = this.decodeToken(token);
    if (userData) {
      this.isLoggedIn$.next(true);
      this.user$.next(userData);
    }
  }

  logout(): void {
    this.clearStorage();
    this.isLoggedIn$.next(false);
    this.user$.next(null);
  }

  getUser(): UserData | null {
    if (!this.isBrowser) return null;
    const token = localStorage.getItem('token');
    return token ? this.decodeToken(token) : null;
  }

  getUserRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  getUserEmail(): string | null {
    return this.getUser()?.email ?? null;
  }

  getUserName(): string | null {
    return this.getUser()?.name ?? null;
  }

  isAuthenticated(): boolean {
    return this.isBrowser && !!localStorage.getItem('token');
  }

  // ✅ فكّ التوكين وبناء بيانات المستخدم
  private decodeToken(token: string): UserData | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || '',
        name: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as any
      };
    } catch (error) {
      console.error('❌ فشل فك التوكين:', error);
      return null;
    }
  }

  private clearStorage() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
  }
}
