
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const initialEvent = `event: connected\ndata: ${JSON.stringify({ message: "Telemetry SSE stream active" })}\n\n`;
      controller.enqueue(encoder.encode(initialEvent));

      const interval = setInterval(() => {
        const pingEvent = `event: ping\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(pingEvent));
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}

