// src/app/pages/provider-home/provider-home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet';
import { finalize } from 'rxjs/operators';

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

  processingIds = new Set<number>();

  showMapModal = false;
  map: L.Map | null = null;

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
    }
  }

  /** تحميل الطلبات من السيرفر وترتيبها */
  loadOrders(status: number, label: string) {
    this.selectedStatus = status;
    this.selectedStatusLabel = label;

    const technicianId = this.provider.id;

    this.requestService.getTechnicianRequests(technicianId, status).subscribe({
      next: (data) => {
        this.orders = (Array.isArray(data) ? data : []).map(order => ({ ...order }));
        this.sortOrders();
      },
      error: () => {
        this.orders = [];
      }
    });
  }

  /** قبول الطلب */
  acceptOrder(order: any) {
    if (!order?.id) return;

    this.processingIds.add(order.id);
    this.requestService.acceptRequest(order.id).pipe(
      finalize(() => this.processingIds.delete(order.id))
    ).subscribe({
      next: () => {
        this.successMessage = '✅ تم قبول الطلب بنجاح';
        this.clearMessagesAfterDelay();
        this.applyLocalStatusChange(order.id, 2);
        this.sortOrders();
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء قبول الطلب';
        this.clearMessagesAfterDelay();
      }
    });
  }

  /** رفض الطلب */
  rejectOrder(requestId: number) {
    if (!requestId) return;

    this.processingIds.add(requestId);
    this.requestService.rejectRequest(requestId).pipe(
      finalize(() => this.processingIds.delete(requestId))
    ).subscribe({
      next: () => {
        this.successMessage = '✅ تم رفض الطلب بنجاح';
        this.clearMessagesAfterDelay();
        this.orders = this.orders.filter(o => o.id !== requestId);
        this.sortOrders();
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء رفض الطلب';
        this.clearMessagesAfterDelay();
      }
    });
  }

  /** تحديث حالة الطلب */
  updateOrderStatus(orderId: number, newState: number) {
    if (!orderId) return;

    this.processingIds.add(orderId);
    this.requestService.updateOrderState(orderId, newState).pipe(
      finalize(() => this.processingIds.delete(orderId))
    ).subscribe({
      next: () => {
        this.successMessage = '✅ تم تحديث حالة الطلب بنجاح';
        this.clearMessagesAfterDelay();
        this.applyLocalStatusChange(orderId, newState);
        this.sortOrders();
      },
      error: () => {
        this.errorMessage = '❌ حدث خطأ أثناء تحديث حالة الطلب';
        this.clearMessagesAfterDelay();
      }
    });
  }

  /** تحديث الحالة محلياً */
  private applyLocalStatusChange(orderId: number, newState: number) {
    let found = false;
    this.orders = this.orders.map(o => {
      if (o.id === orderId) {
        found = true;
        return { ...o, status: newState };
      }
      return o;
    });

    if (found) {
      const updated = this.orders.find(o => o.id === orderId);
      if (updated && updated.status !== this.selectedStatus) {
        this.orders = this.orders.filter(o => o.id !== orderId);
      }
    }

    if (newState === 5) {
      this.provider.orders = (this.provider.orders || 0) + 1;
    }
  }

  /** ترتيب الطلبات (الأحدث فوق) */
  private sortOrders() {
    this.orders.sort((a: any, b: any) => {
      const ta = a.visitingDate ? new Date(a.visitingDate).getTime() : (a.id || 0);
      const tb = b.visitingDate ? new Date(b.visitingDate).getTime() : (b.id || 0);
      return ta - tb; // ✅ الأحدث فوق
    });
    this.orders = [...this.orders];
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

  // === خريطة ===
  openLocationMap() {
    this.showMapModal = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.initMap(lat, lng);
        this.updateLocationOnServer(lat, lng);
      },
      () => {
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
      },
      error: () => {
        this.provider.orders = 0;
      }
    });
  }
}
