'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardClient({ contracts }: { contracts: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateEscrow = async (contractId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create PayPal escrow');

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMilestone = async (contractId: string, milestoneId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch('/api/agent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, milestoneId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI verification failed');

      setSuccessMsg(data.message);
      window.location.reload(); // Refresh to display updated status and agent logs
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            AutoSovereign Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous Enterprise Micro-Escrow & Contingency Agent Protocol
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {error && <span className="text-xs text-rose-400 bg-rose-950 px-3 py-1 rounded border border-rose-800">{error}</span>}
          {successMsg && <span className="text-xs text-emerald-400 bg-emerald-950 px-3 py-1 rounded border border-emerald-800">{successMsg}</span>}
          <Link
            href="/api/health"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition border border-slate-700"
          >
            System Health
          </Link>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Contracts</span>
          <p className="text-3xl font-extrabold mt-2 text-white">{contracts.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Locked Micro-Escrow</span>
          <p className="text-3xl font-extrabold mt-2 text-emerald-400">
            ${contracts
              .reduce((acc: number, c: any) => acc + Number(c.totalAmount || 0), 0)
              .toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Agent Inspections</span>
          <p className="text-3xl font-extrabold mt-2 text-indigo-400">
            {contracts.reduce((acc: number, c: any) => acc + (c.agentLogs?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">PayPal Sandbox Status</span>
          <div className="flex items-center gap-2 mt-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-200">REST v2 Connected</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Contracts Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Active Micro-Escrow Contracts</h2>

          {contracts.length === 0 ? (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500">
              No contracts found in database.
            </div>
          ) : (
            contracts.map((contract: any) => (
              <div
                key={contract.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{contract.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1">ID: {contract.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        contract.status === 'VERIFIED' || contract.status === 'RELEASED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {contract.status}
                    </span>
                    <button
                      disabled={loading}
                      onClick={() => handleCreateEscrow(contract.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold rounded-lg shadow transition text-white"
                    >
                      {loading ? 'Processing...' : 'Lock Escrow (PayPal)'}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-6">{contract.description}</p>

                {/* Milestones & AI Trigger Buttons */}
                <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                    Milestones & AI Agent Inspection
                  </h4>
                  {contract.milestones?.map((m: any) => (
                    <div key={m.id} className="flex justify-between items-center text-sm py-2 border-b border-slate-900 last:border-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            m.status === 'VERIFIED' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        ></span>
                        <span className="text-slate-200">{m.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 text-xs">${Number(m.amount).toFixed(2)}</span>
                        {m.status === 'VERIFIED' ? (
                          <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                            VERIFIED
                          </span>
                        ) : (
                          <button
                            disabled={loading}
                            onClick={() => handleVerifyMilestone(contract.id, m.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold rounded text-white transition shadow"
                          >
                            AI Verify & Release
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Escrow Status Line */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <div>
                    <span>PayPal Order: </span>
                    <span className="font-mono text-slate-200">
                      {contract.escrowState?.paypalOrderId || 'PENDING'}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-100">
                    Total: ${Number(contract.totalAmount).toFixed(2)} {contract.currency}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Agent Telemetry Logs Column */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200">AI Agent Decision Feed</h2>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 max-h-[700px] overflow-y-auto">
            {contracts.flatMap((c: any) => c.agentLogs || []).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No agent decision logs recorded yet.</p>
            ) : (
              contracts
                .flatMap((c: any) => c.agentLogs || [])
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((log: any) => (
                  <div key={log.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                        {log.agentRole}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-200">{log.action}</p>
                    {log.payload && (
                      <pre className="p-2 bg-slate-900 rounded text-[10px] font-mono text-slate-400 overflow-x-auto border border-slate-800/80">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}