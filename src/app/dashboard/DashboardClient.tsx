"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BuyerCheckout from "@/components/BuyerCheckout";

async function post(url: string, body: object) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: r.ok, data: await r.json().catch(() => ({} as any)) };
}

export default function DashboardClient({ contracts }: { contracts: any[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [evidence, setEvidence] = useState<Record<string, string>>({});

  const verify = async (contractId: string, milestoneId: string) => {
    setBusy(milestoneId); setNotice(null);
    const { ok, data } = await post("/api/agent/ai-verify", { contractId, milestoneId, evidence: evidence[milestoneId] || "" });
    setBusy(null);
    if (!ok) return setNotice({ kind: "err", text: data.error || "AI verification failed" });
    const why = (data.verdict?.reasons || []).join(" | ");
    setNotice({ kind: data.approved ? "ok" : "err", text: `AI ${data.approved ? "APPROVED" : "REJECTED"} (confidence ${data.verdict?.confidence}): ${why}` });
    router.refresh();
  };

  const act = async (key: string, url: string, contractId: string, okText: string) => {
    setBusy(key); setNotice(null);
    const { ok, data } = await post(url, { contractId });
    setBusy(null);
    if (!ok || data.success === false) return setNotice({ kind: "err", text: data.error || data.issue || "Request failed" });
    setNotice({ kind: "ok", text: `${okText}${data.batchId ? ` (batch ${data.batchId})` : ""}` });
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-blue-400">AutoSovereign</h1>
        <p className="text-sm text-slate-400 mt-1">AI judges the work. Code decides if money moves. PayPal moves it.</p>
      </header>

      {notice && (
        <div className={`mb-6 text-sm px-4 py-3 rounded border ${notice.kind === "ok" ? "text-emerald-300 bg-emerald-950 border-emerald-800" : "text-rose-300 bg-rose-950 border-rose-800"}`}>
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {contracts.length === 0 && <p className="text-slate-500">No contracts. Run: node prisma/seed.js</p>}
          {contracts.map((c: any) => {
            const escrow = c.escrowState;
            const funded = escrow?.status === "COMPLETED";
            const paidOut = !!escrow?.paypalPayoutBatchId;
            return (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {c.id}</p>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-bold">{c.status}</div>
                    <div className="text-slate-400">Escrow: {escrow?.status || "NOT CREATED"}</div>
                    <div className="font-bold text-slate-100 text-sm">${Number(c.totalAmount).toFixed(2)} {c.currency}</div>
                  </div>
                </div>

                {!funded && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <p className="text-xs uppercase text-slate-400 mb-2">Buyer: fund escrow with PayPal (sandbox)</p>
                    <BuyerCheckout contractId={c.id} onDone={() => router.refresh()} />
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs uppercase text-slate-400">Milestones - AI inspection</p>
                  {c.milestones.map((m: any) => (
                    <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{m.title}</span>
                        <span className="font-mono text-xs text-slate-400">${Number(m.amount).toFixed(2)} - {m.status}</span>
                      </div>
                      {!["VERIFIED", "RELEASED", "REFUNDED"].includes(m.status) && (
                        <>
                          <textarea
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded p-2"
                            rows={2}
                            placeholder="Seller evidence (paste a diff, link, or description of the delivered work)"
                            value={evidence[m.id] || ""}
                            onChange={(e) => setEvidence({ ...evidence, [m.id]: e.target.value })}
                          />
                          <button
                            disabled={busy === m.id}
                            onClick={() => verify(c.id, m.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold rounded"
                          >
                            {busy === m.id ? "AI reviewing..." : "AI Verify"}
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-800">
                  <button
                    disabled={!!busy || paidOut}
                    onClick={() => act(`pay-${c.id}`, "/api/paypal/payout", c.id, "Payout sent to seller")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-sm font-bold rounded"
                  >
                    Release payout
                  </button>
                  {funded && !paidOut && (
                    <button
                      disabled={!!busy}
                      onClick={() => act(`refund-${c.id}`, "/api/escrow/refund", c.id, "Buyer refunded")}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-sm font-bold rounded"
                    >
                      Refund buyer
                    </button>
                  )}
                  <span className="text-xs text-slate-500 self-center font-mono">Order: {escrow?.paypalOrderId || "-"}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Agent and webhook feed</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 max-h-[700px] overflow-y-auto">
            {contracts.flatMap((c: any) => c.agentLogs || []).length === 0 && <p className="text-sm text-slate-500">No events yet.</p>}
            {contracts
              .flatMap((c: any) => c.agentLogs || [])
              .sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))
              .map((l: any) => (
                <div key={l.id} className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-indigo-300 font-semibold">{l.agentRole || l.agentType}</span>
                    <span className="text-slate-500">{new Date(l.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200">{l.action}</p>
                  {l.reasoning && <p className="text-slate-400">{l.reasoning}</p>}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}