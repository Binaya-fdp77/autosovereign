'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AiArchitectCard() {
  const [prompt, setPrompt] = useState('');
  const [amount, setAmount] = useState('1500');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleArchitect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    try {
      const res = await fetch('/api/agent/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, totalAmount: amount }),
      });
      const data = await res.json();
      if (data.success) {
        setPrompt('');
        router.refresh();
      } else {
        alert(data.error || 'Failed to architect contract');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
        <h3 className="text-white font-semibold text-lg">AI Escrow Architect</h3>
      </div>
      <p className="text-gray-400 text-xs mb-4">
        Describe your project or deliverable. GPT-4o will automatically structure milestones, allocate funds, and initialize PayPal escrow.
      </p>
      
      <form onSubmit={handleArchitect} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-gray-300 mb-1">Project Description / Goal</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Build a Next.js e-commerce store with PostgreSQL backend and payment integration..."
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-300 mb-1">Total Budget ($ USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? 'AI Architecting Contract...' : 'Generate Escrow & Milestones'}
        </button>
      </form>
    </div>
  );
}