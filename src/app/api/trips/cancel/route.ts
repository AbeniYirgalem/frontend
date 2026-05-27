import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "bookingId is required" }, { status: 400 });
    }

    // In demo mode, return a simulated cancellation result
    return NextResponse.json({
      success: true,
      data: {
        id: bookingId,
        status: "refunded",
        cancelledAt: new Date().toISOString(),
        refundAmount: 0, // Would be calculated from actual booking
        message: "Trip cancelled. Refund has been credited to your card balance.",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
