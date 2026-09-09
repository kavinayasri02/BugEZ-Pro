import React, { useState } from 'react';
import { BugItem, BugCategory, Severity } from '../types';
import { ShieldAlert, Zap, Bug, CheckCircle2, AlertTriangle, Copy, Check, Filter } from 'lucide-react';

interface BugRiskMatrixProps {
  bugs: BugItem[];
  onSelectLine?: (line: number) => void;
  onApplyFix?: (fix: string) => void;
}

export const BugRiskMatrix: React.FC<BugRiskMatrixProps> = ({ bugs, onSelectLine }) => {
  const [selectedCategory, setSelectedCategory] = useState<BugCategory | 'All'>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'All'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyFix = (fix: string, id: string) => {
    navigator.clipboard.writeText(fix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const criticalCount = bugs.filter(b => b.severity === 'Critical').length;
  const highCount = bugs.filter(b => b.severity === 'High').length;
  const mediumCount = bugs.filter(b => b.severity === 'Medium').length;
  const lowCount = bugs.filter(b => b.severity === 'Low').length;

  const filteredBugs = bugs.filter(b => {
    if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && b.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.bug.toLowerCase().includes(q) || b.fix.toLowerCase().includes(q);
    }
    return true;
  });

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Low
          </span>
        );
    }
  };

  const getCategoryIcon = (cat: BugCategory) => {
    switch (cat) {
      case 'Bug':
        return <Bug className="w-4 h-4 text-rose-400" />;
      case 'Performance':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Security':
        return <ShieldAlert className="w-4 h-4 text-cyan-400" />;
    }
  };

  if (bugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Zero Issues Detected</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          No bugs, performance bottlenecks, or security hazards found in this code scan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'Critical' ? 'All' : 'Critical')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedSeverity === 'Critical'
              ? 'bg-rose-950/50 border-rose-500/80 shadow-lg shadow-rose-900/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
            <span>Critical</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">High hazard bugs</div>
        </button>

        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'High' ? 'All' : 'High')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedSeverity === 'High'
              ? 'bg-amber-950/50 border-amber-500/80 shadow-lg shadow-amber-900/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span>High Risk</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{highCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Probable failures</div>
        </button>

        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'Medium' ? 'All' : 'Medium')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedSeverity === 'Medium'
              ? 'bg-purple-950/50 border-purple-500/80 shadow-lg shadow-purple-900/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
            <span>Medium</span>
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{mediumCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Code smells &amp; perf</div>
        </button>

        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'Low' ? 'All' : 'Low')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedSeverity === 'Low'
              ? 'bg-emerald-950/50 border-emerald-500/80 shadow-lg shadow-emerald-900/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>Low Risk</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white">{lowCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Minor cleanups</div>
        </button>
      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Bug', 'Performance', 'Security'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'Bug' && <Bug className="w-3.5 h-3.5" />}
              {cat === 'Performance' && <Zap className="w-3.5 h-3.5" />}
              {cat === 'Security' && <ShieldAlert className="w-3.5 h-3.5" />}
              {cat === 'All' ? `All (${bugs.length})` : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-700/80 focus:border-cyan-400 focus:outline-none placeholder-slate-500 w-44"
          />
          {(selectedCategory !== 'All' || selectedSeverity !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSeverity('All');
                setSearchQuery('');
              }}
              className="text-xs text-cyan-400 hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Structured Issues Table / Cards */}
      <div className="space-y-2.5">
        {filteredBugs.map((bug, index) => {
          const bugId = bug.id || `bug-${index}`;
          return (
            <div
              key={bugId}
              className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/90 hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    {getCategoryIcon(bug.category)}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{bug.category}</span>
                  {getSeverityBadge(bug.severity)}
                  {bug.line > 0 && (
                    <button
                      onClick={() => onSelectLine?.(bug.line)}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono border border-slate-700 transition-colors"
                      title="Jump to line"
                    >
                      Line {bug.line}
                    </button>
                  )}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-100 mb-2 leading-snug">
                {bug.bug}
              </h4>

              {/* Fix Recommendation Card */}
              <div className="mt-3 p-3 rounded-lg bg-slate-950/90 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Suggested Fix
                  </div>
                  <div className="font-mono text-slate-300 leading-relaxed break-words">
                    {bug.fix}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyFix(bug.fix, bugId)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 shrink-0 text-xs"
                  title="Copy fix recommendation"
                >
                  {copiedId === bugId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Fix</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
