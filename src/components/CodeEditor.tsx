import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileCode, Sparkles, Trash2, Copy, Check, Terminal, Play, ShieldAlert, Wrench, FileCheck, Pencil } from 'lucide-react';
import { SUPPORTED_LANGUAGES, detectFromFilename } from '../utils/languageDetect';
import { UiTheme } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  filename: string;
  onFilenameChange?: (name: string) => void;
  onFileLoaded: (name: string, content: string) => void;
  onClear: () => void;
  onAnalyze: () => void;
  onFix: () => void;
  onBugScan: () => void;
  onGenerateTests: () => void;
  isLoading: boolean;
  activeAction: string | null;
  uiTheme?: UiTheme;
  fontSize?: 'compact' | 'standard' | 'relaxed';
}

const SAMPLE_SNIPPETS = {
  Python: {
    name: 'user_auth_service.py',
    code: `import hashlib
import sqlite3

def authenticate_user(username, password):
    # Bug: SQL Injection vulnerability and unsafe raw hash
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    
    # Insecure string formatting allows SQL injection
    query = f"SELECT id, role FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    # Bug: unclosed database connection leak
    if not user:
        return None
        
    return {"user_id": user[0], "role": user[1]}

def calculate_discount(price, discount_percent):
    # Bug: Division by zero risk, off-by-one, no type checking
    if discount_percent > 100:
        raise ValueError("Discount cannot exceed 100%")
    discounted = price - (price * (discount_percent / 100))
    # Bug: Floating point precision issue
    return round(discounted, 2)
`
  },
  JavaScript: {
    name: 'cacheManager.js',
    code: `class CacheManager {
  constructor(maxSize = 100) {
    this.cache = {};
    this.maxSize = maxSize;
    this.keys = [];
  }

  // Bug: Memory leak and race condition with concurrent writes
  set(key, value, ttlMs) {
    if (this.keys.length >= this.maxSize) {
      const oldestKey = this.keys.shift();
      delete this.cache[oldestKey];
    }
    
    this.cache[key] = value;
    this.keys.push(key);

    // Bug: timer callback holds reference causing leaks if not cleared
    if (ttlMs) {
      setTimeout(() => {
        delete this.cache[key];
      }, ttlMs);
    }
  }

  get(key) {
    // Bug: No check for undefined vs null or prototype pollution
    return this.cache[key];
  }
}
`
  },
  Java: {
    name: 'OrderProcessor.java',
    code: `import java.util.*;

public class OrderProcessor {
    private List<String> inventory = new ArrayList<>();

    public void processOrder(String itemId, int quantity) {
        // Bug: ConcurrentModificationException risk and no synchronization
        for (String item : inventory) {
            if (item.equals(itemId)) {
                inventory.remove(item); // Throws ConcurrentModificationException
            }
        }
    }

    public double computeTax(double amount, String state) {
        // Bug: Null pointer exception if state is null
        if (state.equalsIgnoreCase("CA")) {
            return amount * 0.0825;
        }
        return amount * 0.05;
    }
}
`
  },
  'C++': {
    name: 'buffer_handler.cpp',
    code: `#include <iostream>
#include <cstring>

void copyUserData(const char* input) {
    char buffer[16];
    // Bug: Buffer overflow vulnerability - strcpy doesn't check bounds
    strcpy(buffer, input);
    std::cout << "Data received: " << buffer << std::endl;
}

int* createIntArray(int size) {
    // Bug: Returning pointer to local stack variable (Dangling Pointer)
    int arr[10];
    for (int i = 0; i < size; ++i) {
        arr[i] = i * 2;
    }
    return arr;
}
`
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language,
  onLanguageChange,
  filename,
  onFilenameChange,
  onFileLoaded,
  onClear,
  onAnalyze,
  onFix,
  onBugScan,
  onGenerateTests,
  isLoading,
  activeAction,
  uiTheme = 'cyber-dark',
  fontSize = 'standard'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [tempFilename, setTempFilename] = useState(filename);

  useEffect(() => {
    setTempFilename(filename);
  }, [filename]);

  const saveFilename = () => {
    setIsEditingFilename(false);
    const cleaned = tempFilename.trim();
    if (cleaned && onFilenameChange) {
      onFilenameChange(cleaned);
      const detectedLang = detectFromFilename(cleaned);
      if (detectedLang) {
        onLanguageChange(detectedLang);
      }
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileLoaded(file.name, content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileLoaded(file.name, content);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const loadSample = (lang: 'Python' | 'JavaScript' | 'Java' | 'C++') => {
    const sample = SAMPLE_SNIPPETS[lang];
    onFileLoaded(sample.name, sample.code);
    onLanguageChange(lang);
  };

  const lineCount = code ? code.split('\n').length : 1;
  const isLight = uiTheme === 'clean-light';
  const isEmerald = uiTheme === 'terminal-emerald';
  const isPurple = uiTheme === 'royal-amethyst';

  const fontClass = fontSize === 'compact'
    ? 'text-[11px] leading-[18px]'
    : fontSize === 'relaxed'
    ? 'text-sm leading-[24px]'
    : 'text-xs leading-[21px]';

  return (
    <div className={`flex flex-col h-full rounded-2xl border shadow-xl overflow-hidden transition-colors ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50' 
        : isEmerald
        ? 'bg-[#101b15] border-emerald-900/60 text-emerald-100 shadow-emerald-950/20'
        : isPurple
        ? 'bg-[#161228] border-purple-900/50 text-purple-100 shadow-purple-950/20'
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      {/* Editor Header & Toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b transition-colors ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : isEmerald
          ? 'bg-[#0d1611] border-emerald-900/50'
          : isPurple
          ? 'bg-[#1b1533] border-purple-900/40'
          : 'bg-slate-800/80 border-slate-700/60'
      }`}>
        <div className="flex items-center gap-2">
          {/* Editable Filename Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
            isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
              : isEmerald
              ? 'bg-[#080d0a] border-emerald-800 text-emerald-300 hover:border-emerald-600'
              : isPurple
              ? 'bg-[#100c20] border-purple-800 text-purple-300 hover:border-purple-600'
              : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:border-slate-500'
          }`}>
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${
              isLight ? 'text-blue-600' : isEmerald ? 'text-emerald-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
            }`} />
            {isEditingFilename ? (
              <input
                id="editor-filename-input"
                type="text"
                value={tempFilename}
                onChange={(e) => setTempFilename(e.target.value)}
                onBlur={saveFilename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveFilename();
                  if (e.key === 'Escape') setIsEditingFilename(false);
                }}
                autoFocus
                placeholder="filename.ext"
                className="w-32 bg-transparent outline-none border-b border-current font-mono font-semibold"
              />
            ) : (
              <button
                type="button"
                id="editor-filename-display-btn"
                onClick={() => setIsEditingFilename(true)}
                title="Click to rename file or change extension"
                className="flex items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <span className={`font-semibold truncate max-w-[160px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {filename || 'untitled_code'}
                </span>
                <Pencil className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          {/* Language Selector */}
          <select
            id="editor-language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold focus:outline-none cursor-pointer transition-colors ${
              isLight
                ? 'bg-white border-slate-300 text-blue-700 focus:border-blue-500'
                : isEmerald
                ? 'bg-[#080d0a] border-emerald-800 text-emerald-300 focus:border-emerald-400'
                : isPurple
                ? 'bg-[#100c20] border-purple-800 text-purple-300 focus:border-purple-400'
                : 'bg-slate-900 border-slate-700/60 text-cyan-300 focus:border-cyan-400'
            }`}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls & Sample Loader */}
        <div className="flex items-center gap-1.5">
          {/* Sample Preset Dropdown */}
          <div className="relative group">
            <button
              id="editor-samples-dropdown-btn"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-700/80 text-slate-300 border-slate-700/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Examples</span>
            </button>
            <div className={`absolute right-0 top-full mt-1 hidden group-hover:block border rounded-xl shadow-2xl p-1 z-30 min-w-[170px] ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}>
              <button
                onClick={() => loadSample('Python')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isLight ? 'hover:bg-blue-50 hover:text-blue-700' : 'hover:bg-cyan-500/20 hover:text-cyan-300'
                }`}
              >
                🐍 Python Buggy Auth
              </button>
              <button
                onClick={() => loadSample('JavaScript')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isLight ? 'hover:bg-blue-50 hover:text-blue-700' : 'hover:bg-cyan-500/20 hover:text-cyan-300'
                }`}
              >
                ⚡ JS Memory Leak
              </button>
              <button
                onClick={() => loadSample('Java')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isLight ? 'hover:bg-blue-50 hover:text-blue-700' : 'hover:bg-cyan-500/20 hover:text-cyan-300'
                }`}
              >
                ☕ Java Concurrency
              </button>
              <button
                onClick={() => loadSample('C++')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isLight ? 'hover:bg-blue-50 hover:text-blue-700' : 'hover:bg-cyan-500/20 hover:text-cyan-300'
                }`}
              >
                ⚙️ C++ Buffer Overflow
              </button>
            </div>
          </div>

          <button
            id="editor-copy-btn"
            onClick={handleCopy}
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              isLight
                ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/60'
            }`}
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="editor-clear-btn"
            onClick={onClear}
            className={`p-1.5 rounded-lg text-xs border transition-colors ${
              isLight
                ? 'bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-300'
                : 'bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-slate-700/60'
            }`}
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* File Dropzone Pill */}
      <div
        id="editor-file-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className={`mx-3 mt-3 px-3 py-2 border-2 border-dashed rounded-xl cursor-pointer transition-all flex items-center justify-between gap-2 ${
          isLight
            ? 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50'
            : isEmerald
            ? 'border-emerald-900/80 hover:border-emerald-400/70 bg-[#0a120e] hover:bg-emerald-950/30'
            : isPurple
            ? 'border-purple-900/80 hover:border-purple-400/70 bg-[#120e22] hover:bg-purple-950/30'
            : 'border-slate-700/80 hover:border-cyan-400/70 bg-slate-950/40 hover:bg-cyan-950/10'
        }`}
      >
        <div className="flex items-center gap-2">
          <Upload className={`w-4 h-4 ${
            isLight ? 'text-blue-600' : isEmerald ? 'text-emerald-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
          }`} />
          <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <span className={`font-semibold ${
              isLight ? 'text-blue-600' : isEmerald ? 'text-emerald-400' : isPurple ? 'text-purple-400' : 'text-cyan-400'
            }`}>Click to upload</span> or drag &amp; drop a file
          </span>
        </div>
        <span className={`text-[11px] font-mono hidden sm:inline-block ${
          isLight ? 'text-slate-400' : 'text-slate-500'
        }`}>
          .py, .java, .cpp, .js, .ts, .go, .rs
        </span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".py,.java,.cpp,.cc,.c,.h,.hpp,.js,.jsx,.ts,.tsx,.go,.rs,.rb,.php,.cs"
        />
      </div>

      {/* Code Text Area with Line Numbers */}
      <div className="flex-1 flex overflow-hidden p-3 min-h-[360px]">
        <div className={`flex w-full rounded-xl border font-mono ${fontClass} overflow-hidden shadow-inner transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-300 focus-within:border-blue-500'
            : isEmerald
            ? 'bg-[#080e0a] border-emerald-900/80 focus-within:border-emerald-500'
            : isPurple
            ? 'bg-[#0f0b1c] border-purple-900/80 focus-within:border-purple-500'
            : 'bg-slate-950 border-slate-800 focus-within:border-cyan-500/70'
        }`}>
          {/* Line Numbers column */}
          <div className={`w-10 py-3 select-none text-right pr-2 border-r overflow-hidden ${
            isLight
              ? 'bg-slate-200/50 border-slate-300 text-slate-400'
              : isEmerald
              ? 'bg-[#0c1410] border-emerald-900/70 text-emerald-600'
              : isPurple
              ? 'bg-[#151026] border-purple-900/70 text-purple-600'
              : 'bg-slate-900/60 border-slate-800/80 text-slate-600'
          }`}>
            {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
              <div key={i} className="h-[21px] leading-[21px]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            id="code-editor-textarea"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            placeholder="// Paste your code here or upload a file to begin analysis with explanation & enhancement tips..."
            className={`flex-1 p-3 bg-transparent resize-none focus:outline-none font-mono whitespace-pre overflow-auto ${
              isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-600'
            }`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Footer Info & Multi-Action Bar */}
      <div className={`p-3 border-t space-y-2 ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : isEmerald
          ? 'bg-[#0d1611] border-emerald-900/60'
          : isPurple
          ? 'bg-[#1b1533] border-purple-900/50'
          : 'bg-slate-800/70 border-slate-800'
      }`}>
        <div className={`flex items-center justify-between text-[11px] px-1 font-mono ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <span>{lineCount} lines</span>
          <span>{code.length} characters</span>
        </div>

        {/* 4 Primary Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Analyze & Tips */}
          <button
            id="code-action-analyze-btn"
            onClick={onAnalyze}
            disabled={isLoading || !code.trim()}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAction === 'analyze' && isLoading
                ? 'bg-cyan-500 text-slate-950 animate-pulse'
                : isLight
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:pointer-events-none'
                : isEmerald
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:pointer-events-none'
                : isPurple
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 disabled:opacity-40 disabled:pointer-events-none'
                : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none'
            }`}
            title="Analyze code with detailed logic explanation, enhancement tips, bugs & complexity"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Analyze &amp; Tips</span>
          </button>

          {/* Fix Code */}
          <button
            id="code-action-fix-btn"
            onClick={onFix}
            disabled={isLoading || !code.trim()}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAction === 'fix' && isLoading
                ? 'bg-indigo-500 text-white animate-pulse'
                : isLight
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 disabled:opacity-40 disabled:pointer-events-none'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Fix Code</span>
          </button>

          {/* Bug Scan */}
          <button
            id="code-action-bugs-btn"
            onClick={onBugScan}
            disabled={isLoading || !code.trim()}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAction === 'bugs' && isLoading
                ? 'bg-rose-500 text-white animate-pulse'
                : isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-40 disabled:pointer-events-none'
                : 'bg-slate-800 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/60 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Bug Scan</span>
          </button>

          {/* Generate Tests */}
          <button
            id="code-action-tests-btn"
            onClick={onGenerateTests}
            disabled={isLoading || !code.trim()}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeAction === 'tests' && isLoading
                ? 'bg-emerald-500 text-slate-950 animate-pulse'
                : isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 disabled:opacity-40 disabled:pointer-events-none'
                : 'bg-slate-800 hover:bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 hover:border-emerald-500/60 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gen Tests</span>
          </button>
        </div>
      </div>
    </div>
  );
};
