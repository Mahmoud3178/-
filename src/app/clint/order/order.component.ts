import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../services/request.service';
import { RequestQueryDTO } from '../../DTOS/request-query.dto';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  statusSteps = ['تم الموافقة', 'في الطريق', 'وصل الفني', 'جاري التنفيذ', 'تم الانتهاء'];
  currentStep = 0;
  orders: any[] = [];
  selectedStatus: number = 1;
  userId: number = 0;
successMessage: string | null = null;
errorMessage: string | null = null;
selectedStatusLabel: string = 'الطلبات الجديدة'; // الافتراضي

  constructor(private requestService: RequestService, private http: HttpClient) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;

    if (!this.userId) {
      this.errorMessage = '@ لم يتم العثور على بيانات المستخدم.';
      return;
    }

    this.fetchOrders(this.selectedStatus);


  }

  fetchOrders(status: number): void {
    this.errorMessage = '';
    const query: RequestQueryDTO = {
      userId: this.userId,
      status: status
    };

    this.requestService.getUserRequests(query).subscribe({
      next: (res) => {
        const result = Array.isArray(res) ? res : [res];

        // تهيئة tempRating و tempComment لكل طلب
        this.orders = result.map(order => ({
          ...order,
          visitDate: order.visitingDate,
          departmentName: order.categoryName,
          serviceType: order.servicesType,
          tempRating: 0,      // 👈 تهيئة تقييم مؤقت صفر
          tempComment: '',    // 👈 تهيئة تعليق مؤقت فارغ
          isRated: order.isRated || false  // 👈 حالة التقييم (لو متوفرة)
        }));

        if (this.orders.length === 0) {
          this.errorMessage = '@ لا توجد طلبات في هذه الحالة.';
        }
      },
      error: () => {
        this.errorMessage = '@ حدث خطأ أثناء تحميل الطلبات.';
      }
    });
  }



  setStepFromOrderStatus(status: number): void {
    this.currentStep = Math.min(Math.max(status - 1, 0), this.statusSteps.length - 1);
  }

  cancelOrder(orderId: number): void {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    this.requestService.cancelRequest(orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(order => order.id !== orderId);
      },
      error: () => {
        alert('حدث خطأ أثناء محاولة إلغاء الطلب.');
      }
    });
  }

  setRating(order: any, stars: number): void {
    order.tempRating = stars;
  }

submitRating(order: any): void {
  if (!order.tempRating || order.tempRating === 0) {
    alert('من فضلك اختر تقييمًا.');
    return;
  }

  const ratingData = {
    id: 0,
    requestId: order.id,
    userId: this.userId,
    technicianId: order.technicianId,
    ratingValue: order.tempRating,
    comment: order.tempComment || ''
  };

  this.http.post(
    'http://on-demand-service-backend.runasp.net/api/Rating/Create',
    JSON.stringify(ratingData),
    {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'text' as 'json'   // ✅ أضفناها هنا زي ما طلبت
    }
  ).subscribe({
    next: (res: any) => {
      order.isRated = true;
      alert(res);  // هيطبع الرسالة: "The rating was saved successfully."
    },
    error: () => {
      alert('حدث خطأ أثناء إرسال التقييم.');
    }
  });
}


changeStatusFilter(status: number, label?: string): void {
  this.selectedStatus = status;

  if (label) {
    this.selectedStatusLabel = label;
  }

  this.fetchOrders(status);
}

}
