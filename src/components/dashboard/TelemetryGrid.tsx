'use client';

import React, { useEffect, useState } from 'react';

interface TelemetryLog {
  id: string;
  agentRole: string;
  action: string;
  timestamp: string;
}

export default function TelemetryGrid({ contractId }: { contractId: string }) {
  const [logs, setLogs] = useState<TelemetryLog[]>([]);

  useEffect(() => {
    // Poll or Stream live logs
    const interval = setInterval(async () => {
      const res = await fetch(`/api/agent/telemetry?contractId=${contractId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [contractId]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 font-mono">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-cyan-400">AG-Studio Real-Time Agent Telemetry</h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-200 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Agent Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6">Listening for live telemetry...</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-3 px-4 text-amber-400 font-semibold">{log.agentRole}</td>
                  <td className="py-3 px-4">{log.action}</td>
                  <td className="py-3 px-4 text-emerald-400">EXECUTED</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
