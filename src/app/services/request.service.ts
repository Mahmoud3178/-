// src/app/services/request.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { RequestQueryDTO } from '../DTOS/request-query.dto';
import { CreateRequestDto } from '../DTOS/create-request.dto';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private readonly baseUrl = '/api';  // خلي الرابط نسبي

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  createRequest(requestData: CreateRequestDto): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.post<number>(`${this.baseUrl}/Requests/CreateRequest`, requestData, { headers });
  }

  getUserRequests(query: RequestQueryDTO): Observable<any> {
    const params = new HttpParams()
      .set('UserId', query.userId)
      .set('status', query.status);
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/Requests/CompletedRequestUser`, { params, headers });
  }

  getTechnicianRequests(technicianId: number, status: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Requests/CompletedRequestTechnician?TechnicianId=${technicianId}&status=${status}`);
  }

  updateStatus(orderId: number, status: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Requests/UpdateStatus?orderId=${orderId}&status=${status}`, {});
  }

  updateOrderState(orderId: number, newState: number): Observable<any> {
    const params = new HttpParams()
      .set('id', orderId)
      .set('newState', newState);

    return this.http.patch(`${this.baseUrl}/Requests/UpdateState`, null, {
      params,
      responseType: 'text' as 'json' // لو الـ API بيرجع نص
    });
  }

  confirmUserRequest(orderId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Requests/technicianConfairmUserRequest`, { orderId });
  }

  cancelRequest(orderId: number): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/Requests/CancelRequest?RequestId=${orderId}`,
      {},
      { responseType: 'text' as 'json' } // 👈 نفس الشيء هنا
    );
  }

  endService(orderId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Requests/EndServices`, { orderId });
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Services/technicianAccepteRequest?requestId=${requestId}`, {}, {
      responseType: 'text' as 'json'  // 👈 الحل هنا
    });
  }

  rejectRequest(requestId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/Services/technicianRejectedRequest?requestId=${requestId}`, {}, {
      responseType: 'text' as 'json'  // 👈 نفس الشيء هنا
    });
  }

  updateTechnicianLatLong(technicianId: string, lat: number, lng: number) {
    let params = new HttpParams()
      .set('technicianId', technicianId)
      .set('lat', lat.toString())
      .set('lng', lng.toString());

    return this.http.post(`${this.baseUrl}/UpdateLatLong`, null, { params });
  }
  getCompletedRequestsCount(technicianId: string): Observable<number> {
  const headers = this.getAuthHeaders();
  return this.http.get<number>(
    `${this.baseUrl}/Rating/GetCompletedRequestsCount`,
    { params: new HttpParams().set('TechnicianId', technicianId), headers }
  );
}
/** ✅ الصور فقط من TechnicianRequest */
getTechnicianImages(technicianId: string): Observable<string[]> {
  return this.http.get<any[]>(
    `/api/Requests/TechnicianRequest`,
    { params: new HttpParams().set('TechnicianId', technicianId) }
  ).pipe(
    map((orders: any[]) => {
      if (!Array.isArray(orders)) return [];
      return orders.flatMap(order =>
        [order.image11, order.image12, order.image13].filter(img => !!img)
      );
    })
  );
}


}
