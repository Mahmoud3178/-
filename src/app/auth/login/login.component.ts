import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthHttpService } from '../../services/auth-http.service';
import { AuthService } from '../../services/auth.service';
import { LoginDTO } from '../../DTOS/login.dto';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  selectedRole: 'client' | 'provider' = 'client';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  private backendBaseUrl = 'http://on-demand-service-backend.runasp.net'; // رابط السيرفر الأساسي

  constructor(
    private fb: FormBuilder,
    private authHttp: AuthHttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.valid) {
      const dto = this.mapLoginFormToDTO();

      const loginObservable =
        this.selectedRole === 'provider'
          ? this.authHttp.logintechnical(dto)
          : this.authHttp.login(dto);

      loginObservable.subscribe({
        next: (res) => {
          if (!res || !res.token) {
            this.errorMessage = this.selectedRole === 'client'
              ? '❌ البريد أو كلمة المرور غير صحيحة'
              : '@ البريد أو كلمة المرور غير صحيحة';
            return;
          }

          const decoded = jwtDecode<any>(res.token);

          const userId =
            decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
          const roleFromToken =
            decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';

          const expectedRole = this.selectedRole === 'provider' ? 'Technician' : 'User';

          if (roleFromToken !== expectedRole) {
            this.errorMessage = this.selectedRole === 'client'
              ? '❌ الحساب غير صحيح'
              : '@ الحساب لا يتطابق مع نوع المستخدم المختار';
            return;
          }

          // تنظيف رابط الصورة لو كامل
          let imageUrl = res.photo || res.image || null;
          if (imageUrl && imageUrl.startsWith(this.backendBaseUrl)) {
            imageUrl = imageUrl.replace(this.backendBaseUrl, '');
          }

          const user = {
            email: dto.email,
            role: this.selectedRole,
            image: imageUrl,
            name: res.name || '',
            id: userId
          };

          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', res.token);

          this.authService.login(res.token, user);

          this.successMessage = '@ تم تسجيل الدخول بنجاح';
          setTimeout(() => {
            this.router.navigate([
              this.selectedRole === 'provider' ? '/provider-home' : '/'
            ]);
          }, 1000);
        },
        error: () => {
          this.errorMessage = this.selectedRole === 'client'
            ? '❌ البريد أو كلمة المرور غير صحيحة'
            : '@ قد يكون لم يوافق الادمن عليك ستصلك رساله تاكيد عند تفعيل الحساب علي الجيميل أو البيانات غير صحيحة';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.errorMessage = '@ يرجى تعبئة جميع الحقول بشكل صحيح';
    }
  }

  private mapLoginFormToDTO(): LoginDTO {
    return {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
  }
}
