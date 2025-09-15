// ✅ DTO النهائي بعد التعديل بناءً على الـ Postman والـ API
export interface RegisterTechnicianDto {
  Name: string;
  Email: string;
  PhoneNumber: string;
  Password: string;
  ConfirmPassword: string;
  City: string;
  NationalId: string;
  Category: string;
  ServiceAreas: string;
  WorkingHours: number;
  YearsOfExperience: number;
  BankName: string;
  BankAccountNumber: string;
  NameServices: string;
  PersonalPhoto?: File; // 👈 ده عشان ترفع الصورة
}
