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

export interface MeetingLocationUpdatedData {
  menteeName: string;
  mentorName: string;
  planType: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface MeetingCompletedData {
  menteeName: string;
  mentorName: string;
  planType: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  feedbackUrl: string;
}

export interface MeetingCancelledData {
  menteeName: string;
  mentorName: string;
  planType: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  refundNote?: string;
  exploreMentorsUrl: string;
}

export interface MeetingReminderData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  otherParty?: string;
  roleLabel?: string;
  timeUntil: string;
}
