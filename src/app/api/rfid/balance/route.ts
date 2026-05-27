import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      cardUid: "RFID-A3F92B",
      balance: 1250,
      status: "active",
      lastTapAt: new Date(Date.now() - 3600000).toISOString(),
    },
  });
}
