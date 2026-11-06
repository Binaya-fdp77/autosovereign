'use client';

import React, { useState } from 'react';

export default function WebhookSimulatorCard() {
  const [contractId, setContractId] = useState('');
  const [eventType, setEventType] = useState('PAYMENT.CAPTURE.COMPLETED');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, eventType }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Simulation failed');
      }
    } catch (err: any) {
      setError('Error connecting to webhook simulator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">PayPal Webhook Simulator</h3>
        <span className="text-xs text-blue-400 font-mono">Event-Driven Gateway</span>
      </div>

      <form onSubmit={handleSimulate} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Trigger Simulated PayPal Sandbox Events</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Contract ID (optional)"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          />
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED</option>
            <option value="PAYOUTS.ITEM.SUCCEEDED">PAYOUTS.ITEM.SUCCEEDED</option>
            <option value="PAYMENT.CAPTURE.DENIED">PAYMENT.CAPTURE.DENIED</option>
          </select>
        </div>
        <div className="flex justify-between items-center pt-1">
          {error && <span className="text-xs text-rose-400 font-mono">{error}</span>}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            {loading ? 'Firing Event...' : '⚡ Fire Webhook Event'}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-blue-950/30 border border-blue-800/60 p-4 rounded-lg space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-blue-400 font-mono">STATUS: {result.contract?.status}</span>
            <span className="text-gray-400 font-mono text-[11px]">ID: {result.contract?.id.slice(0, 8)}...</span>
          </div>
          <p className="text-gray-300 text-xs">{result.message}</p>
        </div>
      )}
    </div>
  );
}