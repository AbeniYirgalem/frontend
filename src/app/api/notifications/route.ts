/**
 * This Next.js API route is intentionally disabled.
 *
 * All notification data is served directly by the Express backend at:
 *   GET http://localhost:5000/api/notifications
 *
 * The frontend NotificationBell component uses the notification-service.ts
 * which calls the Express backend via NEXT_PUBLIC_API_URL directly.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        "This endpoint is disabled. Use the Express backend at /api/notifications",
    },
    { status: 404 },
  );
}
