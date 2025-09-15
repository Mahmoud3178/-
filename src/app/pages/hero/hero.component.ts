import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  constructor(private router: Router, private authService: AuthService) {}

  goToBook() {
    this.authService.isLoggedIn$.pipe(take(1)).subscribe((loggedIn) => {
      if (loggedIn) {
        this.router.navigate(['/book']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
