import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reviews',
  standalone: true,
    imports: [CommonModule], // ✅ مهم جداً هنا

  template: `
    <div>
      <h6 class="text-success">التقييمات</h6>
      <div class="mb-2 border rounded p-2" *ngFor="let review of [1,2]">
        <div class="d-flex justify-content-between">
          <strong>محمد علي</strong>
          <span>⭐⭐⭐⭐⭐</span>
        </div>
        <small>05/07/2024 - 06:30PM</small>
        <p class="mb-0">فني محترم وشغله ممتاز</p>
      </div>
      <button class="btn btn-outline-success btn-sm">عرض المزيد</button>
    </div>
  `
})
export class ReviewsComponent {}
