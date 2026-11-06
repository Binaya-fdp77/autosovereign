'use client';

import React, { useState } from 'react';

export default function PayPalDashboardCard() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/paypal/sync-sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Connected successfully to PayPal Sandbox API!');
      } else {
        setStatus(data.error || 'Connection failed.');
      }
    } catch (err) {
      setStatus('Error connecting to PayPal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">PayPal Developer Dashboard Link</h3>
        <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-400 text-[10px] font-mono rounded">
          REST API v2
        </span>
      </div>

      <form onSubmit={handleConnect} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Link Live Sandbox Credentials</p>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="PayPal Sandbox Client ID"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            required
          />
          <input
            type="password"
            placeholder="PayPal Sandbox Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            required
          />
        </div>
        <div className="flex justify-between items-center pt-1">
          {status && <span className="text-xs text-emerald-400 font-mono">{status}</span>}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sync Sandbox API'}
          </button>
        </div>
      </form>
    </div>
  );
}