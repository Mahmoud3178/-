import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-service-provide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './service-provide.component.html',
  styleUrls: ['./service-provide.component.css'],
})
export class ServiceProvideComponent {
  providerForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.providerForm = this.fb.group({
      areas: ['', Validators.required],
      workingHours: ['', Validators.required],
      experience: ['', Validators.required],
      bankAccount: ['', Validators.required],
      bankName: ['', Validators.required],
      services: this.fb.array([this.createServiceControl()])
    });
  }

  createServiceControl(): FormControl {
    return new FormControl('', Validators.required);
  }

  get services(): FormArray<FormControl> {
    return this.providerForm.get('services') as FormArray<FormControl>;
  }

  addService() {
    this.services.push(this.createServiceControl());
  }

  removeService(index: number) {
    this.services.removeAt(index);
  }

  submitForm() {
    if (this.providerForm.valid) {
      console.log('✅ البيانات المرسلة:', this.providerForm.value);
    } else {
      this.providerForm.markAllAsTouched();
    }
  }
}
