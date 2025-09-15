import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ⛔️ تأكد إن الإيميل محفوظ من المرحلة السابقة
    const storedEmail = localStorage.getItem('resetEmail');
    if (!storedEmail) {
      alert('البريد الإلكتروني غير متوفر، أعد العملية من جديد');
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.email = storedEmail;

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      const { newPassword, confirmPassword } = this.resetForm.value;

      if (newPassword !== confirmPassword) {
        alert('❌ كلمتا المرور غير متطابقتين');
        return;
      }

      this.http.post('http://on-demand-service-backend.runasp.net/api/Auth/ResetPassword', {
        email: this.email,
        newPassword
      }).subscribe({
        next: () => {
          alert('✅ تم تغيير كلمة المرور بنجاح');
          localStorage.removeItem('resetEmail'); // 🧹 ننضف التخزين
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('❌ Reset failed:', err);
          alert('❌ فشل تغيير كلمة المرور');
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
