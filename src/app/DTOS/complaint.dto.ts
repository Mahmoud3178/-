// src/app/DTOS/complaint.dto.ts
export interface Complaint {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  userId: string;
  phoneNumber: string;
  email: string;
}
