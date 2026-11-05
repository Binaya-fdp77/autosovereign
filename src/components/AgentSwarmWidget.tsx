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
    const interval = setInterval(fetchSwarmStatus, 5000); // Poll live swarm telemetry
    return () => clearInterval(interval);
  }, []);

  if (loading && !swarmData) {
    return <div className="bg-gray-950 border border-cyan-900/50 p-4 rounded-xl text-xs font-mono text-cyan-400">Initializing Agent Swarm Network...</div>;
  }

  return (
    <div className="bg-gray-950 border border-cyan-900/50 p-5 rounded-xl space-y-4 font-mono text-xs shadow-2xl">
      <div className="flex justify-between items-center">
        <div className="text-cyan-400 font-bold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          Autonomous Multi-Agent Swarm
        </div>
        <span className="bg-cyan-950 border border-cyan-800 text-cyan-300 px-2.5 py-0.5 rounded text-[10px]">
          {swarmData?.swarmStatus || 'SYNCING'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {swarmData?.activeNodes?.map((node: any) => (
          <div key={node.id} className="bg-gray-900 border border-gray-800 p-3 rounded-lg space-y-1">
            <div className="flex justify-between items-center text-white font-medium">
              <span>{node.name}</span>
              <span className="text-emerald-400 text-[10px]">{node.status}</span>
            </div>
            <p className="text-gray-400 text-[10px]">{node.role}</p>
            <div className="flex justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800">
              <span>Latency: {node.load}</span>
              <span className="text-cyan-400">Secure TEE</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}