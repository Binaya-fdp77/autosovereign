import React from 'react';
import UserManagementCard from '@/components/UserManagementCard';
import AiArchitectCard from '@/components/AiArchitectCard';
import RiskEvaluatorCard from '@/components/RiskEvaluatorCard';
import DisputeMediatorCard from '@/components/DisputeMediatorCard';
import WebhookSimulatorCard from '@/components/WebhookSimulatorCard';
import ArtifactVaultCard from '@/components/ArtifactVaultCard';
import PayoutWaterfallCard from '@/components/PayoutWaterfallCard';
import SwarmStreamCard from '@/components/SwarmStreamCard';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8 space-y-6">
      <header className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AutoSovereign Control Center</h1>
          <p className="text-xs text-gray-400 font-mono">Autonomous AI Escrow & Contingency Platform</p>
        </div>
      </header>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagementCard />
        <AiArchitectCard />
        <RiskEvaluatorCard />
        <DisputeMediatorCard />
        <WebhookSimulatorCard />
        <ArtifactVaultCard />
        <PayoutWaterfallCard />
        <SwarmStreamCard />
      </div>
    </main>
  );
}