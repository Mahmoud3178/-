import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-verify.component.html',
  styleUrl: './forgot-verify.component.css'
})
export class ForgotVerifyComponent implements OnInit, AfterViewInit {
  verifyForm!: FormGroup;
  @ViewChildren('codeBox') codeBoxes!: QueryList<ElementRef<HTMLInputElement>>;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // ✅ أولاً نحاول قراءة الإيميل من URL
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });

    // ✅ إذا فشلنا، نقرأه من localStorage
    if (!this.email) {
      const storedEmail = localStorage.getItem('resetEmail');
      if (storedEmail) {
        this.email = storedEmail;
      } else {
        alert('لا يوجد بريد إلكتروني متاح للتحقق.');
        this.router.navigate(['/forgot-password']);
        return;
      }
    }

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
    if (input.value && index < 5) {
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
      const otp = Object.values(this.verifyForm.value).join('');

      console.log('📤 Sending:', { email: this.email, otp });

      this.http.post('/api/Auth/VerifyOTP', {
        email: this.email,
        otp
      }).subscribe({
        next: (res) => {
          console.log('✅ Verified!', res);
          this.router.navigate(['/reset-password']);
        },
        error: (err) => {
          console.error('❌ OTP Error', err);
          alert('❌ رمز خاطئ أو الإيميل غير صحيح');
        }
      });
    } else {
      this.verifyForm.markAllAsTouched();
    }
  }
}
