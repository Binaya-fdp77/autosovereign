import { NextRequest, NextResponse } from 'next/server';
import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';
import { parsePayPalError } from '@/lib/paypal/error-parser';

export async function POST(req: NextRequest) {
  try {
    const { contractId, returnUrl, cancelUrl } = await req.json();

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: contract.id,
          description: contract.title,
          custom_id: contract.id,
          amount: {
            currency_code: contract.currency,
            value: contract.totalAmount.toString(),
          },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: 'PAY_NOW',
      },
    };

    const order = await paypalClient.request<{ id: string; status: string; links: Array<{ href: string; rel: string }> }>(
      '/v2/checkout/orders',
      {
        method: 'POST',
        body: orderPayload,
      }
    );

    await prisma.escrowState.upsert({
      where: { contractId: contract.id },
      update: { paypalOrderId: order.id, status: 'CREATED' },
      create: {
        contractId: contract.id,
        paypalOrderId: order.id,
        status: 'CREATED',
        amountCaptured: 0,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id, links: order.links });
  } catch (error: unknown) {
    const parsed = parsePayPalError(error);
    return NextResponse.json({ error: parsed.issue, message: parsed.message }, { status: parsed.statusCode });
  }
}
