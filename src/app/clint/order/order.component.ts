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
  selectedStatusLabel: string = 'الطلبات الجديدة';

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

  /** تحميل الطلبات */
  fetchOrders(status: number): void {
    this.errorMessage = '';
    const query: RequestQueryDTO = { userId: this.userId, status: status };

    this.requestService.getUserRequests(query).subscribe({
      next: (res) => {
        const result = Array.isArray(res) ? res : [res];

        this.orders = result
          .map(order => ({
            ...order,
            visitDate: order.visitingDate,
            departmentName: order.categoryName,
            serviceType: order.servicesType,
            technicianName: order.technicianName || 'غير متوفر',
            technicianNumber: order.technicianNumber || 'غير متوفر',
            tempRating: 0,
            tempComment: '',
            isRated: order.isRated || false
          }))
          .sort((a, b) => b.id - a.id);

        if (this.orders.length === 0) {
          this.errorMessage = '@ لا توجد طلبات في هذه الحالة.';
        }
      },
      error: () => {
        this.errorMessage = '@ حدث خطأ أثناء تحميل الطلبات.';
      }
    });
  }

  /** إلغاء الطلب */
  cancelOrder(orderId: number): void {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    this.requestService.cancelRequest(orderId).subscribe({
      next: () => {
        // ✅ حدث الـ UI فوراً
        this.orders = this.orders.filter(order => order.id !== orderId);
        this.successMessage = '✅ تم إلغاء الطلب بنجاح';
        this.clearMessages();
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء محاولة إلغاء الطلب.';
        this.clearMessages();
      }
    });
  }

  /** تغيير حالة الطلب محلياً بعد ما السيرفر يرجع OK */
  updateOrderStatus(orderId: number, newState: number): void {
    this.requestService.updateOrderState(orderId, newState).subscribe({
      next: (res: any) => {
        if (res) {
          // ✅ لو الـ API رجعت الطلب الجديد، استبدل الطلب به
          this.orders = this.orders.map(o => o.id === orderId ? { ...o, status: newState } : o);
          this.successMessage = '✅ تم تحديث حالة الطلب';
        } else {
          this.errorMessage = '❌ لم يتم تحديث حالة الطلب';
        }
        this.clearMessages();
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء تحديث حالة الطلب.';
        this.clearMessages();
      }
    });
  }

  setStepFromOrderStatus(status: number): void {
    this.currentStep = Math.min(Math.max(status - 1, 0), this.statusSteps.length - 1);
  }

  /** إضافة تقييم */
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
      `/api/Rating/Create`,
      JSON.stringify(ratingData),
      {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'text' as 'json'
      }
    ).subscribe({
      next: (res: any) => {
        order.isRated = true; // ✅ عدل الطلب محلياً بحيث يختفي زر التقييم
        this.successMessage = '✅ تم إرسال التقييم';
        this.clearMessages();
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء إرسال التقييم.';
        this.clearMessages();
      }
    });
  }

  changeStatusFilter(status: number, label?: string): void {
    this.selectedStatus = status;
    if (label) this.selectedStatusLabel = label;
    this.fetchOrders(status);
  }

  /** تنظيف الرسائل بعد 3 ثواني */
  clearMessages() {
    setTimeout(() => {
      this.successMessage = null;
      this.errorMessage = null;
    }, 3000);
  }
}
