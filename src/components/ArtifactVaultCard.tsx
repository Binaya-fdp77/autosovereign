'use client';

import React, { useState } from 'react';

export default function ArtifactVaultCard() {
  const [contractId, setContractId] = useState('');
  const [artifactUrl, setArtifactUrl] = useState('');
  const [commitSummary, setCommitSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/agent/ai-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: contractId || 'mock-contract', artifactUrl, commitSummary }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Artifact securely uploaded and queued for AI verification.');
      } else {
        setError(data.error || 'Failed to submit artifact');
      }
    } catch (err: any) {
      setError('Error connecting to artifact vault');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Deliverable Artifact Vault</h3>
        <span className="text-xs text-emerald-400 font-mono">Verifiable Proof</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Submit GitHub PR, Deploy URL, or Commit Proof</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Contract ID (optional)"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <input
            type="url"
            placeholder="Artifact URL (e.g., https://github.com/...)"
            value={artifactUrl}
            onChange={(e) => setArtifactUrl(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            required
          />
        </div>
        <textarea
          placeholder="Commit summary or technical proof description..."
          value={commitSummary}
          onChange={(e) => setCommitSummary(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-xs text-white focus:outline-none focus:border-emerald-500 h-16 resize-none"
          required
        />
        <div className="flex justify-between items-center pt-1">
          {error && <span className="text-xs text-rose-400 font-mono">{error}</span>}
          {successMsg && <span className="text-xs text-emerald-400 font-mono">{successMsg}</span>}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            {loading ? 'Locking Proof...' : '🔒 Secure Artifact'}
          </button>
        </div>
      </form>
    </div>
  );
}