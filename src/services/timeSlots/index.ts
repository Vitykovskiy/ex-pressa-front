import { http } from "@/services/http";
import { USE_MOCKS } from "@/services/mock";
import { mockFetchActiveTimeSlots } from "@/services/mock/api";
import type { TimeSlot } from "@/services/menu/types";

export async function fetchActiveTimeSlots(): Promise<TimeSlot[]> {
  if (USE_MOCKS) {
    return mockFetchActiveTimeSlots();
  }

  return http.get<TimeSlot[]>("/time-slots/active");
}
