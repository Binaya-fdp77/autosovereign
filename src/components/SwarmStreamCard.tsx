'use client';

import React, { useEffect, useState } from 'react';

export default function SwarmStreamCard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/swarm-stream');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data.slice(0, 5)); // Show latest 5
      } else if (data.logs) {
        setLogs(data.logs.slice(0, 5));
      }
    } catch (err) {
      // Fallback telemetry stream mock if endpoint not seeded
      setLogs([
        { id: '1', agentRole: 'ARCHITECT', action: 'CREATE_CONTRACT', createdAt: new Date().toISOString() },
        { id: '2', agentRole: 'MEDIATOR', action: 'MEDIATE_DISPUTE', createdAt: new Date().toISOString() },
        { id: '3', agentRole: 'PAYPAL_LISTENER', action: 'WEBHOOK_CAPTURE_COMPLETED', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">AI Swarm Telemetry Stream</h3>
        <span className="text-xs text-purple-400 font-mono animate-pulse">● Live Stream</span>
      </div>

      <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 space-y-2 font-mono text-xs max-h-40 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500 italic">Initializing agent swarm streams...</p>
        ) : (
          logs.map((log, idx) => (
            <div key={log.id || idx} className="flex justify-between items-center border-b border-gray-900 pb-1">
              <span className="text-purple-400">[{log.agentRole || 'AGENT'}]</span>
              <span className="text-gray-300 truncate max-w-[180px]">{log.action}</span>
              <span className="text-gray-500 text-[10px]">{new Date(log.createdAt || Date.now()).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}