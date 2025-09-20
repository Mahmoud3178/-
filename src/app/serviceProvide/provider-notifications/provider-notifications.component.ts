import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';
import { NotificationStateService } from '../../services/notification-state.service'; // لازم تضيفه لو هتستخدم العلامة الحمراء
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

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
    private notificationState: NotificationStateService,
    private cdRef: ChangeDetectorRef
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
        // ✅ نخلي أحدث إشعار الأول (عكس الترتيب)
        this.notifications = data.reverse();

        // تحقق من وجود إشعارات غير مقروءة
        const hasUnseen = this.notifications.some(n => !n.seen);
        this.notificationState.setHasNewNotifications(hasUnseen); // لو عاوز علامة جرس
      },
      error: (err) => {
        console.error('Error loading notifications', err);
      }
    });
  }

  deleteNotification(id: number) {
    this.notificationsService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id.toString() !== id.toString());
        this.cdRef.detectChanges(); // 💥 ترغم Angular يعمل تحديث
        window.location.reload();
      },
      error: (err) => {
        console.error('Error deleting notification', err);
      }
    });
  }

  trackById(index: number, item: any): any {
    return item.id;
  }
}
