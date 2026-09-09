import React from 'react';
import { X, Key, Shield, CheckCircle, AlertCircle, ExternalLink, Database } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onGeminiKeyChange: (key: string) => void;
  groqKey: string;
  onGroqKeyChange: (key: string) => void;
  githubToken: string;
  onGithubTokenChange: (token: string) => void;
  systemStatus: {
    geminiAvailable: boolean;
    groqAvailable: boolean;
    githubTokenConfigured: boolean;
    historyCount: number;
  };
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  geminiKey,
  onGeminiKeyChange,
  groqKey,
  onGroqKeyChange,
  githubToken,
  onGithubTokenChange,
  systemStatus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Engine &amp; API Settings</h3>
              <p className="text-xs text-slate-400">Configure AI models, Groq tokens, and GitHub rate limits.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* System Status Indicators */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${systemStatus.geminiAvailable || geminiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium">Gemini 3.8 Flash</span>
            <span className="text-[10px] text-slate-500 ml-auto font-mono">
              {systemStatus.geminiAvailable || geminiKey ? 'Active' : 'Unset'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${systemStatus.groqAvailable || groqKey ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-slate-300 font-medium">Groq Models</span>
            <span className="text-[10px] text-slate-500 ml-auto font-mono">
              {systemStatus.groqAvailable || groqKey ? 'Configured' : 'Optional'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${systemStatus.githubTokenConfigured || githubToken ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-slate-300 font-medium">GitHub API</span>
            <span className="text-[10px] text-slate-500 ml-auto font-mono">
              {systemStatus.githubTokenConfigured || githubToken ? 'Auth' : 'Public'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Database DB</span>
            <span className="text-[10px] text-cyan-400 ml-auto font-mono">
              {systemStatus.historyCount} items
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 text-xs">
          {/* Groq API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Groq API Key</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Optional</span>
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Get free Groq key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => onGroqKeyChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Required only when selecting LLaMA 3.3, LLaMA 3.1 8B Instant, or Qwen models.
            </p>
          </div>

          {/* Custom Gemini Key Override */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Gemini API Key</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Built-in Active
                </span>
              </label>
            </div>
            <input
              type="password"
              placeholder="AIzaSy... (uses server env by default)"
              value={geminiKey}
              onChange={(e) => onGeminiKeyChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Leave blank to use the pre-configured Gemini AI engine automatically.
            </p>
          </div>

          {/* GitHub Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>GitHub Personal Access Token</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Optional</span>
              </label>
            </div>
            <input
              type="password"
              placeholder="ghp_... (for higher rate limit / private repos)"
              value={githubToken}
              onChange={(e) => onGithubTokenChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
