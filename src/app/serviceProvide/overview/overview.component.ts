import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IngeneralEyeService } from '../../services/ingeneral-eye.service';
import { IngeneralEye } from '../../DTOS/ingeneral-eye.dto';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
  toggleStatus = true;
  technicianId: string = 'e1fb4ebc-164c-463b-b249-a70dcc705e3f';

  provider: any = {};
  orders: any[] = [];
  successMessage = '';
  errorMessage = '';

  // ✅ مربوط بالـ DTO
  overview: IngeneralEye = {
    name: '',
    email: '',
    phoneNumber: '',
    bankName: '',
    bankAccountNumber: '',
    nameServices: '',
    nationalId: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private overviewService: IngeneralEyeService
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.technicianId = user.id; // ⬅️ ID من localStorage
      this.provider = {
        id: user.id,
        name: user.name,
        avatar: user.image,
        rating: 0,
        reviews: 0,
        orders: 0
      };

      // ✅ API call
      this.overviewService.getProfile(this.technicianId).subscribe({
        next: (res) => {
          this.provider.name = res.name;

          this.overview.name = res.name ?? '-';
          this.overview.email = res.email ?? '-';
          this.overview.phoneNumber = res.phoneNumber ?? '-';
          this.overview.bankName = res.bankName ?? '-';
          this.overview.bankAccountNumber = res.bankAccountNumber ?? '-';
          this.overview.nameServices = res.nameServices ?? '-';
          this.overview.nationalId = res.nationalId ?? '-';
        },
        error: () => {
          this.errorMessage = '❌ حدث خطأ أثناء تحميل البيانات';
          this.clearMessages();
        }
      });
    }
  }

  clearMessages() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
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
