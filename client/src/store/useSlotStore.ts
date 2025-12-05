import { create } from "zustand";
import type { Slot } from "@/types/booking.type";
import type { Plan } from "@/types/mentor.type";
import { getAllSlotsByPlanId, createSlot, updateSlot, deleteSlot, type CreateSlotRequest } from "@/apis/slot.api";
import { getMentor } from "@/apis/mentor.api";
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

interface SlotState {
  slots: Slot[];
  plans: Plan[];
  selectedPlanId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMentorPlans: (mentorId: number) => Promise<void>;
  fetchSlotsByPlanId: (planId: number) => Promise<void>;
  fetchAllSlotsForMentor: (mentorId: number) => Promise<void>;
  setSelectedPlanId: (planId: number | null) => void;
  addSlot: (planId: number, data: CreateSlotRequest) => Promise<boolean>;
  updateSlotStatus: (
    planId: number,
    startTime: string,
    endTime: string,
    date: string,
    status: "Available" | "Booked" | "Cancelled"
  ) => Promise<boolean>;
  removeSlot: (planId: number, startTime: string, endTime: string, date: string) => Promise<boolean>;

  // Getters
  getSlotsForDate: (date: Date) => Slot[];
  getAvailableSlotsForDate: (date: Date) => Slot[];
  getBookedSlotsForDate: (date: Date) => Slot[];
}

export const useSlotStore = create<SlotState>((set, get) => ({
  slots: [],
  plans: [],
  selectedPlanId: null,
  isLoading: false,
  error: null,

  fetchMentorPlans: async (mentorId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getMentor(mentorId);
      if (response.success && response.data) {
        set({ plans: response.data.plans });
        // Auto-select first plan if available
        if (response.data.plans.length > 0 && !get().selectedPlanId) {
          set({ selectedPlanId: response.data.plans[0].plan_id });
        }
      } else {
        set({ error: "Failed to fetch mentor plans" });
      }
    } catch (error) {
      console.error("Error fetching mentor plans:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string } | undefined;
        const message = errorData?.message;
        set({ error: typeof message === "string" ? message : "Failed to fetch mentor plans" });
      } else {
        set({ error: "Failed to fetch mentor plans" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSlotsByPlanId: async (planId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllSlotsByPlanId(planId);
      if (response.success && response.data) {
        set({ slots: response.data.slots });
      } else {
        set({ error: response.message || "Failed to fetch slots" });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string } | undefined;
        const message = errorData?.message;
        set({ error: typeof message === "string" ? message : "Failed to fetch slots" });
      } else {
        set({ error: "Failed to fetch slots" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllSlotsForMentor: async (mentorId: number) => {
    set({ isLoading: true, error: null });
    try {
      // First get all plans for this mentor
      const mentorResponse = await getMentor(mentorId);
      if (!mentorResponse.success || !mentorResponse.data) {
        set({ error: "Failed to fetch mentor data" });
        return;
      }

      const plans = mentorResponse.data.plans;
      set({ plans });

      // Auto-select first plan if available
      if (plans.length > 0 && !get().selectedPlanId) {
        set({ selectedPlanId: plans[0].plan_id });
      }

      // Fetch slots for all plans
      const allSlots: Slot[] = [];
      for (const plan of plans) {
        try {
          const slotsResponse = await getAllSlotsByPlanId(plan.plan_id);
          if (slotsResponse.success && slotsResponse.data) {
            allSlots.push(...slotsResponse.data.slots);
          }
        } catch (err) {
          console.error(`Error fetching slots for plan ${String(plan.plan_id)}:`, err);
        }
      }

      set({ slots: allSlots });
    } catch (error) {
      console.error("Error fetching all slots:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string } | undefined;
        const message = errorData?.message;
        set({ error: typeof message === "string" ? message : "Failed to fetch slots" });
      } else {
        set({ error: "Failed to fetch slots" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedPlanId: (planId: number | null) => {
    set({ selectedPlanId: planId });
  },

  addSlot: async (planId: number, data: CreateSlotRequest) => {
    try {
      const response = await createSlot(planId, data);
      if (response.success) {
        // Refresh slots
        await get().fetchSlotsByPlanId(planId);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating slot:", error);
      return false;
    }
  },

  updateSlotStatus: async (
    planId: number,
    startTime: string,
    endTime: string,
    date: string,
    status: "Available" | "Booked" | "Cancelled"
  ) => {
    try {
      const response = await updateSlot(planId, startTime, endTime, date, { status });
      if (response.success) {
        // Update local state
        set((state) => ({
          slots: state.slots.map((slot) =>
            slot.plan_id === planId && slot.start_time === startTime && slot.end_time === endTime && slot.date === date
              ? { ...slot, status }
              : slot
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating slot:", error);
      return false;
    }
  },

  removeSlot: async (planId: number, startTime: string, endTime: string, date: string) => {
    try {
      const response = await deleteSlot(planId, startTime, endTime, date);
      if (response.success) {
        // Remove from local state
        set((state) => ({
          slots: state.slots.filter(
            (slot) =>
              !(
                slot.plan_id === planId &&
                slot.start_time === startTime &&
                slot.end_time === endTime &&
                slot.date === date
              )
          ),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting slot:", error);
      return false;
    }
  },

  // Get slots for a specific date
  getSlotsForDate: (date: Date) => {
    const { slots } = get();
    // Use local date string to avoid timezone issues
    const dateStr = formatLocalDateString(date);

    return slots.filter((slot) => {
      // Extract date portion without timezone conversion
      const slotDateStr = extractDateString(slot.date);
      return slotDateStr === dateStr;
    });
  },

  // Get available slots for a specific date
  getAvailableSlotsForDate: (date: Date) => {
    const { slots } = get();
    const dateStr = formatLocalDateString(date);

    return slots.filter((slot) => {
      const slotDateStr = extractDateString(slot.date);
      return slotDateStr === dateStr && slot.status === "Available";
    });
  },

  // Get booked slots for a specific date
  getBookedSlotsForDate: (date: Date) => {
    const { slots } = get();
    const dateStr = formatLocalDateString(date);

    return slots.filter((slot) => {
      const slotDateStr = extractDateString(slot.date);
      return slotDateStr === dateStr && slot.status === "Booked";
    });
  },
}));
