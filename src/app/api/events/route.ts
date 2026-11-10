import { NextResponse } from "next/server";
import { sseHub } from "@/lib/events/sse-hub";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now();
      sseHub.addClient({ id: clientId, controller });

      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("event: connected\ndata: {\"status\":\"connected\"}\n\n"));

      reqClosedSignal(controller, () => sseHub.removeClient(clientId));
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

function reqClosedSignal(controller: ReadableStreamDefaultController, onClose: () => void) {
  setTimeout(() => {
    try {
      controller.close();
      onClose();
    } catch {}
  }, 86400000);
}
