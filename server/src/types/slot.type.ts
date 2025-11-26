export interface Slot {
  start_time: Date;
  end_time: Date;
  date: Date;
  mentor_id: number;
  status: "Available" | "Booked" | "Cancelled";
  plan_id: number;
}

export interface SlotWithPlanDetails extends Slot {
  plan_description: string;
  plan_charge: number;
  plan_type: string;
}

export interface CreateSlotRequest {
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  date: string; // ISO 8601 format or YYYY-MM-DD
  status?: "Available" | "Booked" | "Cancelled";
}

export interface UpdateSlotRequest {
  status?: "Available" | "Booked" | "Cancelled";
}

export interface GetSlotsQuery {
  page?: number;
  limit?: number;
  status?: "Available" | "Booked" | "Cancelled";
}

export interface SlotIdentifier {
  planId: number;
  startTime: string;
  endTime: string;
  date: string;
}
