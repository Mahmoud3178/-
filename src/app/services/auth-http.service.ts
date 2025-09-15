import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {
  private readonly baseUrl = 'http://on-demand-service-backend.runasp.net/api/Account';
  private readonly authBase = 'http://on-demand-service-backend.runasp.net/api/Auth';

  constructor(private http: HttpClient) {}

  login(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loginUser`, dto);
  }

    logintechnical(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loginTechnician`, dto);
  }
registerUser(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/registerUser`, formData, {
    responseType: 'text'  // ✅ أهم سطر
  });
}

registerTechnician(formData: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/registerTechnician`, formData, {
    responseType: 'text'  // ✅ أهم سطر
  });
}

sendOtp(email: string): Observable<any> {
  return this.http.post(
    `http://on-demand-service-backend.runasp.net/api/Auth/SendOTP?Email=${email}`,
    {},
    { responseType: 'text' } // <-- أضف ده مؤقتاً لمراقبة الرد
  );
}

  // ✅ 2. Verify OTP
  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.authBase}/VerifyOTP`, {
      email,
      otp
    });
  }

  // ✅ 3. Reset Password
  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.authBase}/ResetPassword`, {
      email,
      newPassword
    });
  }
}
