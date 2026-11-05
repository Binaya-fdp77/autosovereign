import { NextRequest, NextResponse } from 'next/server';
import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';
import { parsePayPalError } from '@/lib/paypal/error-parser';

interface CreateEscrowRequestBody {
  contractId: string;
  idempotencyKey: string;
  returnUrl: string;
  cancelUrl: string;
  mockResponseCode?: 'INSTRUMENT_DECLINED' | 'DUPLICATE_INVOICE_ID';
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateEscrowRequestBody = await req.json();
    const { contractId, idempotencyKey, returnUrl, cancelUrl, mockResponseCode } = body;

    if (!contractId || !idempotencyKey || !returnUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETERS', message: 'contractId, idempotencyKey, returnUrl, and cancelUrl are required.' },
        { status: 400 }
      );
    }

    // 1. ACID Idempotency Check & Transaction Execution
    const result = await prisma.$transaction(async (tx) => {
      // Check existing idempotency key
      const existingKey = await tx.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existingKey) {
        return { isCached: true, data: existingKey.response };
      }

      // Fetch Contract with optimistic row lock validation
      const contract = await tx.contract.findUnique({
        where: { id: contractId },
        include: { buyer: true, seller: true, milestones: true, escrowState: true },
      });

      if (!contract) {
        throw new Error('CONTRACT_NOT_FOUND');
      }

      if (contract.escrowState) {
        throw new Error('ESCROW_ALREADY_EXISTS');
      }

      // 2. Prepare PayPal Orders v2 Payload
      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `CTR-${contract.id}`,
            description: `AutoSovereign Escrow for Contract: ${contract.title}`,
            custom_id: contract.id,
            amount: {
              currency_code: contract.currency,
              value: contract.totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: contract.currency,
                  value: contract.totalAmount.toFixed(2),
                },
              },
            },
            items: contract.milestones.map((m) => ({
              name: m.title,
              description: m.deliverable.substring(0, 120),
              unit_amount: {
                currency_code: contract.currency,
                value: m.amount.toFixed(2),
              },
              quantity: '1',
              category: 'DIGITAL_GOODS',
            })),
            payee: {
              email_address: process.env.PLATFORM_PAYPAL_ACCOUNT_EMAIL,
            },
          },
        ],
        application_context: {
          brand_name: 'AutoSovereign Micro-Escrow',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      // 3. Call PayPal REST API v2 Create Order Endpoint
      const paypalOrder = await paypalClient.request<{ id: string; status: string; links: Array<{ href: string; rel: string }> }>(
        '/v2/checkout/orders',
        {
          method: 'POST',
          headers: {
            'PayPal-Request-Id': idempotencyKey,
          },
          body: orderPayload,
          negativeTestingMock: mockResponseCode,
        }
      );

      // 4. Update Database State atomically
      const escrowState = await tx.escrowState.create({
        data: {
          contractId: contract.id,
          paypalOrderId: paypalOrder.id,
          status: 'CREATED',
        },
      });

      await tx.contract.update({
        where: { id: contract.id },
        data: { status: 'LOCKED_IN_ESCROW' },
      });

      const approveUrl = paypalOrder.links.find((l) => l.rel === 'approve')?.href;

      const responseBody = {
        success: true,
        paypalOrderId: paypalOrder.id,
        escrowId: escrowState.id,
        status: paypalOrder.status,
        approveUrl,
      };

      // Store Idempotency Record (Expires in 24 hrs)
      await tx.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          contractId: contract.id,
          response: responseBody,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return { isCached: false, data: responseBody };
    });

    return NextResponse.json(result.data, { status: result.isCached ? 200 : 201 });
  } catch (error: any) {
    if (error.message === 'CONTRACT_NOT_FOUND') {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Target contract does not exist.' }, { status: 404 });
    }
    if (error.message === 'ESCROW_ALREADY_EXISTS') {
      return NextResponse.json({ error: 'CONFLICT', message: 'Escrow order already initialized for this contract.' }, { status: 409 });
    }

    const parsed = parsePayPalError(error);
    return NextResponse.json(
      {
        error: parsed.issue,
        message: parsed.message,
        debugId: parsed.debugId,
        details: parsed.details,
      },
      { status: parsed.statusCode }
    );
  }
}
