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


loadWorks() {
  this.previosWorkService.getPreviousWorks(this.technicianId).subscribe({
    next: (res) => {
      this.works = res.map(item => {
        let imageBeforeUrl = '';
        let imageAfterUrl = '';

        try {
          const beforeParsed = JSON.parse(item.imageBeforeUrl);
          if (Array.isArray(beforeParsed) && beforeParsed.length > 0) {
            imageBeforeUrl = `/Uploads/${beforeParsed[0].split('/').pop()}`;
          }
        } catch {
          imageBeforeUrl = item.imageBeforeUrl || 'assets/images/default-before.jpg';
        }

        try {
          const afterParsed = JSON.parse(item.imageAfterUrl);
          if (Array.isArray(afterParsed) && afterParsed.length > 0) {
            imageAfterUrl = `/Uploads/${afterParsed[0].split('/').pop()}`;
          }
        } catch {
          imageAfterUrl = item.imageAfterUrl || 'assets/images/default-after.jpg';
        }

        return {
          ...item,
          imageBeforeUrl,
          imageAfterUrl
        };
      });
    },
    error: (err) => console.error('❌ خطأ في تحميل الأعمال السابقة:', err)
  });
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
  formData.append('Title', this.newWork.title); // 👈 أضف هذا السطر
  formData.append('Description', this.newWork.description);
  formData.append('ImageBefore', this.beforeFile);
  formData.append('ImageAfter', this.afterFile);

  this.previosWorkService.createPreviousWork(formData).subscribe({
    next: () => {
      this.successMessage = '✅ تم إضافة العمل بنجاح';
      this.beforePreview = '';
      this.afterPreview = '';
      this.newWork = { title: '', description: '' };
      this.beforeFile = null;
      this.afterFile = null;
      this.loadWorks();
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
