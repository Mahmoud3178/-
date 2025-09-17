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
import { HttpClient } from '@angular/common/http';


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
    private route: ActivatedRoute,
      private http: HttpClient // ✅ أضفنا دا

  ) {}
ngOnInit(): void {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  this.userId = user.id || '';

  if (!this.userId) {
    console.error('❌ لا يوجد userId');
    return;
  }

  // 1. أنشئ الفورم فاضي مؤقتًا
  this.profileForm = this.fb.group({
    name: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  this.passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  this.route.queryParams.subscribe(params => {
    this.selectedTab = params['tab'] || 'info';
  });

  this.loadMessages();

  // 2. نجيب البيانات من API
 this.http.get<any>(`/api/Profile/GetbyIduserprfile?id=${this.userId}`).subscribe({
  next: (res) => {
    // تأكد من وجود id
    if (!res.id) {
      console.error('❌ البيانات المستلمة لا تحتوي على id');
      return;
    }
    // تحديث النموذج
    this.profileForm.patchValue({
      name: res.name,
      phoneNumber: res.phoneNumber,
      email: res.email
    });
    // تحديث الصورة
    if (res.imageUrl) {
      this.userImage = res.imageUrl.startsWith('/Uploads') || res.imageUrl.startsWith('http') ? res.imageUrl : this.userImage;
    }
    // تحديث userId من البيانات الجديدة
    this.userId = res.id.toString();
    // تحديث localStorage
    const updatedUser = { ...user, ...res };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  },
  error: (err) => {
    console.error('❌ فشل في تحميل بيانات المستخدم:', err);
  }
});

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
const data = {
  userDto: {
    id: parseInt(this.userId, 10),  // يحول الـ userId لـ integer
    name: this.profileForm.value.name,
    phoneNumber: this.profileForm.value.phoneNumber,
    email: this.profileForm.value.email,
          imageUrl: this.userImage  // ✅ الصورة مطلوبة للـ API

    // لو فيه imageUrl أو غيره، تبعته هنا
  }
};


    this.profileService.updateProfile(this.userId, data).subscribe({
      next: () => {
        this.successMessage = '@ تم تحديث الملف بنجاح.';
      },
      error: (err) => {
        console.error('❌ فشل التحديث:', err);
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
