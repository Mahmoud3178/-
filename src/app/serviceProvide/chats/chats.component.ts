// ✅ ChatsComponent - chats.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { ChatMessage } from '../../DTOS/chatmessage.dto';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent implements OnInit {
  toggleStatus = true;
  technicianId = '369af723-dbda-427d-b075-d51b5d2083a8';
  provider: any = {};
  orders: any[] = [];
errorMessage: string = '';
successMessage: string = '';

  chats: {
    name: string;
    phone: string;
    service: string;
    time: string;
    orderNumber: number;
  }[] = [];

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
      const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);

    // بنسند بيانات الفني مباشرة من التوكن
    this.provider = {
      id: user.id,
      name: user.name,
      avatar: user.image,
      rating: 0,
      reviews: 0,
      orders: 0
    };}
this.chatService.getTechnicianMessages(this.technicianId).subscribe({
  next: (messageGroups: ChatMessage[][]) => {
    if (!messageGroups || messageGroups.length === 0) {
      this.errorMessage = '❌ لا توجد محادثات لعرضها.';
      this.clearMessagesAfterDelay();
      return;
    }

    this.chats = messageGroups.map(group => {
      const latest = group[group.length - 1];
      return {
        name: 'اسم العميل غير متوفر',
        phone: 'رقم غير متوفر',
        service: latest.text,
        time: new Date(latest.timestamp).toLocaleString('ar-EG'),
        orderNumber: latest.orderId
      };
    });

    this.successMessage = '✅ تم تحميل المحادثات بنجاح';
    this.clearMessagesAfterDelay();
  },
  error: (err) => {
    console.error('❌ خطأ في تحميل الرسائل:', err);
    this.errorMessage = '❌ حدث خطأ أثناء تحميل المحادثات.';
    this.clearMessagesAfterDelay();
  }
});

  }

  clearMessagesAfterDelay() {
  setTimeout(() => {
    this.errorMessage = '';
    this.successMessage = '';
  }, 3000);
}

logout() {
  const confirmed = confirm("هل تريد فعلاً تسجيل الخروج؟");
  if (confirmed) {
    localStorage.removeItem('user');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
}
