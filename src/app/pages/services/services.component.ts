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
  styleUrl: './services.component.css'
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
        this.services = data.map(service => ({
          ...service,
          imageUrl: this.getSafeImage(service.imageBase64)
        }));
      },
      error: (err) => {
        console.error('❌ فشل تحميل الخدمات:', err);
      }
    });
  }

  /**
   * ✅ دالة شاملة للتعامل مع الصور
   */
  getSafeImage(imagePath: string | null | undefined): string {
    if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
      return 'assets/images/default-avatar.png';
    }

    try {
      const parsed = JSON.parse(imagePath);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (typeof first === 'string' && first.trim() !== '') {
          if (first.startsWith('http')) {
            return first.replace('http://', 'https://');
          }
          const fileName = first.split('/').pop();
          return `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`;
        }
      }

      if (!Array.isArray(parsed) && parsed.imageUrll) {
        const url = parsed.imageUrll;
        if (url.startsWith('http')) {
          return url.replace('http://', 'https://');
        }
        const fileName = url.split('/').pop();
        return `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`;
      }
    } catch {
      if (imagePath.startsWith('http')) {
        return imagePath.replace('http://', 'https://');
      }
      const fileName = imagePath.split('/').pop();
      return `https://on-demand-service-backend.runasp.net/Uploads/${fileName}`;
    }

    return 'assets/images/default-avatar.png';
  }

  goToBook() {
    this.authService.isLoggedIn$.pipe(take(1)).subscribe((loggedIn) => {
      this.router.navigate([loggedIn ? '/book' : '/login']);
    });
  }
}
