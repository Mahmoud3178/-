// src/app/pages/call-us/call-us.component.ts
import { Component } from '@angular/core';
import { Complaint } from '../../DTOS/complaint.dto';
import { ComplaintService } from '../../services/complaint.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-call-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './call-us.component.html',
  styleUrls: ['./call-us.component.css']
})
export class CallUsComponent {
  user = {
    fullName: '',
    phone: '',
    email: '',
    notes: ''
  };
message = '';
messageType: 'success' | 'danger' | '' = '';

  constructor(private complaintService: ComplaintService) {}
showMessage(msg: string, type: 'success' | 'danger') {
  this.message = msg;
  this.messageType = type;
  setTimeout(() => {
    this.message = '';
    this.messageType = '';
  }, 4000);
}

submitForm() {
 if (
    !this.user.fullName.trim() ||
    !this.user.phone.trim() ||
    !this.user.email.trim() ||
    !this.user.notes.trim()
  ) {
    this.showMessage('❗ برجاء إدخال جميع البيانات وكتابة الملاحظات', 'danger');
    return;
  }

  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null;

  const userId = user?.id;
  const userEmail = user?.email;

  if (!userId) {
    this.showMessage('❌ لا يوجد مستخدم مسجل', 'danger');
    return;
  }

  if (this.user.email.trim().toLowerCase() !== userEmail?.trim().toLowerCase()) {
    this.showMessage('❌ يرجى استخدام البريد الإلكتروني المسجل في الحساب فقط', 'danger');
    return;
  }

  const complaint: Complaint = {
    id: 0,
    name: this.user.fullName,
    description: this.user.notes,
    createdAt: new Date().toISOString(),
    userId: userId,
    phoneNumber: this.user.phone,
    email: this.user.email
  };

  this.complaintService.createComplaint(complaint).subscribe({
    next: () => {
      this.showMessage('✅ تم إرسال الرسالة بنجاح', 'success');
      this.user = { fullName: '', phone: '', email: '', notes: '' };
    },
    error: (err) => {
      console.error('❌ فشل الإرسال:', err);
      this.showMessage('❌ حدث خطأ أثناء إرسال الرسالة', 'danger');
    }
  });
}


}
