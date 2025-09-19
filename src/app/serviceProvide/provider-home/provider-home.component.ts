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
      this.loadCompletedOrdersCount();
    } else {
      console.error('⚠️ لا يوجد بيانات تسجيل دخول');
    }
  }

  // ✅ تحميل الطلبات مع ترتيب الأحدث أولاً
  loadOrders(status: number, label: string) {
    this.selectedStatus = status;
    this.selectedStatusLabel = label;

    const technicianId = this.provider.id;

    this.requestService.getTechnicianRequests(technicianId, status).subscribe({
      next: (data) => {
        this.orders = (Array.isArray(data) ? data : [])
          .map(order => ({ ...order, accepted: false }))
          .sort((a, b) => new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime());
      },
      error: (err) => {
        console.error('❌ فشل في تحميل الطلبات:', err);
      }
    });
  }

  // ✅ قبول الطلب مع ترتيب القائمة بعد الحذف
  acceptOrder(order: any) {
    this.requestService.acceptRequest(order.id).subscribe({
      next: () => {
        this.successMessage = '✅ تم قبول الطلب بنجاح';
        this.clearMessagesAfterDelay();
        this.orders = this.orders
          .filter(o => o.id !== order.id)
          .sort((a, b) => new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime());
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء قبول الطلب';
        this.clearMessagesAfterDelay();
      }
    });
  }

  // ✅ رفض الطلب مع ترتيب القائمة بعد الحذف
  rejectOrder(requestId: number) {
    this.requestService.rejectRequest(requestId).subscribe({
      next: () => {
        this.successMessage = '✅ تم رفض الطلب بنجاح';
        this.clearMessagesAfterDelay();
        this.orders = this.orders
          .filter(o => o.id !== requestId)
          .sort((a, b) => new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime());
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء رفض الطلب';
        this.clearMessagesAfterDelay();
      }
    });
  }

  // ✅ تحديث حالة الطلب مع إعادة الترتيب
  updateOrderStatus(orderId: number, newState: number) {
    this.requestService.updateOrderState(orderId, newState).subscribe({
      next: () => {
        this.successMessage = '✅ تم تحديث حالة الطلب بنجاح';
        this.clearMessagesAfterDelay();

        this.orders = this.orders.map(o =>
          o.id === orderId ? { ...o, status: newState } : o
        );

        this.orders.sort((a, b) =>
          new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime()
        );
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء تحديث حالة الطلب';
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

  // --- الخريطة ---
  showMapModal = false;
  map: L.Map | null = null;

  openLocationMap() {
    this.showMapModal = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.initMap(lat, lng);
        this.updateLocationOnServer(lat, lng);
      },
      (error) => {
        console.error('❌ فشل في الحصول على الموقع:', error);
        alert('حدث خطأ أثناء تحديد الموقع. تأكد من السماح بالموقع في المتصفح.');
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

    const marker = L.marker([lat, lng], { draggable: true }).addTo(this.map)
      .bindPopup('موقعك الحالي')
      .openPopup();

    marker.on('dragend', () => {
      const newLatLng = marker.getLatLng();
      this.updateLocationOnServer(newLatLng.lat, newLatLng.lng);
    });
  }

  updateLocationOnServer(lat: number, lng: number) {
    const technicianId = this.provider.id;
    const apiUrl = `http://on-demand-service-backend.runasp.net/api/Services/UpdateLat_long?technicianId=${technicianId}&lat=${lat}&lng=${lng}`;

    fetch(apiUrl, { method: 'POST' })
      .then(res => res.ok ? console.log('✅ تم تحديث الموقع') : console.error('❌ فشل:', res.statusText))
      .catch(err => console.error('❌ خطأ:', err));
  }

  loadCompletedOrdersCount() {
    if (!this.provider.id) return;
    this.requestService.getCompletedRequestsCount(this.provider.id).subscribe({
      next: (res) => {
        this.provider.orders = Number(res);
      }
    });
  }
}
