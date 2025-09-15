import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent {
  toggleStatus = true;

  provider = {
    name: 'محمد علي',
    rating: 4.5,
    reviews: 28,
    orders: 28,
    avatar: 'assets/images/provider1.jpg'
  };

  summary = {
    totalHours: 12,
    workDays: 6,
    fixedAppointments: 3
  };

  selectedDay = 'بداية يوم العمل';
  selectedVisitDuration = 'مدة الزيارة';
  selectedDate = '2025-05-28';

  slots = [
    { time: 'من 9:00 ص', active: true },
    { time: 'من 11:00 ص', active: false },
    { time: 'من 1:00 م', active: false },
    { time: 'من 3:00 م', active: true },
    { time: 'من 5:00 م', active: false },
    { time: 'من 7:00 م', active: true }
  ];
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
