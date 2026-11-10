import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sseHub } from "@/lib/events/sse-hub";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const event = await req.json();
    const eventType = event.event_type;
    const resource = event.resource;

    if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const paypalOrderId = resource.id || resource.supplementary_data?.related_ids?.order_id;

      if (paypalOrderId) {
        const escrow = await prisma.escrowState.findUnique({
          where: { paypalOrderId },
          include: { contract: true },
        });

        if (escrow) {
          const updatedEscrow = await prisma.escrowState.update({
            where: { id: escrow.id },
            data: {
              status: "COMPLETED",
              paypalCaptureId: resource.purchase_units?.[0]?.payments?.captures?.[0]?.id || resource.id,
            },
          });

          await prisma.contract.update({
            where: { id: escrow.contractId },
            data: { status: "IN_PROGRESS" },
          });

          await prisma.milestone.updateMany({
            where: { contractId: escrow.contractId },
            data: { status: "FUNDED" },
          });

          // Broadcast real-time update to all connected dashboard clients
          sseHub.broadcast("escrow-updated", {
            contractId: escrow.contractId,
            status: "IN_PROGRESS",
            escrowStatus: "COMPLETED",
            paypalOrderId,
            amountLocked: escrow.amountLocked,
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
