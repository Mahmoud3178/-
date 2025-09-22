import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService implements OnDestroy {
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private hasNewNotificationsSubject = new BehaviorSubject<boolean>(false);
  hasNewNotifications$ = this.hasNewNotificationsSubject.asObservable();

  private pollingSub?: Subscription;

  constructor(private notificationsService: NotificationsService) {}

  /** Polling كل 10 ثواني */
  fetchNotifications(userId: string): void {
    this.pollingSub = timer(0, 10000)
      .pipe(switchMap(() => this.notificationsService.getNotifications(userId)))
      .subscribe({
        next: (notifications) => {
          this.notificationsSubject.next(notifications);

          const hasNew = notifications.some(n => !n.seen);
          this.hasNewNotificationsSubject.next(hasNew);
        },
        error: (err) => {
          console.error('❌ فشل في تحميل الإشعارات:', err);
        }
      });
  }

  /** حذف إشعار محليًا */
  removeNotificationLocally(id: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);

    const hasNew = updated.some(n => !n.seen);
    this.hasNewNotificationsSubject.next(hasNew);
  }
  /** تحديث علامة الجرس يدويًا */
  setHasNewNotifications(hasUnseen: boolean): void {
    this.hasNewNotificationsSubject.next(hasUnseen);
  }

  /** تعليم الكل كمقروء */
  markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map(n => ({
      ...n,
      seen: true
    }));
    this.notificationsSubject.next(updated);
    this.hasNewNotificationsSubject.next(false);
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }
}
