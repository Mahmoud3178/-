import { Component } from '@angular/core';

@Component({
  selector: 'app-overview',
  standalone: true,
  template: `
    <div>
      <h6 class="text-success">نظرة عامة</h6>
      <ul class="list-group">
        <li class="list-group-item">القسم: الكهرباء</li>
        <li class="list-group-item">سنوات الخبرة: 5 سنوات</li>
        <li class="list-group-item">المحافظة: قنا</li>
        <li class="list-group-item">مناطق الخدمة: قنا، نجع حمادي</li>
        <li class="list-group-item">الخدمات المقدمة: صيانة مفاتيح، تركيب لمبات</li>
      </ul>
    </div>
  `
})
export class OverviewComponent {}
