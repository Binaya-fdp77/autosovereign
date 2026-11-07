'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface FinancialFlowchartProps {
  contracts: any[];
}

export default function FinancialFlowchart({ contracts }: FinancialFlowchartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Calculate total locked vs released capital
  const totalLocked = contracts
    .filter((c) => c.status === 'LOCKED_IN_ESCROW')
    .reduce((sum, c) => sum + parseFloat(c.totalAmount || 0), 0);

  const totalReleased = contracts
    .filter((c) => c.status === 'RELEASED')
    .reduce((sum, c) => sum + parseFloat(c.totalAmount || 0), 0);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 240;

    // Define Node Layout
    const nodes = [
      { id: 'Buyer', x: 60, y: 120, color: '#3b82f6', label: 'Buyer Deposit' },
      { id: 'Escrow', x: 220, y: 120, color: '#f59e0b', label: `Escrow Vault\n($${totalLocked})` },
      { id: 'Contractor', x: 420, y: 50, color: '#10b981', label: 'Contractor (90%)' },
      { id: 'Platform', x: 420, y: 120, color: '#6366f1', label: 'Platform (5%)' },
      { id: 'Contingency', x: 420, y: 190, color: '#ec4899', label: 'Reserve (5%)' },
    ];

    const links = [
      { source: nodes[0], target: nodes[1], label: `$${totalLocked + totalReleased}` },
      { source: nodes[1], target: nodes[2], label: '90%' },
      { source: nodes[1], target: nodes[3], label: '5%' },
      { source: nodes[1], target: nodes[4], label: '5%' },
    ];

    // Draw Connectors (Links)
    svg.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('stroke', '#334155')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Draw Flow Nodes
    const nodeGroups = svg.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodeGroups.append('circle')
      .attr('r', 24)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.85)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 3);

    // Node Labels
    nodeGroups.append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    nodeGroups.append('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', 38)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px');

  }, [contracts, totalLocked, totalReleased]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="text-lg font-semibold mb-2 text-amber-400">Real-Time Financial Flowchart</h2>
      <p className="text-xs text-slate-400 mb-4">
        Dynamic capital trajectory from Buyer deposit $\rightarrow$ Escrow Vault $\rightarrow$ Payout Waterfall split.
      </p>

      <div className="flex justify-center bg-slate-950 border border-slate-800 rounded-lg p-3">
        <svg ref={svgRef} width="100%" height="240" viewBox="0 0 500 240"></svg>
      </div>
    </div>
  );
}