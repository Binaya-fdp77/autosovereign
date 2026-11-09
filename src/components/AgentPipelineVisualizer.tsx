'use client';
import { useState } from 'react';

export default function AgentPipelineVisualizer() {
  const [activeStep, setActiveStep] = useState(2);

  const steps = [
    { id: 1, title: 'Escrow Architect', role: 'AI_ESCROW_ARCHITECT', status: 'COMPLETED', desc: 'Auto-structures contract milestones' },
    { id: 2, title: 'Code Auditor', role: 'AI_CODE_AUDITOR', status: 'ACTIVE', desc: 'Validates Git commit SHA & repository syntax' },
    { id: 3, title: 'Consensus Jury', role: 'AI_DISPUTE_JURY', status: 'PENDING', desc: '3-Agent consensus voting engine' },
    { id: 4, title: 'Deterministic Guard', role: 'SAFETY_GUARD', status: 'PENDING', desc: 'Boolean safety check before payout' },
    { id: 5, title: 'PayPal Payout', role: 'PAYPAL_WATERFALL', status: 'PENDING', desc: 'Idempotent batch settlement' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-indigo-400">Autonomous Agent Pipeline Visualizer</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time sequence flow from prompt architecture to PayPal settlement</p>
        </div>
        <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full">
          Telemetry Polling Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step) => {
          const isActive = step.id === activeStep;
          const isDone = step.id < activeStep;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                isActive
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-indigo-900/30 shadow-lg'
                  : isDone
                  ? 'bg-slate-950 border-emerald-800/80 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-mono">
                <span className="text-[10px] text-slate-400">STEP 0{step.id}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    isDone
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : isActive
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  {isDone ? 'PASSED' : isActive ? 'RUNNING' : 'QUEUED'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-200 text-xs mb-1">{step.title}</h3>
              <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}