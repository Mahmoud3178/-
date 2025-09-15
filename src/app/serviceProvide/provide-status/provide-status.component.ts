import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-provide-status',
  standalone: true,
  imports: [CommonModule],
    templateUrl: './provide-status.component.html',
  styleUrl: './provide-status.component.css'
})
export class ProvideStatusComponent implements OnInit {
  status: 'pending' | 'approved' = 'pending';
 constructor(private router: Router) {}

  ngOnInit() {
    // أول 4 ثواني يعرض رسالة "قيد المراجعة"
    setTimeout(() => {
      this.status = 'approved';

      // بعدها بثانيتين يوديه على صفحة الخدمة
      setTimeout(() => {
        this.router.navigate(['/provider-home']); // 👈 غيّر المسار حسب الكومبوننت
      }, 2000);
    }, 4000);
  }
}
