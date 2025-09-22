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
  technicianId = ''; // هيتم تعيينه من localStorage
  successMessage: string | null = null;
  errorMessage: string | null = null;

  provider: any = {};
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
      this.technicianId = user.id;

      this.provider = {
        id: user.id,
        name: user.name,
        avatar: user.image,
        rating: 0,
        reviews: 0,
        orders: 0
      };

      this.loadWorks();
    }
  }

  loadWorks() {
    this.previosWorkService.getPreviousWorks(this.technicianId).subscribe({
      next: (res) => {
        this.works = res.map(item => ({
          ...item,
          imageBeforeUrl: this.normalizeImageUrl(item.imageBeforeUrl, 'before'),
          imageAfterUrl: this.normalizeImageUrl(item.imageAfterUrl, 'after')
        })).reverse(); // أحدث عمل في الأعلى
      },
      error: (err) => console.error('❌ خطأ في تحميل الأعمال السابقة:', err)
    });
  }

  normalizeImageUrl(rawUrl: string, type: 'before' | 'after'): string {
    if (!rawUrl) {
      return type === 'before'
        ? 'assets/images/default-before.jpg'
        : 'assets/images/default-after.jpg';
    }

    // ✅ لو اللينك بالفعل يبدأ بـ http أو https → استخدمه زي ما هو
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }

    try {
      // لو القيمة جاية كـ JSON array
      const parsed = JSON.parse(rawUrl);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const fileName = parsed[0].split('/').pop();
        return fileName
          ? `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`
          : this.getDefaultImage(type);
      }
    } catch (e) {
      // قيمة عادية (مش JSON)
      const fileName = rawUrl.split('/').pop();
      return fileName
        ? `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`
        : this.getDefaultImage(type);
    }

    return this.getDefaultImage(type);
  }

  getDefaultImage(type: 'before' | 'after'): string {
    return type === 'before'
      ? 'assets/images/default-before.jpg'
      : 'assets/images/default-after.jpg';
  }

  onImageError(event: Event, type: 'before' | 'after') {
    const element = event.target as HTMLImageElement;
    element.src = this.getDefaultImage(type);
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

        this.works.unshift({
          ...res,
          imageBeforeUrl: this.beforePreview,
          imageAfterUrl: this.afterPreview
        });

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
    }, 3000);
  }

  logout() {
    if (confirm("هل تريد فعلاً تسجيل الخروج؟")) {
      localStorage.removeItem('user');
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
