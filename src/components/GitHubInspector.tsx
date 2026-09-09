import React, { useState } from 'react';
import { GitBranch, GitFork, Star, Play, FileCode, Download, Copy, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { detectFromFilename } from '../utils/languageDetect';

interface GitHubInspectorProps {
  onRecordHistory: (record: {
    mode: 'GitHub';
    language: string;
    source: string;
    code_snippet: string;
    result: string;
  }) => void;
  selectedModel: string;
  customApiKey: string;
  customGithubToken: string;
}

const PRESET_REPOS = [
  { name: 'octocat/Hello-World', desc: 'Canonical GitHub starter repo', url: 'https://github.com/octocat/Hello-World' },
  { name: 'pallets/click', desc: 'Python composable CLI package', url: 'https://github.com/pallets/click' },
  { name: 'fastify/fastify', desc: 'Fast and low overhead web framework', url: 'https://github.com/fastify/fastify' }
];

export const GitHubInspector: React.FC<GitHubInspectorProps> = ({
  onRecordHistory,
  selectedModel,
  customApiKey,
  customGithubToken
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<{
    owner: string;
    repo: string;
    defaultBranch: string;
    files: Record<string, string>;
    stars?: number;
    description?: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFetchRepo = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || repoUrl;
    if (!urlToFetch.trim()) {
      setError('Please provide a GitHub repository URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAuditResult('');

    try {
      const response = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: urlToFetch,
          token: customGithubToken,
          maxFiles: 15
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch GitHub repository');
      }

      setRepoData(data);
      if (data.files && Object.keys(data.files).length > 0) {
        setSelectedFile(Object.keys(data.files)[0]);
      }
    } catch (err: any) {
      setError(err.message || 'GitHub fetch error');
      setRepoData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeRepo = async () => {
    if (!repoData || !repoData.files) return;

    setIsAnalyzing(true);
    setAuditResult('');
    setError(null);

    try {
      const response = await fetch('/api/multi-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: repoData.files,
          model: selectedModel,
          customKey: customApiKey
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errJson.error || 'Repo analysis failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.text) {
                accumulated += parsed.text;
                setAuditResult(accumulated);
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {
              // ignore
            }
          }
        }
      }

      onRecordHistory({
        mode: 'GitHub',
        language: 'Mixed',
        source: `${repoData.owner}/${repoData.repo}`,
        code_snippet: Object.keys(repoData.files).join('\n'),
        result: accumulated
      });
    } catch (err: any) {
      setError(err.message || 'Failed to analyze repository');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(auditResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([auditResult], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoData?.owner || 'github'}_${repoData?.repo || 'repo'}_audit.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Repo URL Input Card */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              GitHub Repository Inspector
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Input any public repository URL. BugEZ Pro pulls the source tree and performs an architectural audit.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>REST API Active</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchRepo()}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs font-mono text-slate-100 placeholder-slate-500 shadow-inner"
            />
          </div>

          <button
            onClick={() => handleFetchRepo()}
            disabled={isLoading || !repoUrl.trim()}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-cyan-500 text-slate-950 animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-40'
            }`}
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitFork className="w-3.5 h-3.5" />}
            <span>{isLoading ? 'Fetching Tree...' : 'Fetch Code'}</span>
          </button>
        </div>

        {/* Preset Repos */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500">Quick test:</span>
          {PRESET_REPOS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setRepoUrl(preset.url);
                handleFetchRepo(preset.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Repo Details and Workspace */}
      {repoData && repoData.files && Object.keys(repoData.files).length > 0 ? (
        <div className="space-y-4">
          {/* Repo Header Bar */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {repoData.owner} / {repoData.repo}
                  </h3>
                  <a
                    href={`https://github.com/${repoData.owner}/${repoData.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {repoData.description && (
                  <p className="text-xs text-slate-400 max-w-xl truncate mt-0.5">
                    {repoData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {repoData.stars !== undefined && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{repoData.stars.toLocaleString()}</span>
                </div>
              )}
              <div className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
                branch: <span className="text-cyan-400">{repoData.defaultBranch}</span>
              </div>
              <button
                onClick={handleAnalyzeRepo}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isAnalyzing
                    ? 'bg-cyan-500 text-slate-950 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAnalyzing ? 'Auditing Repo...' : 'Run Full Repo Audit'}</span>
              </button>
            </div>
          </div>

          {/* Dual Panel: Files List & Preview + Audit Output */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Files List */}
            <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-3 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Repository Files</span>
                <span className="font-mono">{Object.keys(repoData.files).length} files</span>
              </div>
              <div className="flex-1 overflow-auto space-y-1 pr-1">
                {Object.keys(repoData.files).map((path) => {
                  const lang = detectFromFilename(path) || 'Code';
                  const isSelected = selectedFile === path;
                  return (
                    <button
                      key={path}
                      onClick={() => setSelectedFile(path)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate font-mono">{path}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {lang}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Code Viewer & Audit Report */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              {/* Selected File Code */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[260px]">
                <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-semibold">{selectedFile}</span>
                  <span className="text-slate-400">
                    {selectedFile && repoData.files[selectedFile] ? `${repoData.files[selectedFile].split('\n').length} lines` : ''}
                  </span>
                </div>
                <pre className="flex-1 p-3 overflow-auto font-mono text-xs text-slate-200 bg-slate-950">
                  <code>{selectedFile ? repoData.files[selectedFile] : ''}</code>
                </pre>
              </div>

              {/* Audit Report */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex-1 min-h-[260px] overflow-auto flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    AI Repository Audit Report
                  </h4>
                  {auditResult && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto">
                  {isAnalyzing && !auditResult ? (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-xs space-y-2">
                      <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                      <span>Analyzing cross-file relationships and repository architecture...</span>
                    </div>
                  ) : auditResult ? (
                    <MarkdownRenderer content={auditResult} />
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Click "Run Full Repo Audit" to generate an architectural report, security checks, and cross-file bug analysis.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
