import type { NextRequest } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "web-vitals-log.json");

export async function POST(req: NextRequest) {
  const metric = await req.json();

  const logEntry = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  };

  try {
    let existing: any[] = [];

    try {
      const file = await readFile(filePath, "utf8");
      existing   = JSON.parse(file);
    } catch {
      existing = [];
    }

    existing.push(logEntry);

    await writeFile(filePath, JSON.stringify(existing, null, 2));

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("error", { status: 500 });
  }
}
