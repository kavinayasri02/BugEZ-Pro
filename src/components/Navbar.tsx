import React from 'react';
import { Bug, Sparkles, Settings, Cpu, Layers, GitBranch, History, Palette } from 'lucide-react';
import { ModelOption, UiTheme } from '../types';

interface NavbarProps {
  activeTab: 'studio' | 'multi' | 'github' | 'history';
  onTabChange: (tab: 'studio' | 'multi' | 'github' | 'history') => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onOpenSettings: () => void;
  historyCount: number;
  uiTheme: UiTheme;
  onOpenThemeModal: () => void;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'gemini',
    tag: 'Fastest & Reliable',
    description: 'Instant response time, stable code analysis, and smart enhancement tips',
    isRecommended: true
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    tag: 'High Precision',
    description: 'Deep static code analysis with streaming responses'
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    tag: 'Deep Reasoning',
    description: 'Advanced reasoning for complex algorithms and deep security audits'
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Groq: LLaMA 3.3 70B',
    provider: 'groq',
    tag: 'Groq Versatile',
    description: 'Open source 70B model with broad knowledge'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Groq: LLaMA 3.1 8B',
    provider: 'groq',
    tag: 'Ultra-Fast',
    description: 'Sub-second lightweight token generation'
  },
  {
    id: 'qwen/qwen3.6-27b',
    name: 'Groq: Qwen 3.6 27B',
    provider: 'groq',
    tag: 'Balanced',
    description: 'Fast bilingual and code-specialized model'
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  selectedModel,
  onModelChange,
  onOpenSettings,
  historyCount,
  uiTheme,
  onOpenThemeModal
}) => {
  const isLight = uiTheme === 'clean-light';
  const isEmerald = uiTheme === 'terminal-emerald';
  const isPurple = uiTheme === 'royal-amethyst';

  const themeLabelMap: Record<UiTheme, { name: string; color: string }> = {
    'cyber-dark': { name: 'Cyber Dark', color: 'text-cyan-400' },
    'clean-light': { name: 'Studio Light', color: 'text-blue-600' },
    'terminal-emerald': { name: 'Terminal', color: 'text-emerald-400' },
    'royal-amethyst': { name: 'Amethyst', color: 'text-purple-400' }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isLight 
        ? 'bg-white/90 border-slate-200 text-slate-900 shadow-sm' 
        : isEmerald
        ? 'bg-[#0a0f0d]/90 border-emerald-950 text-emerald-100'
        : isPurple
        ? 'bg-[#0c0a17]/90 border-purple-950 text-purple-100'
        : 'bg-slate-950/85 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl p-0.5 shadow-lg ${
              isLight 
                ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-slate-800 shadow-blue-500/10'
                : isEmerald
                ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-700 shadow-emerald-500/20'
                : isPurple
                ? 'bg-gradient-to-br from-purple-400 via-pink-500 to-indigo-700 shadow-purple-500/20'
                : 'bg-gradient-to-br from-cyan-400 via-teal-500 to-indigo-600 shadow-cyan-500/20'
            }`}>
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                isLight ? 'bg-white' : isEmerald ? 'bg-[#0a0f0d]' : isPurple ? 'bg-[#0c0a17]' : 'bg-slate-950'
              }`}>
                <Bug className={`w-5 h-5 ${
                  isLight ? 'text-blue-600' : isEmerald ? 'text-emerald-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
                }`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-base tracking-tight font-sans ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  Bug<span className={
                    isLight ? 'text-blue-600' : isEmerald ? 'text-emerald-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
                  }>EZ</span> <span className={
                    isLight ? 'text-indigo-600' : isPurple ? 'text-pink-400' : 'text-indigo-400'
                  }>AI</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : isEmerald
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : isPurple
                    ? 'bg-purple-950 text-purple-300 border-purple-800'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  v2.0
                </span>
              </div>
              <p className={`text-[10px] font-mono hidden sm:block ${
                isLight ? 'text-slate-500' : isEmerald ? 'text-emerald-500/70' : isPurple ? 'text-purple-400/70' : 'text-slate-400'
              }`}>
                Explanation • Enhancement Tips • Auto-Fix
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className={`flex items-center gap-1 p-1 rounded-xl border ${
            isLight 
              ? 'bg-slate-100 border-slate-200' 
              : isEmerald
              ? 'bg-[#101b15] border-emerald-900/60'
              : isPurple
              ? 'bg-[#161228] border-purple-900/50'
              : 'bg-slate-900/90 border-slate-800/90'
          }`}>
            <button
              id="nav-tab-studio"
              onClick={() => onTabChange('studio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isEmerald
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : isPurple
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Code</span> Studio
            </button>

            <button
              id="nav-tab-multi"
              onClick={() => onTabChange('multi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'multi'
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isEmerald
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : isPurple
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Multi-File</span> Zip
            </button>

            <button
              id="nav-tab-github"
              onClick={() => onTabChange('github')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'github'
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isEmerald
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : isPurple
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </button>

            <button
              id="nav-tab-history"
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isEmerald
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : isPurple
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {historyCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                  isLight
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-700/50'
                }`}>
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Model Selector, UI Theme Selector & Settings */}
          <div className="flex items-center gap-2">
            {/* UI Design & Theme Selector Button */}
            <button
              id="open-theme-selector-button"
              onClick={onOpenThemeModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                  : isEmerald
                  ? 'bg-[#101b15] hover:bg-[#182920] border-emerald-900/70 text-emerald-300'
                  : isPurple
                  ? 'bg-[#161228] hover:bg-[#201a3b] border-purple-900/60 text-purple-200'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
              title="Change UI Theme & Layout Options"
            >
              <Palette className={`w-3.5 h-3.5 ${themeLabelMap[uiTheme]?.color || 'text-cyan-400'}`} />
              <span className="hidden md:inline">UI Design:</span>
              <span className={`font-bold ${themeLabelMap[uiTheme]?.color || 'text-cyan-400'}`}>
                {themeLabelMap[uiTheme]?.name || 'Theme'}
              </span>
            </button>

            {/* Model Dropdown */}
            <div className="relative hidden lg:block">
              <select
                id="model-selector-dropdown"
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className={`appearance-none pl-3 pr-8 py-1.5 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer shadow-sm transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-600'
                    : isEmerald
                    ? 'bg-[#101b15] border-emerald-900/70 text-emerald-200 focus:border-emerald-500'
                    : isPurple
                    ? 'bg-[#161228] border-purple-900/60 text-purple-200 focus:border-purple-500'
                    : 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-500 hover:border-slate-700'
                }`}
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.tag ? `(${model.tag})` : ''}
                  </option>
                ))}
              </select>
              <Sparkles className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isLight ? 'text-blue-600' : isEmerald ? 'text-emerald-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
              }`} />
            </div>

            {/* Settings Cog */}
            <button
              id="open-settings-button"
              onClick={onOpenSettings}
              className={`p-2 rounded-xl border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="API Keys & System Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
