export interface UpdateProfileUser {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  imageUrl?: string;  // ← لو عايزها، أضفها هنا
}
