'use client';

import React, { useState } from 'react';

export default function PayPalSandboxWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/paypal/sandbox-setup');
      const json = await res.json();
      if (json.success) {
        setData(json.profiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSimulatedWebhook = async (eventType: string) => {
    setSimulating(true);
    setSimMessage(null);
    try {
      const res = await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType }),
      });
      const json = await res.json();
      if (json.success) {
        setSimMessage(`Triggered ${eventType}`);
        setTimeout(() => setSimMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-amber-900/50 p-4 rounded-xl space-y-3 font-mono text-xs shadow-xl">
      <div className="text-amber-400 font-semibold flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          PayPal Sandbox Inspector
        </span>
        <button
          onClick={checkStatus}
          disabled={loading}
          className="bg-amber-600/20 hover:bg-amber-600/40 border border-amber-700/50 text-amber-300 text-[10px] px-2.5 py-1 rounded transition disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Inspect Connection'}
        </button>
      </div>

      {data && (
        <div className="space-y-2 bg-gray-900 p-3 rounded-lg text-gray-300 border border-gray-800">
          <div className="flex justify-between items-center border-b border-gray-800 pb-1 text-[11px]">
            <span className="text-gray-400">Gateway Status:</span>
            <span className="text-emerald-400 font-bold">{data.gateway.clientId}</span>
          </div>
          <div className="text-[10px] space-y-1">
            <p><strong className="text-amber-400">Buyer:</strong> {data.buyer.email} ({data.buyer.balance})</p>
            <p><strong className="text-emerald-400">Seller:</strong> {data.seller.email}</p>
          </div>
        </div>
      )}

      {/* Webhook Simulation Controls */}
      <div className="pt-2 border-t border-gray-800 space-y-2">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Judge Demo Actions</p>
        <div className="flex gap-2">
          <button
            onClick={() => triggerSimulatedWebhook('PAYMENT.CAPTURE.COMPLETED')}
            disabled={simulating}
            className="flex-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[10px] py-1.5 rounded transition font-sans"
          >
            {simulating ? 'Firing...' : 'Simulate Capture Webhook'}
          </button>
          <button
            onClick={() => triggerSimulatedWebhook('PAYOUT.ITEM.SUCCESS')}
            disabled={simulating}
            className="flex-1 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-[10px] py-1.5 rounded transition font-sans"
          >
            {simulating ? 'Firing...' : 'Simulate Payout Webhook'}
          </button>
        </div>
        {simMessage && (
          <p className="text-emerald-400 text-[10px] text-center animate-fade-in">{simMessage}</p>
        )}
      </div>
    </div>
  );
}