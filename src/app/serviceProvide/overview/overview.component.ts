// src/app/pages/overview/overview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IngeneralEyeService } from '../../services/ingeneral-eye.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  toggleStatus = true;
  technicianId: string = '';

  provider: any = {
    id: '',
    name: '',
    avatar: 'assets/images/provider1.jpg',
    rating: 0,
    reviews: 0,
    orders: 0
  };

  orders: any[] = [];
  successMessage = '';
  errorMessage = '';

  // الحقول اللي عايز تعرضها بس
  overview = {
    section: '',          // from API: categoryName
    experienceYears: '',  // from API: yearsOfExperience
    city: '',             // from API: city (fallback 'قنا' لو فاضي)
    areas: '',            // from API: serviceAreas
    services: '',         // from API: nameServices
    workHours: ''         // from API: workingHours
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private overviewService: IngeneralEyeService
  ) {}

  ngOnInit(): void {
    // حاول نجيب الـ user من localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      // لو مفيش يوزر — روح لصفحة الدخول
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userJson);
    this.technicianId = user?.id ?? '';
    this.provider.id = this.technicianId;
    this.provider.name = user?.name ?? '';
    this.provider.avatar = this.normalizeImage(user?.image ?? '');

    if (!this.technicianId) {
      this.errorMessage = 'لا يوجد معرف مزوّد صالح';
      this.clearMessages();
      return;
    }

    // نجيب بيانات البروفايل من الـ API
    this.overviewService.getProfile(this.technicianId).subscribe({
      next: (res: any) => {
        // res متوقع يحتوى على الحقول: categoryName, yearsOfExperience, city, serviceAreas, nameServices, workingHours, imageUrl, name
        // نحافظ على عرض الحقول اللي اخترتها فقط، مع fallback آمن

        // اسم المزود (لو API عنده اسم أفضل من localStorage نستخدمه)
        this.provider.name = res.name ?? this.provider.name;

        // صورة المزود (يفضّل imageUrl من الـ API)
        const serverImage = res.imageUrl ?? res.image ?? null;
        if (serverImage) {
          this.provider.avatar = this.normalizeImage(serverImage);
        }

        // القسم — انت طلبت: "القسم يكون الـ categoryName"
        this.overview.section = res.categoryName ?? (res.category && res.category.name) ?? '-';

        // سنوات الخبرة
        if (res.yearsOfExperience !== undefined && res.yearsOfExperience !== null && res.yearsOfExperience !== 0) {
          this.overview.experienceYears = `${res.yearsOfExperience} ${+res.yearsOfExperience === 1 ? 'سنة' : 'سنوات'}`;
        } else {
          this.overview.experienceYears = '-';
        }

        // المدينة — لو الـ API رجع city استخدمه، وإلا ابقي افتراضي 'قنا' لو انت عايز
        this.overview.city = res.city ?? 'قنا';

        // مناطق الخدمة — API ممكن يرجع string أو array
        if (Array.isArray(res.serviceAreas)) {
          this.overview.areas = res.serviceAreas.join(', ') || '-';
        } else if (typeof res.serviceAreas === 'string' && res.serviceAreas.trim() !== '') {
          this.overview.areas = res.serviceAreas;
        } else {
          this.overview.areas = '-';
        }

        // الخدمات (nameServices)
        this.overview.services = res.nameServices ?? res.servicesName ?? '-';

        // ساعات العمل
        if (res.workingHours !== undefined && res.workingHours !== null && res.workingHours !== '') {
          this.overview.workHours = `${res.workingHours}`;
        } else {
          this.overview.workHours = '-';
        }

        // مثبت: لا نعرض غير الحقول دي — مفيش حاجة تانية هتظهر غير اللي فوق
        this.successMessage = '';
      },
      error: (err) => {
        console.error('❌ خطأ في جلب البروفايل:', err);
        this.errorMessage = 'فشل في تحميل بيانات البروفايل';
        this.clearMessages();
      }
    });
  }

  clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3500);
  }

  logout() {
    const confirmed = confirm("هل تريد فعلاً تسجيل الخروج؟");
    if (confirmed) {
      localStorage.removeItem('user');
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  /**
   * تحويل رابط الصورة ليكون آمن / نسبي بحيث يشتغل مع rewrite اللي عاملها على Vercel:
   * - لو الرابط يحتوي 'on-demand-service-backend.runasp.net' أو 'http://' نحول لـ https أو نسبي /Uploads/...
   * - لو الرابط يبدأ بـ '/Uploads' أو 'Uploads' نخليه '/Uploads/...' (نسبي)
   * - لو Base64 نرجعه كما هو
   */
  private normalizeImage(path: string | null | undefined): string {
    if (!path) return 'assets/images/provider1.jpg';

    const trimmed = path.trim();

    // Base64
    if (trimmed.startsWith('data:image')) return trimmed;

    // already a relative Uploads path
    if (trimmed.startsWith('/Uploads') || trimmed.startsWith('Uploads')) {
      // ensure starts with slash
      return trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    }

    // if backend absolute URL contains /Uploads/filename.png — convert to relative to use rewrites
    try {
      const url = new URL(trimmed);
      const pathname = url.pathname || '';
      const idx = pathname.lastIndexOf('/Uploads/');
      if (idx !== -1) {
        // take /Uploads/...
        const uploadsPath = pathname.substring(idx + 1); // remove leading '/'
        // return relative path starting with /Uploads
        return '/' + uploadsPath;
      }

      // otherwise if it's http -> keep https
      if (url.protocol === 'http:') {
        url.protocol = 'https:';
        return url.toString();
      }

      return trimmed;
    } catch (e) {
      // not a valid absolute URL — fallback to original string
      return trimmed;
    }
  }
}
