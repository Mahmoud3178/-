import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from './notifications.service'; // أو service الإشعارات عندك

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService {
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private hasNewNotificationsSubject = new BehaviorSubject<boolean>(false);
  hasNewNotifications$ = this.hasNewNotificationsSubject.asObservable();

  constructor(private notificationsService: NotificationsService) {}

  fetchNotifications(userId: string): void {
    this.notificationsService.getNotifications(userId).subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.hasNewNotificationsSubject.next(notifications.some(n => !n.seen));
      },
      error: (err) => {
        console.error('❌ فشل في تحميل الإشعارات:', err);
      }
    });
  }

  setHasNewNotifications(value: boolean): void {
    this.hasNewNotificationsSubject.next(value);
  }
}
