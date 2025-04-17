import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { bookingSchema } from "@/validation/book";
import { APIResponse, BookingInput } from "@/types";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body: BookingInput = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { userId, eventId } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json<APIResponse<null>>(
        { success: false, error: "User does not exist" },
        { status: 404 }
      );
    }

    const existingBooking = await prisma.booking.findUnique({
      where: {
        userId_eventId: { userId, eventId },
      },
    });

    if (existingBooking) {
      return NextResponse.json<APIResponse<null>>(
        { success: false, error: "User already booked this event" },
        { status: 409 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json<APIResponse<null>>(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    if (event._count.bookings >= event.max_capacity) {
      return NextResponse.json<APIResponse<null>>(
        { success: false, error: "Event is fully booked" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: { userId, eventId },
    });

    return NextResponse.json<APIResponse<typeof booking>>(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json<APIResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
