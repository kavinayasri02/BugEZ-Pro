import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CodeEditor } from './components/CodeEditor';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { SideBySideDiff } from './components/SideBySideDiff';
import { BugRiskMatrix } from './components/BugRiskMatrix';
import { MultiFileStudio } from './components/MultiFileStudio';
import { GitHubInspector } from './components/GitHubInspector';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { detectLanguage, detectFromContent, detectFromFilename, suggestFilename, LANG_TO_EXT } from './utils/languageDetect';
import { BugItem, AnalysisRecord, UiTheme, UiLayout } from './types';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { Copy, Download, Check, Sparkles, Terminal, FileCheck, ShieldAlert, Wrench, Eye, RefreshCw, AlertCircle, LayoutTemplate, Palette } from 'lucide-react';

const INITIAL_CODE = `import sqlite3
import hashlib

def login(username, password):
    # Bug 1: Insecure SQL Injection via unescaped string formatting
    conn = sqlite3.connect("app.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE user = '{username}' AND pass = '{password}'"
    cursor.execute(query)
    record = cursor.fetchone()
    
    # Bug 2: Missing connection closure causing memory/descriptor leak
    if not record:
        return {"status": "error", "msg": "Invalid credentials"}
        
    return {"status": "ok", "user": record[1]}

def calculate_average(values):
    # Bug 3: ZeroDivisionError when values array is empty
    total = sum(values)
    return total / len(values)
`;

