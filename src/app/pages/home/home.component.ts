import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../hero/hero.component';
import { OffersComponent } from '../offers/offers.component';
import { FeaturesComponent } from '../features/features.component';
import { HowToOrderComponent } from '../how-to-order/how-to-order.component';
import { ServicesComponent } from '../services/services.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    OffersComponent,
    FeaturesComponent,
    HowToOrderComponent,
    ServicesComponent,
    TestimonialsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
