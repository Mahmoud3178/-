import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthHttpService } from '../../services/auth-http.service'; // ✅ تأكد من المسار

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authHttp: AuthHttpService // ✅ استخدام السيرفيس
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;

      // ✅ استخدم السيرفيس لإرسال OTP
      this.authHttp.sendOtp(email).subscribe({
        next: (res) => {
          console.log('✅ Response:', res);

          // ✅ خزّن الإيميل محليًا واستخدمه لاحقًا
          localStorage.setItem('resetEmail', email);

          // ✅ انتقل لصفحة التحقق مع باراميتر للإيميل
          this.router.navigate(['/forgot-password/verify'], {
            queryParams: { email }
          });
        },
        error: (err) => {
          console.log('❌ Error Response:', err);
          alert('فشل في إرسال رمز التأكيد');
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
