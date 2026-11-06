'use client';

import React, { useEffect, useState } from 'react';

export default function AgentSwarmWidget() {
  const [swarmData, setSwarmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSwarmStatus = async () => {
    try {
      const res = await fetch('/api/agent/swarm-stream');
      const data = await res.json();
      if (data.success) {
        setSwarmData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwarmStatus();
    const interval = setInterval(fetchSwarmStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !swarmData) {
    return <div className="bg-gray-950 border border-cyan-900/50 p-4 rounded-xl text-xs font-mono text-cyan-400">Initializing Agent Swarm Network...</div>;
  }

  return (
    <div className="bg-gray-950 border border-cyan-900/50 p-6 rounded-xl space-y-6 font-mono text-xs shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center">
        <div className="text-cyan-400 font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          Autonomous Multi-Agent Topology
        </div>
        <span className="bg-cyan-950 border border-cyan-800 text-cyan-300 px-2.5 py-0.5 rounded text-[10px]">
          {swarmData?.swarmStatus || 'SYNCING'}
        </span>
      </div>

      {/* SVG Connection Lines Visualizer */}
      <div className="relative py-4">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="15%" y1="50%" x2="40%" y2="50%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="40%" y1="50%" x2="65%" y2="50%" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
          <line x1="65%" y1="50%" x2="88%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
        </svg>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {swarmData?.activeNodes?.map((node: any, idx: number) => (
            <div key={node.id} className="bg-gray-900/90 backdrop-blur border border-gray-800 p-3 rounded-lg space-y-1.5 shadow-lg">
              <div className="flex justify-between items-center text-white font-medium text-[11px]">
                <span className="truncate">{node.name}</span>
                <span className="text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                  {node.status}
                </span>
              </div>
              <p className="text-gray-400 text-[10px]">{node.role}</p>
              <div className="flex justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-800/80">
                <span>Latency: {node.load}</span>
                <span className="text-cyan-400">Node #{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}