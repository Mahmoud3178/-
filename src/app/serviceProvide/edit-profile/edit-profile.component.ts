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

  provider: any = {};
  orders: any[] = [];
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

    // ✅ تحميل الصورة من localStorage زي change-password
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
          imageUrl: res.imageUrl || ''
        };

        // ✅ تحديث الصورة من السيرفر لو موجودة
        if (res.imageUrl) {
          this.provider.avatar = this.getSafeImageUrl(res.imageUrl);
          this.userImage = this.provider.avatar;

          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.image = this.provider.avatar;
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

  onChangeImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

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
    this.userImage = this.provider.avatar || 'assets/images/default-avatar.png';
  }

  async urlToFile(url: string, filename: string, mimeType: string): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  }

async onSave(): Promise<void> {
  this.successMessage = '';
  this.errorMessage = '';

  const formData = new FormData();
  formData.append('name', this.profileData.name);
  formData.append('categoryName', this.profileData.categoryName);
  formData.append('email', this.profileData.email);
  formData.append('phoneNumber', this.profileData.phoneNumber);
  formData.append('nationalId', this.profileData.nationalId);
  formData.append('serviceAreas', this.profileData.serviceAreas);
  formData.append('workingHours', this.profileData.workingHours.toString());
  formData.append('yearsOfExperience', this.profileData.yearsOfExperience.toString());
  formData.append('bankName', this.profileData.bankName);
  formData.append('bankAccountNumber', this.profileData.bankAccountNumber);
  formData.append('nameServices', this.profileData.nameServices);

  if (!this.technicianId) {
    this.errorMessage = '❌ لا يمكن تحديد هوية المستخدم.';
    return;
  }

  // ✅ الصورة
  const fileInput = document.getElementById('imageFileInput') as HTMLInputElement;
  if (fileInput?.files?.[0]) {
    formData.append('imageUrl', fileInput.files[0]); // ← اتأكد من اسم الحقل اللي الـ backend مستنيه
  }

  const url = `/api/Profile/UpdateTechnician?id=${this.technicianId}`;

  this.http.patch(url, formData, { responseType: 'text' }).subscribe({
    next: () => {
      this.successMessage = '✅ تم تحديث الملف الشخصي بنجاح';

      // ⬅️ إعادة تحميل البيانات
      const getUrl = `/api/Requests/GetTechnicianById?technicianId=${this.technicianId}`;
      this.http.get<any>(getUrl).subscribe({
        next: (res) => {
          console.log('🔄 تم تحديث بيانات الفني من السيرفر:', res);

          // ✅ تحديث البيانات
          this.profileData.imageUrl = res.imageUrl;
          this.provider.avatar = this.getSafeImageUrl(res.imageUrl) + `?t=${Date.now()}`;
          this.userImage = this.provider.avatar;

          // ✅ تحديث localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.image = this.provider.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        },
        error: (err) => console.error('❌ فشل في جلب البيانات بعد التحديث:', err)
      });

      this.selectedImage = null;
    },
    error: (err) => {
      console.error('❌ خطأ في حفظ البيانات:', err);
      this.errorMessage = '❌ حدث خطأ أثناء حفظ البيانات.';
    }
  });
}



  getSafeImageUrl(url: string): string {
    if (!url) return 'assets/images/default-avatar.png';
    return url.startsWith('http://') ? url.replace('http://', 'https://') : url;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
