import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-how-to-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-to-order.component.html',
  styleUrl: './how-to-order.component.css'
})
export class HowToOrderComponent {
  steps = [
    {
      image: 'images/قم بالدفع.png',
      title: 'اطلب الخدمة',
      description: 'المناسبة لك من قائمة الخدمات'
    },
    {
      image: 'images/اختر وقت الزيارة.png',
      title: 'اختر وقت الزيارة',
      description: 'وتحديد الخدمة المناسب لك'
    },
    {
      image: 'images/قم بالدفع.png',
      title: 'قم بالدفع',
      description: 'وادخال بياناتك الشخصية'
    }
  ];
}
