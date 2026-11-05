import { NextRequest, NextResponse } from 'next/server';
import 'server-only';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    const transmissionId = headers.get('paypal-transmission-id');
    const transmissionTime = headers.get('paypal-transmission-time');
    const certUrl = headers.get('paypal-cert-url');
    const authAlgo = headers.get('paypal-auth-algo');
    const transmissionSig = headers.get('paypal-transmission-sig');
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig || !webhookId) {
      return NextResponse.json({ error: 'MISSING_SIGNATURE_HEADERS' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Verify signature using PayPal API
    const verificationResponse = await paypalClient.request<{ verification_status: string }>(
      '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        body: {
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo,
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: event,
        },
      }
    );

    if (verificationResponse.verification_status !== 'SUCCESS') {
      console.error('[SECURITY ALERT] Invalid PayPal Webhook Signature Rejected.');
      return NextResponse.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
    }

    // Process Verified Events
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const resource = event.resource;
        const customId = resource.custom_id;
        const captureId = resource.id;

        if (customId) {
          await prisma.escrowState.update({
            where: { contractId: customId },
            data: {
              status: 'APPROVED',
              captureId: captureId,
              amountCaptured: parseFloat(resource.amount.value),
            },
          });
        }
        break;
      }

      case 'CUSTOMER.DISPUTE.CREATED': {
        const dispute = event.resource;
        const customId = dispute.custom_id;

        if (customId) {
          await prisma.contract.update({
            where: { id: customId },
            data: { status: 'DISPUTED' },
          });
        }
        break;
      }
    }

    return NextResponse.json({ status: 'VERIFIED_AND_PROCESSED' }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR', message: err.message }, { status: 500 });
  }
}
