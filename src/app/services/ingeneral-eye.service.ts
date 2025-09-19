// ✅ Service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IngeneralEye } from '../DTOS/ingeneral-eye.dto';

@Injectable({ providedIn: 'root' })
export class IngeneralEyeService {
  private api = '/api/Services/technicianProfile';

  constructor(private http: HttpClient) {}

  getProfile(technicianId: string): Observable<IngeneralEye> {
    return this.http.get<IngeneralEye>(`${this.api}?technicianid=${technicianId}`);
  }
}
