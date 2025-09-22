import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationStateService implements OnDestroy {
  setHasNewNotifications(hasUnseen: boolean) {
    throw new Error('Method not implemented.');
  }
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private hasNewNotificationsSubject = new BehaviorSubject<boolean>(false);
  hasNewNotifications$ = this.hasNewNotificationsSubject.asObservable();

  private pollingSub?: Subscription;

  constructor(private notificationsService: NotificationsService) {}

  fetchNotifications(userId: string): void {
    // نعمل Polling كل 10 ثواني
    this.pollingSub = timer(0, 10000)
      .pipe(switchMap(() => this.notificationsService.getNotifications(userId)))
      .subscribe({
        next: (notifications) => {
          this.notificationsSubject.next(notifications);

          // لو فيه إشعارات غير مقروءة علم عليها
          const hasNew = notifications.some(n => !n.seen);
          this.hasNewNotificationsSubject.next(hasNew);
        },
        error: (err) => {
          console.error('❌ فشل في تحميل الإشعارات:', err);
        }
      });
  }

  /** نستخدمها عند حذف إشعار محلياً */
  removeNotificationLocally(id: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.filter(n => n.id !== id);
    this.notificationsSubject.next(updated);

    const hasNew = updated.some(n => !n.seen);
    this.hasNewNotificationsSubject.next(hasNew);
  }

  /** نستخدمها لو المستخدم قرأ الإشعارات */
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
