import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [RouterLink ,CommonModule, FormsModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent {
  toggleStatus = true;

  provider = {
    name: 'محمد علي',
    rating: 4.5,
    reviews: 28,
    orders: 28,
    avatar: 'assets/images/provider1.jpg'
  };

  wallet = {
    total: 2000,
    available: 1500,
    feePercentage: 25,
    transactions: [
      { label: 'زيارة صيانة خفيفة', date: '31/5/2025 - 9:00 am', amount: 200 },
      { label: 'الزيارة', date: '31/5/2025 - 9:00 am', amount: -50 },
      { label: 'زيارة صيانة خفيفة', date: '31/5/2025 - 9:00 am', amount: 200 },
      { label: 'الزيارة', date: '31/5/2025 - 9:00 am', amount: -150 }
    ]
  };
    constructor(private authService: AuthService, private router: Router) {}

logout() {
  const confirmed = confirm("هل تريد فعلاً تسجيل الخروج؟");
  if (confirmed) {
    localStorage.removeItem('user');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
}
