import React, { useState } from 'react';
import { AnalysisRecord } from '../types';
import { History, Trash2, ArrowUpRight, Copy, Check, Download, Search, Filter, Calendar, Code } from 'lucide-react';

interface HistoryDrawerProps {
  history: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    if (filterMode !== 'All' && item.mode !== filterMode) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.source?.toLowerCase().includes(q) ||
        item.language?.toLowerCase().includes(q) ||
        item.code_snippet?.toLowerCase().includes(q) ||
        item.result?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAllJson = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugez_audit_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'Analyze':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Analysis</span>;
      case 'Fix':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Auto-Fix</span>;
      case 'BugTable':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Bug Matrix</span>;
      case 'Tests':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Unit Tests</span>;
      case 'MultiFile':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Multi-File</span>;
      case 'GitHub':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">GitHub Repo</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">{mode}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Audit History &amp; Persistent Database
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Past analyses are persisted and survive browser refreshes. Click any record to review or restore code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={exportAllJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                title="Export all records as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                title="Clear all saved history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Analyze', 'Fix', 'BugTable', 'Tests', 'MultiFile', 'GitHub'].map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === m
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {m === 'All' ? `All (${history.length})` : m}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-700 focus:border-cyan-400 focus:outline-none placeholder-slate-500"
          />
        </div>
      </div>

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">No Past Analyses Found</h4>
          <p className="text-xs text-slate-500">
            Run an analysis, bug scan, or code fix in the Code Studio to record it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const formattedDate = new Date(item.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all shadow-md overflow-hidden"
              >
                {/* Item Summary Header */}
                <div className="p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getModeBadge(item.mode)}
                    <span className="text-xs font-semibold text-white truncate max-w-[160px] sm:max-w-[240px]">
                      {item.source || 'pasted snippet'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                      {item.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>

                    {/* Restore to Editor Button */}
                    <button
                      onClick={() => onSelectRecord(item)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
                      title="Restore code into Code Studio editor"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Open in Studio</span>
                    </button>

                    {/* Expand/Collapse Toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                    </button>

                    {/* Delete item */}
                    <button
                      onClick={() => onDeleteRecord(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Preview */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3 text-xs">
                    {/* Code Snippet */}
                    <div>
                      <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3 text-cyan-400" /> Source Snippet
                        </span>
                        <button
                          onClick={() => handleCopy(item.code_snippet, `${item.id}-code`)}
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          {copiedId === `${item.id}-code` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedId === `${item.id}-code` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto text-slate-300 font-mono max-h-40">
                        <code>{item.code_snippet}</code>
                      </pre>
                    </div>

                    {/* Analysis Result */}
                    <div>
                      <div className="flex items-center justify-between text-slate-400 font-mono mb-1">
                        <span>Analysis / Output</span>
                        <button
                          onClick={() => handleCopy(item.result, `${item.id}-result`)}
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          {copiedId === `${item.id}-result` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedId === `${item.id}-result` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto text-slate-300 font-mono max-h-48 whitespace-pre-wrap">
                        <code>{item.result}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
