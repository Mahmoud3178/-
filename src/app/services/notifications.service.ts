import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private baseUrl = '/api/notifications'; // رابط نسبي (خلي الـ proxy في angular.json يوجه للباك)

  constructor(private http: HttpClient) {}

  /** ✅ جلب الإشعارات */
  getNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/GetNotifications`, { params: { userId } });
  }

  /** ✅ حذف إشعار */
  deleteNotification(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/DeleteNotification`, {
      params: { id: id.toString() },
      responseType: 'text'  // 👈 مهم جدًا عشان الباك بيرجع "Deleted"
    });
  }
}
