import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/telebirr";

/**
 * POST /api/telebirr/initiate
 * Initiates a Telebirr H5 payment for RFID card recharge.
 *
 * Body: { cardNumber, cardholderName, amount, returnUrl }
 * Returns: { success, checkoutUrl, orderNo } or { success: false, error }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cardNumber, cardholderName, amount, returnUrl } = body;

    if (!cardNumber || !amount || !returnUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: cardNumber, amount, returnUrl" },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10 || numAmount > 10000) {
      return NextResponse.json(
        { success: false, error: "Amount must be between 10 and 10,000 ETB" },
        { status: 400 }
      );
    }

    // Build the callback URL from the request origin
    const origin = req.nextUrl.origin;
    const notifyUrl = `${origin}/api/telebirr/callback`;

    const { checkoutUrl, orderNo } = await createOrder({
      amount: numAmount.toFixed(2),
      cardNumber,
      cardholderName: cardholderName || "Passenger",
      notifyUrl,
      returnUrl,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      orderNo,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Telebirr Initiate] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
