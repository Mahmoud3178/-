// ✅ chat-user.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMessage } from '../../DTOS/chatmessage.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-user.component.html',
  styleUrls: ['./chat-user.component.css']
})
export class ChatUserComponent implements OnInit {
  messages: ChatMessage[] = [];
  messageText: string = '';
  currentUserId: string = '222f0967-2fa2-4dc4-ae37-fd83f34ae5a8';
  technicianId: string = '';
  orderId!: number;

  @ViewChild('chatBox') chatBox!: ElementRef;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.technicianId = this.route.snapshot.queryParamMap.get('techId') || '';
    this.orderId = Number(this.route.snapshot.queryParamMap.get('orderId'));
    this.loadMessages();
  }
loadMessages(): void {
  this.chatService.getUserMessages(this.currentUserId).subscribe({
    next: (res: ChatMessage[][]) => {
      const allMessages = res.flat(); // ✅ فك المصفوفة
      this.messages = allMessages.filter(
        msg => msg.orderId === this.orderId && msg.technicianId === this.technicianId
      );

      setTimeout(() => this.scrollToBottom(), 100);
    },
    error: (err) => console.error('❌ خطأ عند تحميل الرسائل:', err)
  });
}


  sendMessage(): void {
    if (!this.messageText.trim()) return;

    const newMsg: ChatMessage = {
      id: 0,
      senderId: this.currentUserId,
      technicianId: this.technicianId,
      text: this.messageText,
      orderId: this.orderId,
      timestamp: new Date().toISOString()
    };

   this.chatService.sendMessage(newMsg).subscribe({
  next: () => {
    this.messages.push(newMsg);
    this.messageText = '';

    // ✅ خزّن آخر رسالة محليًا
    localStorage.setItem('lastUserMessage', JSON.stringify(newMsg));

    setTimeout(() => this.scrollToBottom(), 100);
  }
});

  }

  scrollToBottom(): void {
    if (this.chatBox) {
      this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
    }
  }

  goBack(): void {
    this.router.navigate(['/profile'], { queryParams: { tab: 'conversations' } });
  }
}
