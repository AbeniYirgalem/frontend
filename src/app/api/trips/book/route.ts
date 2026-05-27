import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo bookings
const bookings: Array<Record<string, unknown>> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { routeId, originStop, destinationStop, fare, estimatedDuration, congestionLevel, selectedRouteType, label } = body;

    if (!originStop || !destinationStop || !fare) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const booking = {
      id: `TB-${Date.now().toString(36).toUpperCase()}`,
      routeId: routeId || `route-${originStop}-${destinationStop}`,
      originStop,
      destinationStop,
      label: label || `${originStop} → ${destinationStop}`,
      fare,
      estimatedDuration: estimatedDuration || 20,
      congestionLevel: congestionLevel || "low",
      selectedRouteType: selectedRouteType || "direct",
      status: "confirmed",
      bookedAt: new Date().toISOString(),
      cancelledAt: null,
      refundAmount: 0,
      paymentMethod: "card_balance",
    };

    bookings.unshift(booking);
    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
