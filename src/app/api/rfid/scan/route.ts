import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cardUid, fare } = body;

  if (!cardUid) {
    return NextResponse.json({ success: false, message: "RFID Card UID required" }, { status: 400 });
  }

  // Simulate scan lookup
  const passengers: Record<string, { name: string; email: string; balance: number }> = {
    "RFID-4821": { name: "Abebe Worku", email: "abebe@mail.com", balance: 450 },
    "RFID-7193": { name: "Sara Tadesse", email: "sara@mail.com", balance: 1200 },
    "RFID-5567": { name: "Hana Bekele", email: "hana@mail.com", balance: 820 },
    "RFID-8901": { name: "Yonas Gebre", email: "yonas@mail.com", balance: 340 },
    "RFID-A3F92B": { name: "Demo User", email: "demo@mail.com", balance: 1250 },
  };

  const match = passengers[cardUid.toUpperCase()];
  if (!match) {
    return NextResponse.json({ success: false, message: "Invalid RFID card" }, { status: 404 });
  }

  const tripFare = fare || 15;
  if (match.balance < tripFare) {
    return NextResponse.json({
      success: false,
      message: `Insufficient balance. Current: ${match.balance} ETB, Required: ${tripFare} ETB. Please recharge.`,
    }, { status: 400 });
  }

  const balanceAfter = match.balance - tripFare;

  return NextResponse.json({
    success: true,
    message: "Fare deducted",
    data: {
      passenger: { name: match.name, email: match.email },
      card: {
        cardUid,
        balanceBefore: match.balance,
        balanceAfter,
        fareDeducted: tripFare,
      },
    },
  });
}
