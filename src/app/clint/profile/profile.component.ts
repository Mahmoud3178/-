import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileUserService } from '../../services/profile-user.service';
import { AuthService } from '../../services/auth.service';
import { UpdatePasswordUser } from '../../DTOS/update-password-user.dto';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../DTOS/chatmessage.dto';
import { UpdateProfileUser } from '../../DTOS/update-profile-user.dto';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  selectedTab: string = 'info';
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  userId: string = '';
  userImage: string = 'assets/images/default-avatar.png';
  successMessage: string | null = null;
  errorMessage: string | null = null;

  conversations: {
    name: string;
    message: string;
    time: string;
    techId: string;
    orderId: number;
  }[] = [];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileUserService,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id || '';

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    // تحديد التبويب من الـ query params
    this.route.queryParams.subscribe(params => {
      this.selectedTab = params['tab'] || 'info';
    });

    this.loadProfile();
    this.loadMessages();
  }

  // ✅ تحميل بيانات البروفايل
  loadProfile() {
    this.profileService.getUserProfile(this.userId).subscribe({
      next: (res) => {
        this.profileForm.patchValue({
          name: res.name,
          phoneNumber: res.phoneNumber,
          email: res.email
        });

        if (res.imageUrl) {
          this.userImage = res.imageUrl;
        }
      },
      error: (err) => console.error('❌ فشل في تحميل بيانات المستخدم:', err)
    });
  }

  // ✅ تحديث بيانات البروفايل
// ✅ تحديث بيانات البروفايل
onSaveProfile() {
  if (this.profileForm.valid) {
    const data: UpdateProfileUser = {
      id: this.userId,
      name: this.profileForm.value.name,
      phoneNumber: this.profileForm.value.phoneNumber,
      email: this.profileForm.value.email,
      imageUrl: this.userImage
    };

    this.profileService.updateProfile(this.userId, data).subscribe({
      next: () => {
        this.successMessage = '✅ تم تحديث الملف بنجاح.';

        // 🔄 تحديث localStorage بالصورة الجديدة
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.image = this.userImage + `?t=${Date.now()}`; // عشان يكسر الكاش
        localStorage.setItem('user', JSON.stringify(user));

        // 🔄 تحديث المتغير المستخدم في الهيدر
        this.userImage = user.image;
      },
      error: (err) => {
        console.error('❌ فشل التحديث:', err);
        this.errorMessage = '❌ حدث خطأ أثناء تحديث البيانات.';
      }
    });
  }
}
  // ✅ تغيير كلمة المرور
  onChangePassword() {
    if (this.passwordForm.valid) {
      this.resetMessages();

      const data: UpdatePasswordUser = {
        userId: this.userId,
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.profileService.changePassword(data).subscribe({
        next: () => {
          this.successMessage = '✅ تم تغيير كلمة المرور بنجاح.';
          this.passwordForm.reset();
        },
        error: (err) => {
          if (err.error?.errors) {
            const errors = Object.entries(err.error.errors)
              .map(([k, v]) => `${(v as string[]).join(', ')}`)
              .join(' ');
            this.errorMessage = `❌ ${errors}`;
          } else {
            this.errorMessage = '❌ فشل في تغيير كلمة المرور.';
          }
        }
      });
    }
  }

  // ✅ تحميل المحادثات
  loadMessages(): void {
    this.chatService.getUserMessages(this.userId).subscribe({
      next: (res: ChatMessage[][]) => {
        const allMessages = res.flat();
        const grouped = new Map<number, ChatMessage[]>();

        allMessages.forEach(msg => {
          if (!grouped.has(msg.orderId)) {
            grouped.set(msg.orderId, []);
          }
          grouped.get(msg.orderId)!.push(msg);
        });

        this.conversations = Array.from(grouped.entries()).map(([orderId, messages]) => {
          const last = messages[messages.length - 1];
          return {
            name: 'اسم الفني غير متوفر',
            message: last.text,
            time: new Date(last.timestamp).toLocaleString('ar-EG'),
            techId: last.technicianId,
            orderId: last.orderId
          };
        });
      },
      error: (err) => console.error('❌ فشل في تحميل المحادثات:', err)
    });
  }

  // ✅ Reset للـ Toast Messages
  resetMessages() {
    this.successMessage = null;
    this.errorMessage = null;
  }

  // ✅ تغيير التبويب
  setTab(tab: string) {
    this.selectedTab = tab;
  }

  // ✅ تغيير صورة البروفايل
  onChangeImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ حذف صورة البروفايل
  onDeleteImage() {
    this.userImage = 'assets/images/default-avatar.png';
  }

  // ✅ تسجيل الخروج
  logout() {
    const confirmed = confirm("هل تريد فعلاً تسجيل الخروج؟");
    if (confirmed) {
      localStorage.removeItem('user');
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
