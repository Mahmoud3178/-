import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-complete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-complete.component.html',
  styleUrls: ['./payment-complete.component.css']
})
export class PaymentCompleteComponent {
  selectedMethod: string = '';

  selectMethod(method: string) {
    this.selectedMethod = method;
  }

  applyCoupon() {
    alert('تم تطبيق كود الخصم');
  }

  confirmPayment() {
    alert(`تم تأكيد الطلب والدفع بطريقة: ${this.selectedMethod}`);
  }
}
