import { Suspense } from 'react';
import { prisma } from '@/lib/db/prisma';
import AuditLedgerGrid from '@/components/AuditLedgerGrid';
import AiArchitectCard from '@/components/AiArchitectCard';
import AiTerminalWidget from '@/components/AiTerminalWidget';
import DisputeModalWidget from '@/components/DisputeModalWidget';
import FxBridgeWidget from '@/components/FxBridgeWidget';
import TaxComplianceWidget from '@/components/TaxComplianceWidget';
import ExportAuditWidget from '@/components/ExportAuditWidget';
import AgentSwarmWidget from '@/components/AgentSwarmWidget';

async function DashboardContent() {
  const db = prisma as any;
  
  let contracts = [];
  let agentLogs = [];

  try {
    contracts = await db.contract.findMany({
      include: { milestones: true, escrowState: true },
      orderBy: { createdAt: 'desc' },
    });

    agentLogs = await db.agentLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (e) {
    console.error('Database fetch error:', e);
  }

  const latestContractId = contracts.length > 0 ? contracts[0].id : null;
  const latestAmount = contracts.length > 0 ? Number(contracts[0].totalAmount || 1000) : 1000;

  return (
    <div className="space-y-8">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Contracts</p>
          <p className="text-3xl font-bold mt-2 text-white">{contracts.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">AI Telemetry Events</p>
          <p className="text-3xl font-bold mt-2 text-emerald-400">{agentLogs.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Protocol Status</p>
          <p className="text-3xl font-bold mt-2 text-blue-400">Autonomous</p>
        </div>
      </div>

      {/* Live Agent Swarm Visualizer */}
      <AgentSwarmWidget />

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <AiArchitectCard />
          {latestContractId && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 tracking-wide uppercase">Enterprise Sub-Agents</h3>
              <FxBridgeWidget contractId={latestContractId} baseAmount={latestAmount} />
              <TaxComplianceWidget contractId={latestContractId} />
              <ExportAuditWidget />
            </div>
          )}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Active Contracts ({contracts.length})</h2>
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl text-center text-gray-400">
                No active contracts found. Use the AI Escrow Architect to generate one!
              </div>
            ) : (
              contracts.map((c: any) => (
                <div key={c.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl shadow-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">{c.title}</h4>
                    <span className="text-emerald-400 font-mono text-sm">${Number(c.totalAmount || 0).toFixed(2)} USD</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">ID: {c.id}</div>
                  <div className="border-t border-gray-800 pt-3 space-y-3">
                    <p className="text-xs font-medium text-gray-300">Milestones & Agent Verification:</p>
                    {c.milestones.map((m: any) => (
                      <div key={m.id} className="space-y-3 bg-gray-950 p-3 rounded-lg border border-gray-800">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-200 font-medium">{m.title}</span>
                          <span className="text-blue-400 font-mono">${Number(m.amount || 0).toFixed(2)} ({m.status})</span>
                        </div>
                        {m.status !== 'VERIFIED' && (
                          <div className="space-y-2">
                            <AiTerminalWidget contractId={c.id} milestoneId={m.id} milestoneTitle={m.title} />
                            <DisputeModalWidget contractId={c.id} milestoneId={m.id} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AG Grid Enterprise Audit Ledger Section */}
      <div className="space-y-4 pt-6 border-t border-gray-800">
        <h2 className="text-xl font-bold tracking-tight">Audit & Telemetry Stream</h2>
        <AuditLedgerGrid data={agentLogs.map((log: any) => ({
          ...log,
          createdAt: new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19)
        }))} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              AutoSovereign Control Center
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Autonomous Escrow Orchestration & Verified Agent Telemetry
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              PayPal Sandbox Active
            </span>
          </div>
        </div>

        <Suspense fallback={<div className="text-gray-400 py-12 text-center">Loading autonomous telemetry ledger...</div>}>
          <DashboardContent />
        </Suspense>

      </div>
    </div>
  );
}