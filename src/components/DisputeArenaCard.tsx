'use client';
import { useState } from 'react';

interface DisputeArenaProps {
  contracts: any[];
  onDisputeResolved: () => void;
}

export default function DisputeArenaCard({ contracts, onDisputeResolved }: DisputeArenaProps) {
  const disputedContracts = contracts.filter((c) => c.status === 'DISPUTED' || c.status === 'LOCKED_IN_ESCROW');
  const [selectedContractId, setSelectedContractId] = useState(disputedContracts[0]?.id || '');
  const [buyerClaim, setBuyerClaim] = useState('Deliverables incomplete. Critical APIs returning 500 errors.');
  const [sellerClaim, setSellerClaim] = useState('All source code delivered to GitHub repo with test pass logs.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleArbitrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) {
      alert('Please select a contract to arbitrate.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/agent/mediator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContractId,
          buyerClaim,
          sellerClaim
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        onDisputeResolved();
      } else {
        alert('Arbitration error: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-semibold mb-2 text-rose-400">AI Dispute Arbitration Arena</h2>
      <p className="text-xs text-slate-400 mb-4">
        Multi-party evidence evaluation. GPT-4o analyzes claims against milestone criteria to generate a weighted payout settlement.
      </p>

      <form onSubmit={handleArbitrate} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Contract</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
          >
            <option value="">Select a contract...</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} (${c.totalAmount}) - [{c.status}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Buyer Claim / Evidence</label>
          <textarea
            value={buyerClaim}
            onChange={(e) => setBuyerClaim(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            rows={2}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Seller Rebuttal / Evidence</label>
          <textarea
            value={sellerClaim}
            onChange={(e) => setSellerClaim(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            rows={2}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedContractId}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Evaluating Arguments...' : 'Run AI Arbitration & Execute Split'}
        </button>
      </form>

      {result && (
        <div className="mt-4 bg-slate-950 border border-rose-950 p-3 rounded-lg text-xs space-y-2">
          <p className="font-semibold text-rose-300">{result.verdict}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-900 text-center">
            <div className="bg-slate-900 p-2 rounded">
              <span className="text-slate-400 block">Seller Allocation</span>
              <strong className="text-emerald-400 text-sm">{result.sellerPercent}% (${result.sellerPayout})</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded">
              <span className="text-slate-400 block">Buyer Refund</span>
              <strong className="text-blue-400 text-sm">{result.buyerPercent}% (${result.buyerRefund})</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}