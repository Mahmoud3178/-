// src/app/pages/provider-home/provider-home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet';


@Component({
  selector: 'app-provider-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, RouterLinkActive],
  templateUrl: './provider-home.component.html',
  styleUrls: ['./provider-home.component.css']
})
export class ProviderHomeComponent implements OnInit {
  toggleStatus = true;
  selectedDate = new Date().toISOString().substring(0, 10);
  selectedStatusLabel = 'الطلبات الجديدة';
  selectedStatus = 1;

  provider: any = {};
  orders: any[] = [];

successMessage: string | null = null;
errorMessage: string | null = null;


  constructor(
    private authService: AuthService,
    private router: Router,
    private requestService: RequestService
  ) {}

  ngOnInit() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);

      this.provider = {
        id: user.id,
        name: user.name,
        avatar: user.image,
        rating: 0,
        reviews: 0,
        orders: 0
      };

      this.loadOrders(this.selectedStatus, this.selectedStatusLabel);
    } else {
      console.error('⚠️ لا يوجد بيانات تسجيل دخول');
    }
  }

loadOrders(status: number, label: string) {
  this.selectedStatus = status;
  this.selectedStatusLabel = label;

  const technicianId = this.provider.id;

  this.requestService.getTechnicianRequests(technicianId, status).subscribe({
    next: (data) => {
      this.orders = (Array.isArray(data) ? data : []).map(order => ({
        ...order,
        accepted: false // نضيف خاصية accepted بشكل يدوي
      }));
    },
    error: (err) => {
      console.error('❌ فشل في تحميل الطلبات:', err);
    }
  });
}


acceptOrder(order: any) {
  this.requestService.acceptRequest(order.id).subscribe({
    next: () => {
      this.successMessage = '✅ تم قبول الطلب بنجاح';
      this.clearMessagesAfterDelay();

      order.accepted = true; // <-- يتم تعديل حالة الطلب محليًا
    },
    error: () => {
      this.errorMessage = '❌ حدث خطأ أثناء قبول الطلب';
      this.clearMessagesAfterDelay();
    }
  });
}

updateOrderStatus(orderId: number, newState: number) {
  this.requestService.updateOrderState(orderId, newState).subscribe({
    next: () => {
      this.successMessage = '✅ تم تحديث حالة الطلب بنجاح';
      this.clearMessagesAfterDelay();
      this.loadOrders(this.selectedStatus, this.selectedStatusLabel); // إعادة تحميل الطلبات
    },
    error: () => {
      this.errorMessage = '❌ حدث خطأ أثناء تحديث حالة الطلب';
      this.clearMessagesAfterDelay();
    }
  });
}




rejectOrder(requestId: number) {
  this.requestService.rejectRequest(requestId).subscribe({
    next: () => {
      this.successMessage = '✅ تم رفض الطلب بنجاح';
      this.clearMessagesAfterDelay();

      // ✅ إعادة تحميل الطلبات بعد الرفض
      this.loadOrders(this.selectedStatus, this.selectedStatusLabel);
    },
    error: () => {
      this.errorMessage = '❌ حدث خطأ أثناء رفض الطلب';
      this.clearMessagesAfterDelay();
    }
  });
}



  clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  logout() {
    const confirmed = confirm("هل تريد فعلاً تسجيل الخروج؟");
    if (confirmed) {
      localStorage.removeItem('user');
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }
  // ... باقي الخصائص
  showMapModal = false;
  map: L.Map | null = null;

  updateLocationOnServer(lat: number, lng: number) {
  const technicianId = this.provider.id;

  const apiUrl = `http://on-demand-service-backend.runasp.net/api/Services/UpdateLat_long?technicianId=${technicianId}&lat=${lat}&lng=${lng}`;

  fetch(apiUrl, {
    method: 'POST'
  })
  .then(res => {
    if (res.ok) {
      console.log('✅ تم تحديث الموقع على السيرفر');
    } else {
      console.error('❌ فشل في التحديث:', res.statusText);
    }
  })
  .catch(err => {
    console.error('❌ خطأ أثناء التحديث:', err);
  });
}


openLocationMap() {
  this.showMapModal = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.initMap(lat, lng); // استخدم الإحداثيات الحقيقية

      // 👇 استدعي API التحديث
      this.updateLocationOnServer(lat, lng);
    },
    (error) => {
      console.error('❌ فشل في الحصول على الموقع:', error);
      alert('حدث خطأ أثناء تحديد الموقع. تأكد من السماح بالموقع في المتصفح.');

      // fallback للإحداثيات الافتراضية
      this.initMap(24.7136, 46.6753);
    }
  );
}


  closeMapModal() {
    this.showMapModal = false;
  }

initMap(lat: number, lng: number) {
  if (this.map) {
    this.map.setView([lat, lng], 13);
    return;
  }

  this.map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  // ⬇️ أضف marker قابل للسحب
  const marker = L.marker([lat, lng], { draggable: true }).addTo(this.map)
    .bindPopup('موقعك الحالي')
    .openPopup();

  // ⬇️ لما يتحرك الماركر، حدث الموقع
  marker.on('dragend', () => {
    const newLatLng = marker.getLatLng();
    const newLat = newLatLng.lat;
    const newLng = newLatLng.lng;

    console.log('📍 تم تحريك العلامة إلى:', newLat, newLng);

    // ⬇️ حدث الموقع في السيرفر
    this.updateLocationOnServer(newLat, newLng);
  });
}
loadCompletedOrdersCount() {
  if (!this.provider.id) return;
this.requestService.getCompletedRequestsCount(this.provider.id).subscribe({
  next: (res) => {
    console.log('📡 Response:', res, typeof res);
    this.provider.orders = Number(res); // نحوله لرقم
  }
});

}


}
