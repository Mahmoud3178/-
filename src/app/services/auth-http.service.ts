import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {
  // خلي العناوين نسبيّة عشان تستخدم البروكسي في فيرسل
  private readonly baseUrl = '/api/Account';
  private readonly authBase = '/api/Auth';

  constructor(private http: HttpClient) {}

  login(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loginUser`, dto);
  }

  logintechnical(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loginTechnician`, dto);
  }

  registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/registerUser`, formData, {
      responseType: 'text'  // مهم
    });
  }

  registerTechnician(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/registerTechnician`, formData, {
      responseType: 'text'  // مهم
    });
  }

  sendOtp(email: string): Observable<any> {
    return this.http.post(
      `/api/Auth/SendOTP?Email=${email}`,
      {},
      { responseType: 'text' }
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.authBase}/VerifyOTP`, {
      email,
      otp
    });
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.authBase}/ResetPassword`, {
      email,
      newPassword
    });
  }
}
