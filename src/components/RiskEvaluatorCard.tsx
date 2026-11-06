'use client';

import React, { useState } from 'react';

export default function RiskEvaluatorCard() {
  const [contractId, setContractId] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/agent/risk-evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data);
      } else {
        setError(data.error || 'Evaluation failed');
      }
    } catch (err) {
      setError('Error connecting to risk evaluator agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Predictive AI Risk Guardrail</h3>
        <span className="text-xs text-amber-400 font-mono">Autonomous Health Monitor</span>
      </div>

      <form onSubmit={handleEvaluate} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Analyze Contract Velocity & Failure Probability</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Contract ID (optional)"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Evaluating...' : '🛡️ Run Risk Audit'}
          </button>
        </div>
        {error && <p className="text-xs text-rose-400 font-mono">{error}</p>}
      </form>

      {report && (
        <div className="bg-amber-950/20 border border-amber-800/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-400 font-mono">STATUS: {report.riskLevel}</span>
            <span className="text-gray-300 font-mono">Risk Index: {report.riskScore}%</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden border border-gray-800">
            <div 
              className={`h-full ${report.riskScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
              style={{ width: `${report.riskScore}%` }}
            />
          </div>
          <p className="text-gray-300 text-xs italic">{report.recommendation}</p>
        </div>
      )}
    </div>
  );
}