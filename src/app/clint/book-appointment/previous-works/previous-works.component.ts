import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-previous-works',
  standalone: true,
    imports: [CommonModule], // ✅ مهم جداً هنا

  template: `
    <div>
      <h6 class="text-success">الأعمال السابقة</h6>
      <div class="row g-3">
        <div class="col-md-6" *ngFor="let work of [1,2,3]">
          <img src="assets/images/sample.jpg" class="img-fluid rounded mb-1" />
          <p class="small text-muted">تركيب مفتاح حائط</p>
        </div>
      </div>
    </div>
  `
})
export class PreviousWorksComponent {}
