'use client';
import { useState, useEffect } from 'react';
import UserManagementCard from '@/components/UserManagementCard';
import DisputeArenaCard from '@/components/DisputeArenaCard';
import CodeAuditorCard from '@/components/CodeAuditorCard';
import FinancialFlowchart from '@/components/FinancialFlowchart';
import PayoutWaterfallHistoryCard from '@/components/PayoutWaterfallHistoryCard';
import SettlementCertificateCard from '@/components/SettlementCertificateCard';
import AgentPipelineVisualizer from '@/components/AgentPipelineVisualizer';
import AgentMetricsMonitor from '@/components/AgentMetricsMonitor';

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState('1000');
  const [logs, setLogs] = useState<any[]>([]);
  const [telemetryFilter, setTelemetryFilter] = useState('ALL');

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          setContracts(data.contracts || []);
        }
      } catch {
        console.error('API contracts returned non-JSON:', text);
      }
    } catch (e) {
      console.error('Failed to fetch contracts', e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/agent/swarm-stream');
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch {
        console.error('API swarm-stream returned non-JSON:', text);
      }
    } catch (e) {
      console.error('Failed to fetch logs', e);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/agent/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, budget: parseFloat(budget) })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid response: ' + text.slice(0, 100));
      }

      if (data.success) {
        alert('Escrow Contract auto-architected & locked in escrow!');
        setPrompt('');
        fetchContracts();
        fetchLogs();
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReleasePayout = async (contractId: string) => {
    setActionLoading(contractId);
    try {
      const res = await fetch('/api/paypal/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned invalid response');
      }

      if (data.success) {
        alert('Payout Waterfall executed successfully! Funds released.');
        fetchContracts();
        fetchLogs();
      } else {
        alert('Payout Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="mb-4 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          AutoSovereign Control Center
        </h1>
        <p className="text-slate-400 text-sm mt-1">Autonomous AI Escrow & Contingency Platform</p>
      </header>

      {/* Live Agent Latency & Performance Monitor Bar */}
      <AgentMetricsMonitor />

      {/* Autonomous Agent Pipeline Visualizer */}
      <AgentPipelineVisualizer />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Enterprise User Directory</h2>
          <UserManagementCard />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-indigo-400">AI Escrow Architect</h2>
          <p className="text-xs text-slate-400 mb-4">
            Describe your project. GPT-4o automatically structures milestones and locks funds in escrow.
          </p>
          <form onSubmit={handleCreateContract} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Project Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Build Next.js Web3 Dashboard with Tailwind CSS"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                rows={2}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Budget ($ USD)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Architecting...' : 'Generate & Lock Escrow'}
            </button>
          </form>
        </div>
      </div>

      {/* D3 Real-Time Financial Flowchart */}
      <div className="mt-6">
        <FinancialFlowchart contracts={contracts} />
      </div>

      {/* Interactive Agent Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CodeAuditorCard contracts={contracts} onAuditCompleted={() => { fetchContracts(); fetchLogs(); }} />
        <DisputeArenaCard contracts={contracts} onDisputeResolved={() => { fetchContracts(); fetchLogs(); }} />
      </div>

      {/* Cryptographic Settlement Certificate Card */}
      <div className="mt-6">
        <SettlementCertificateCard contracts={contracts} onCertificateGenerated={() => { fetchContracts(); fetchLogs(); }} />
      </div>

      {/* Payout Waterfall History Table */}
      <div className="mt-6">
        <PayoutWaterfallHistoryCard logs={logs} />
      </div>

      {/* Active Contracts & Escrows Display */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-emerald-400">Active Escrow Contracts</h2>
        {contracts.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No contracts generated yet. Use the Architect above to create one.</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => (
              <div key={c.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="bg-slate-900 border border-slate-800 text-amber-400 px-2.5 py-1 rounded font-semibold">
                      {c.status}
                    </span>
                    <span>Budget: <strong className="text-emerald-400">${c.totalAmount} {c.currency}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.status === 'LOCKED_IN_ESCROW' && (
                    <button
                      onClick={() => handleReleasePayout(c.id)}
                      disabled={actionLoading === c.id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shadow"
                    >
                      {actionLoading === c.id ? 'Releasing...' : 'Release Escrow Payout'}
                    </button>
                  )}
                  <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full">
                    ID: {c.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Swarm Telemetry Stream */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-400">AI Swarm Telemetry Stream</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live event stream across all autonomous agent roles.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={telemetryFilter}
              onChange={(e) => setTelemetryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Agents</option>
              <option value="AI_ESCROW_ARCHITECT">Architect</option>
              <option value="AI_CODE_AUDITOR">Auditor</option>
              <option value="AI_DISPUTE_MEDIATOR">Mediator</option>
              <option value="PAYPAL_PAYOUT_WATERFALL">Waterfall</option>
              <option value="SETTLEMENT_CERTIFICATE_ISSUER">Cert Issuer</option>
            </select>
            <button
              onClick={() => setLogs([])}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition-colors border border-slate-700 font-medium"
            >
              Clear Stream
            </button>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs space-y-2">
          {logs.filter(log => telemetryFilter === 'ALL' || log.agentRole === telemetryFilter).length === 0 ? (
            <p className="text-slate-600 italic">No telemetry events found for the selected filter...</p>
          ) : (
            logs
              .filter(log => telemetryFilter === 'ALL' || log.agentRole === telemetryFilter)
              .map((log, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-1 flex justify-between items-center">
                  <span className="text-cyan-400">[{log.agentRole}] {log.action}</span>
                  <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}