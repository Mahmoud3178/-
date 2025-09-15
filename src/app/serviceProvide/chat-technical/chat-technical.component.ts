// ✅ ChatTechnicalComponent - chat-technical.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMessage } from '../../DTOS/chatmessage.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-technical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-technical.component.html',
  styleUrls: ['./chat-technical.component.css']
})
export class ChatTechnicalComponent implements OnInit {
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
    this.chatService.getTechnicianMessages(this.technicianId).subscribe({
      next: (groups) => {
        const all = groups.flat();
        this.messages = all.filter(m => m.orderId === this.orderId);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => console.error('❌ خطأ في تحميل الرسائل:', err)
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
        this.scrollToBottom();
      },
      error: (err) => console.error('❌ خطأ في إرسال الرسالة:', err)
    });
  }

  scrollToBottom(): void {
    if (this.chatBox) {
      this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
    }
  }

  goBack(): void {
    this.router.navigate(['/chats']);
  }
}
