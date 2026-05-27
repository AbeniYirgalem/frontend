import { NextRequest, NextResponse } from "next/server";
import { verifyCallback } from "@/lib/telebirr";

/**
 * POST /api/telebirr/callback
 * Webhook endpoint for Telebirr payment notifications.
 * Telebirr sends a POST here after successful payment.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[Telebirr Callback] Received:", JSON.stringify(body, null, 2));

    // Verify the callback signature
    const isValid = verifyCallback(body);
    if (!isValid) {
      console.warn("[Telebirr Callback] Invalid signature");
      return NextResponse.json({ code: 1, msg: "Invalid signature" }, { status: 400 });
    }

    const { outTradeNo, totalAmount, tradeNo, tradeStatus } = body;

    if (tradeStatus === "2" || tradeStatus === "SUCCESS") {
      // Payment successful — update card balance
      // In production, you would:
      // 1. Look up the order by outTradeNo in your database
      // 2. Find the associated RFID card
      // 3. Credit the totalAmount to the card balance
      // 4. Mark the order as completed
      console.log(
        `[Telebirr Callback] Payment SUCCESS — Order: ${outTradeNo}, Amount: ${totalAmount} ETB, TelebirrRef: ${tradeNo}`
      );
    } else {
      console.log(
        `[Telebirr Callback] Payment status: ${tradeStatus} — Order: ${outTradeNo}`
      );
    }

    // Respond with success acknowledgment (required by Telebirr)
    return NextResponse.json({ code: 0, msg: "success" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Telebirr Callback] Error:", message);
    return NextResponse.json({ code: 1, msg: message }, { status: 500 });
  }
}
