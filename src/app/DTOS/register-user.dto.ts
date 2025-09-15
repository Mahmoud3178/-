export interface RegisterUserDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  city: string;
  userPhoto?: File; // ✅ بدل image
}
