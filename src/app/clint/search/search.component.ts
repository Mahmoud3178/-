import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements AfterViewInit {
  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;

  providers: any[] = [];
  ctx!: CanvasRenderingContext2D;
  angle = 0;

  formData: any = {
    serviceType: '',
    categoryName: '',
    description: '',
    city: ''
  };

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngAfterViewInit() {
    const canvas = this.radarCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 300;
    canvas.height = 300;

    this.route.queryParams.subscribe(params => {
      const requestId = params['requestId'];
      const lat = parseFloat(params['lat']);
      const lng = parseFloat(params['lng']);
      const range = parseInt(params['range'], 10) || 10000;

      if (requestId) {
        this.loadRequestData(requestId);
      }

      if (lat && lng) {
        this.getNearbyTechnicians(lat, lng, range);
      }
    });

    this.animateRadar();
  }

  loadRequestData(requestId: string) {
    const url = `/api/Requests/GetById?id=${requestId}`;  // نسبي
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.formData.serviceType = data.servicesType === 0 ? 'سباكة' : 'كهرباء';
        this.formData.categoryName = data.categoryName || '';
        this.formData.description = data.description || '';
        this.formData.city = `${data.city || ''} ${data.area || ''} ${data.street || ''}`.trim();
      },
      error: (err) => {
        console.error('❌ Error loading request data:', err);
      }
    });
  }

getNearbyTechnicians(lat: number, lng: number, range: number) {
  const url = `/api/Services/NearestTechnician?latitude=${lat}&longitude=${lng}&range=${range}`;

  this.http.get<any[]>(url).subscribe({
    next: (res) => {
      if (Array.isArray(res) && res.length > 0) {
        this.providers = res.map(p => {
          return {
            id: p.id,
            name: p.name,
            phoneNumber: p.phoneNumber,
            email: p.email,
            rating: p.rating,
            description: p.nameServices || p.categoryName || 'بدون وصف',
            image: this.getImagePath(p.imageUrl), // ✅ هنا
            x: (p.long - lng) * 1000,
            y: (p.lat - lat) * -1000
          };
        });
      } else {
        this.providers = [];
      }
    },
    error: (err) => {
      console.error('❌ Error fetching technicians:', err);
      this.providers = [];
    }
  });
}
getImagePath(imageValue: string | null | undefined): string {
  // 1️⃣ fallback
  if (!imageValue || typeof imageValue !== "string" || imageValue.trim() === "") {
    return "assets/images/default-avatar.png";
  }

  try {
    // 2️⃣ لو JSON Array أو Object
    const parsed = JSON.parse(imageValue);

    // لو Array
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (typeof first === "string" && first.trim() !== "") {
        return this.normalizeImage(first);
      }
    }

    // لو Object فيه imageUrl أو imageUrll
    if (!Array.isArray(parsed)) {
      const url = parsed.imageUrl || parsed.imageUrll;
      if (url && typeof url === "string") {
        return this.normalizeImage(url);
      }
    }
  } catch {
    // 3️⃣ مش JSON → string عادي
    return this.normalizeImage(imageValue);
  }

  return "assets/images/default-avatar.png";
}

// ✨ دالة مساعدة لتوحيد بناء اللينك
private normalizeImage(path: string): string {
  if (!path || typeof path !== "string") {
    return "assets/images/default-avatar.png";
  }

  // Base64 (جاهز)
  if (path.startsWith("data:image")) {
    return path;
  }

  // Base64 خام (من غير prefix)
  if (/^[A-Za-z0-9+/=]+$/.test(path) && path.length > 50) {
    return "data:image/jpeg;base64," + path;
  }

  // لينك كامل من السيرفر
  if (path.startsWith("http://on-demand-service-backend.runasp.net")) {
    return path.replace("http://", "https://");
  }
  if (path.startsWith("https://on-demand-service-backend.runasp.net")) {
    return path;
  }

  // لينك خارجي
  if (path.startsWith("http")) {
    return path;
  }

  // مجرد اسم ملف
  const fileName = path.split("/").pop();
  return `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`;
}



  reserveService(technicianId: string) {
    const requestId = this.route.snapshot.queryParamMap.get('requestId');

    if (!requestId || !technicianId) {
      alert('حدث خطأ في البيانات');
      return;
    }

    const url = `/api/Requests/reservationTechnician?Technicianid=${technicianId}&RequestId=${requestId}`;  // نسبي

    this.http.post(url, null, { responseType: 'text' }).subscribe({
      next: (res) => {
        console.log('✅ تم الحجز:', res);
        const modalElement = document.getElementById('successModal');
        if (modalElement) {
          const successModal = new bootstrap.Modal(modalElement);
          successModal.show();
        }
      },
      error: (err) => {
        console.error('❌ فشل الحجز:', err);
        alert('❌ حدث خطأ أثناء إرسال الطلب، حاول لاحقًا');
      }
    });
  }

  animateRadar() {
    this.ctx.clearRect(0, 0, 300, 300);

    this.ctx.strokeStyle = '#B6D1BD';
    for (let i = 1; i <= 4; i++) {
      this.ctx.beginPath();
      this.ctx.arc(150, 150, i * 30, 0, 2 * Math.PI);
      this.ctx.stroke();
    }

    this.ctx.beginPath();
    this.ctx.moveTo(150, 150);
    const rad = this.angle * (Math.PI / 180);
    this.ctx.fillStyle = 'rgba(0, 128, 0, 0.2)';
    this.ctx.arc(150, 150, 150, rad, rad + 0.4);
    this.ctx.fill();

    for (const p of this.providers) {
      const px = 150 + p.x;
      const py = 150 + p.y;
      const img = new Image();
      img.src = p.image || 'assets/images/default-avatar.png';
      img.onload = () => {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(px, py, 15, 0, 2 * Math.PI);
        this.ctx.clip();
        this.ctx.drawImage(img, px - 15, py - 15, 30, 30);
        this.ctx.restore();

        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(p.name, px - 20, py + 30);
      };
    }

    this.angle = (this.angle + 2) % 360;
    requestAnimationFrame(() => this.animateRadar());
  }
}
