import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UpdateProfileUser } from '../DTOS/update-profile-user.dto';
import { UpdatePasswordUser } from '../DTOS/update-password-user.dto';

@Injectable({ providedIn: 'root' })
export class ProfileUserService {
  private baseUrl = '/api'; // نسبي عشان يشتغل مع Vercel

  constructor(private http: HttpClient) {}

  // ✅ Get user profile
  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/Profile/GetbyIduserprfile?id=${userId}`, {
      responseType: 'json'
    });
  }

  // ✅ Update user profile
  updateProfile(userId: string, data: UpdateProfileUser): Observable<any> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    if (data.imageUrl) {
      formData.append('ImageUrl', data.imageUrl); // زي backend
    }

    return this.http.patch(
      `${this.baseUrl}/Services/UpdateUserProfile?userId=${userId}`,
      formData,
      { responseType: 'text' }
    );
  }

  // ✅ Change password
  changePassword(data: UpdatePasswordUser): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.patch(`${this.baseUrl}/Account/change-password`, data, {
      headers,
      responseType: 'text'
    });
  }

  // ✅ Notifications
  getNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notifications/GetNotifications?userId=${userId}`);
  }

  deleteNotification(id: number) {
    return this.http.delete(`${this.baseUrl}/notifications/DeleteNotification?id=${id}`, {
      responseType: 'text'
    });
  }
}
