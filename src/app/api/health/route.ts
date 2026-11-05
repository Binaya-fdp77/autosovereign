import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  const acceptHeader = request.headers.get('accept') || '';
  
  let dbStatus = 'UP';
  try {
    const db = prisma as any;
    await db.contract.findFirst();
  } catch (err) {
    dbStatus = 'DOWN';
  }

  const paypalConfigured = process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_ID.includes('placeholder');
  const healthData = {
    status: dbStatus === 'UP' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      paypalAuth: paypalConfigured ? 'UP' : 'MOCK_FALLBACK_ACTIVE',
    },
    environment: process.env.NODE_ENV || 'development',
  };

  // If requested from a browser navigation, render a sleek HTML status card instead of raw JSON
  if (acceptHeader.includes('text/html')) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AutoSovereign - System Health</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen font-sans">
        <div class="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">System Telemetry</h1>
            <span class="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold rounded-full animate-pulse">LIVE</span>
          </div>
          <div class="space-y-4 text-sm">
            <div class="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span class="text-slate-400">System Status</span>
              <span class="font-bold text-emerald-400">${healthData.status}</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span class="text-slate-400">Database (SQLite/Prisma)</span>
              <span class="font-bold text-emerald-400">${healthData.services.database}</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span class="text-slate-400">PayPal REST v2 Engine</span>
              <span class="font-bold text-indigo-400">${healthData.services.paypalAuth}</span>
            </div>
            <div class="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span class="text-slate-400">Environment</span>
              <span class="font-mono text-xs text-slate-300">${healthData.environment}</span>
            </div>
          </div>
          <div class="mt-8 text-center">
            <a href="/dashboard" class="inline-block w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-lg text-white transition text-sm shadow">Return to Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  }

  return NextResponse.json(healthData, { status: dbStatus === 'UP' ? 200 : 503 });
}