import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileUserService } from '../../services/profile-user.service';
import { AuthService } from '../../services/auth.service';
import { UpdateProfileUser } from '../../DTOS/update-profile-user.dto';
import { UpdatePasswordUser } from '../../DTOS/update-password-user.dto';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../DTOS/chatmessage.dto';

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

  userId: string = ''; // ✅ هيتجاب من localStorage بعدين
  userImage: string = 'assets/images/default-avatar.png';
successMessage: string | null = null;
errorMessage: string | null = null;

  favorites = [
    { name: 'محمد علي', rating: 5, orders: 28, image: 'assets/images/provider1.jpg' },
    { name: 'مصطفى علي', rating: 4, orders: 18, image: 'assets/images/provider2.jpg' }
  ];

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
if (user.image) {
  // لو الصورة Base64
  if (user.image.startsWith('data:image')) {
    this.userImage = user.image;
  }
  // لو الصورة جاية من الباك إند نسبية
  else if (user.image.startsWith('/Uploads')) {
    this.userImage = user.image;
  }
  // لو الصورة رابط كامل (http)
  else if (user.image.startsWith('http')) {
    this.userImage = user.image;
  }
  // لو أي حالة غريبة، حط الصورة الافتراضية
  else {
    this.userImage = 'assets/images/default-avatar.png';
  }
} else {
  this.userImage = 'assets/images/default-avatar.png';
}

  // ✅ إنشاء نموذج تعديل البيانات
  this.profileForm = this.fb.group({
    name: [user.name || '', Validators.required],
    phoneNumber: [user.phoneNumber || '', Validators.required],
    email: [user.email || '', [Validators.required, Validators.email]]
  });

  // ✅ إنشاء نموذج تغيير كلمة المرور
  this.passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  this.route.queryParams.subscribe(params => {
    this.selectedTab = params['tab'] || 'info';
  });

  this.loadMessages();
}



resetMessages() {
  this.successMessage = '';
  this.errorMessage = '';
}

  loadMessages(): void {
    this.chatService.getUserMessages(this.userId).subscribe({
      next: (res: ChatMessage[][]) => {
        const allMessages = res.flat();
        console.log('✅ كل الرسائل بعد الفك:', allMessages);

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

        const latest = localStorage.getItem('lastUserMessage');
        if (latest) {
          const msg: ChatMessage = JSON.parse(latest);
          const idx = this.conversations.findIndex(c => c.orderId === msg.orderId);

          if (idx !== -1) {
            this.conversations[idx].message = msg.text;
            this.conversations[idx].time = new Date(msg.timestamp).toLocaleString('ar-EG');
          }

          localStorage.removeItem('lastUserMessage');
        }

        console.log('📦 المحادثات النهائية:', this.conversations);
      },
      error: (err) => console.error('❌ فشل في تحميل المحادثات:', err)
    });
  }

  setTab(tab: string) {
    this.selectedTab = tab;
  }

onSaveProfile() {
  if (this.profileForm.valid) {
    this.resetMessages();

    const data: UpdateProfileUser = {
      id: this.userId,
      name: this.profileForm.value.name,
      phoneNumber: this.profileForm.value.phoneNumber,
      email: this.profileForm.value.email
    };

    this.profileService.updateProfile(this.userId, data).subscribe({
      next: () => {
        this.successMessage = '@ تم تحديث الملف بنجاح.';
      },
      error: () => {
        this.errorMessage = '@ حدث خطأ أثناء تحديث البيانات.';
      }
    });
  }
}

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
        this.successMessage = '@ تم تغيير كلمة المرور بنجاح.';
        this.passwordForm.reset();
      },
      error: (err) => {
        if (err.error?.errors) {
          const errors = Object.entries(err.error.errors)
            .map(([k, v]) => `${(v as string[]).join(', ')}`)
            .join(' ');
          this.errorMessage = `@ ${errors}`;
        } else {
          this.errorMessage = '@ فشل في تغيير كلمة المرور.';
        }
      }
    });
  }
}

  onChangeImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.userImage = reader.result as string;

      // 🔁 تحدث نسخة اليوزر المحفوظة في localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.image = this.userImage;
      localStorage.setItem('user', JSON.stringify(user));
    };
    reader.readAsDataURL(file);
  }
}
onDeleteImage() {
  this.userImage = 'assets/images/default-avatar.png';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.image = '';
  localStorage.setItem('user', JSON.stringify(user));
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
