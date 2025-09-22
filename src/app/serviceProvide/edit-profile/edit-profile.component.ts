import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  toggleStatus = true;
  userImage: string = 'assets/images/default-avatar.png';
  selectedImage: string | null = null;
  categories: any[] = [];
  places: any[] = [];

  provider: any = {};
  successMessage: string | null = null;
  errorMessage: string | null = null;

  profileData = {
    name: '',
    categoryName: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    serviceAreas: '',
    workingHours: 0,
    yearsOfExperience: 0,
    bankName: '',
    bankAccountNumber: '',
    nameServices: '',
    imageUrl: ''
  };

  technicianId = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.technicianId =
          decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
      } catch (err) {
        console.error('❌ فشل في فك التوكن:', err);
      }
    }

    this.provider = {
      id: user.id,
      name: user.name || '',
      avatar: user.image || 'assets/images/default-avatar.png',
      rating: 0,
      reviews: 0,
      orders: 0
    };

    this.userImage = this.provider.avatar;
  }

  ngOnInit(): void {
    if (!this.technicianId) {
      console.error('❌ technicianId مفقود');
      return;
    }

    this.loadTechnicianData();
    this.loadCategories();
    this.loadPlaces();
  }

  loadTechnicianData(): void {
    const url = `/api/Requests/GetTechnicianById?technicianId=${this.technicianId}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        console.log('✅ بيانات الفني:', res);

        this.profileData = {
          name: res.name || '',
          categoryName: res.categoryName || '',
          email: res.email || '',
          phoneNumber: res.phoneNumber || '',
          nationalId: res.nationalId || '',
          serviceAreas: res.serviceAreas || '',
          workingHours: res.workingHours || 0,
          yearsOfExperience: res.yearsOfExperience || 0,
          bankName: res.bankName || '',
          bankAccountNumber: res.bankAccountNumber || '',
          nameServices: res.nameServices || '',
          imageUrl: res.imageUrl || this.profileData.imageUrl
        };

        if (res.imageUrl && res.imageUrl.trim() !== '') {
          this.userImage = this.getSafeImageUrl(res.imageUrl) + `?t=${Date.now()}`;
          this.provider.avatar = this.userImage;
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.image = this.userImage;
          localStorage.setItem('user', JSON.stringify(user));
        }

        this.provider.name = res.name || this.provider.name;
        this.provider.orders = res.ordersCount || 0;
        this.provider.rating = res.rating || 0;
        this.provider.reviews = res.reviewsCount || 0;
      },
      error: (err) => {
        console.error('❌ خطأ في تحميل بيانات الفني:', err);
      }
    });
  }

  loadCategories(retries = 3, delayMs = 2000) {
    this.http.get<any[]>('/api/Category/GetAll').subscribe({
      next: (res) => (this.categories = res),
      error: (err) => {
        console.error('❌ فشل في تحميل الأقسام:', err);
        if (retries > 0) {
          setTimeout(() => this.loadCategories(retries - 1, delayMs), delayMs);
        }
      }
    });
  }

  loadPlaces(retries = 3, delayMs = 2000) {
    this.http.get<any[]>('/api/Places/GetAllPlaces').subscribe({
      next: (res) => (this.places = res),
      error: (err) => {
        console.error('❌ فشل في تحميل مناطق الخدمة:', err);
        if (retries > 0) {
          setTimeout(() => this.loadPlaces(retries - 1, delayMs), delayMs);
        }
      }
    });
  }

  onChangeImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.selectedImage = reader.result as string;
      this.userImage = this.selectedImage;
    };

    reader.readAsDataURL(file);
  }

  onDeleteImage(): void {
    this.selectedImage = null;
    this.userImage = 'assets/images/default-avatar.png';
  }

  onSave(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.technicianId) {
      this.errorMessage = '❌ لا يمكن تحديد هوية المستخدم.';
      return;
    }

    const formData = new FormData();
    Object.entries(this.profileData).forEach(([key, value]) =>
      formData.append(key, value.toString())
    );

    const fileInput = document.getElementById('imageFileInput') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('imageurll', fileInput.files[0]);
    }

    const url = `/api/Profile/UpdateTechnician?id=${this.technicianId}`;

    this.http.patch(url, formData, { responseType: 'text' }).subscribe({
      next: () => {
        this.successMessage = '✅ تم تحديث الملف الشخصي بنجاح';
        this.reloadTechnicianDataWithRetry();
      },
      error: (err) => {
        console.error('❌ خطأ في حفظ البيانات:', err);
        this.errorMessage = '❌ حدث خطأ أثناء حفظ البيانات.';
      }
    });
  }

  reloadTechnicianDataWithRetry(retries: number = 3, delayMs: number = 1500): void {
    const getUrl = `/api/Requests/GetTechnicianById?technicianId=${this.technicianId}`;
    this.http.get<any>(getUrl).subscribe({
      next: (res) => {
        if (retries > 0 && res.imageUrl === this.profileData.imageUrl) {
          console.log(`🔄 البيانات لم تتحدث بعد، إعادة المحاولة (${retries})...`);
          setTimeout(() => this.reloadTechnicianDataWithRetry(retries - 1, delayMs), delayMs);
          return;
        }
        this.profileData.imageUrl = res.imageUrl;
        this.userImage = this.getSafeImageUrl(res.imageUrl) + `?t=${Date.now()}`;
        this.provider.avatar = this.userImage;

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.image = this.userImage;
        localStorage.setItem('user', JSON.stringify(user));
      },
      error: (err) => {
        console.error('❌ فشل في جلب البيانات بعد التحديث:', err);
        if (retries > 0) {
          setTimeout(() => this.reloadTechnicianDataWithRetry(retries - 1, delayMs), delayMs);
        }
      }
    });
  }

  getSafeImageUrl(url: string): string {
    if (!url) return 'assets/images/default-avatar.png';
    if (url.includes('on-demand-service-backend.runasp.net/Uploads')) {
      return `/Uploads/${url.split('/Uploads/')[1]}`;
    }
    if (!url.startsWith('http')) return `/Uploads/${url}`;
    return url;
  }

  logout(): void {
    if (confirm('هل تريد فعلاً تسجيل الخروج؟')) {
      localStorage.removeItem('user');
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
}
