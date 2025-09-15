import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileUser } from '../DTOS/update-profile-user.dto';
import { UpdatePasswordUser } from '../DTOS/update-password-user.dto';

@Injectable({ providedIn: 'root' })
export class ProfileUserService {
  private baseUrl = '/api'; // خلي الرابط نسبي

  constructor(private http: HttpClient) {}

  updateProfile(userId: string, data: UpdateProfileUser): Observable<any> {
    return this.http.patch(`${this.baseUrl}/Services/UpdateUserProfile?userId=${userId}`, data, {
      responseType: 'text'
    });
  }

  changePassword(data: UpdatePasswordUser): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    console.log('📤 headers:', headers);
    console.log('📤 body:', data);

    return this.http.patch(`${this.baseUrl}/Account/change-password`, data, {
      headers,
      responseType: 'text' // مهم عشان الـ backend بيرجع نص مش JSON
    });
  }

  getNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notifications/GetNotifications?userId=${userId}`);
  }

  deleteNotification(id: number) {
    return this.http.delete(
      `${this.baseUrl}/notifications/DeleteNotification?id=${id}`,
      { responseType: 'text' }  // مهم عشان الاستجابة نص
    );
  }
}
