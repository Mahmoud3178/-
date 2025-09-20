import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PreviosWorkService } from '../../services/previos-work.service';
import { PreviosWork } from '../../DTOS/previos-work.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-previous-work',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './previous-work.component.html',
  styleUrls: ['./previous-work.component.css']
})
export class PreviousWorkComponent implements OnInit {
  toggleStatus = true;
  technicianId = '369af723-dbda-427d-b075-d51b5d2083a8'; // ثابت للتجربة فقط
  successMessage: string | null = null;
  errorMessage: string | null = null;

  provider: any = {};
  orders: any[] = [];
  newWork = {
    title: '',
    description: ''
  };

  beforeFile: File | null = null;
  afterFile: File | null = null;
  beforePreview: string = '';
  afterPreview: string = '';

  works: PreviosWork[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private previosWorkService: PreviosWorkService
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);

      // اسند ID المستخدم اللي سجل دخول للفني
      this.technicianId = user.id;

      this.provider = {
        id: user.id,
        name: user.name,
        avatar: user.image,
        rating: 0,
        reviews: 0,
        orders: 0
      };

      // حمل الأعمال الخاصة بهذا المستخدم فقط
      this.loadWorks();
    }
  }

  // ✅ تحميل الأعمال السابقة بترتيب عكسي (الأحدث فوق)
  loadWorks() {
    this.previosWorkService.getPreviousWorks(this.technicianId).subscribe({
      next: (res) => {
        this.works = res.map(item => {
          let imageBeforeUrl = this.getValidImageUrl(item.imageBeforeUrl, 'before');
          let imageAfterUrl = this.getValidImageUrl(item.imageAfterUrl, 'after');

          return {
            ...item,
            imageBeforeUrl,
            imageAfterUrl
          };
        }).reverse(); // 👈 نخلي الأحدث يبان فوق
      },
      error: (err) => console.error('❌ خطأ في تحميل الأعمال السابقة:', err)
    });
  }

  getValidImageUrl(rawUrl: string, type: 'before' | 'after'): string {
    if (!rawUrl) {
      return type === 'before'
        ? 'images/default-before.jpg'
        : 'images/default-after.jpg';
    }

    try {
      // لو القيمة JSON Array
      const parsed = JSON.parse(rawUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const fileName = parsed[0].split('/').pop();
        if (fileName) return `/Uploads/${fileName}`;
      }
    } catch (e) {
      // لو قيمة عادية (مش JSON)
      const fileName = rawUrl.split('/').pop();
      if (fileName) return `/Uploads/${fileName}`;
    }

    return type === 'before'
      ? 'images/default-before.jpg'
      : 'images/default-after.jpg';
  }

  onImageError(event: Event, type: 'before' | 'after') {
    const element = event.target as HTMLImageElement;
    element.src = type === 'before'
      ? 'images/default-before.jpg'
      : 'images/default-after.jpg';
  }

  onImageSelected(event: any, type: 'before' | 'after') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'before') {
          this.beforePreview = reader.result as string;
          this.beforeFile = file;
        } else {
          this.afterPreview = reader.result as string;
          this.afterFile = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ إضافة عمل جديد ويظهر فوق فورًا
  submitWork() {
    if (!this.newWork.title || !this.newWork.description || !this.beforeFile || !this.afterFile) {
      this.errorMessage = '❌ يرجى إدخال العنوان والوصف وتحميل الصور';
      this.clearMessagesAfterDelay();
      return;
    }

    const formData = new FormData();
    formData.append('TechnicianId', this.technicianId);
    formData.append('Title', this.newWork.title);
    formData.append('Description', this.newWork.description);
    formData.append('ImageBefore', this.beforeFile);
    formData.append('ImageAfter', this.afterFile);

    this.previosWorkService.createPreviousWork(formData).subscribe({
      next: (res: any) => {
        this.successMessage = '✅ تم إضافة العمل بنجاح';

        // 👇 ضيف العمل الجديد في أول الليستة
        this.works.unshift({
          ...res,
          imageBeforeUrl: this.beforePreview,
          imageAfterUrl: this.afterPreview
        });

        // Reset للفورم
        this.beforePreview = '';
        this.afterPreview = '';
        this.newWork = { title: '', description: '' };
        this.beforeFile = null;
        this.afterFile = null;

        this.clearMessagesAfterDelay();
      },
      error: (err) => {
        console.error('❌ فشل في الإضافة:', err);
        this.errorMessage = '❌ حدث خطأ أثناء الإضافة';
        this.clearMessagesAfterDelay();
      }
    });
  }

  clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000); // 3 ثواني
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
