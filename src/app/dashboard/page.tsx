
"use client";

import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { MilestoneTimeline, MilestoneItem } from "@/components/MilestoneTimeline";

ModuleRegistry.registerModules([AllCommunityModule]);

interface EscrowTelemetry {
  contractId: string;
  title: string;
  status: string;
  amountLocked: number;
  platformFee: number;
  freelancerNet: number;
  paypalOrderId: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [telemetryData, setTelemetryData] = useState<EscrowTelemetry[]>([
    {
      contractId: "cnt_101",
      title: "Autonomous Agent Protocol",
      status: "LOCKED_IN_ESCROW",
      amountLocked: 1250.00,
      platformFee: 62.50,
      freelancerNet: 1187.50,
      paypalOrderId: "SIM_ORDER_38249",
      updatedAt: "",
    },
    {
      contractId: "cnt_102",
      title: "Decentralized LLM Oracle",
      status: "COMPLETED_AND_DISBURSED",
      amountLocked: 2400.00,
      platformFee: 120.00,
      freelancerNet: 2280.00,
      paypalOrderId: "SIM_ORDER_91042",
      updatedAt: "",
    },
    {
      contractId: "cnt_103",
      title: "Multi-Agent Swarm Coordinator",
      status: "WAITING_FOR_HANDSHAKE",
      amountLocked: 850.00,
      platformFee: 42.50,
      freelancerNet: 807.50,
      paypalOrderId: "-",
      updatedAt: "",
    },
  ]);

