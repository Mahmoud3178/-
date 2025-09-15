import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asks.component.html',
  styleUrls: ['./asks.component.css']
})
export class AsksComponent {
  faqs = [
    {
      question: 'لماذا أستخدم موقع صيانة الآن ؟',
      answer: 'صيانة الآن يسهل لأصحاب المنازل والمنشآت الحصول على باقة من الخدمات المتعددة بأقل جهد، وبالوقت المناسب، وبأسعار تنافسية مع ضمان للعمل.',
      open: false
    },
    {
      question: 'هل يوجد ضمان على العمل؟',
      answer: 'نعم، جميع مزودي خدماتنا تعهدوا على تقديم ضمان لعملائهم حسب الشروط، ويمكن التواصل مع فريق الدعم للمراجعة في حال وجود مشكلة.',
      open: false
    },
    {
      question: 'ماذا يحدث عند إلغاء الطلب ؟',
      answer: 'يتم مراجعة الحالة، وقد يتم تطبيق رسوم إلغاء حسب توقيت الإلغاء وشروط المزود.',
      open: false
    },
    {
      question: 'ماذا أفعل لو تأخر مقدم الخدمة عن الموعد ؟',
      answer: 'يمكنك التواصل مع الدعم وسيتم مراجعة الحالة فوراً وتعويضك إذا لزم الأمر.',
      open: false
    }
  ];

  toggle(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
