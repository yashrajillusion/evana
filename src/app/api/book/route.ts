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
    return NextResponse.json<APIResponse<null>>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, eventId } = body;

    if (!userId || !eventId) {
      return NextResponse.json(
        { success: false, error: "Missing userId or eventId" },
        { status: 400 }
      );
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        eventId,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    await prisma.booking.delete({
      where: {
        id: existingBooking.id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Booking cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
    });

    return NextResponse.json(
      { success: true, data: bookings },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
