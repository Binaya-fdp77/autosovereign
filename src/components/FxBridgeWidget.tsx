'use client';

import React, { useState } from 'react';

export default function FxBridgeWidget({ contractId, baseAmount }: { contractId: string; baseAmount: number }) {
  const [currency, setCurrency] = useState('EUR');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/agent/fx-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, targetCurrency: currency }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || 'Conversion failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-blue-900/50 p-4 rounded-xl space-y-3 font-mono text-xs">
      <div className="text-blue-400 font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        Global FX Bridge (Multi-Currency Payout)
      </div>
      <form onSubmit={handleConvert} className="flex gap-2 items-center">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="AUD">AUD ($)</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded transition disabled:opacity-50"
        >
          {loading ? 'Converting...' : 'Calculate FX Rate'}
        </button>
      </form>
      {result && (
        <div className="bg-gray-900 p-3 rounded-lg space-y-1 text-gray-300">
          <p className="text-emerald-400 font-semibold">
            Converted: {result.convertedAmount} {result.targetCurrency}
          </p>
          <p className="text-gray-400 text-[10px]">
            Base USD: ${result.originalAmount} | Rate: {result.exchangeRate}
          </p>
        </div>
      )}
    </div>
  );
}