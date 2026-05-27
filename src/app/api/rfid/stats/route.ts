import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalCards: 2456,
      activeCards: 2100,
      suspendedCards: 280,
      expiredCards: 76,
      totalBalanceCirculation: 3842500,
      todayRevenue: 48200,
      todayRecharges: 126,
      todayScans: 8432,
      weeklyRevenue: [
        { day: "Mon", revenue: 42100 },
        { day: "Tue", revenue: 38500 },
        { day: "Wed", revenue: 45200 },
        { day: "Thu", revenue: 41800 },
        { day: "Fri", revenue: 52400 },
        { day: "Sat", revenue: 35600 },
        { day: "Sun", revenue: 28900 },
      ],
      rechargeBreakdown: {
        "50 ETB": 28,
        "100 ETB": 42,
        "200 ETB": 31,
        "500 ETB": 18,
        "1000+ ETB": 7,
      },
      recentActivity: [
        { type: "recharge", card: "RFID-7193", amount: 500, time: "2 min ago" },
        { type: "fare", card: "RFID-4821", amount: 15, time: "5 min ago" },
        { type: "fare", card: "RFID-5567", amount: 20, time: "8 min ago" },
        { type: "recharge", card: "RFID-6678", amount: 1000, time: "12 min ago" },
        { type: "fare", card: "RFID-8901", amount: 15, time: "15 min ago" },
        { type: "fare", card: "RFID-1145", amount: 25, time: "18 min ago" },
        { type: "recharge", card: "RFID-4456", amount: 200, time: "22 min ago" },
      ],
    },
  });
}
