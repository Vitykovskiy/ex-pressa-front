import { http } from "@/services/http";
import type { TimeSlot } from "@/services/menu/types";

export async function fetchActiveTimeSlots(): Promise<TimeSlot[]> {
  return http.get<TimeSlot[]>("/time-slots/active");
}
