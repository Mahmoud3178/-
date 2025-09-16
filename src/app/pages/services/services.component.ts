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
this.http.get<Category[]>('/api/Category/GetAll')
      .subscribe({
        next: (data) => {

       this.services = data.map(service => {
  let imageUrl = '';

  try {
    const parsed = JSON.parse(service.imageBase64);
    if (Array.isArray(parsed) && parsed.length > 0) {
      imageUrl = parsed[0]; // استعمله زي ما هو
    }
  } catch (e) {
    console.error('❌ خطأ في قراءة الصورة:', e);
  }

  return {
    ...service,
    imageUrl
  };
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
