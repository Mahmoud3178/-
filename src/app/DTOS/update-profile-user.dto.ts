export interface UpdateProfileUser {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  imageUrl?: string;  // ← خليها زي الـ backend
}
