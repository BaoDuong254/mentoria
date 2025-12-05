import { create } from "zustand";
import type { MeetingResponse } from "@/types/meeting.type";
import {
  getMeetingsForMentee,
  getMeetingsForMentor,
  updateMeetingLocation,
  updateMeetingStatus,
  updateReviewLink,
} from "@/apis/meeting.api";
import axios from "axios";

// Helper function to format date as YYYY-MM-DD in local timezone (without UTC conversion)
const formatLocalDateString = (date: Date): string => {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to extract date portion from a date string (handles both ISO and YYYY-MM-DD formats)
const extractDateString = (dateStr: string): string => {
  // If it's already YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // If it contains 'T', it's ISO format - extract the date part before 'T'
  if (dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  // Otherwise, return as is
  return dateStr;
};

interface MeetingState {
  meetings: MeetingResponse[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMeetingsForMentee: () => Promise<void>;
  fetchMeetingsForMentor: () => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setMeetingLocation: (meetingId: number, location: string) => Promise<boolean>;
  markMeetingAsCompleted: (meetingId: number) => Promise<boolean>;
  setReviewLink: (meetingId: number, reviewLink: string) => Promise<boolean>;
  deleteMeeting: (meetingId: number) => Promise<boolean>;

  // Computed getters
  getAcceptedMeetings: () => MeetingResponse[];
  getOutOfDateMeetings: () => MeetingResponse[];
  getCompletedMeetings: () => MeetingResponse[];
  getCancelledMeetings: () => MeetingResponse[];
  getPendingMeetings: () => MeetingResponse[];
  getAllUpcomingMeetings: () => MeetingResponse[];
}

// Helper function to parse time from various formats
const parseTimeFromString = (timeStr: string): { hours: number; minutes: number } => {
  // Handle ISO datetime format: "2025-12-01T09:00:00.000Z"
  if (timeStr.includes("T")) {
    const date = new Date(timeStr);
    return { hours: date.getHours(), minutes: date.getMinutes() };
  }
  // Handle time format: "09:00:00" or "09:00"
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
};

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,

  fetchMeetingsForMentee: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMeetingsForMentee();
      if (response.success) {
        set({ meetings: response.data });
      } else {
        set({ error: "Failed to fetch meetings" });
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string } | undefined;
        const message = errorData?.message;
        set({ error: typeof message === "string" ? message : "Failed to fetch meetings" });
      } else {
        set({ error: "Failed to fetch meetings" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMeetingsForMentor: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMeetingsForMentor();
      if (response.success) {
        set({ meetings: response.data });
      } else {
        set({ error: "Failed to fetch meetings" });
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string } | undefined;
        const message = errorData?.message;
        set({ error: typeof message === "string" ? message : "Failed to fetch meetings" });
      } else {
        set({ error: "Failed to fetch meetings" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  },

  setMeetingLocation: async (meetingId: number, location: string) => {
    try {
      const response = await updateMeetingLocation(meetingId, { location });
      if (response.success) {
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.meeting_id === meetingId ? { ...m, location, status: "Scheduled" as const } : m
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating location:", error);
      return false;
    }
  },

  markMeetingAsCompleted: async (meetingId: number) => {
    try {
      const response = await updateMeetingStatus(meetingId, {
        status: "Completed",
      });
      if (response.success) {
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.meeting_id === meetingId ? { ...m, status: "Completed" as const } : m
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error marking as completed:", error);
      return false;
    }
  },

  setReviewLink: async (meetingId: number, reviewLink: string) => {
    try {
      const response = await updateReviewLink(meetingId, { reviewLink });
      if (response.success) {
        set((state) => ({
          meetings: state.meetings.map((m) => (m.meeting_id === meetingId ? { ...m, review_link: reviewLink } : m)),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating review link:", error);
      return false;
    }
  },

  deleteMeeting: async (meetingId: number) => {
    try {
      const response = await updateMeetingStatus(meetingId, {
        status: "Cancelled",
      });
      if (response.success) {
        set((state) => ({
          meetings: state.meetings.filter((m) => m.meeting_id !== meetingId),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting meeting:", error);
      return false;
    }
  },

  // Get accepted/scheduled meetings for selected date (upcoming, not passed)
  getAcceptedMeetings: () => {
    const { meetings, selectedDate } = get();
    const now = new Date();
    const selectedDateStr = formatLocalDateString(selectedDate);

    return meetings.filter((m) => {
      // Parse start_time to get meeting datetime
      const { hours, minutes } = parseTimeFromString(m.start_time);
      // Create meeting date from the date string without timezone conversion
      const meetingDateStr = extractDateString(m.date);
      const [year, month, day] = meetingDateStr.split("-").map(Number);
      const meetingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

      const isSameDay = meetingDateStr === selectedDateStr;

      return m.status === "Scheduled" && meetingDateTime > now && isSameDay;
    });
  },

  // Get out of date meetings (pending or scheduled but time has passed)
  getOutOfDateMeetings: () => {
    const { meetings } = get();
    const now = new Date();

    return meetings.filter((m) => {
      const { hours, minutes } = parseTimeFromString(m.start_time);
      const meetingDateStr = extractDateString(m.date);
      const [year, month, day] = meetingDateStr.split("-").map(Number);
      const meetingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

      return (m.status === "Pending" || m.status === "Scheduled") && meetingDateTime < now;
    });
  },

  // Get completed meetings
  getCompletedMeetings: () => {
    const { meetings } = get();
    return meetings.filter((m) => m.status === "Completed");
  },

  // Get cancelled meetings
  getCancelledMeetings: () => {
    const { meetings } = get();
    return meetings.filter((m) => m.status === "Cancelled");
  },

  // Get pending meetings for selected date
  getPendingMeetings: () => {
    const { meetings, selectedDate } = get();
    const now = new Date();
    const selectedDateStr = formatLocalDateString(selectedDate);

    return meetings.filter((m) => {
      const { hours, minutes } = parseTimeFromString(m.start_time);
      const meetingDateStr = extractDateString(m.date);
      const [year, month, day] = meetingDateStr.split("-").map(Number);
      const meetingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

      const isSameDay = meetingDateStr === selectedDateStr;

      return m.status === "Pending" && meetingDateTime > now && isSameDay;
    });
  },

  // Get all upcoming meetings (scheduled, future, any date)
  getAllUpcomingMeetings: () => {
    const { meetings } = get();
    const now = new Date();

    return meetings.filter((m) => {
      const { hours, minutes } = parseTimeFromString(m.start_time);
      const meetingDateStr = extractDateString(m.date);
      const [year, month, day] = meetingDateStr.split("-").map(Number);
      const meetingDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

      return m.status === "Scheduled" && meetingDateTime > now;
    });
  },
}));
