import { NextResponse } from "next/server";

export async function GET() {
  const transactions = [
    { _id: "t1", type: "recharge", amount: 500, balanceBefore: 750, balanceAfter: 1250, status: "success", note: "In-app recharge", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: "t2", type: "fare", amount: 15, balanceBefore: 765, balanceAfter: 750, status: "success", note: "Megenagna → Bole", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: "t3", type: "fare", amount: 20, balanceBefore: 785, balanceAfter: 765, status: "success", note: "CMC → Mexico", createdAt: new Date(Date.now() - 14400000).toISOString() },
    { _id: "t4", type: "recharge", amount: 200, balanceBefore: 585, balanceAfter: 785, status: "success", note: "In-app recharge", createdAt: new Date(Date.now() - 28800000).toISOString() },
    { _id: "t5", type: "fare", amount: 15, balanceBefore: 600, balanceAfter: 585, status: "success", note: "Piassa → Arat Kilo", createdAt: new Date(Date.now() - 43200000).toISOString() },
    { _id: "t6", type: "fare", amount: 25, balanceBefore: 625, balanceAfter: 600, status: "success", note: "Kaliti → Megenagna", createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: "t7", type: "recharge", amount: 1000, balanceBefore: 0, balanceAfter: 1000, status: "success", note: "Initial top-up", createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  return NextResponse.json({
    success: true,
    data: {
      items: transactions,
      total: transactions.length,
      page: 1,
      totalPages: 1,
    },
  });
}
