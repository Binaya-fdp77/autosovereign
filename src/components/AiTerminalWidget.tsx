'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AiTerminalWidget({ contractId, milestoneId, milestoneTitle }: { contractId: string; milestoneId: string; milestoneTitle: string }) {
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRunInspection = async () => {
    setLoading(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/agent/stream-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, milestoneId }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamingText((prev) => prev + chunk);
      }

      // Also hit the state update endpoint to mark verified and trigger payout
      await fetch('/api/agent/ai-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, milestoneId }),
      });

      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-800 rounded-xl p-4 font-mono text-xs shadow-2xl space-y-3">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <span className="text-emerald-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Agent Terminal: {milestoneTitle}
        </span>
        <button
          onClick={handleRunInspection}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1 rounded text-xs transition disabled:opacity-50"
        >
          {loading ? 'Inspecting...' : 'Run AI Verification'}
        </button>
      </div>
      <div className="bg-gray-950 p-3 rounded-lg h-32 overflow-y-auto text-gray-300 whitespace-pre-wrap border border-gray-900">
        {streamingText || '// Click "Run AI Verification" to initiate autonomous inspection...'}
      </div>
    </div>
  );
}