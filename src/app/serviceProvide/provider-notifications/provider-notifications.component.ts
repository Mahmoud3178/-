import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationStateService } from '../../services/notification-state.service';

@Component({
  selector: 'app-provider-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './provider-notifications.component.html',
  styleUrls: ['./provider-notifications.component.css']
})
export class ProviderNotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  userId = '';
  private subscription?: Subscription;

  constructor(
    private notificationsService: NotificationsService,
    private notificationState: NotificationStateService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user?.id;

    if (this.userId) {
      // ✅ نبدأ الـ polling
      this.notificationState.fetchNotifications(this.userId);

      // ✅ نتابع التغييرات في الإشعارات
      this.subscription = this.notificationState.notifications$.subscribe((data) => {
        this.notifications = [...data].reverse();
      });
    }
  }

  deleteNotification(id: number) {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        // ✅ نحذف محليًا من state
        this.notificationState.removeNotificationLocally(id);
      },
      error: (err) => {
        console.error('❌ Error deleting notification', err);
      }
    });
  }

  trackById(index: number, item: any): any {
    return item.id;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
