export interface Rating {
  id: number;
  requestId: number;
  userId: string;
  technicianId: string;
  ratingValue: number;
  comment: string;
    userName?: string;     // هنا ضيف userName
  userImage?: string;    // هنا ضيف userImage
}
