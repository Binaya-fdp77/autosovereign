'use client';
import { useState } from 'react';

interface MultiAgentJuryCardProps {
  contracts: any[];
  onVerdictReached: () => void;
}

export default function MultiAgentJuryCard({ contracts, onVerdictReached }: MultiAgentJuryCardProps) {
  const [selectedContractId, setSelectedContractId] = useState('');
  const [disputeReason, setDisputeReason] = useState('Deliverable missed non-functional code quality requirements.');
  const [loading, setLoading] = useState(false);
  const [juryResult, setJuryResult] = useState<any>(null);

  const handleConveneJury = async () => {
    if (!selectedContractId) {
      alert('Please select an active contract to convene the jury.');
      return;
    }

    setLoading(true);
    setJuryResult(null);

    try {
      const res = await fetch('/api/agent/dispute-jury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: selectedContractId, disputeReason })
      });

      const data = await res.json();
      if (data.success) {
        setJuryResult(data);
        onVerdictReached();
      } else {
        alert('Jury Convene Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-amber-400">Multi-Agent Consensus Jury</h2>
          <p className="text-xs text-slate-400 mt-0.5">3-Agent Swarm Voting Engine (Auditor, Risk & Compliance)</p>
        </div>
        <span className="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-full">
          3 Agents Active
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Escrow Contract</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Select Contract for Dispute Arbitration --</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} (${c.totalAmount})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Dispute Claims & Evidence</label>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={handleConveneJury}
          disabled={loading || !selectedContractId}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 px-4 rounded-lg text-xs transition-colors disabled:opacity-50"
        >
          {loading ? 'Agents Voting...' : 'Convene Multi-Agent Swarm Jury'}
        </button>
      </div>

      {juryResult && (
        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-400">Consensus Verdict:</span>
            <span className="text-sm font-bold text-emerald-400">{juryResult.consensusVerdict}</span>
          </div>

          <div className="space-y-2">
            {juryResult.votes.map((v: any, idx: number) => (
              <div key={idx} className="text-xs border-b border-slate-900 pb-1.5">
                <div className="flex justify-between font-mono text-cyan-400">
                  <span>[{v.agentRole}]</span>
                  <span className={v.vote === 'FAVOR_SELLER' ? 'text-emerald-400' : 'text-rose-400'}>{v.vote}</span>
                </div>
                <p className="text-slate-400 mt-0.5">{v.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}