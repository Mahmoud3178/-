import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreviosWork } from '../DTOS/previos-work.dto';

@Injectable({
  providedIn: 'root'
})
export class PreviosWorkService {
  private apiUrl = '/api/PreviousWorks'; // خلي الرابط نسبي

  constructor(private http: HttpClient) {}

  getPreviousWorks(technicianId: string): Observable<PreviosWork[]> {
    return this.http.get<PreviosWork[]>(`${this.apiUrl}/GetPreviousWorksforTechnician?technicianId=${technicianId}`);
  }

  createPreviousWork(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/Creat`, formData, {
      responseType: 'text' // مهم لاستقبال نص
    });
  }
}
