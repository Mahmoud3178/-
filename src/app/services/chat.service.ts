import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage } from '../DTOS/chatmessage.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://on-demand-service-backend.runasp.net/api/Chate';

  constructor(private http: HttpClient) {}

  // ✅ استرجاع الرسائل الخاصة بالمستخدم
getUserMessages(userId: string): Observable<ChatMessage[][]> {
  const url = `${this.baseUrl}/GetUserMessages?userId=${userId}`;
  return this.http.get<ChatMessage[][]>(url, {
    headers: this.getAuthHeaders()
  });
}

sendMessage(message: ChatMessage): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/SendMessage`, // ✅ شيل التكرار
    message,
    {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }
  );
}

getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token'); // أو 'user' لو بتخزن كله
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}
getTechnicianMessages(technicianId: string): Observable<ChatMessage[][]> {
  return this.http.get<ChatMessage[][]>(
    `${this.baseUrl}/GetTechnicianMessages?TechnicianId=${technicianId}`,
    {
      headers: this.getAuthHeaders()
    }
  );
}



}
