import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

  private lat!: number;
  private lng!: number;
  private range!: number;
  private retryCount = 0;
  private maxRetries = 10; // نحاول 10 مرات كحد أقصى

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngAfterViewInit() {
    const canvas = this.radarCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 300;
    canvas.height = 300;

    this.route.queryParams.subscribe(params => {
      const requestId = params['requestId'];
      this.lat = parseFloat(params['lat']);
      this.lng = parseFloat(params['lng']);
      this.range = parseInt(params['range'], 10) || 10000;

      if (requestId) {
        this.loadRequestData(requestId);
      }

      if (this.lat && this.lng) {
        this.getNearbyTechnicians();
      }
    });

    this.animateRadar();
  }

  loadRequestData(requestId: string) {
    const url = `/api/Requests/GetById?id=${requestId}`;
    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.formData.serviceType = data.servicesType === 0 ? 'سباكة' : 'كهرباء';
        this.formData.categoryName = data.categoryName || '';
        this.formData.description = data.description || '';
        this.formData.city = `${data.city || ''} ${data.area || ''} ${data.street || ''}`.trim();

        // ✅ بعد ما نجيب الداتا نعيد البحث مع الفلترة على أساس الكاتيجوري
        this.getNearbyTechnicians();
      },
      error: (err) => {
        console.error('❌ Error loading request data:', err);
      }
    });
  }

  getNearbyTechnicians() {
    const url = `/api/Services/NearestTechnician?latitude=${this.lat}&longitude=${this.lng}&range=${this.range}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        if (Array.isArray(res) && res.length > 0) {
          // ✅ فلترة الفنيين حسب الكاتيجوري
          const filtered = res.filter(p => {
            return this.formData.categoryName
              ? p.categoryName?.trim() === this.formData.categoryName.trim()
              : true; // لو مفيش كاتيجوري، رجّع الكل
          });

          this.providers = filtered.map(p => ({
            id: p.id,
            name: p.name,
            phoneNumber: p.phoneNumber,
            email: p.email,
            rating: p.rating,
            description: p.categoryName || 'بدون وصف',
            image: this.normalizeImage(p.imageUrl),
            x: (p.long - this.lng) * 1000,
            y: (p.lat - this.lat) * -1000
          }));

          console.log(`✅ تم العثور على ${this.providers.length} مزود خدمة مطابق للفئة.`);

          // لو مفيش مزودين مطابقين، نحاول تاني لحد maxRetries
          if (this.providers.length === 0 && this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`⏳ إعادة المحاولة (${this.retryCount}/${this.maxRetries})...`);
            setTimeout(() => this.getNearbyTechnicians(), 3000);
          }
        } else {
          this.providers = [];
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`⏳ إعادة المحاولة (${this.retryCount}/${this.maxRetries})...`);
            setTimeout(() => this.getNearbyTechnicians(), 3000);
          } else {
            console.warn('⚠️ لم يتم العثور على مزودين بعد عدة محاولات.');
          }
        }
      },
      error: (err) => {
        console.error('❌ Error fetching technicians:', err);
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => this.getNearbyTechnicians(), 3000);
        }
      }
    });
  }

  private normalizeImage(path: string | null | undefined): string {
    if (!path || typeof path !== "string" || path.trim() === "") {
      return "assets/images/default-avatar.png";
    }

    if (path.startsWith("data:image")) return path;

    if (path.includes("on-demand-service-backend.runasp.net")) {
      let safePath = path.replace("http://", "https://");
      const parts = safePath.split("/");
      const fileName = encodeURIComponent(parts.pop()!);
      return parts.join("/") + "/" + fileName;
    }

    if (path.startsWith("http")) return path;

    const fileName = encodeURIComponent(path.split("/").pop()!);
    return `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`;
  }

  reserveService(technicianId: string) {
    const requestId = this.route.snapshot.queryParamMap.get('requestId');

    if (!requestId || !technicianId) {
      alert('حدث خطأ في البيانات');
      return;
    }

    const url = `/api/Requests/reservationTechnician?Technicianid=${technicianId}&RequestId=${requestId}`;

    this.http.post(url, null, { responseType: 'text' }).subscribe({
      next: (res) => {
        console.log('✅ تم الحجز:', res);
        const modalElement = document.getElementById('successModal');
        if (modalElement) {
          const successModal = new bootstrap.Modal(modalElement);
          successModal.show();

          modalElement.addEventListener('hidden.bs.modal', () => {
            this.router.navigate(['/order']);
          });
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
