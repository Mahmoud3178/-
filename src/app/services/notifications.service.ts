import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private baseUrl = 'http://on-demand-service-backend.runasp.net/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/GetNotifications`, { params: { userId } });
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeleteNotification`, { params: { id: id.toString() } });
  }

}
