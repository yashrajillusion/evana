"use client";

import { Event } from "@/types";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import api from "@/lib/axios";
import { EventsList, Header, SearchBar } from "@/component/EventList";

const USER_ID = "cm9lwjoz20006ouhfkb35uwc3";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookedEvents, setBookedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchEvents(controller), 100);

    setBookedEvents(getBookedFromLocalStorage());

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  const getBookedFromLocalStorage = (): string[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("bookedEvents") || "[]");
  };

  const updateLocalBookings = (ids: string[]) => {
    localStorage.setItem("bookedEvents", JSON.stringify(ids));
    setBookedEvents(ids);
  };

  const fetchEvents = async (controller: AbortController) => {
    setLoading(true);
    try {
      const res = await api.get("/events", {
        params: { search },
        signal: controller.signal,
      });
      setEvents(res.data.data);
    } catch (error: any) {
      if (error.code !== "ERR_CANCELED") toast.error("Event failed to fetch!");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (eventId: string) => {
    updateEventSpots(eventId, -1);
    const updatedBookings = [...new Set([...bookedEvents, eventId])];
    updateLocalBookings(updatedBookings);

    try {
      await api.post("/book", { userId: USER_ID, eventId });
      toast.success("Event booked successfully!");
    } catch (error: any) {
      updateEventSpots(eventId, 1);
      const rolledBack = updatedBookings.filter((id) => id !== eventId);
      updateLocalBookings(rolledBack);
      toast.error(error?.response?.data?.error || "Booking failed");
    }
  };

  const handleCancelBooking = async (eventId: string) => {
    try {
      await api.delete("/book", {
        data: { userId: USER_ID, eventId },
      });
      updateEventSpots(eventId, 1);
      const updated = bookedEvents.filter((id) => id !== eventId);
      updateLocalBookings(updated);
      toast.success("Booking canceled!");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const updateEventSpots = (eventId: string, delta: number) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              remainingSpots: event.remainingSpots + delta,
            }
          : event
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto">
        <Header />
        <SearchBar value={search} onChange={setSearch} />
        <EventsList
          events={events}
          loading={loading}
          bookedEvents={bookedEvents}
          onBook={handleBook}
          onCancel={handleCancelBooking}
        />
      </div>
    </div>
  );
}

