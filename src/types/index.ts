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

export type ErrorResponse = APIResponse<null>;

export interface EventSummary {
  id: string;
  title: string;
  startTime: Date;
  maxCapacity: number;
  remainingSpots: number;
}

export interface FullEvent {
  id: string;
  title: string;
  description: string;
  start_time: Date;
  max_capacity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
