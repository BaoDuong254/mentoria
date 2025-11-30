import { create } from "zustand";
import type { Slot } from "@/types/booking.type";
import { getSlotsByPlanId } from "@/apis/slot.api";

interface BookingState {
  slots: Slot[];
  availableDates: string[];

  // SELECTION STATE
  selectedDate: Date | null;
  selectedSlotId: string | null;
  selectedPlanType: string | null;
  selectedCharge: number | null;

  // UI STATE
  isLoadingSlots: boolean;

  //ACTIONS
  fetchSlots: (planId: number) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setSelectedSlotId: (slotId: string) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  slots: [],
  availableDates: [],
  selectedDate: new Date(2025, 10, 27),
  selectedSlotId: null,
  selectedPlanType: null,
  selectedCharge: null,
  isLoadingSlots: false,

  fetchSlots: async (planId) => {
    set({ isLoadingSlots: true });
    try {
      const res = await getSlotsByPlanId(planId);
      if (res.success) {
        const slots = res.data?.slots;
        const dates = Array.from(new Set(slots?.map((s) => s.date)));
        const type = slots?.[0]?.plan_type;
        const charge = slots?.[0]?.plan_charge;

        set({ slots: slots, availableDates: dates, selectedPlanType: type, selectedCharge: charge });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      set({ slots: [] });
    } finally {
      set({ isLoadingSlots: false });
    }
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date, selectedSlotId: null });
  },
  setSelectedSlotId: (slotId) => {
    set({ selectedSlotId: slotId });
  },

  resetBooking: () => {
    set({
      slots: [],
      selectedDate: new Date(),
      selectedSlotId: null,
    });
  },
}));
