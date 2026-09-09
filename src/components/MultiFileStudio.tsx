import React, { useState, useRef } from 'react';
import { Upload, FolderArchive, FileCode, Play, Download, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { MarkdownRenderer } from './MarkdownRenderer';
import { detectFromFilename } from '../utils/languageDetect';

interface MultiFileStudioProps {
  onRecordHistory: (record: {
    mode: 'MultiFile';
    language: string;
    source: string;
    code_snippet: string;
    result: string;
  }) => void;
  selectedModel: string;
  customApiKey: string;
}

const SAMPLE_PROJECT_FILES: Record<string, string> = {
  'auth/token_service.py': `import jwt
import datetime

SECRET_KEY = "insecure_hardcoded_secret"

def generate_auth_token(user_id, role="user"):
    # Token valid for 2 hours
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    # Bug: Weak algorithm none allowed if not enforced
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def decode_token(token_string):
    try:
        # Bug: Doesn't verify expiration or signature strictly
        return jwt.decode(token_string, SECRET_KEY, algorithms=["HS256"])
    except Exception as e:
        return None
`,
  'api/routes.py': `from auth.token_service import generate_auth_token, verify_user_token # Bug: verify_user_token doesn't exist in token_service!
from models.user_model import get_user_by_id

def handle_login_request(request_data):
    username = request_data.get("username")
    user = get_user_by_id(username) # Bug: get_user_by_id expects integer id, but username string is passed!
    
    if not user:
        return {"error": "User not found"}, 404
        
    token = generate_auth_token(user["id"])
    return {"token": token, "user": user}, 200
`,
  'models/user_model.py': `import sqlite3

def get_user_by_id(user_id: int):
    # Expects integer id
    conn = sqlite3.connect("database.db")
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "username": row[1], "email": row[2]}
`
};

export const MultiFileStudio: React.FC<MultiFileStudioProps> = ({
  onRecordHistory,
  selectedModel,
  customApiKey
}) => {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('project.zip');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProjectName(file.name);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const extracted: Record<string, string> = {};

      const validExts = ['.py', '.java', '.cpp', '.cc', '.c', '.h', '.hpp', '.js', '.jsx', '.ts', '.tsx', '.go', '.rs', '.rb', '.php', '.cs'];

      for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.includes('node_modules/')) continue;
        const lower = relativePath.toLowerCase();
        if (validExts.some(ext => lower.endsWith(ext))) {
          const text = await zipEntry.async('text');
          extracted[relativePath] = text;
        }
      }

      if (Object.keys(extracted).length === 0) {
        setError('No recognizable code files found in this zip file.');
        return;
      }

      setFiles(extracted);
      setSelectedFilename(Object.keys(extracted)[0]);
    } catch (err: any) {
      setError(`Failed to read zip: ${err.message}`);
    }
  };

  const handleMultiFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    setError(null);
    setProjectName(`Project (${uploaded.length} files)`);
    const newFiles: Record<string, string> = {};

    Array.from(uploaded).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        newFiles[file.name] = text;
        if (Object.keys(newFiles).length === uploaded.length) {
          setFiles(newFiles);
          setSelectedFilename(uploaded[0].name);
        }
      };
      reader.readAsText(file);
    });
  };

  const loadSampleProject = () => {
    setFiles(SAMPLE_PROJECT_FILES);
    setSelectedFilename(Object.keys(SAMPLE_PROJECT_FILES)[0]);
    setProjectName('microservice_sample.zip');
    setError(null);
  };

  const startAnalysis = async () => {
    if (Object.keys(files).length === 0) return;

    setIsStreaming(true);
    setAnalysisResult('');
    setError(null);

    try {
      const response = await fetch('/api/multi-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files,
          model: selectedModel,
          customKey: customApiKey
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errJson.error || 'Multi-file analysis failed');
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
              const data = JSON.parse(trimmed.slice(6));
              if (data.text) {
                accumulated += data.text;
                setAnalysisResult(accumulated);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      onRecordHistory({
        mode: 'MultiFile',
        language: 'Mixed',
        source: projectName,
        code_snippet: Object.keys(files).join('\n'),
        result: accumulated
      });
    } catch (err: any) {
      setError(err.message || 'Cross-file analysis failed');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([analysisResult], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_analysis_${projectName.replace(/\W+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileCount = Object.keys(files).length;

  return (
    <div className="space-y-4">
      {/* Upload and Control Header */}
      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-400" />
            Multi-File &amp; Project Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload a .zip file or select multiple files. The AI analyzes cross-module imports, interface mismatches, and architectural risks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSampleProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Project
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .ZIP
          </button>

          <button
            onClick={() => multiFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            Add Multiple Files
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleZipUpload}
            accept=".zip"
            className="hidden"
          />
          <input
            type="file"
            ref={multiFileInputRef}
            onChange={handleMultiFilesUpload}
            multiple
            className="hidden"
          />

          <button
            onClick={startAnalysis}
            disabled={fileCount === 0 || isStreaming}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isStreaming
                ? 'bg-indigo-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isStreaming ? 'Analyzing Project...' : `Analyze ${fileCount > 0 ? `(${fileCount} files)` : 'Project'}`}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Multi-File Workspace */}
      {fileCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* File Tree / File List */}
          <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-3 shadow-xl flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Project Files</span>
              <span className="font-mono">{fileCount} files</span>
            </div>

            <div className="flex-1 overflow-auto space-y-1 pr-1">
              {Object.keys(files).map((path) => {
                const lang = detectFromFilename(path) || 'Code';
                const isSelected = selectedFilename === path;
                return (
                  <button
                    key={path}
                    onClick={() => setSelectedFilename(path)}
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

          {/* Center Code Preview & Right/Bottom Stream Viewer */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* File Preview */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-[280px]">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs font-mono">
                <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  {selectedFilename || 'Select a file'}
                </span>
                <span className="text-slate-400">
                  {selectedFilename && files[selectedFilename] ? `${files[selectedFilename].split('\n').length} lines` : ''}
                </span>
              </div>
              <pre className="flex-1 p-3 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950">
                <code>{selectedFilename ? files[selectedFilename] : '// Select a file from the left to preview'}</code>
              </pre>
            </div>

            {/* Analysis Result */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex-1 min-h-[300px] overflow-auto flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Architectural &amp; Cross-File Review
                </h3>
                {analysisResult && (
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
                      Save Markdown
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto">
                {isStreaming && !analysisResult ? (
                  <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-xs space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                    <span>Streaming architectural cross-file audit...</span>
                  </div>
                ) : analysisResult ? (
                  <MarkdownRenderer content={analysisResult} />
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Click "Analyze Project" to run a cross-file audit detecting import errors, shared state issues, and architectural flaws.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border-2 border-dashed border-slate-800">
          <FolderArchive className="w-12 h-12 text-indigo-400/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Project Loaded</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Upload a .zip package or multiple code files, or try our sample microservice to test cross-file dependency inspection.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={loadSampleProject}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Load Sample Microservice
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-slate-700 transition-all"
            >
              Upload .ZIP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
