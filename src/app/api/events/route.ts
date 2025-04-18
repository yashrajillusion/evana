import { APIResponse, ErrorResponse, EventSummary, FullEvent } from "@/types";
import { eventSchema, paginationSchema } from "@/validation/event";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const parsed = paginationSchema.safeParse({ page, limit });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const search = searchParams.get("search") || "";

    const events = await prisma.event.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        title: {
          contains: search,
        },
      },
      orderBy: {
        start_time: "asc",
      },
      select: {
        id: true,
        title: true,
        start_time: true,
        max_capacity: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const formatted: EventSummary[] = events.map((event) => ({
      id: event.id,
      title: event.title,
      startTime: event.start_time,
      maxCapacity: event.max_capacity,
      remainingSpots: event.max_capacity - event._count.bookings,
    }));

    return NextResponse.json<APIResponse<EventSummary[]>>(
      { success: true, data: formatted },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { success: false, message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, start_time, max_capacity } = parsed.data;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        start_time: new Date(start_time),
        max_capacity,
      },
    });

    return NextResponse.json<APIResponse<FullEvent>>(
      { success: true, data: event },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
