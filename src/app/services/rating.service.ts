import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../DTOS/rating.dto'; // تأكد من المسار

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = '/api/Rating';  // الرابط نسبي علشان يشتغل مع الـ proxy

  constructor(private http: HttpClient) {}

  // 🟢 استدعاء API للحصول على التقييمات
  getRatingsByTechnician(technicianId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(
      `${this.apiUrl}/GetRatingsOfTechnician?TechnicianId=${technicianId}`
    );
  }

  // 🟢 دالة لتصحيح روابط الصور
  fixImageUrl(userImage: string | undefined): string {
    if (!userImage || userImage.trim() === '') {
      return 'assets/images/avatar1.jpg'; // صورة افتراضية لو مفيش صورة
    }

    if (userImage.startsWith('http://')) {
      // نحول http لـ https
      return userImage.replace('http://', 'https://');
    }

    if (!userImage.startsWith('http')) {
      // لو رابط نسبي (زي Uploads/xyz.png) نكمله بالـ domain
      return `https://on-demand-service-backend.runasp.net/${userImage}`;
    }

    return userImage;
  }
}
