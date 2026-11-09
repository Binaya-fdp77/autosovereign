'use client';

interface PayoutWaterfallHistoryProps {
  logs: any[];
}

export default function PayoutWaterfallHistoryCard({ logs }: PayoutWaterfallHistoryProps) {
  const payoutLogs = logs.filter(
    (log) => log.agentRole === 'PAYPAL_PAYOUT_WATERFALL' || log.action === 'RESOLVE_DISPUTE_ARBITRATION'
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-400">Payout Waterfall History & Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of automated 90/5/5% split disbursements and arbitration settlements.
          </p>
        </div>
        <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full font-semibold">
          {payoutLogs.length} Executions Recorded
        </span>
      </div>

      {payoutLogs.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 text-center text-slate-500 text-xs italic">
          No payout waterfall events recorded yet. Release an escrow payout or resolve a dispute to populate the ledger.
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-950 border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Agent Role</th>
                <th className="p-3">Action Trigger</th>
                <th className="p-3">Contract Ref</th>
                <th className="p-3">Details / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-mono">
              {payoutLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  <td className="p-3 text-cyan-400 font-semibold">{log.agentRole}</td>
                  <td className="p-3 text-emerald-400">{log.action}</td>
                  <td className="p-3 text-slate-400">{log.contractId ? log.contractId.slice(0, 8) + '...' : 'N/A'}</td>
                  <td className="p-3 text-slate-300 truncate max-w-xs" title={log.payload}>
                    {log.payload}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}