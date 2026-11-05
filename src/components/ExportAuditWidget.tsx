'use client';

import React, { useState } from 'react';

export default function ExportAuditWidget() {
  const [loading, setLoading] = useState(false);

  const handleDownloadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/export-audit');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autosovereign-audit-attestation-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download cryptographic audit attestation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 border border-purple-900/50 p-4 rounded-xl space-y-3 font-mono text-xs">
      <div className="text-purple-400 font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
        Cryptographic Audit Attestation Ledger
      </div>
      <p className="text-gray-400 text-[11px]">
        Generate a tamper-proof SHA-256 hashed JSON bundle of all autonomous agent telemetry and transaction records for compliance and judging review.
      </p>
      <button
        onClick={handleDownloadReport}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
      >
        {loading ? 'Generating Attestation...' : 'Download Cryptographic Audit Report'}
      </button>
    </div>
  );
}