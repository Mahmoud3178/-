import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthHttpService } from '../../services/auth-http.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  selectedRole: 'client' | 'provider' = 'client';
  imagePreview: string | null = null;
  userPhotoFile: File | null = null;

  departmentsOptions: { id: number, name: string }[] = [];
  serviceAreasOptions: { id: number, name: string }[] = [];

  rolePhotos: { [key in 'client' | 'provider']?: { file: File, preview: string } } = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authHttp: AuthHttpService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadServiceAreas();
    this.loadDepartments();
  }

  createForm(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
          ]
        ],
        confirmPassword: ['', Validators.required],
        city: ['', Validators.required],   // ✅ بقت دروب داون
        department: [''],
        nationalId: [''],
        serviceAreas: [''],
        workingHours: [''],
        experienceYears: [''],
        bankName: [''],
        bankAccountNumber: [''],
        serviceName: ['']
      },
      { validators: this.passwordsMatchValidator }
    );

    this.updateValidatorsForRole();
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  setRole(role: 'client' | 'provider') {
    this.selectedRole = role;

    if (this.rolePhotos[role]) {
      this.userPhotoFile = this.rolePhotos[role]!.file;
      this.imagePreview = this.rolePhotos[role]!.preview;
    } else {
      this.userPhotoFile = null;
      this.imagePreview = null;
    }

    this.updateValidatorsForRole();
  }

  updateValidatorsForRole(): void {
    const isProvider = this.selectedRole === 'provider';

    this.registerForm.get('department')?.setValidators(isProvider ? [Validators.required] : []);
    this.registerForm.get('nationalId')?.setValidators(isProvider ? [Validators.pattern(/^\d{14}$/)] : []);
    this.registerForm.get('serviceAreas')?.setValidators(isProvider ? [Validators.required] : []);
    this.registerForm.get('workingHours')?.setValidators(isProvider ? [Validators.required] : []);
    this.registerForm.get('experienceYears')?.setValidators(isProvider ? [Validators.required] : []);
    this.registerForm.get('bankName')?.setValidators(isProvider ? [Validators.required] : []);
    this.registerForm.get('bankAccountNumber')?.setValidators(isProvider ? [Validators.required] : []);
    this.registerForm.get('serviceName')?.setValidators(isProvider ? [Validators.required] : []);

    this.registerForm.updateValueAndValidity();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const preview = reader.result as string;
        this.userPhotoFile = file;
        this.imagePreview = preview;

        this.rolePhotos[this.selectedRole] = { file, preview };

        const otherRole = this.selectedRole === 'client' ? 'provider' : 'client';
        this.rolePhotos[otherRole] = { file, preview };
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.userPhotoFile) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const dto = this.mapFormToDTO();
    const formData = this.buildFormData(dto);

    const request$ =
      this.selectedRole === 'client'
        ? this.authHttp.registerUser(formData)
        : this.authHttp.registerTechnician(formData);

    request$.subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        alert('حدث خطأ أثناء تسجيل الحساب، حاول مرة أخرى');
      }
    });
  }

  private mapFormToDTO(): any {
    const form = this.registerForm.value;

    if (this.selectedRole === 'provider') {
      return {
        Name: form.fullName,
        Email: form.email,
        PhoneNumber: form.phone,
        Password: form.password,
        ConfirmPassword: form.confirmPassword,
        City: form.city,   // ✅ ID من الدروب داون
        Category: form.department,
        NationalId: form.nationalId,
        ServiceAreas: form.serviceAreas,
        WorkingHours: form.workingHours,
        YearsOfExperience: form.experienceYears,
        BankName: form.bankName,
        BankAccountNumber: form.bankAccountNumber,
        NameServices: form.serviceName
      };
    }

    return {
      Name: form.fullName,
      Email: form.email,
      PhoneNumber: form.phone,
      Password: form.password,
      ConfirmPassword: form.confirmPassword,
      City: form.city   // ✅ ID من الدروب داون
    };
  }

  private buildFormData(dto: any): FormData {
    const formData = new FormData();

    for (const key in dto) {
      if (dto[key] !== undefined && dto[key] !== null) {
        formData.append(key, dto[key]);
      }
    }

    if (this.userPhotoFile) {
      const fieldName = this.selectedRole === 'client' ? 'UserPhoto' : 'PersonalPhoto';
      formData.append(fieldName, this.userPhotoFile);
    }

    return formData;
  }

  loadServiceAreas(): void {
    const url = `/api/Places/GetAllPlaces`;
    this.http.get<{ id: number, name: string }[]>(url).subscribe({
      next: (places) => {
        this.serviceAreasOptions = places;
      },
      error: (err) => {
        console.error('خطأ في تحميل مناطق الخدمة / المدن', err);
        this.serviceAreasOptions = [];
      }
    });
  }

  loadDepartments(): void {
    const url = '/api/Category/GetAll';
    this.http.get<any[]>(url).subscribe({
      next: (categories) => {
        this.departmentsOptions = categories.map(cat => ({
          id: cat.id,
          name: cat.name
        }));
      },
      error: (err) => {
        console.error('خطأ في تحميل الأقسام', err);
        this.departmentsOptions = [];
      }
    });
  }
}
