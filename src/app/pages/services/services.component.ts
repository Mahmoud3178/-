import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../DTOS/category.dto';
import { take } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  services: (Category & { imageUrl: string })[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.http.get<Category[]>('/api/Category/GetAll').subscribe({
      next: (data) => {
        this.services = data.map((service) => {
          let imageUrl = '';

          if (service.imageBase64) {
            try {
              // نحاول نقرأها كـ JSON لو API بيرجع Array
              const parsed = JSON.parse(service.imageBase64);
              if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = `/Uploads/${parsed[0].split('/').pop()}`;
              } else if (typeof parsed === 'string') {
                // لو رجع string بس
                imageUrl = `/Uploads/${parsed.split('/').pop()}`;
              }
            } catch {
              // لو مش JSON نعتبره لينك مباشر أو اسم الصورة
              imageUrl = `/Uploads/${service.imageBase64.split('/').pop()}`;
            }
          }

          return { ...service, imageUrl };
        });
      },
      error: (err) => {
        console.error('❌ فشل تحميل الخدمات:', err);
      }
    });
  }

  goToBook() {
    this.authService.isLoggedIn$.pipe(take(1)).subscribe((loggedIn) => {
      this.router.navigate([loggedIn ? '/book' : '/login']);
    });
  }
}
