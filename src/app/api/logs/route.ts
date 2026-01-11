import { NextResponse } from "next/server";
import { getLogs } from "@/lib/logger";

export async function GET() {
  const logs = getLogs();

  const sorted = logs.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });

  return NextResponse.json(sorted);
}
