import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable, map, Subscription } from 'rxjs';
import { NotificationStateService } from '../../services/notification-state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() scrollToSection = new EventEmitter<string>();

  isLoggedIn$: Observable<boolean>;
  userData$: Observable<{ name: string; role: 'client' | 'provider' | null; image: string }>;

  hasNewNotifications = false;
  notificationCount: number = 0;

  ready = false;
  isNavbarCollapsed = true;
  showMobileMenu = false;

  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationState: NotificationStateService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    this.userData$ = this.isLoggedIn$.pipe(
      map(loggedIn => {
        if (!loggedIn) {
          return { name: 'العميل', role: null, image: '' };
        }
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const name = user?.name || 'العميل';
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
    // ✅ الجرس (مقروء/غير مقروء)
    this.subscription = this.notificationState.hasNewNotifications$.subscribe(value => {
      this.hasNewNotifications = value;
    });

    // ✅ العداد يتحدث من الاستيت مش API
    this.subscription.add(
      this.notificationState.notifications$.subscribe(list => {
        this.notificationCount = list.filter(n => !n.seen).length;
      })
    );

    // ✅ أول مرة: شغل polling عشان يملأ الستيت
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
    if (userId) {
      this.notificationState.fetchNotifications(userId);
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  scrollTo(sectionId: string): void {
    this.scrollToSection.emit(sectionId);
  }
}
