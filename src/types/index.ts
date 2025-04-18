export interface BookingInput {
  userId: string;
  eventId: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Event = {
  id: string;
  title: string;
  startTime: string;
  maxCapacity: number;
  remainingSpots: number;
};

export type EventsApiResponse = {
  success: boolean;
  data: Event[];
};
