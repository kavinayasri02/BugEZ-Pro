import React, { useState } from 'react';
import { Copy, Check, Download, ArrowRight, Columns, GitCompare } from 'lucide-react';

interface SideBySideDiffProps {
  originalCode: string;
  fixedCode: string;
  language: string;
  filename?: string;
  onApplyToEditor: (code: string) => void;
}

export const SideBySideDiff: React.FC<SideBySideDiffProps> = ({
  originalCode,
  fixedCode,
  language,
  filename,
  onApplyToEditor
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fixedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename ? `fixed_${filename}` : `fixed_code.${language.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    onApplyToEditor(fixedCode);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  // Compute simple unified diff
  const computeDiffLines = () => {
    const origLines = originalCode.split('\n');
    const fixLines = fixedCode.split('\n');
    const diff: Array<{ type: 'same' | 'add' | 'remove'; text: string; oldLine?: number; newLine?: number }> = [];

    let i = 0;
    let j = 0;
    let oldLineNum = 1;
    let newLineNum = 1;

    while (i < origLines.length || j < fixLines.length) {
      if (i < origLines.length && j < fixLines.length && origLines[i] === fixLines[j]) {
        diff.push({ type: 'same', text: origLines[i], oldLine: oldLineNum++, newLine: newLineNum++ });
        i++;
        j++;
      } else if (j < fixLines.length && (i >= origLines.length || origLines[i] !== fixLines[j])) {
        // Look ahead in orig
        const nextMatchInOrig = origLines.indexOf(fixLines[j], i);
        if (nextMatchInOrig !== -1 && nextMatchInOrig - i < 4) {
          // Lines were removed in original
          while (i < nextMatchInOrig) {
            diff.push({ type: 'remove', text: origLines[i], oldLine: oldLineNum++ });
            i++;
          }
        } else {
          // Added line in fix
          diff.push({ type: 'add', text: fixLines[j], newLine: newLineNum++ });
          j++;
        }
      } else if (i < origLines.length) {
        diff.push({ type: 'remove', text: origLines[i], oldLine: oldLineNum++ });
        i++;
      }
    }

    return diff;
  };

  const origLines = originalCode.split('\n');
  const fixedLines = fixedCode.split('\n');
  const unifiedDiff = computeDiffLines();

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Diff Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-900/90 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'unified'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Unified Diff
            </button>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            {origLines.length} lines → {fixedLines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              applied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
            title="Replace current editor content with fixed code"
          >
            {applied ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            {applied ? 'Applied!' : 'Apply to Editor'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Fixed'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-3">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full min-h-[400px]">
            {/* Original Column */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-rose-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Original Code
                </span>
                <span className="text-slate-500 font-mono">{origLines.length} lines</span>
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-xs text-slate-300 leading-relaxed">
                {origLines.map((line, idx) => (
                  <div key={idx} className="flex hover:bg-slate-900/70 px-1 py-0.5 rounded">
                    <span className="w-8 select-none text-right pr-3 text-slate-600 font-mono">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre overflow-x-auto text-rose-200/90">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Column */}
            <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Corrected &amp; Optimized Code
                </span>
                <span className="text-slate-500 font-mono">{fixedLines.length} lines</span>
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-xs text-slate-200 leading-relaxed">
                {fixedLines.map((line, idx) => (
                  <div key={idx} className="flex hover:bg-emerald-950/20 px-1 py-0.5 rounded">
                    <span className="w-8 select-none text-right pr-3 text-slate-600 font-mono">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre overflow-x-auto text-emerald-200">{line || ' '}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden h-full flex flex-col font-mono text-xs">
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>--- Original ({origLines.length} lines)</span>
              <span>+++ Corrected ({fixedLines.length} lines)</span>
            </div>
            <div className="flex-1 overflow-auto p-2 divide-y divide-slate-900/40">
              {unifiedDiff.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex px-2 py-0.5 font-mono ${
                    item.type === 'add'
                      ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                      : item.type === 'remove'
                      ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="w-10 select-none text-right pr-2 text-slate-600">
                    {item.oldLine ?? ''}
                  </span>
                  <span className="w-10 select-none text-right pr-3 text-slate-600">
                    {item.newLine ?? ''}
                  </span>
                  <span className="w-4 select-none font-bold text-center">
                    {item.type === 'add' ? '+' : item.type === 'remove' ? '-' : ' '}
                  </span>
                  <span className="flex-1 whitespace-pre overflow-x-auto">{item.text || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
