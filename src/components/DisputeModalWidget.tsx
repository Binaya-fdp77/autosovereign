'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DisputeModalWidget({ contractId, milestoneId }: { contractId: string; milestoneId: string }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    try {
      const res = await fetch('/api/agent/mediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, milestoneId, disputeReason: reason }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        router.refresh();
      } else {
        alert(data.error || 'Mediation failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-yellow-900/50 p-4 rounded-xl space-y-3">
      <div className="text-yellow-400 font-mono text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
        Multi-Agent Dispute Arbitration
      </div>
      {result ? (
        <div className="bg-gray-900 p-3 rounded-lg text-xs space-y-1 text-gray-300">
          <p className="font-semibold text-emerald-400">Resolved: {result.settlementPercentage}% released to seller (${result.payoutAmount})</p>
          <p className="italic text-gray-400">{result.verdict}</p>
        </div>
      ) : (
        <form onSubmit={handleDispute} className="space-y-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for milestone dispute..."
            className="w-full bg-gray-900 border border-gray-800 rounded p-2 text-xs text-white focus:outline-none focus:border-yellow-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-semibold px-3 py-1.5 rounded text-xs transition disabled:opacity-50"
          >
            {loading ? 'Arbitrating...' : 'Trigger Mediator Agent'}
          </button>
        </form>
      )}
    </div>
  );
}