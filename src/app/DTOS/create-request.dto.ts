export interface CreateRequestDto {
  visitingDate: string;         // تاريخ الحجز بصيغة ISO
  description: string;
  categoryName: string;
  serviceType: string;
  userId: string;               // خده من الـ Auth
  city: string;
  area: string;
  street: string;
  buildingNumber: string;
  floorNumber: string;
  distinctiveMark: string;
  status: number;               // افتراضي: 1
  technicianId?: string;        // ممكن يبقى فاضي
}
