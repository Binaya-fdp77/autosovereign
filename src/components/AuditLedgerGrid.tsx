'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface AgentLogItem {
  id: string;
  contractId: string;
  agentRole: string;
  action: string;
  payload: string;
  createdAt: string;
}

export default function AuditLedgerGrid({ data }: { data: AgentLogItem[] }) {
  const colDefs = useMemo<ColDef[]>(() => [
    { field: 'createdAt', headerName: 'Timestamp', sortable: true, filter: true, width: 180 },
    { field: 'agentRole', headerName: 'Agent Role', sortable: true, filter: true, width: 220 },
    { field: 'action', headerName: 'Action Executed', sortable: true, filter: true, flex: 1 },
    { field: 'contractId', headerName: 'Contract ID', sortable: true, filter: true, width: 150 },
    { 
      field: 'payload', 
      headerName: 'Telemetry Payload', 
      flex: 2,
      cellRenderer: (params: any) => {
        try {
          const parsed = JSON.parse(params.value);
          return <span className="text-xs font-mono text-emerald-400">{JSON.stringify(parsed)}</span>;
        } catch {
          return <span className="text-xs font-mono text-gray-400">{params.value}</span>;
        }
      }
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Immutable Agent Telemetry Ledger
          </h3>
          <p className="text-gray-400 text-xs">Powered by AG Grid Enterprise Data Virtualization</p>
        </div>
      </div>
      <div className="ag-theme-alpine-dark" style={{ height: 450, width: '100%' }}>
        <AgGridReact
          rowData={data}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
}