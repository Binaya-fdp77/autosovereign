'use client';
import { useState } from 'react';

interface CodeAuditorProps {
  contracts: any[];
  onAuditCompleted: () => void;
}

export default function CodeAuditorCard({ contracts, onAuditCompleted }: CodeAuditorProps) {
  const [selectedContractId, setSelectedContractId] = useState('');
  const [repoUrl, setRepoUrl] = useState('https://github.com/autosovereign/escrow-core');
  const [prNumber, setPrNumber] = useState('42');
  const [commitDiff, setCommitDiff] = useState('export function verifyEscrow(id: string) { expect(id).toBeDefined(); return true; }');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) {
      alert('Please select a target contract.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/agent/auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContractId,
          repoUrl,
          prNumber: parseInt(prNumber) || 1,
          commitDiff
        })
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.report);
        onAuditCompleted();
      } else {
        alert('Audit error: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-semibold mb-2 text-cyan-400">Automated Repository Delivery Verifier</h2>
      <p className="text-xs text-slate-400 mb-4">
        AST Parsing & Security Auditor. Inspects Pull Requests and commit diffs to auto-verify milestone completion.
      </p>

      <form onSubmit={handleRunAudit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Contract</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Select contract to audit...</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} (${c.totalAmount}) - [{c.status}]
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Repository URL</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">PR #</label>
            <input
              type="number"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Commit Diff Snippet / PR Sample</label>
          <textarea
            value={commitDiff}
            onChange={(e) => setCommitDiff(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedContractId}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Auditing Codebase & Tests...' : 'Execute Automated Code Audit'}
        </button>
      </form>

      {auditResult && (
        <div className="mt-4 bg-slate-950 border border-cyan-950 p-3 rounded-lg text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-cyan-300">Audit Status</span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${auditResult.verified ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
              {auditResult.verified ? 'PASSED & AUTO-VERIFIED' : 'FAILED'}
            </span>
          </div>
          <p className="text-slate-300">{auditResult.summary}</p>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-900 text-center text-xs">
            <div className="bg-slate-900 p-1.5 rounded">
              <span className="text-slate-400 block text-[10px]">Quality Score</span>
              <strong className="text-cyan-400">{auditResult.qualityScore}/100</strong>
            </div>
            <div className="bg-slate-900 p-1.5 rounded">
              <span className="text-slate-400 block text-[10px]">Tests Passed</span>
              <strong className={auditResult.hasTests ? 'text-emerald-400' : 'text-amber-400'}>
                {auditResult.hasTests ? 'YES' : 'NO'}
              </strong>
            </div>
            <div className="bg-slate-900 p-1.5 rounded">
              <span className="text-slate-400 block text-[10px]">Security Vulnerabilities</span>
              <strong className={auditResult.hasSecurityRisk ? 'text-rose-400' : 'text-emerald-400'}>
                {auditResult.hasSecurityRisk ? 'DETECTED' : 'CLEAR'}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}