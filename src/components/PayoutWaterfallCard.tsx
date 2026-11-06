'use client';

import React, { useState } from 'react';

export default function PayoutWaterfallCard() {
  const [contractId, setContractId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWaterfall = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/payouts/waterfall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Payout waterfall execution failed');
      }
    } catch (err) {
      setError('Error connecting to payout waterfall gateway');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">PayPal Batch Payout Waterfall</h3>
        <span className="text-xs text-cyan-400 font-mono">Multi-Recipient Distribution</span>
      </div>

      <form onSubmit={handleWaterfall} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Execute Automated Split Payouts (Contractor, Fees, Pool)</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Contract ID (optional)"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Disbursing...' : '💸 Trigger Waterfall'}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
      </form>

      {result && (
        <div className="bg-cyan-950/20 border border-cyan-800/50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400 font-mono">TOTAL DISBURSED: ${result.distribution.totalAmount}</span>
            <span className="text-gray-300 font-mono">Status: RELEASED</span>
          </div>
          <div className="space-y-1.5">
            {result.distribution.recipients.map((r: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-gray-900 px-3 py-2 rounded border border-gray-800 text-xs font-mono">
                <div>
                  <span className="text-white font-bold">{r.role}</span>
                  <span className="text-gray-400 text-[10px] block">{r.email}</span>
                </div>
                <span className="text-cyan-400 font-bold">${r.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}