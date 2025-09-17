import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable, map } from 'rxjs';
import { NotificationStateService } from '../../services/notification-state.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Output() scrollToSection = new EventEmitter<string>();

  isLoggedIn$: Observable<boolean>;
  userData$: Observable<{ name: string; role: 'client' | 'provider' | null; image: string }>;

  hasNewNotifications = false;
notificationCount: number = 0;

  ready = false;
  isNavbarCollapsed = true;
  showMobileMenu = false;

  constructor(
    private authService: AuthService,
    private notificationState: NotificationStateService,
      private http: HttpClient

  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    this.userData$ = this.isLoggedIn$.pipe(
      map(loggedIn => {
        if (!loggedIn) {
          return { name: 'العميل', role: null, image: '' };
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const name = user?.email?.split('@')[0] || 'العميل';
        const role: 'client' | 'provider' | null = user?.role || null;
let image = 'assets/images/default-avatar.png';

if (user?.image) {
  if (user.image.startsWith('data:image')) {
    image = user.image;
  } else if (user.image.startsWith('/Uploads')) {
    image = user.image;
  } else if (user.image.startsWith('http')) {
    image = user.image;
  }
}
        return { name, role, image };
      })
    );

    this.isLoggedIn$.subscribe(() => {
      this.ready = true;
    });
  }

 ngOnInit() {
  this.notificationState.hasNewNotifications$.subscribe(value => {
    this.hasNewNotifications = value;
  });

  this.fetchNotificationCount(); // ✅ استدعاء جديد
}
fetchNotificationCount() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id;

  if (!userId) return;

this.http.get<number>(`/api/notifications/GetNotificationCount?id=${userId}`)
    .subscribe({
      next: (count) => {
        this.notificationCount = count;
      },
      error: (err) => {
        console.error('❌ فشل في جلب عدد الإشعارات:', err);
        this.notificationCount = 0;
      }
    });
}


  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  scrollTo(sectionId: string): void {
    this.scrollToSection.emit(sectionId);
  }
}
