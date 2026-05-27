/**
 * This Next.js API route is intentionally disabled.
 *
 * Bus data is served directly by the Express backend at:
 *   GET http://localhost:5000/api/buses
 *
 * The live transit map uses the addis-ababa-routes constants for the
 * visual simulation layer; real bus fleet data comes from the Express backend.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message:
        "This endpoint is disabled. Use the Express backend at /api/buses",
    },
    { status: 404 },
  );
}
