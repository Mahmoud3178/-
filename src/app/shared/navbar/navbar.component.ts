import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable, map } from 'rxjs';
import { NotificationStateService } from '../../services/notification-state.service';

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

  ready = false;
  isNavbarCollapsed = true;
  showMobileMenu = false;

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
        const name = user?.email?.split('@')[0] || 'العميل';
        const role: 'client' | 'provider' | null = user?.role || null;
        const image: string = user?.image || '';
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
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  scrollTo(sectionId: string): void {
    this.scrollToSection.emit(sectionId);
  }
}
