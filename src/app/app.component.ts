// ✅ app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeroComponent } from "./pages/hero/hero.component";
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { OffersComponent } from "./pages/offers/offers.component";
import { FeaturesComponent } from "./pages/features/features.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { TestimonialsComponent } from './pages/testimonials/testimonials.component';
import { ServicesComponent } from "./pages/services/services.component";
import { HowToOrderComponent } from './pages/how-to-order/how-to-order.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeroComponent,
    NavbarComponent,
    OffersComponent,
    FeaturesComponent,
    FooterComponent,
    TestimonialsComponent,
    ServicesComponent,
    HowToOrderComponent,CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'app';
  isAppReady = false;

  constructor(private authService: AuthService) {}

ngOnInit(): void {
  this.authService.isLoggedIn$.subscribe(() => {
    // ننتظر أول قيمة من الـ BehaviorSubject
    this.isAppReady = true;
  });
}
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
