'use client';

import React, { useState } from 'react';

export default function DisputeMediatorCard() {
  const [contractId, setContractId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [ruling, setRuling] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMediate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRuling(null);

    try {
      const res = await fetch('/api/agent/mediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractId: contractId || 'mock-contract-1', 
          milestoneId: milestoneId || 'mock-milestone-1', 
          disputeReason 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRuling(data.ruling);
      } else {
        setError(data.error || 'Mediation failed');
      }
    } catch (err: any) {
      setError('Error connecting to AI Mediator agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">AI Dispute Arbitration Agent</h3>
        <span className="text-xs text-amber-400 font-mono">Autonomous Mediator</span>
      </div>

      <form onSubmit={handleMediate} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Submit Dispute for Automated AI Ruling</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Contract ID (optional)"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />
          <input
            type="text"
            placeholder="Milestone ID (optional)"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
        <textarea
          placeholder="Describe dispute reason (e.g., 'Milestone contains bugs in the auth flow...')"
          value={disputeReason}
          onChange={(e) => setDisputeReason(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-xs text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
          required
        />
        <div className="flex justify-between items-center pt-1">
          {error && <span className="text-xs text-rose-400 font-mono">{error}</span>}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            {loading ? 'Arbitrating...' : '⚖️ Run AI Arbitration'}
          </button>
        </div>
      </form>

      {ruling && (
        <div className="bg-amber-950/30 border border-amber-800/60 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-400 font-mono">ARBITRATION RULING: {ruling.resolution}</span>
            <span className="bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded font-mono text-[11px]">{ruling.percentage}% Payout</span>
          </div>
          <p className="text-gray-300 text-xs italic">{ruling.note}</p>
        </div>
      )}
    </div>
  );
}