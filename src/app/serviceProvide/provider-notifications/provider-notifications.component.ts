import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationStateService } from '../../services/notification-state.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-provider-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './provider-notifications.component.html',
  styleUrls: ['./provider-notifications.component.css']
})
export class ProviderNotificationsComponent implements OnInit {
  notifications: any[] = [];
  userId = '';

  constructor(
    private notificationsService: NotificationsService,
    private notificationState: NotificationStateService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user?.id;

    if (this.userId) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notificationsService.getNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data.reverse();

        // ✅ نحدث حالة الجرس
        const hasUnseen = this.notifications.some(n => !n.seen);
        this.notificationState.setHasNewNotifications(hasUnseen);
      },
      error: (err) => {
        console.error('❌ Error loading notifications', err);
      }
    });
  }

  deleteNotification(id: number) {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        // نحذف محليًا فورًا
        this.notifications = this.notifications.filter(n => n.id.toString() !== id.toString());
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
}
