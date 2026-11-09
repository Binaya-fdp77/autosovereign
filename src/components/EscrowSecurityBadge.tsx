'use client';
export default function EscrowSecurityBadge() {
  return (
    <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-800/60 rounded-xl p-4 shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
        <div>
          <h3 className="text-sm font-semibold text-cyan-300">PayPal REST API & Deterministic Guard Active</h3>
          <p className="text-xs text-slate-400 mt-0.5">Idempotency headers (v4) & SHA-256 Settlement Certificates protecting escrow pipeline.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono bg-slate-950 border border-slate-700 px-3 py-1 rounded text-cyan-400">
          TLS 1.3 SECURE
        </span>
        <span className="text-[11px] font-mono bg-slate-950 border border-slate-700 px-3 py-1 rounded text-emerald-400">
          ZERO-TRUST AI
        </span>
      </div>
    </div>
  );
}