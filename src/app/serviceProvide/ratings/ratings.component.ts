import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RatingService } from '../../services/rating.service';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {
  toggleStatus = true;
  ratings: any[] = [];
  visibleRatings: any[] = [];
  showCount = 4;

  provider: any = {};
  orderInfo: any = {};
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.provider = {
        id: user.id,
        name: user.name,
        avatar: user.image || 'assets/images/provider1.jpg',
        rating: 0,
        reviews: 0,
        orders: 0
      };

      this.ratingService.getRatingsByTechnician(this.provider.id).subscribe({
        next: (data) => {
          this.ratings = data.map(r => ({
            clientName: r.userName && r.userName.trim() !== '' ? r.userName : 'اسم العميل غير متوفر',
            clientRole: 'عميل',
            clientRoleColor: 'bg-success',
            clientAvatar: r.userImage && r.userImage.trim() !== '' ? r.userImage : 'assets/images/avatar1.jpg',
            clientTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            clientDate: new Date().toLocaleDateString('ar-EG'),
            stars: r.ratingValue,
            comment: r.comment
          }));

          this.visibleRatings = this.ratings.slice(0, this.showCount);

          this.successMessage = '✅ تم تحميل التقييمات بنجاح';
          this.clearMessages();
        },
        error: (err) => {
          console.error('❌ خطأ في جلب التقييمات:', err);
          this.errorMessage = '❌ فشل في تحميل التقييمات';
          this.clearMessages();
        }
      });
    }
  }

  showMore() {
    const nextCount = this.visibleRatings.length + this.showCount;
    this.visibleRatings = this.ratings.slice(0, nextCount);
  }
  showLess() {
  this.visibleRatings = this.ratings.slice(0, this.showCount);
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
