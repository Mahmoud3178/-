import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent {
  offers = [
    {
      img: 'https://png.pngtree.com/background/20230405/original/pngtree-factory-worker-engineer-staff-working-in-dangerous-environment-concept-photo-picture-image_2314422.jpg',
      text: 'تركيب مروحة سقف ب 100ج بدلاً من 120ج.م'
    },
    {
      img: 'https://png.pngtree.com/background/20230405/original/pngtree-factory-worker-engineer-staff-working-in-dangerous-environment-concept-photo-picture-image_2314422.jpg',
      text: 'خصم خاص لتأسيس الكهرباء',
      code: 'R5G245'
    },
    {
      img: 'https://png.pngtree.com/background/20230405/original/pngtree-factory-worker-engineer-staff-working-in-dangerous-environment-concept-photo-picture-image_2314422.jpg',
      text: 'خصم 10% علي جميع خدمات الكهرباء',
      code: 'E5G245'
    },
    {
      img: 'https://png.pngtree.com/background/20230405/original/pngtree-factory-worker-engineer-staff-working-in-dangerous-environment-concept-photo-picture-image_2314422.jpg',
      text: 'معاينة لتركيب لوحة الكهرباء مجاناً'
    },
    {
      img: 'https://png.pngtree.com/background/20230405/original/pngtree-factory-worker-engineer-staff-working-in-dangerous-environment-concept-photo-picture-image_2314422.jpg',
      text: 'تركيب كشاف خارجي بسعر مخفض'
    }
  ];

  startIndex = 0;
  visibleCount = 4;

  get visibleOffers() {
    return this.offers.slice(this.startIndex, this.startIndex + this.visibleCount);
  }

  slideRight() {
    if (this.startIndex + this.visibleCount < this.offers.length) {
      this.startIndex++;
    }
  }

  slideLeft() {
    if (this.startIndex > 0) {
      this.startIndex--;
    }
  }
}
