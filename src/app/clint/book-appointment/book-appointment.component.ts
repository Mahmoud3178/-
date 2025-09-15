import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent {
  activeTab: 'overview' | 'reviews' | 'works' = 'overview';

  selectedDate: string = '2025-05-28';
  availableTimes: string[] = [
    'ص1: p1', 'ص2: p2', 'ص3: p3',
    'م4: p4', 'م5: p5', 'م6: p6'
  ];

  reviews = [
    {
      name: 'عادل محمد',
      department: 'قسم الكهرباء',
      date: '05/07/2024 - 06:30PM',
      rating: 5,
      comment: 'فني ممتاز، جاء في الموعد واشتغل بدقة.',
      avatar: 'assets/images/user1.jpg'
    },
    {
      name: 'محمد علي',
      department: 'قسم الكهرباء',
      date: '05/07/2024 - 06:30PM',
      rating: 4,
      comment: 'خدمة جيدة لكن تأخر قليلاً.',
      avatar: 'assets/images/user2.jpg'
    }
  ];

  works = [
    {
      title: 'تركيب مفاتيح حائط',
      description: 'لورييم إيبسوم طريقة لكتابة النصوص في النشر.',
      images: [
        { src: 'assets/images/work1.jpg', label: 'قبل' },
        { src: 'assets/images/work2.jpg', label: 'بعد' }
      ]
    },
    {
      title: 'تركيب فيش كهرباء',
      description: 'لورييم إيبسوم طريقة لكتابة النصوص في النشر.',
      images: [
        { src: 'assets/images/work3.jpg', label: 'قبل' },
        { src: 'assets/images/work4.jpg', label: 'بعد' }
      ]
    }
  ];
}
