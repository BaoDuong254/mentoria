import type { pagination } from ".";
export interface Slot {
  slot_id: string;
  start_time: string;
  end_time: string;
  date: string;
  mentor_id: number;
  status: string;
  plan_id: number;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
}

export interface getSlotResponse {
  success: boolean;
  message: string;
  data?: {
    slots: Slot[];
    pagination: pagination;
  };
}
