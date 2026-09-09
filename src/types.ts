export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type BugCategory = 'Bug' | 'Performance' | 'Security';

export interface BugItem {
  id?: string;
  bug: string;
  category: BugCategory;
  severity: Severity;
  line: number;
  fix: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  mode: 'Analyze' | 'Fix' | 'BugTable' | 'Tests' | 'MultiFile' | 'GitHub';
  language: string;
  source: string;
  code_snippet: string;
  result: string;
  bugs?: BugItem[];
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'gemini' | 'groq';
  tag: string;
  description: string;
  isRecommended?: boolean;
}

export interface FileEntry {
  path: string;
  content: string;
  language: string;
  size?: number;
}

export type UiTheme = 'cyber-dark' | 'clean-light' | 'terminal-emerald' | 'royal-amethyst';
export type UiLayout = 'split' | 'stacked' | 'focus';
export type FontSize = 'compact' | 'standard' | 'relaxed';

export interface ThemeConfig {
  id: UiTheme;
  name: string;
  badge: string;
  description: string;
  accent: string;
  previewBg: string;
  previewAccent: string;
  isDark: boolean;
}

