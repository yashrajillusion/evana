import useOnScreen from "@/helper/useOnScreen";
import { Event } from "@/types";
import { Search } from "lucide-react";

export const EventsList = ({
  events,
  loading,
  bookedEvents,
  onBook,
  onCancel,
  measureRef,
}: {
  events: Event[];
  loading: boolean;
  bookedEvents: string[];
  onBook: (id: string) => void;
  onCancel: (id: string) => void;
  measureRef: (node: HTMLElement | null) => void;
}) => {
  if (loading && !events.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-60 w-full rounded-lg animate-pulse bg-gray-300"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">No events found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
      {events.map((event, index) => {
        const isBooked = bookedEvents.includes(event.id);
        return (
          <div
            key={event.id}
            ref={index === events.length - 1 ? measureRef : null}
            className="bg-black shadow p-4 rounded-lg border"
          >
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p>Start Time: {new Date(event.startTime).toLocaleString()}</p>
            <p>Remaining Spots: {event.remainingSpots}</p>
            <div className="mt-4">
              {isBooked ? (
                <button
                  onClick={() => onCancel(event.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              ) : (
                <button
                  disabled={event.remainingSpots === 0}
                  onClick={() => onBook(event.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                  {event.remainingSpots === 0 ? "Full" : "Book"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Header = () => (
  <div className="text-center mb-12">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
    <p className="text-lg text-gray-600">
      Discover and book amazing events in your area
    </p>
  </div>
);

export const SearchBar = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="relative max-w-xl mx-auto mb-12">
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      size={20}
    />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-10 px-4 py-2 transition duration-300 focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
      placeholder="Search event name"
    />
  </div>
);
