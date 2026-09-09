import React from 'react';
import { X, Check, Palette, Columns, LayoutList, Eye, Monitor, Sun, Moon, Sparkles, Terminal } from 'lucide-react';
import { UiTheme, UiLayout, FontSize, ThemeConfig } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: UiTheme;
  onThemeSelect: (theme: UiTheme) => void;
  currentLayout: UiLayout;
  onLayoutSelect: (layout: UiLayout) => void;
  currentFontSize: FontSize;
  onFontSizeSelect: (size: FontSize) => void;
}

export const THEME_OPTIONS: ThemeConfig[] = [
  {
    id: 'cyber-dark',
    name: 'Cyber Dark (Default)',
    badge: 'High-Tech IDE',
    description: 'Vibrant neon cyan & electric indigo accents over an obsidian slate canvas.',
    accent: '#06b6d4',
    previewBg: 'bg-slate-950',
    previewAccent: 'border-cyan-500 text-cyan-400',
    isDark: true
  },
  {
    id: 'clean-light',
    name: 'Studio Paper Light',
    badge: 'Minimalist & Crisp',
    description: 'Crisp porcelain canvas with high-contrast obsidian typography and cobalt accents.',
    accent: '#2563eb',
    previewBg: 'bg-slate-50',
    previewAccent: 'border-blue-600 text-blue-600',
    isDark: false
  },
  {
    id: 'terminal-emerald',
    name: 'Terminal Emerald',
    badge: 'Hacker Matrix',
    description: 'Retro-modern dark terminal with phosphor mint & emerald accents and dense monospace feel.',
    accent: '#10b981',
    previewBg: 'bg-[#0a0f0d]',
    previewAccent: 'border-emerald-500 text-emerald-400',
    isDark: true
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    badge: 'Midnight Violet',
    description: 'Luxurious deep violet-slate backdrop with luminous purple and soft rose highlights.',
    accent: '#a855f7',
    previewBg: 'bg-[#0c0a17]',
    previewAccent: 'border-purple-500 text-purple-400',
    isDark: true
  }
];

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeSelect,
  currentLayout,
  onLayoutSelect,
  currentFontSize,
  onFontSizeSelect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="theme-selector-dialog"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Customize UI Design & Workspace
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Instant Preview
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose your visual theme, screen layout, and reading density
              </p>
            </div>
          </div>
          <button
            id="close-theme-modal-button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. THEME SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                1. Visual Theme (Color Palette)
              </label>
              <span className="text-[11px] text-slate-400">
                Active: <span className="font-semibold text-cyan-300">{THEME_OPTIONS.find(t => t.id === currentTheme)?.name}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    onClick={() => onThemeSelect(theme.id)}
                    className={`relative text-left p-4 rounded-xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {/* Card Top: Theme Title & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner flex-shrink-0"
                          style={{ backgroundColor: theme.accent }}
                        />
                        <span className="font-bold text-slate-200 text-sm">
                          {theme.name}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {theme.badge}
                        </span>
                      )}
                    </div>

                    {/* Preview Strip */}
                    <div className={`w-full h-8 rounded-lg p-1.5 flex items-center justify-between gap-1.5 ${theme.previewBg} border border-slate-700/50`}>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400/80" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
                        <div className="w-2 h-2 rounded-full bg-green-400/80" />
                      </div>
                      <div className="h-2 w-16 rounded bg-slate-700/50" />
                      <div 
                        className="h-2 w-8 rounded"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. WORKSPACE LAYOUT SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Columns className="w-3.5 h-3.5 text-indigo-400" />
                2. Studio Layout Architecture
              </label>
              <span className="text-[11px] text-slate-400">
                Active: <span className="font-semibold text-indigo-300 capitalize">{currentLayout}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Split Studio */}
              <button
                id="layout-option-split"
                onClick={() => onLayoutSelect('split')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                  currentLayout === 'split'
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Columns className="w-3.5 h-3.5 text-indigo-400" />
                    Split Studio
                  </span>
                  {currentLayout === 'split' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                  )}
                </div>

                {/* Mock wireframe */}
                <div className="h-12 w-full bg-slate-900 rounded-lg p-1 border border-slate-700/60 flex gap-1">
                  <div className="w-1/2 h-full bg-slate-800/80 rounded flex items-center justify-center">
                    <span className="text-[8px] font-mono text-slate-400">Editor</span>
                  </div>
                  <div className="w-1/2 h-full bg-indigo-950/50 border border-indigo-800/40 rounded flex items-center justify-center">
                    <span className="text-[8px] font-mono text-indigo-300">Analysis</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  Side-by-side 50/50 split. Best for widescreen workstations and real-time comparison.
                </p>
              </button>

              {/* Stacked Reading */}
              <button
                id="layout-option-stacked"
                onClick={() => onLayoutSelect('stacked')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                  currentLayout === 'stacked'
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5 text-indigo-400" />
                    Stacked Reading
                  </span>
                  {currentLayout === 'stacked' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                  )}
                </div>

                {/* Mock wireframe */}
                <div className="h-12 w-full bg-slate-900 rounded-lg p-1 border border-slate-700/60 flex flex-col gap-1">
                  <div className="w-full h-1/2 bg-slate-800/80 rounded flex items-center justify-center">
                    <span className="text-[8px] font-mono text-slate-400">Editor (Top)</span>
                  </div>
                  <div className="w-full h-1/2 bg-indigo-950/50 border border-indigo-800/40 rounded flex items-center justify-center">
                    <span className="text-[8px] font-mono text-indigo-300">Full Analysis (Bottom)</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  Editor on top, wide analysis below. Maximum room for reading explanation and tips.
                </p>
              </button>

              {/* Focus Tabs */}
              <button
                id="layout-option-focus"
                onClick={() => onLayoutSelect('focus')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2.5 transition-all ${
                  currentLayout === 'focus'
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    Focus View
                  </span>
                  {currentLayout === 'focus' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                  )}
                </div>

                {/* Mock wireframe */}
                <div className="h-12 w-full bg-slate-900 rounded-lg p-1 border border-slate-700/60 flex flex-col justify-center items-center">
                  <div className="w-full h-full bg-indigo-950/60 border border-indigo-700/40 rounded flex items-center justify-center">
                    <span className="text-[8px] font-mono text-indigo-200">100% Focused Screen</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  Single focused view. Toggle smoothly between code input and analysis output.
                </p>
              </button>
            </div>
          </div>

          {/* 3. FONT SCALING */}
          <div>
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Monitor className="w-3.5 h-3.5 text-teal-400" />
              3. Text Scale & Code Density
            </label>
            <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
              {(['compact', 'standard', 'relaxed'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  id={`font-size-${size}`}
                  onClick={() => onFontSizeSelect(size)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${
                    currentFontSize === size
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size === 'compact' && 'Compact (13px)'}
                  {size === 'standard' && 'Standard (14px)'}
                  {size === 'relaxed' && 'Comfortable (16px)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preferences saved automatically to browser storage.</span>
          </div>
          <button
            id="apply-theme-settings-button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-sm shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
