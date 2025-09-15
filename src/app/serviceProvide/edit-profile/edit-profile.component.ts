import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
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
  userImage: string = 'assets/images/default-avatar.png'; // الصورة المعروضة
  selectedImage: string | null = null; // صورة مؤقتة للتعديل قبل الحفظ

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

    this.userImage = user.image || 'assets/images/default-avatar.png';
    this.provider.avatar = this.userImage;
    this.provider.name = user.name || '';
  }

  ngOnInit(): void {
    if (!this.technicianId) {
      console.error('❌ technicianId مفقود');
      return;
    }

    const url = `http://on-demand-service-backend.runasp.net/api/Requests/GetTechnicianById?technicianId=${this.technicianId}`;

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

        // عرض الصورة الحالية أو الافتراضية
        if (!this.selectedImage) {
          this.provider.avatar = res.imageUrl || 'assets/images/default-avatar.png';
          this.userImage = this.provider.avatar;
        }

        // اسم الفني، الطلبات، والتقييمات لو موجودة في res
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
      this.userImage = this.selectedImage; // عرض الصورة الجديدة مؤقتًا
      // لا تغير provider.avatar هنا لعدم فقدان الصورة الحالية حتى الحفظ
    };
    reader.readAsDataURL(file);
  }

  onDeleteImage(): void {
    this.selectedImage = null;
    this.userImage = this.provider.avatar || 'assets/images/default-avatar.png';
  }

  onSave(): void {
    // تحديث صورة الملف الشخصي بالـ selectedImage لو موجودة
    if (this.selectedImage) {
      this.profileData.imageUrl = this.selectedImage;
    }

    const data = {
      name: this.profileData.name,
      categoryName: this.profileData.categoryName,
      email: this.profileData.email,
      phoneNumber: this.profileData.phoneNumber,
      nationalId: this.profileData.nationalId,
      serviceAreas: this.profileData.serviceAreas,
      workingHours: this.profileData.workingHours,
      yearsOfExperience: this.profileData.yearsOfExperience,
      bankName: this.profileData.bankName,
      bankAccountNumber: this.profileData.bankAccountNumber,
      nameServices: this.profileData.nameServices,
      imageUrl: this.profileData.imageUrl
    };

  const url = `http://on-demand-service-backend.runasp.net/api/Profile/UpdateTechnician?id=${this.technicianId}`;

   this.http.patch(url, data, { responseType: 'text' }).subscribe({
  next: (res) => {
    this.successMessage = '✅ تم تحديث الملف الشخصي بنجاح';
    this.errorMessage = '';

    // تحديث الصورة المعروضة والصورة في provider.avatar
    if (this.selectedImage) {
      this.userImage = this.selectedImage;
      this.provider.avatar = this.selectedImage;

      // تحديث بيانات المستخدم في التخزين المحلي
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.image = this.selectedImage;
      localStorage.setItem('user', JSON.stringify(user));

      this.selectedImage = null;
    }
  },
  error: (err) => {
    this.errorMessage = '❌ حدث خطأ أثناء تحديث الملف الشخصي';
    this.successMessage = '';
    console.error('❌ خطأ في حفظ البيانات:', err);
  }
});

  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
