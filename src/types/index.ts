export interface BookingInput {
  userId: string;
  eventId: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string
}