  const [handshakeStatus, setHandshakeStatus] = useState<string>("System online. Multi-contract telemetry active.");
  const [totalPool, setTotalPool] = useState<number>(4500.00);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);

  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      id: "ms_1",
      title: "Milestone 1: Dual-Agent Negotiation Handshake",
      status: "RELEASED",
      amount: 1400.00,
      startDate: "2026-11-01",
      endDate: "2026-11-04",
    },
    {
      id: "ms_2",
      title: "Milestone 2: Escrow Lock & PayPal v2 Capture",
      status: "FUNDED",
      amount: 1600.00,
      startDate: "2026-11-05",
      endDate: "2026-11-08",
    },
    {
      id: "ms_3",
      title: "Milestone 3: Disburse Freelancer Payouts v1",
      status: "PENDING",
      amount: 1500.00,
      startDate: "2026-11-09",
      endDate: "2026-11-12",
    },
  ]);

  useEffect(() => {
    const timestamp = new Date().toISOString();
    setTelemetryData((prev) =>
      prev.map((row) => ({ ...row, updatedAt: timestamp }))
    );

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("escrow-updated", (event) => {
      const data = JSON.parse(event.data);
      setTelemetryData((prev) =>
        prev.map((row) =>
          row.contractId === data.contractId
            ? {
                ...row,
                status: data.status,
                paypalOrderId: data.paypalOrderId || row.paypalOrderId,
                updatedAt: new Date().toISOString(),
              }
            : row
        )
      );
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const spawnNewContract = () => {
    const newId = "cnt_" + Math.floor(Math.random() * 90000 + 10000);
    const newRow: EscrowTelemetry = {
      contractId: newId,
      title: "Autonomous Micro-Service Node #" + Math.floor(Math.random() * 10 + 1),
      status: "WAITING_FOR_HANDSHAKE",
      amountLocked: 1100.00,
      platformFee: 55.00,
      freelancerNet: 1045.00,
      paypalOrderId: "-",
      updatedAt: new Date().toISOString(),
    };
    setTelemetryData((prev) => [newRow, ...prev]);
    setTotalPool((prev) => prev + 1100.00);
    setHandshakeStatus("➕ Spawned new contract " + newId + " for agent negotiation.");
  };

  const runFullE2ESimulation = async () => {
    setIsSimulating(true);
    try {
      setHandshakeStatus("🤖 Running multi-agent consensus across active contracts...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      setTelemetryData((prev) =>
        prev.map((row) =>
          row.status === "WAITING_FOR_HANDSHAKE"
            ? { ...row, status: "LOCKED_IN_ESCROW", paypalOrderId: "SIM_ORDER_" + Math.floor(Math.random() * 90000 + 10000), updatedAt: new Date().toISOString() }
            : row
        )
      );

      setMilestones((prev) =>
        prev.map((ms) => (ms.id === "ms_2" ? { ...ms, status: "RELEASED" } : ms))
      );

      setHandshakeStatus("✅ E2E Simulation completed! All pending contracts successfully escrowed.");
    } catch (err: any) {
      setHandshakeStatus("❌ Simulation error: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const disbursePayout = async () => {
    setIsDisbursing(true);
    setHandshakeStatus("💸 Executing multi-party payout disbursements...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setMilestones((prev) =>
        prev.map((ms) => ({ ...ms, status: "RELEASED" }))
      );

      setTelemetryData((prev) =>
        prev.map((row) => ({ ...row, status: "COMPLETED_AND_DISBURSED", updatedAt: new Date().toISOString() }))
      );

      setHandshakeStatus("✅ All escrow pools successfully disbursed to freelancer accounts.");
    } catch (err: any) {
      setHandshakeStatus("❌ Disbursement failed: " + err.message);
    } finally {
      setIsDisbursing(false);
    }
  };

  const columnDefs = [
    { field: "contractId", headerName: "Contract ID", sortable: true, filter: true, width: 140 },
    { field: "title", headerName: "Autonomous Scope", sortable: true, filter: true, flex: 1 },
    { 
      field: "status", 
      headerName: "Execution Status", 
      sortable: true, 
      filter: true, 
      width: 230,
      cellRenderer: (params: any) => {
        const val = params.value;
        let color = "bg-amber-500/20 text-amber-400 border-amber-500/30";
        if (val === "COMPLETED_AND_DISBURSED") color = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        if (val === "LOCKED_IN_ESCROW") color = "bg-blue-500/20 text-blue-400 border-blue-500/30";
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-mono border ${color}`}>
            {val}
          </span>
        );
      }
    },
    { field: "amountLocked", headerName: "Locked ($)", sortable: true, width: 130, valueFormatter: (params: any) => "$" + params.value.toFixed(2) },
    { field: "platformFee", headerName: "Fee (5%)", sortable: true, width: 120, valueFormatter: (params: any) => "$" + params.value.toFixed(2) },
    { field: "freelancerNet", headerName: "Net Payout", sortable: true, width: 140, valueFormatter: (params: any) => "$" + params.value.toFixed(2) },
    { field: "paypalOrderId", headerName: "PayPal Order ID", width: 160 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 space-y-8">
      <header className="border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">AutoSovereign</h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-mono border border-emerald-500/30">
              v2.4 Live Telemetry Grid
            </span>
          </div>
          <p className="text-slate-400 mt-1">Real-Time Autonomous Agent Escrow & Multi-Contract Monitoring</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={spawnNewContract}
            className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-3 rounded-lg shadow transition-all flex items-center gap-2"
          >
            ➕ Spawn Contract
          </button>
          <button
            onClick={runFullE2ESimulation}
            disabled={isSimulating}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg transition-all disabled:opacity-50"
          >
            {isSimulating ? "Simulating..." : "⚡ Run Simulation"}
          </button>
          <button
            onClick={disbursePayout}
            disabled={isDisbursing}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg transition-all disabled:opacity-50"
          >
            {isDisbursing ? "Disbursing..." : "💸 Disburse All"}
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl shadow">
          <span className="text-xs uppercase tracking-wider text-slate-400">Total Active Escrow Pool</span>
          <div className="text-3xl font-bold text-white mt-1">${totalPool.toFixed(2)}</div>
          <span className="text-xs text-emerald-400 mt-2 block">Across {telemetryData.length} monitored contracts</span>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl shadow">
          <span className="text-xs uppercase tracking-wider text-slate-400">Platform Revenue (5%)</span>
          <div className="text-3xl font-bold text-emerald-400 mt-1">${(totalPool * 0.05).toFixed(2)}</div>
          <span className="text-xs text-slate-400 mt-2 block">Accumulated protocol fees</span>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-xl shadow">
          <span className="text-xs uppercase tracking-wider text-slate-400">Total Net Payouts</span>
          <div className="text-3xl font-bold text-blue-400 mt-1">${(totalPool * 0.95).toFixed(2)}</div>
          <span className="text-xs text-slate-400 mt-2 block">Secured by PayPal v2 Orders</span>
        </div>
      </div>

      {/* Console Banner */}
      <section className="bg-slate-800/90 border border-slate-700 rounded-xl p-5 shadow flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">AG Grid Telemetry Engine</h2>
          <p className="text-slate-200 mt-1 font-mono text-sm">{handshakeStatus}</p>
        </div>
      </section>

      {/* Multi-Row AG Grid */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-emerald-400">Live Escrow Telemetry (AG Grid)</h2>
          <span className="text-xs font-mono text-slate-400">Interactive Sort, Filter & Column Resizing Enabled</span>
        </div>
        <div className="ag-theme-alpine-dark h-72 w-full rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
          <AgGridReact
            rowData={telemetryData}
            columnDefs={columnDefs as any}
            defaultColDef={{ resizable: true, sortable: true, filter: true }}
            theme="legacy"
          />
        </div>
      </section>

      <section>
        <MilestoneTimeline milestones={milestones} />
      </section>
    </div>
  );
}

