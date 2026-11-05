import { NextResponse } from 'next/server';
import 'server-only';
import { prisma } from '@/lib/db/prisma';
import { paypalClient } from '@/lib/paypal/client';

export async function GET() {
  const healthCheck = {
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    services: {
      database: 'DOWN',
      paypalAuth: 'DOWN',
    },
    environment: process.env.NODE_ENV || 'development',
  };

  // 1. Check PostgreSQL Database Connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'UP';
  } catch (dbError: any) {
    healthCheck.status = 'DEGRADED';
    healthCheck.services.database = `ERROR: ${dbError.message}`;
  }

  // 2. Check PayPal API OAuth2 Token Generation
  try {
    const token = await paypalClient.getAccessToken();
    if (token) {
      healthCheck.services.paypalAuth = 'UP';
    } else {
      healthCheck.status = 'DEGRADED';
      healthCheck.services.paypalAuth = 'FAILED_TO_ACQUIRE_TOKEN';
    }
  } catch (paypalError: any) {
    healthCheck.status = 'DEGRADED';
    healthCheck.services.paypalAuth = `ERROR: ${paypalError.message}`;
  }

  const statusCode = healthCheck.status === 'HEALTHY' ? 200 : 503;
  return NextResponse.json(healthCheck, { status: statusCode });
}
