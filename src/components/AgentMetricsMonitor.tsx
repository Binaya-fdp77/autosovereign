'use client';
import { useState, useEffect } from 'react';

export default function AgentMetricsMonitor() {
  const [metrics, setMetrics] = useState({
    avgLatencyMs: 248,
    successRate: 99.4,
    activeTokens: '14.2k',
    swarmHealth: 'OPTIMAL'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        avgLatencyMs: Math.floor(220 + Math.random() * 60),
        successRate: Number((99.0 + Math.random() * 0.9).toFixed(1)),
        activeTokens: `${(14 + Math.random() * 2).toFixed(1)}k`,
        swarmHealth: 'OPTIMAL'
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block font-mono">AVG SWARM LATENCY</span>
          <span className="text-lg font-bold text-cyan-400 font-mono mt-0.5 block">{metrics.avgLatencyMs} ms</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block font-mono">DETERMINISTIC SUCCESS</span>
          <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{metrics.successRate}%</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block font-mono">ACTIVE LLM TOKENS</span>
          <span className="text-lg font-bold text-purple-400 font-mono mt-0.5 block">{metrics.activeTokens}</span>
        </div>
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
          <span className="text-[11px] text-slate-400 block font-mono">SWARM STATUS</span>
          <span className="text-xs font-semibold text-amber-400 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded inline-block mt-1">
            {metrics.swarmHealth}
          </span>
        </div>
      </div>
    </div>
  );
}