// src/app/pages/provider-home/provider-home.component.ts
import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet';
import { finalize } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-provider-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, RouterLinkActive],
  templateUrl: './provider-home.component.html',
  styleUrls: ['./provider-home.component.css']
})
export class ProviderHomeComponent implements OnInit {
  @ViewChild('locationModal') locationModalRef!: ElementRef;

  toggleStatus = true;
  selectedDate = new Date().toISOString().substring(0, 10);
  selectedStatusLabel = 'الطلبات الجديدة';
  selectedStatus = 1;

  provider: any = {};
  orders: any[] = [];

  successMessage: string | null = null;
  errorMessage: string | null = null;
  processingIds = new Set<number>();

  map: L.Map | null = null;
  marker: L.Marker | null = null;

  // العنوان الأساسي للمدينة والمنطقة فقط
  address: any = {
    city: '',
    area: '',
    lat: '',
    lng: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private requestService: RequestService,
    private cd: ChangeDetectorRef
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

    // إعداد أيقونة الافتراضية للماركر
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      shadowSize: [41, 41],
      popupAnchor: [1, -34]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }

  /** تحميل الطلبات */
  loadOrders(status: number, label: string) {
    this.selectedStatus = status;
    this.selectedStatusLabel = label;

    this.requestService.getTechnicianRequests(this.provider.id, status).subscribe({
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
        this.errorMessage = '❌ خطأ أثناء قبول الطلب';
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
        this.successMessage = '✅ تم رفض الطلب';
        this.clearMessagesAfterDelay();
        this.orders = this.orders.filter(o => o.id !== requestId);
        this.sortOrders();
      },
      error: () => {
        this.errorMessage = '❌ خطأ أثناء رفض الطلب';
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
        this.successMessage = '✅ تم تحديث حالة الطلب';
        this.clearMessagesAfterDelay();
        this.applyLocalStatusChange(orderId, newState);
        this.sortOrders();
      },
      error: () => {
        this.errorMessage = '❌ خطأ أثناء تحديث الطلب';
        this.clearMessagesAfterDelay();
      }
    });
  }

  /** تحديث محلي */
  private applyLocalStatusChange(orderId: number, newState: number) {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, status: newState } : o);
    if (newState === 5) this.provider.orders = (this.provider.orders || 0) + 1;
  }

  /** ترتيب */
  private sortOrders() {
    this.orders.sort((a: any, b: any) => {
      const ta = a.visitingDate ? new Date(a.visitingDate).getTime() : (a.id || 0);
      const tb = b.visitingDate ? new Date(b.visitingDate).getTime() : (b.id || 0);
      return ta - tb;
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
    if (confirm("هل تريد تسجيل الخروج؟")) {
      localStorage.removeItem('user');
      this.authService.logout();
      this.router.navigate(['/']);
    }
  }

  // === الخريطة ===
  openModal() {
    const modal = new bootstrap.Modal(this.locationModalRef.nativeElement);
    modal.show();

    setTimeout(() => {
      const defaultLat = 24.7136, defaultLng = 46.6753;
      const userLat = this.address.lat || defaultLat;
      const userLng = this.address.lng || defaultLng;

      if (!this.map) {
        this.map = L.map('providerMap').setView([userLat, userLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.marker = L.marker([userLat, userLng], { draggable: true }).addTo(this.map);
        this.marker.on('dragend', async () => {
          const latLng = this.marker!.getLatLng();
          this.address.lat = latLng.lat;
          this.address.lng = latLng.lng;

          const reverse = await this.reverseGeocode(latLng.lat, latLng.lng);
          if (reverse) {
            this.address.city = reverse.city || reverse.town || '';
            this.address.area = reverse.suburb || '';
            this.cd.detectChanges();
          }

          this.updateLocationOnServer(latLng.lat, latLng.lng);
        });
      } else {
        this.map.invalidateSize();
        this.map.setView([userLat, userLng], 13);
        if (this.marker) this.marker.setLatLng([userLat, userLng]);
      }
    }, 300);
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.address;
  }

  updateLocationOnServer(lat: number, lng: number) {
    const apiUrl = `http://on-demand-service-backend.runasp.net/api/Services/UpdateLat_long?technicianId=${this.provider.id}&lat=${lat}&lng=${lng}`;
    fetch(apiUrl, { method: 'POST' })
      .then(res => res.ok ? console.log('✅ الموقع اتحدث') : console.error('❌ فشل:', res.statusText))
      .catch(err => console.error('❌ خطأ:', err));
  }

  loadCompletedOrdersCount() {
    if (!this.provider.id) return;
    this.requestService.getCompletedRequestsCount(this.provider.id).subscribe({
      next: (res) => this.provider.orders = Number(res),
      error: () => this.provider.orders = 0
    });
  }
}
