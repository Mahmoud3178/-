import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileUserService } from '../../services/profile-user.service';
import { UpdatePasswordUser } from '../../DTOS/update-password-user.dto';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  toggleStatus = true;

  successMessage: string = '';
errorMessage: string = '';

  provider: any = {};
  orders: any[] = [];

  passwordData = {
    current: '',
    new: ''
  };

  show = {
    current: false,
    new: false
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileUserService
  ) {}
  ngOnInit(): void {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);

    // بنسند بيانات الفني مباشرة من التوكن
    this.provider = {
      id: user.id,
      name: user.name,
      avatar: user.image,
      rating: 0,
      reviews: 0,
      orders: 0
    };}
  }
  toggleVisibility(field: 'current' | 'new') {
    this.show[field] = !this.show[field];
  }
onSave() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || '8be4f974-ac5f-4d62-abb6-2c0ceac5ad4c';

  if (!userId || userId.trim() === '') {
    this.errorMessage = '⚠️ لم يتم العثور على المستخدم';
    this.clearMessagesAfterDelay();
    return;
  }

  const payload: UpdatePasswordUser = {
    userId: userId,
    currentPassword: this.passwordData.current,
    newPassword: this.passwordData.new
  };

  this.profileService.changePassword(payload).subscribe({
    next: () => {
      this.successMessage = '✅ تم تغيير كلمة المرور بنجاح';
      this.passwordData = { current: '', new: '' };
      this.clearMessagesAfterDelay();
    },
    error: (err) => {
      if (err.error?.errors) {
        this.errorMessage = Object.entries(err.error.errors)
          .map(([key, val]) => `${key}: ${(val as string[]).join(', ')}`)
          .join('\n');
      } else {
        this.errorMessage = '❌ حدث خطأ أثناء تغيير كلمة المرور';
      }
      this.clearMessagesAfterDelay();
    }
  });
}


clearMessagesAfterDelay() {
  setTimeout(() => {
    this.successMessage = '';
    this.errorMessage = '';
  }, 3000);
}

logout() {
  const confirmed = confirm("هل تريد فعلاً تسجيل الخروج؟");
  if (confirmed) {
    localStorage.removeItem('user');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
}
