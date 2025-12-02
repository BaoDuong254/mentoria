import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BookingRequestStatus = "pending" | "accepted" | "waiting_payment" | "paid" | "cancelled" | "declined";

export interface BookingRequest {
  id: string;
  menteeId: number;
  menteeName: string;
  menteeEmail: string;
  menteeAvatar: string;
  mentorId: number;
  mentorName: string;
  mentorAvatar: string;
  mentorSpecialty: string;
  planId: number;
  planType: string;
  planCharge: number;
  slotStartTime: string;
  slotEndTime: string;
  slotDate: string;
  message: string;
  status: BookingRequestStatus;
  createdAt: string;
  meetingLink?: string;
  invoiceId?: string;
  declineReason?: string;
  // For "out of date" sessions - review materials
  reviewLink?: string;
  reviewPdfUrl?: string;
  // Hidden flags for independent delete
  hiddenByMentee?: boolean;
  hiddenByMentor?: boolean;
}

interface BookingRequestStore {
  requests: BookingRequest[];

  // Actions
  addRequest: (request: BookingRequest) => void;
  updateRequestStatus: (id: string, status: BookingRequestStatus) => void;
  updateMeetingLink: (id: string, link: string) => void;
  removeRequest: (id: string) => void;
  hideRequest: (id: string, role: "mentee" | "mentor") => void;

  // Getters for mentee
  getRequestsByMentee: (menteeId: number) => BookingRequest[];
  getPendingRequestsByMentee: (menteeId: number) => BookingRequest[];
  getWaitingPaymentByMentee: (menteeId: number) => BookingRequest[];
  getPaidRequestsByMentee: (menteeId: number) => BookingRequest[];
  getDeclinedRequestsByMentee: (menteeId: number) => BookingRequest[];

  // Getters for mentor
  getRequestsByMentor: (mentorId: number) => BookingRequest[];
  getPendingRequestsByMentor: (mentorId: number) => BookingRequest[];
  getAcceptedRequestsByMentor: (mentorId: number) => BookingRequest[];

  // Accept/Decline
  acceptRequest: (id: string) => void;
  declineRequest: (id: string, reason?: string) => void;

  // Mark as paid
  markAsPaid: (id: string) => void;

  // Review materials
  updateReviewMaterials: (id: string, data: { link?: string; pdfUrl?: string }) => void;
}

export const useBookingRequestStore = create<BookingRequestStore>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (request) => {
        set((state) => ({
          requests: [...state.requests, request],
        }));
      },

      updateRequestStatus: (id, status) => {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? { ...r, status } : r)),
        }));
      },

      updateMeetingLink: (id, link) => {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? { ...r, meetingLink: link } : r)),
        }));
      },

      removeRequest: (id) => {
        set((state) => ({
          requests: state.requests.filter((r) => r.id !== id),
        }));
      },

      hideRequest: (id, role) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...(role === "mentee" ? { hiddenByMentee: true } : { hiddenByMentor: true }),
                }
              : r
          ),
        }));
      },

      // Mentee getters
      getRequestsByMentee: (menteeId) => {
        return get().requests.filter((r) => r.menteeId === menteeId);
      },

      getPendingRequestsByMentee: (menteeId) => {
        return get().requests.filter((r) => r.menteeId === menteeId && r.status === "pending");
      },

      getWaitingPaymentByMentee: (menteeId) => {
        return get().requests.filter((r) => r.menteeId === menteeId && r.status === "waiting_payment");
      },

      getPaidRequestsByMentee: (menteeId) => {
        return get().requests.filter((r) => r.menteeId === menteeId && r.status === "paid");
      },

      getDeclinedRequestsByMentee: (menteeId) => {
        return get().requests.filter((r) => r.menteeId === menteeId && r.status === "declined" && !r.hiddenByMentee);
      },

      // Mentor getters
      getRequestsByMentor: (mentorId) => {
        return get().requests.filter((r) => r.mentorId === mentorId);
      },

      getPendingRequestsByMentor: (mentorId) => {
        return get().requests.filter((r) => r.mentorId === mentorId && r.status === "pending");
      },

      getAcceptedRequestsByMentor: (mentorId) => {
        return get().requests.filter(
          (r) =>
            r.mentorId === mentorId &&
            (r.status === "waiting_payment" || r.status === "paid" || r.status === "accepted")
        );
      },

      // Accept/Decline
      acceptRequest: (id) => {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? { ...r, status: "waiting_payment" as const } : r)),
        }));
      },

      declineRequest: (id, reason) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, status: "declined" as const, declineReason: reason } : r
          ),
        }));
      },

      markAsPaid: (id) => {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? { ...r, status: "paid" as const } : r)),
        }));
      },

      updateReviewMaterials: (id, data) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? { ...r, reviewLink: data.link ?? r.reviewLink, reviewPdfUrl: data.pdfUrl ?? r.reviewPdfUrl }
              : r
          ),
        }));
      },
    }),
    {
      name: "booking-requests-storage",
    }
  )
);
