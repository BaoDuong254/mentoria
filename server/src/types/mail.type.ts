export interface BookingConfirmationData {
  menteeName: string;
  mentorName: string;
  planType: string;
  planDescription: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  amount: string;
  discountAmount?: string;
  totalAmount: string;
  message?: string;
}
