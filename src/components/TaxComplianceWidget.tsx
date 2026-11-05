'use client';

import React, { useState } from 'react';

export default function TaxComplianceWidget({ contractId }: { contractId: string }) {
  const [jurisdiction, setJurisdiction] = useState('US');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/agent/tax-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, jurisdiction }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || 'Tax verification failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-emerald-900/50 p-4 rounded-xl space-y-3 font-mono text-xs">
      <div className="text-emerald-400 font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        Autonomous Tax & Compliance Agent
      </div>
      <form onSubmit={handleVerifyTax} className="flex gap-2 items-center">
        <select
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="US">United States (IRS 1099)</option>
          <option value="EU">European Union (VAT)</option>
          <option value="GLOBAL">Global Standard</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1.5 rounded transition disabled:opacity-50"
        >
          {loading ? 'Auditing...' : 'Run Tax Audit'}
        </button>
      </form>
      {result && (
        <div className="bg-gray-900 p-3 rounded-lg space-y-1.5 text-gray-300">
          <p className="text-emerald-400 font-semibold">{result.complianceStandard}</p>
          <p className="text-gray-400">Withholding: ${result.withholdingAmount} | Net Payout: ${result.netPayout}</p>
          <p className="text-[10px] text-gray-500 font-mono truncate">Hash: {result.complianceHash}</p>
        </div>
      )}
    </div>
  );
}