import { addLog } from "@/lib/logger";

export async function POST(req: Request) {
  const body                      = await req.json();
  const { level, context, error } = body;

  addLog(level, error.message, context, {
    file: error.file,
    line: error.line,
    column: error.column,
    stack: error.stack,
  });

  return new Response("OK");
}
