import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent {
  reviews = [
    {
      name: 'محمد مصطفى',
      rating: 4,
      date: new Date('2024-07-05'),
      text: 'الإلتزام في المواعيد، والتفاعل والخدمة من أهم ما يميز هذه الشركة...'
    },
    {
      name: 'أحمد فؤاد',
      rating: 5,
      date: new Date('2024-07-02'),
      text: 'تجربة رائعة، الدعم الفني ممتاز...'
    },
    {
      name: 'هالة محمد',
      rating: 3,
      date: new Date('2024-06-30'),
      text: 'جيد جدًا ولكن توجد بعض الملاحظات...'
    },
    {
      name: 'سارة حسن',
      rating: 5,
      date: new Date('2024-06-28'),
      text: 'أفضل خدمة عملاء تعاملت معها...'
    },
    {
      name: 'ياسر عبد الله',
      rating: 4,
      date: new Date('2024-06-25'),
      text: 'ممتاز من جميع النواحي، شكراً لكم.'
    }
  ];

  currentIndex = 0;

  get visibleReviews() {
    return this.reviews.slice(this.currentIndex, this.currentIndex + 3);
  }

  nextGroup() {
    if (this.currentIndex + 3 < this.reviews.length) {
      this.currentIndex++;
    }
  }

  prevGroup() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