export function App() {
  // Navigation & Settings State
  const [activeTab, setActiveTab] = useState<'studio' | 'multi' | 'github' | 'history'>('studio');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-flash-lite');
  const [customGeminiKey, setCustomGeminiKey] = useState<string>('');
  const [customGroqKey, setCustomGroqKey] = useState<string>('');
  const [customGithubToken, setCustomGithubToken] = useState<string>('');

  // UI Theme & Layout Customization State
  const [uiTheme, setUiTheme] = useState<UiTheme>(() => {
    return (localStorage.getItem('bugez_ui_theme') as UiTheme) || 'cyber-dark';
  });
  const [uiLayout, setUiLayout] = useState<UiLayout>(() => {
    return (localStorage.getItem('bugez_ui_layout') as UiLayout) || 'split';
  });
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'relaxed'>(() => {
    return (localStorage.getItem('bugez_font_size') as any) || 'standard';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Focus mode subtab (Editor vs Result) when in focus layout
  const [focusActivePane, setFocusActivePane] = useState<'editor' | 'results'>('editor');

  // Persist UI preferences
  useEffect(() => {
    localStorage.setItem('bugez_ui_theme', uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    localStorage.setItem('bugez_ui_layout', uiLayout);
  }, [uiLayout]);

  useEffect(() => {
    localStorage.setItem('bugez_font_size', fontSize);
  }, [fontSize]);

  // Editor State
  const [code, setCode] = useState<string>(INITIAL_CODE);
  const [language, setLanguage] = useState<string>('Python');
  const [filename, setFilename] = useState<string>('auth_service.py');

  // Studio Results State
  const [studioView, setStudioView] = useState<'analysis' | 'diff' | 'bugs' | 'tests'>('analysis');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [streamedAnalysis, setStreamedAnalysis] = useState<string>('');
  const [fixedCode, setFixedCode] = useState<string>('');
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [generatedTests, setGeneratedTests] = useState<string>('');
  const [testFramework, setTestFramework] = useState<string>('pytest');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Copy States
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [testsCopied, setTestsCopied] = useState(false);

  // History & System Status
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    geminiAvailable: true,
    groqAvailable: false,
    githubTokenConfigured: false,
    historyCount: 0
  });

  // Fetch initial history and system status
  const fetchStatusAndHistory = async () => {
    try {
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const data = await statusRes.json();
        setSystemStatus(data);
      }

      const histRes = await fetch('/api/history');
      if (histRes.ok) {
        const list = await histRes.json();
        setHistory(list);
      }
    } catch (err) {
      console.error('Error fetching initial status/history:', err);
    }
  };

  useEffect(() => {
    fetchStatusAndHistory();
  }, []);

  // Handle code change with automatic language & filename detection
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!newCode.trim()) return;

    // Check code content for language heuristics (Java, C++, Go, Python, etc.)
    const guessed = detectFromContent(newCode);
    if (guessed && guessed !== 'Other') {
      setLanguage(guessed);
      
      // If current filename is default or has a mismatched extension, suggest an appropriate filename
      const currentExt = filename && filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
      const targetExt = LANG_TO_EXT[guessed];
      const isDefaultOrGeneric = !filename || filename === 'auth_service.py' || filename.startsWith('snippet') || filename.startsWith('untitled');

      if (isDefaultOrGeneric || (targetExt && currentExt !== targetExt)) {
        const newSuggestedFilename = suggestFilename(newCode, guessed, filename);
        setFilename(newSuggestedFilename);
      }
    }
  };

  // Handle manual language selection from dropdown
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Automatically update filename extension to match chosen language
    setFilename((prev) => suggestFilename(code, newLang, prev));
  };

  // Handle explicit filename rename
  const handleFilenameChange = (newFilename: string) => {
    setFilename(newFilename);
    const langFromExt = detectFromFilename(newFilename);
    if (langFromExt && langFromExt !== 'Other') {
      setLanguage(langFromExt);
    }
  };

  // Handle clear editor
  const handleClear = () => {
    setCode('');
    setFilename('');
    setStreamedAnalysis('');
    setFixedCode('');
    setBugs([]);
    setGeneratedTests('');
    setErrorMessage(null);
  };

  // Handle file loaded via upload or drag-and-drop
  const handleFileLoaded = (name: string, content: string) => {
    setFilename(name);
    setCode(content);
    const guessed = detectLanguage(content, name);
    if (guessed && guessed !== 'Other') setLanguage(guessed);
  };

  // Record analysis into DB & local state
  const recordAnalysis = async (record: {
    mode: 'Analyze' | 'Fix' | 'BugTable' | 'Tests' | 'MultiFile' | 'GitHub';
    language: string;
    source: string;
    code_snippet: string;
    result: string;
    bugs?: BugItem[];
  }) => {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.record) {
          setHistory((prev) => [json.record, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error recording history:', err);
    }
  };

  // 1. STREAMING ANALYSIS
  const handleAnalyze = async () => {
    if (!code.trim()) return;

    let effectiveLang = language;
    let effectiveFilename = filename;
    const detected = detectFromContent(code);
    if (detected && detected !== 'Other') {
      effectiveLang = detected;
      setLanguage(detected);
    }
    if (!effectiveFilename || effectiveFilename === 'auth_service.py' || effectiveFilename.startsWith('snippet')) {
      effectiveFilename = suggestFilename(code, effectiveLang, effectiveFilename);
      setFilename(effectiveFilename);
    }

    setIsLoading(true);
    setActiveAction('analyze');
    setStudioView('analysis');
    setStreamedAnalysis('');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: effectiveLang,
          filename: effectiveFilename,
          model: selectedModel,
          customKey: selectedModel.startsWith('gemini') ? customGeminiKey : customGroqKey
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errData.error || 'Failed to start analysis');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available from server');

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
              const data = JSON.parse(trimmed.slice(6));
              if (data.text) {
                accumulated += data.text;
                setStreamedAnalysis(accumulated);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // ignore parse errors on intermediate chunks
            }
          }
        }
      }

      recordAnalysis({
        mode: 'Analyze',
        language: effectiveLang,
        source: effectiveFilename || 'pasted snippet',
        code_snippet: code,
        result: accumulated
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis encountered an error');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // 2. FIX MY CODE
  const handleFixCode = async () => {
    if (!code.trim()) return;

    let effectiveLang = language;
    let effectiveFilename = filename;
    const detected = detectFromContent(code);
    if (detected && detected !== 'Other') {
      effectiveLang = detected;
      setLanguage(detected);
    }
    if (!effectiveFilename || effectiveFilename === 'auth_service.py' || effectiveFilename.startsWith('snippet')) {
      effectiveFilename = suggestFilename(code, effectiveLang, effectiveFilename);
      setFilename(effectiveFilename);
    }

    setIsLoading(true);
    setActiveAction('fix');
    setStudioView('diff');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: effectiveLang,
          filename: effectiveFilename,
          model: selectedModel,
          customKey: selectedModel.startsWith('gemini') ? customGeminiKey : customGroqKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix code');
      }

      setFixedCode(data.fixedCode || '');

      recordAnalysis({
        mode: 'Fix',
        language: effectiveLang,
        source: effectiveFilename || 'pasted snippet',
        code_snippet: code,
        result: data.fixedCode
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Fix failed');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // 3. STRUCTURED BUG SCAN
  const handleBugScan = async () => {
    if (!code.trim()) return;

    let effectiveLang = language;
    let effectiveFilename = filename;
    const detected = detectFromContent(code);
    if (detected && detected !== 'Other') {
      effectiveLang = detected;
      setLanguage(detected);
    }
    if (!effectiveFilename || effectiveFilename === 'auth_service.py' || effectiveFilename.startsWith('snippet')) {
      effectiveFilename = suggestFilename(code, effectiveLang, effectiveFilename);
      setFilename(effectiveFilename);
    }

    setIsLoading(true);
    setActiveAction('bugs');
    setStudioView('bugs');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: effectiveLang,
          filename: effectiveFilename,
          model: selectedModel,
          customKey: selectedModel.startsWith('gemini') ? customGeminiKey : customGroqKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan code for bugs');
      }

      const identifiedBugs: BugItem[] = data.bugs || [];
      setBugs(identifiedBugs);

      recordAnalysis({
        mode: 'BugTable',
        language: effectiveLang,
        source: effectiveFilename || 'pasted snippet',
        code_snippet: code,
        result: JSON.stringify(identifiedBugs),
        bugs: identifiedBugs
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Bug scan failed');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // 4. UNIT TEST GENERATION
  const handleGenerateTests = async () => {
    if (!code.trim()) return;

    let effectiveLang = language;
    let effectiveFilename = filename;
    const detected = detectFromContent(code);
    if (detected && detected !== 'Other') {
      effectiveLang = detected;
      setLanguage(detected);
    }
    if (!effectiveFilename || effectiveFilename === 'auth_service.py' || effectiveFilename.startsWith('snippet')) {
      effectiveFilename = suggestFilename(code, effectiveLang, effectiveFilename);
      setFilename(effectiveFilename);
    }

    setIsLoading(true);
    setActiveAction('tests');
    setStudioView('tests');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: effectiveLang,
          filename: effectiveFilename,
          model: selectedModel,
          customKey: selectedModel.startsWith('gemini') ? customGeminiKey : customGroqKey
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tests');
      }

      setGeneratedTests(data.tests || '');
      if (data.framework) setTestFramework(data.framework);

      recordAnalysis({
        mode: 'Tests',
        language: effectiveLang,
        source: effectiveFilename || 'pasted snippet',
        code_snippet: code,
        result: data.tests
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Test generation failed');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  // Restore code from history into Studio editor
  const handleSelectHistoryRecord = (record: AnalysisRecord) => {
    setCode(record.code_snippet);
    if (record.language && record.language !== 'Mixed') {
      setLanguage(record.language);
    }
    setFilename(record.source || 'history_snippet.txt');
    setActiveTab('studio');

    // If record was a fix or bug scan, populate the respective view
    if (record.mode === 'Fix') {
      setFixedCode(record.result);
      setStudioView('diff');
    } else if (record.mode === 'BugTable' && record.bugs) {
      setBugs(record.bugs);
      setStudioView('bugs');
    } else if (record.mode === 'Tests') {
      setGeneratedTests(record.result);
      setStudioView('tests');
    } else {
      setStreamedAnalysis(record.result);
      setStudioView('analysis');
    }
  };

  // Delete history item
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  // Copy helper for tests
  const handleCopyTests = () => {
    navigator.clipboard.writeText(generatedTests);
    setTestsCopied(true);
    setTimeout(() => setTestsCopied(false), 2000);
  };

  // Download tests as file
  const handleDownloadTests = () => {
    const ext = language === 'Python' ? '.py' : language === 'Java' ? '.java' : language === 'C++' ? '.cpp' : '.spec.ts';
    const blob = new Blob([generatedTests], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_${(filename || 'code').replace(/\.[^/.]+$/, '')}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLight = uiTheme === 'clean-light';
  const isEmerald = uiTheme === 'terminal-emerald';
  const isPurple = uiTheme === 'royal-amethyst';

  const tabActiveColor = isLight
    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
    : isEmerald
    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
    : isPurple
    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
    : 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20';

  const tabInactiveColor = isLight
    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    : isEmerald
    ? 'text-emerald-400/80 hover:text-emerald-200 hover:bg-emerald-950/40'
    : isPurple
    ? 'text-purple-300/80 hover:text-purple-100 hover:bg-purple-950/40'
    : 'text-slate-400 hover:text-white hover:bg-slate-800';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isLight 
        ? 'bg-slate-100 text-slate-900' 
        : isEmerald 
        ? 'bg-[#060c08] text-emerald-100' 
        : isPurple 
        ? 'bg-[#0c0918] text-purple-100' 
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        historyCount={history.length}
        uiTheme={uiTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-950/50 border border-rose-500/60 rounded-2xl flex items-center justify-between text-xs text-rose-300 shadow-xl animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: CODE STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-4">
            {/* Focus Layout Selector (Only in Focus mode) */}
            {uiLayout === 'focus' && (
              <div className="flex items-center justify-between px-2">
                <div className={`inline-flex p-1 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'
                }`}>
                  <button
                    onClick={() => setFocusActivePane('editor')}
                    className={`px-4 py-1.5 rounded-lg transition-all ${
                      focusActivePane === 'editor'
                        ? tabActiveColor
                        : tabInactiveColor
                    }`}
                  >
                    Code Editor
                  </button>
                  <button
                    onClick={() => setFocusActivePane('results')}
                    className={`px-4 py-1.5 rounded-lg transition-all ${
                      focusActivePane === 'results'
                        ? tabActiveColor
                        : tabInactiveColor
                    }`}
                  >
                    Analysis &amp; Results
                  </button>
                </div>

                <button
                  onClick={() => setIsThemeModalOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Customize UI</span>
                </button>
              </div>
            )}

            {/* Studio Workspace Layout Container */}
            <div className={`h-full ${
              uiLayout === 'stacked'
                ? 'flex flex-col gap-6'
                : uiLayout === 'focus'
                ? 'block'
                : 'grid grid-cols-1 lg:grid-cols-12 gap-6'
            }`}>
              {/* Left Column: Code Editor & Upload */}
              {(uiLayout !== 'focus' || focusActivePane === 'editor') && (
                <div className={`${uiLayout === 'split' ? 'lg:col-span-6' : 'w-full'} flex flex-col min-h-[640px]`}>
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    language={language}
                    onLanguageChange={handleLanguageChange}
                    filename={filename}
                    onFilenameChange={handleFilenameChange}
                    onFileLoaded={handleFileLoaded}
                    onClear={handleClear}
                    onAnalyze={handleAnalyze}
                    onFix={handleFixCode}
                    onBugScan={handleBugScan}
                    onGenerateTests={handleGenerateTests}
                    isLoading={isLoading}
                    activeAction={activeAction}
                    uiTheme={uiTheme}
                    fontSize={fontSize}
                  />
                </div>
              )}

              {/* Right Column: Interactive Results Workbench */}
              {(uiLayout !== 'focus' || focusActivePane === 'results') && (
                <div className={`${uiLayout === 'split' ? 'lg:col-span-6' : 'w-full'} flex flex-col min-h-[640px]`}>
                  <div className={`flex flex-col h-full rounded-2xl border shadow-xl overflow-hidden transition-colors ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50' 
                      : isEmerald
                      ? 'bg-[#101b15] border-emerald-900/60 text-emerald-100 shadow-emerald-950/20'
                      : isPurple
                      ? 'bg-[#161228] border-purple-900/50 text-purple-100 shadow-purple-950/20'
                      : 'bg-slate-900/90 border-slate-800 text-slate-100'
                  }`}>
                    {/* Result View Switcher Tabs */}
                    <div className={`flex items-center justify-between px-4 py-2.5 border-b flex-wrap gap-2 transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : isEmerald
                        ? 'bg-[#0d1611] border-emerald-900/50'
                        : isPurple
                        ? 'bg-[#1b1533] border-purple-900/40'
                        : 'bg-slate-800/80 border-slate-700/60'
                    }`}>
                      <div className="flex items-center gap-1">
                        <button
                          id="studio-tab-analysis"
                          onClick={() => setStudioView('analysis')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            studioView === 'analysis'
                              ? tabActiveColor
                              : tabInactiveColor
                          }`}
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Analysis &amp; Tips</span>
                        </button>

                        <button
                          id="studio-tab-diff"
                          onClick={() => setStudioView('diff')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            studioView === 'diff'
                              ? tabActiveColor
                              : tabInactiveColor
                          }`}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Fix &amp; Diff</span>
                        </button>

                        <button
                          id="studio-tab-bugs"
                          onClick={() => setStudioView('bugs')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            studioView === 'bugs'
                              ? tabActiveColor
                              : tabInactiveColor
                          }`}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Bug Matrix</span>
                          {bugs.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold">
                              {bugs.length}
                            </span>
                          )}
                        </button>

                        <button
                          id="studio-tab-tests"
                          onClick={() => setStudioView('tests')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            studioView === 'tests'
                              ? tabActiveColor
                              : tabInactiveColor
                          }`}
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Unit Tests</span>
                        </button>
                      </div>

                      {/* Header Actions for current view */}
                      {studioView === 'analysis' && streamedAnalysis && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(streamedAnalysis);
                              setAnalysisCopied(true);
                              setTimeout(() => setAnalysisCopied(false), 2000);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                              isLight
                                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-slate-900 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            {analysisCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {analysisCopied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section Badge Indicators for Analysis Mode */}
                    {studioView === 'analysis' && (
                      <div className={`px-4 py-2 border-b flex items-center gap-2 flex-wrap text-[11px] ${
                        isLight ? 'bg-blue-50/60 border-slate-200 text-slate-600' : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}>
                        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Included in AI Report:</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                          📖 Code Explanation
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          💡 Enhancement Tips
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                          ⚠️ Critical Bugs
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                          ⏱️ Complexity
                        </span>
                      </div>
                    )}

                    {/* Main View Area */}
                    <div className="flex-1 p-4 overflow-auto">
                      {/* View 1: Streamed Analysis */}
                      {studioView === 'analysis' && (
                        <div className="h-full flex flex-col">
                          {isLoading && activeAction === 'analyze' && !streamedAnalysis ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-xs space-y-3">
                              <div className={`w-9 h-9 rounded-full border-2 border-t-transparent animate-spin ${
                                isLight ? 'border-blue-600' : 'border-cyan-400'
                              }`}></div>
                              <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                Analyzing code, generating walkthrough &amp; enhancement tips...
                              </p>
                              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                                Logic explanation • Performance tips • Vulnerability scan • Complexity
                              </span>
                            </div>
                          ) : streamedAnalysis ? (
                            <div className="space-y-4">
                              <MarkdownRenderer content={streamedAnalysis} />
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500">
                              <Terminal className={`w-12 h-12 mb-3 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
                              <h4 className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Ready for Code Analysis &amp; Enhancement Tips
                              </h4>
                              <p className={`text-xs max-w-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Click <strong className={isLight ? 'text-blue-600' : 'text-cyan-400'}>"Analyze &amp; Tips"</strong> to stream a step-by-step logic explanation, professional enhancement tips, bug review, and Big-O complexity analysis.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* View 2: Side-by-Side Diff */}
                      {studioView === 'diff' && (
                        <div className="h-full">
                          {isLoading && activeAction === 'fix' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-xs space-y-3">
                              <div className="w-9 h-9 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                              <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Synthesizing corrected code and computing diffs...
                              </p>
                            </div>
                          ) : fixedCode ? (
                            <SideBySideDiff
                              originalCode={code}
                              fixedCode={fixedCode}
                              language={language}
                              filename={filename}
                              onApplyToEditor={(newCode) => setCode(newCode)}
                            />
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500">
                              <Wrench className={`w-12 h-12 mb-3 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
                              <h4 className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Fix My Code Mode
                              </h4>
                              <p className={`text-xs max-w-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Click <strong className="text-indigo-500">"Fix Code"</strong> to produce a side-by-side comparison and color-coded unified diff with one-click editor replacement.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* View 3: Bug Risk Matrix */}
                      {studioView === 'bugs' && (
                        <div className="h-full">
                          {isLoading && activeAction === 'bugs' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-xs space-y-3">
                              <div className="w-9 h-9 rounded-full border-2 border-rose-400 border-t-transparent animate-spin"></div>
                              <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Scanning for Critical Bugs, Performance flaws, and Security hazards...
                              </p>
                            </div>
                          ) : bugs.length > 0 ? (
                            <BugRiskMatrix bugs={bugs} />
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500">
                              <ShieldAlert className={`w-12 h-12 mb-3 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
                              <h4 className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Severity-Tagged Bug Matrix
                              </h4>
                              <p className={`text-xs max-w-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Click <strong className="text-rose-500">"Bug Scan"</strong> to extract a categorized risk matrix with exact line numbers and actionable fix suggestions.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* View 4: Generated Unit Tests */}
                      {studioView === 'tests' && (
                        <div className="h-full flex flex-col">
                          {isLoading && activeAction === 'tests' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 text-xs space-y-3">
                              <div className="w-9 h-9 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
                              <p className={`font-medium ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Writing complete unit tests with happy paths and edge cases...
                              </p>
                            </div>
                          ) : generatedTests ? (
                            <div className="space-y-3 flex-1 flex flex-col">
                              <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                              }`}>
                                <span className="flex items-center gap-2 text-emerald-500 font-semibold font-mono">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  Framework: {testFramework}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleCopyTests}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                                      isLight
                                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                    }`}
                                  >
                                    {testsCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {testsCopied ? 'Copied' : 'Copy'}
                                  </button>
                                  <button
                                    onClick={handleDownloadTests}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-colors"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download File
                                  </button>
                                </div>
                              </div>

                              <div className={`flex-1 rounded-xl border overflow-hidden flex flex-col ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                              }`}>
                                <pre className={`flex-1 p-4 font-mono text-xs overflow-auto leading-relaxed ${
                                  isLight ? 'text-slate-800' : 'text-slate-200'
                                }`}>
                                  <code>{generatedTests}</code>
                                </pre>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-500">
                              <FileCheck className={`w-12 h-12 mb-3 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
                              <h4 className={`text-sm font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                                Unit Test Generator
                              </h4>
                              <p className={`text-xs max-w-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                Click <strong className="text-emerald-500">"Gen Tests"</strong> to automatically generate comprehensive unit tests covering edge cases and error handling.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-FILE & ZIP */}
        {activeTab === 'multi' && (
          <MultiFileStudio
            onRecordHistory={recordAnalysis}
            selectedModel={selectedModel}
            customApiKey={selectedModel.startsWith('gemini') ? customGeminiKey : customGroqKey}
          />
        )}

        {/* TAB 3: GITHUB REPO INSPECTOR */}
        {activeTab === 'github' && (
          <GitHubInspector
            onRecordHistory={recordAnalysis}
            selectedModel={selectedModel}
            customApiKey={selectedModel.startsWith('gemini') ? customGeminiKey : customGroqKey}
            customGithubToken={customGithubToken}
          />
        )}

        {/* TAB 4: AUDIT HISTORY */}
        {activeTab === 'history' && (
          <HistoryDrawer
            history={history}
            onSelectRecord={handleSelectHistoryRecord}
            onClearHistory={handleClearHistory}
            onDeleteRecord={handleDeleteHistoryItem}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={customGeminiKey}
        onGeminiKeyChange={setCustomGeminiKey}
        groqKey={customGroqKey}
        onGroqKeyChange={setCustomGroqKey}
        githubToken={customGithubToken}
        onGithubTokenChange={setCustomGithubToken}
        systemStatus={systemStatus}
      />

      {/* UI Customization & Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={uiTheme}
        onThemeSelect={setUiTheme}
        currentLayout={uiLayout}
        onLayoutSelect={setUiLayout}
        currentFontSize={fontSize}
        onFontSizeSelect={setFontSize}
      />
    </div>
  );
}
