// src/app/services/complaint.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Complaint } from '../DTOS/complaint.dto';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private baseUrl = 'http://on-demand-service-backend.runasp.net/api/Services';

  constructor(private http: HttpClient) {}

createComplaint(data: Complaint): Observable<any> {
  return this.http.post(`${this.baseUrl}/CreateComplaints`, data, {
    responseType: 'text'  // ✅ هنا التعديل
  });
}

}
