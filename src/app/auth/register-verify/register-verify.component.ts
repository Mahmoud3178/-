// ✅ register-verify.component.ts
import {
  Component, OnInit, AfterViewInit,
  ViewChildren, QueryList, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-verify.component.html',
  styleUrl: './register-verify.component.css'
})
export class RegisterVerifyComponent implements OnInit, AfterViewInit {
  verifyForm!: FormGroup;
  @ViewChildren('codeBox') codeBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.verifyForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit3: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit4: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit5: ['', [Validators.required, Validators.pattern('[0-9]')]],
      digit6: ['', [Validators.required, Validators.pattern('[0-9]')]]
    });
  }

  ngAfterViewInit(): void {
    this.codeBoxes.first.nativeElement.focus();
  }

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value && index < this.codeBoxes.length - 1) {
      this.codeBoxes.get(index + 1)?.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.codeBoxes.get(index - 1)?.nativeElement.focus();
    }
  }

  onVerify(): void {
    if (this.verifyForm.valid) {
      const code = Object.values(this.verifyForm.value).join('');
      const role = localStorage.getItem('registerRole');

      if (role === 'client' || role === 'provider') {
        this.authService.login('fake-token', {
          email: 'temp@example.com',
          role: role
        });

        if (role === 'provider') {
          this.router.navigate(['/service-provider']);
        } else {
          this.router.navigate(['/login']);
        }
      } else {
        console.error('Invalid or missing role in localStorage');
        this.router.navigate(['/login']);
      }
    } else {
      this.verifyForm.markAllAsTouched();
    }
  }
}
