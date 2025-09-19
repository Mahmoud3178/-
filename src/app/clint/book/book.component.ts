import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

import { CreateRequestDto } from '../../DTOS/create-request.dto';
import { RequestService } from '../../services/request.service';

declare var bootstrap: any;

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, AfterViewInit {
  bookForm: FormGroup;

  @ViewChild('locationModal') locationModalRef!: ElementRef;
  map: L.Map | null = null;
  marker: L.Marker | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;
  departmentsOptions: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private requestService: RequestService,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.bookForm = this.fb.group({
      serviceType: ['', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      description: ['', Validators.required],
      address: this.fb.group({
        city: ['', Validators.required],
        area: ['', Validators.required],
        street: ['', Validators.required],
        buildingNumber: ['', Validators.required],
        floorNumber: ['', Validators.required],
        apartmentNumber: ['', Validators.required],
        lat: ['', Validators.required],
        lng: ['', Validators.required]
      })
    });
  }

  ngOnInit(): void {
    this.loadDepartments();

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

  ngAfterViewInit(): void {}

  loadDepartments(): void {
    const url = '/api/Category/GetAll';
    this.http.get<any[]>(url).subscribe({
      next: (categories) => {
        this.departmentsOptions = categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }));
      },
      error: (err) => {
        console.error('خطأ في تحميل الأقسام', err);
        this.departmentsOptions = [];
      }
    });
  }

  openModal() {
    const modal = new bootstrap.Modal(this.locationModalRef.nativeElement);
    modal.show();

    setTimeout(() => {
      const defaultLat = 26.1551;
      const defaultLng = 32.7160;

      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      const userLat = user?.lat || defaultLat;
      const userLng = user?.lng || defaultLng;

      if (!this.map) {
        this.map = L.map('map').setView([userLat, userLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.marker = L.marker([userLat, userLng], { draggable: true }).addTo(this.map);

        this.marker.on('dragend', async () => {
          const latLng = this.marker!.getLatLng();

          this.bookForm.get('address.lat')?.setValue(latLng.lat);
          this.bookForm.get('address.lng')?.setValue(latLng.lng);

          const reverse = await this.reverseGeocode(latLng.lat, latLng.lng);
          if (reverse) {
            this.bookForm.get('address.city')?.setValue(reverse.city || reverse.town || '');
            this.bookForm.get('address.area')?.setValue(reverse.suburb || '');
            this.bookForm.get('address.street')?.setValue(reverse.road || '');
            this.cd.markForCheck();
          }
        });
      } else {
        this.map.invalidateSize();
        this.map.setView([userLat, userLng], 13);
        if (this.marker) this.marker.setLatLng([userLat, userLng]);
      }
    }, 300);
  }

  confirmAddress() {
    // مجرد إغلاق المودال بعد ما يعبّي اليوزر البيانات
    // القيم موجودة داخل الـ FormGroup بالفعل
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.bookForm.valid) {
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      if (!user || !user.id) {
        this.errorMessage = '@ لم يتم تسجيل الدخول';
        return;
      }

      const address = this.bookForm.value.address;

      const payload: CreateRequestDto = {
        visitingDate: this.bookForm.value.date,
        description: this.bookForm.value.description,
        categoryName: this.bookForm.value.category,
        serviceType: this.bookForm.value.serviceType,
        userId: user.id,
        city: address.city,
        area: address.area,
        street: address.street,
        buildingNumber: address.buildingNumber,
        floorNumber: address.floorNumber,
        distinctiveMark: `Lat: ${address.lat}, Lng: ${address.lng}`,
        status: 1
      };

      this.requestService.createRequest(payload).subscribe({
        next: (createdId: number) => {
          this.successMessage = '@ تم إرسال الطلب بنجاح';
          this.bookForm.reset();
          setTimeout(() => {
            this.router.navigate(['/search'], {
              queryParams: {
                requestId: createdId,
                lat: address.lat,
                lng: address.lng,
                range: 10000
              }
            });
          }, 1000);
        },
        error: () => {
          this.errorMessage = '@ فشل إرسال الطلب - تحقق من الاتصال أو البيانات';
        }
      });
    } else {
      this.bookForm.markAllAsTouched();
      this.errorMessage = '@ يرجى تعبئة جميع الحقول المطلوبة';
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<any> {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.address;
  }
}
