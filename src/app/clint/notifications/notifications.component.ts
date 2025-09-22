import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationStateService } from '../../services/notification-state.service';
import { NotificationsService } from '../../services/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: { id: number; title: string; time: string; message: string }[] = [];
  private subscription?: Subscription;

  constructor(
    private notificationState: NotificationStateService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (userId) {
      this.notificationState.fetchNotifications(userId);

      this.subscription = this.notificationState.notifications$.subscribe((res) => {
        this.notifications = res
          .map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: this.getRelativeTime(n.date)
          }))
          .reverse();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  }

  deleteNotification(notificationId: number) {
    this.notificationsService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notificationState.removeNotificationLocally(notificationId); // ✅ تحديث فوري للـ UI
      },
      error: (err) => console.error('❌ فشل في حذف الإشعار:', err)
    });
  }
}
