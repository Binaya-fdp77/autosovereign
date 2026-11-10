import React from "react";

export interface MilestoneItem {
  id: string;
  title: string;
  status: "PENDING" | "FUNDED" | "SUBMITTED" | "VERIFIED" | "RELEASED" | "REFUNDED";
  amount: number;
  startDate: string;
  endDate: string;
}

interface MilestoneTimelineProps {
  milestones: MilestoneItem[];
  onMilestoneSelect?: (id: string) => void;
}

export function MilestoneTimeline({ milestones, onMilestoneSelect }: MilestoneTimelineProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-cyan-400">Milestone Execution Timeline</h3>
        <span className="text-xs text-slate-400">Active Escrow Lifecycle</span>
      </div>
      
      <div className="relative border-l-2 border-slate-700 ml-3 space-y-6 py-2">
        {milestones.map((ms, index) => {
          const isReleased = ms.status === "RELEASED";
          const isFunded = ms.status === "FUNDED";
          
          const markerClass = "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 transition-colors " + (
            isReleased ? "bg-emerald-500 border-emerald-300" :
            isFunded ? "bg-blue-500 border-blue-300 animate-pulse" :
            "bg-slate-800 border-slate-600 group-hover:border-cyan-400"
          );

          const badgeClass = "text-xs px-2.5 py-1 rounded font-medium border " + (
            isReleased ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
            isFunded ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
            "bg-amber-500/20 text-amber-300 border-amber-500/30"
          );

          return (
            <div 
              key={ms.id} 
              onClick={() => onMilestoneSelect?.(ms.id)}
              className="relative pl-6 group cursor-pointer transition-all"
            >
              <div className={markerClass} />

              <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-4 group-hover:border-cyan-500/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-cyan-400/80">Phase 0{index + 1}</span>
                    <h4 className="font-medium text-white text-base mt-0.5">{ms.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Schedule: <span className="text-slate-300">{ms.startDate}</span> to <span className="text-slate-300">{ms.endDate}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-emerald-400">
                      {"$" + ms.amount.toFixed(2)}
                    </span>
                    <span className={badgeClass}>
                      {ms.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
