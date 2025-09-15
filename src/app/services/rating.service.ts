import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../DTOS/rating.dto'; // تأكد من مسار الملف

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = '/api/Rating';  // خلي الرابط نسبي

  constructor(private http: HttpClient) {}

  getRatingsByTechnician(technicianId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/GetRatingsOfTechnician?TechnicianId=${technicianId}`);
  }
}
