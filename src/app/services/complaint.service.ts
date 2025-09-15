// src/app/services/complaint.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Complaint } from '../DTOS/complaint.dto';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  // خلي الرابط نسبي عشان البروكسي في فيرسل يتعامل معاه
  private baseUrl = '/api/Services';

  constructor(private http: HttpClient) {}

  createComplaint(data: Complaint): Observable<any> {
    return this.http.post(`${this.baseUrl}/CreateComplaints`, data, {
      responseType: 'text'  // مهم عشان تستقبل نص مش JSON
    });
  }
}
