import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// -------------------------------------------------------------
// PERSISTENT DATABASE (survives refreshes & restarts)
// -------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'bugez_history.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredAnalysis {
  id: string;
  timestamp: string;
  mode: string;
  language: string;
  source: string;
  code_snippet: string;
  result: string;
  bugs?: any[];
}

function readHistory(): StoredAnalysis[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading history DB:', err);
    return [];
  }
}

function writeHistory(records: StoredAnalysis[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing history DB:', err);
  }
}

// -------------------------------------------------------------
// AI CLIENT HELPERS (GEMINI + GROQ) WITH AUTOMATIC FALLBACK
// -------------------------------------------------------------
function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Resilient streaming with automatic model fallback (handles 503/404/429 spikes seamlessly)
async function streamGeminiWithFallback(
  gemini: GoogleGenAI,
  prompt: string,
  preferredModel: string,
  onChunk: (chunkText: string) => void
): Promise<string> {
  const candidateModels = [
    preferredModel || 'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-pro-preview'
  ];
  const uniqueModels = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const stream = await gemini.models.generateContentStream({
        model: modelName,
        contents: prompt
      });

      let totalOutput = '';
      for await (const chunk of stream) {
        if (chunk.text) {
          totalOutput += chunk.text;
          onChunk(chunk.text);
        }
      }
      if (totalOutput.trim().length > 0) {
        return totalOutput;
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All candidate AI models were temporarily unavailable. Please try again.');
}

// Resilient non-streaming generation with automatic fallback
async function generateGeminiWithFallback(
  gemini: GoogleGenAI,
  prompt: string,
  preferredModel: string
): Promise<string> {
  const candidateModels = [
    preferredModel || 'gemini-3.1-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-pro-preview'
  ];
  const uniqueModels = Array.from(new Set(candidateModels));
  let lastError: any = null;

  for (const modelName of uniqueModels) {
    try {
      const response = await gemini.models.generateContent({
        model: modelName,
        contents: prompt
      });
      const text = response.text || '';
      if (text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} encountered error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All candidate AI models were temporarily unavailable. Please try again.');
}

async function callGroqStream(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Failed to get readable stream from Groq');

  const decoder = new TextDecoder();
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
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) onChunk(content);
        } catch {
          // ignore parse errors
        }
      }
    }
  }
}

async function callGroqSync(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  responseFormat?: { type: string }
): Promise<string> {
  const body: any = {
    model,
    messages,
    stream: false,
  };
  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content || '';
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// System Status
app.get('/api/status', (req: Request, res: Response) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGithub = Boolean(process.env.GITHUB_TOKEN);
  res.json({
    geminiAvailable: hasGemini,
    groqAvailable: hasGroq,
    githubTokenConfigured: hasGithub,
    historyCount: readHistory().length
  });
});

// History List
app.get('/api/history', (req: Request, res: Response) => {
  const history = readHistory();
  res.json(history);
});

// Save Analysis to History
app.post('/api/history', (req: Request, res: Response) => {
  const { mode, language, source, code_snippet, result, bugs } = req.body;
  const history = readHistory();
  const newRecord: StoredAnalysis = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    mode: mode || 'Analyze',
    language: language || 'Plaintext',
    source: source || 'pasted',
    code_snippet: (code_snippet || '').slice(0, 10000),
    result: result || '',
    bugs: bugs || []
  };

  history.unshift(newRecord);
  // Keep max 100 entries
  if (history.length > 100) history.pop();
  writeHistory(history);

  res.json({ success: true, record: newRecord });
});

// Clear or Delete History
app.delete('/api/history', (req: Request, res: Response) => {
  const { id } = req.query;
  if (id && typeof id === 'string') {
    let history = readHistory();
    history = history.filter(item => item.id !== id);
    writeHistory(history);
    res.json({ success: true, message: 'Record deleted' });
  } else {
    writeHistory([]);
    res.json({ success: true, message: 'All history cleared' });
  }
});

// Helper to resolve and validate language & filename based on syntax signatures
function sanitizeAndResolveLanguage(
  code: string,
  providedLanguage?: string,
  providedFilename?: string,
  requestedFramework?: string
): { language: string; filename: string; framework: string } {
  const trimmed = (code || '').trim();
  let resolvedLang = providedLanguage || 'Python';
  let resolvedFilename = providedFilename || '';

  // Strong syntax signatures that override mismatched declared language
  const isJava = /import\s+java\b|import\s+javax\b|public\s+class\s+\w+|public\s+static\s+void\s+main|System\.(out|in|err)\.|new\s+Scanner\(/m.test(trimmed);
  const isCpp = /#include\s*<(iostream|vector|string|algorithm|map|memory|cstring)>|\bstd::|cout\s*<<|cin\s*>>/m.test(trimmed);
  const isC = !isCpp && /#include\s*<(stdio|stdlib|string)\.h>|\bprintf\s*\(/.test(trimmed);
  const isGo = /^\s*package\s+\w+|func\s+\w+\s*\(|fmt\.(Println|Printf)/m.test(trimmed);
  const isRust = /fn\s+main\s*\(|let\s+mut\s+|println!\s*\(|impl\s+\w+/.test(trimmed);
  const isCSharp = /using\s+System(\.|\b)|Console\.WriteLine\s*\(/.test(trimmed);

  if (isJava) {
    resolvedLang = 'Java';
  } else if (isCpp) {
    resolvedLang = 'C++';
  } else if (isC) {
    resolvedLang = 'C';
  } else if (isGo) {
    resolvedLang = 'Go';
  } else if (isRust) {
    resolvedLang = 'Rust';
  } else if (isCSharp) {
    resolvedLang = 'C#';
  }

  // If filename is missing or still auth_service.py or has mismatched extension, fix it
  if (!resolvedFilename || resolvedFilename === 'auth_service.py' || resolvedFilename.startsWith('snippet')) {
    if (resolvedLang === 'Java') {
      const match = trimmed.match(/public\s+class\s+(\w+)/) || trimmed.match(/class\s+(\w+)/);
      resolvedFilename = match && match[1] ? `${match[1]}.java` : 'Main.java';
    } else if (resolvedLang === 'C++') {
      resolvedFilename = 'main.cpp';
    } else if (resolvedLang === 'C') {
      resolvedFilename = 'main.c';
    } else if (resolvedLang === 'Go') {
      resolvedFilename = 'main.go';
    } else if (resolvedLang === 'Rust') {
      resolvedFilename = 'main.rs';
    } else if (resolvedLang === 'Python') {
      resolvedFilename = 'main.py';
    } else if (resolvedLang === 'JavaScript') {
      resolvedFilename = 'index.js';
    } else if (resolvedLang === 'TypeScript') {
      resolvedFilename = 'index.ts';
    }
  }

  const defaultFrameworkMap: Record<string, string> = {
    Python: 'pytest',
    JavaScript: 'Jest',
    TypeScript: 'Jest / Vitest',
    Java: 'JUnit 5',
    'C++': 'Google Test (gtest)',
    C: 'Unity / CUnit',
    Go: 'testing package',
    Rust: 'cargo test',
    'C#': 'xUnit / NUnit',
    Ruby: 'RSpec',
    PHP: 'PHPUnit'
  };

  return {
    language: resolvedLang,
    filename: resolvedFilename,
    framework: requestedFramework || defaultFrameworkMap[resolvedLang] || 'unit test framework'
  };
}

// 1. STREAMING ANALYSIS
app.post('/api/analyze', async (req: Request, res: Response) => {
  const { code, language: reqLang, filename: reqFilename, model = 'gemini-3.1-flash-lite', customKey } = req.body;

  if (!code || !code.trim()) {
    res.status(400).json({ error: 'Code is required for analysis' });
    return;
  }

  const { language, filename } = sanitizeAndResolveLanguage(code, reqLang, reqFilename);

  // Setup Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const prompt = `You are a Principal Software Engineer and static analysis authority reviewing ${language} code.
File Name: ${filename}
Target Language: ${language}

CRITICAL DIRECTIVE:
You are analyzing code in ${language}. You MUST review and explain it natively as ${language}.
DO NOT convert, rewrite, or compare it to Python or any other language unless explicitly requested.
All recommendations, syntax inspections, enhancement tips, and sample fixes must be written in idiomatic ${language}.

Analyze the following ${language} code thoroughly:

\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive, high-quality, and easy-to-read review using clean Markdown with these exact sections:

## 📖 1. Code Explanation & Logic Walkthrough
- **Core Purpose**: Clearly explain what this code does in plain, accessible English so any engineer immediately understands its intent.
- **Function-by-Function / Line-by-Line Breakdown**: Walk through the logic step-by-step, including input parameters, execution flow, conditions, loops, and return values.
- **Data Structures & State**: Describe what data structures, collections, variables, or external resources are used.

## 💡 2. Code Enhancement Tips & Best Practices
- **Clean Code & Readability**: Concrete tips on naming, structure, idiomatic ${language} patterns, and reducing cognitive load.
- **Type Safety & Documentation**: Recommendations for type annotations, docstrings, and input validation.
- **Performance & Resource Optimization**: Specific tips to improve speed, reduce redundant operations, or prevent resource/memory leaks.
- **Defensive Programming & Resilience**: Edge cases to guard against (empty inputs, null/undefined, division by zero, unhandled exceptions).

## 🐛 3. Critical Bugs & Vulnerabilities Found
- Detail any actual bugs, syntax errors, logical defects, security hazards, or unclosed handles in native ${language}. If none, explicitly note clean aspects.

## ⏱️ 4. Time & Space Complexity
- Big-O Time Complexity: O(...) with mathematical explanation.
- Big-O Auxiliary Space Complexity: O(...) with explanation.

## 🚀 5. Enhanced & Optimized Code Example
- Provide the fully refactored, production-ready version of the code in native ${language} that incorporates all the enhancement tips and fixes above. Use a single \`\`\`${language} ... \`\`\` code block.`;

  try {
    if (model.startsWith('gemini')) {
      const gemini = getGeminiClient(customKey);
      if (!gemini) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in environment or provide a key.');
      }

      await streamGeminiWithFallback(gemini, prompt, model, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });
    } else {
      // Groq model
      const groqKey = customKey || process.env.GROQ_API_KEY;
      if (!groqKey) {
        throw new Error('Groq API key is not configured. Please set GROQ_API_KEY or select Gemini.');
      }

      await callGroqStream(
        groqKey,
        model,
        [
          { role: 'system', content: 'You are an expert code analysis and static review engine.' },
          { role: 'user', content: prompt }
        ],
        (chunk) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
      );
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Analyze error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message || 'Analysis failed' })}\n\n`);
    res.end();
  }
});

// 2. "FIX MY CODE" MODE
app.post('/api/fix', async (req: Request, res: Response) => {
  const { code, language: reqLang, filename: reqFilename, model = 'gemini-3.1-flash-lite', customKey } = req.body;

  if (!code || !code.trim()) {
    res.status(400).json({ error: 'Code is required to fix' });
    return;
  }

  const { language, filename } = sanitizeAndResolveLanguage(code, reqLang, reqFilename);

  const prompt = `You are an expert ${language} developer and refactoring authority.
The target language is strictly ${language} (File: ${filename}).

CRITICAL DIRECTIVE:
Fix ALL bugs, syntax errors, security vulnerabilities, edge cases, and performance anti-patterns in the following ${language} code.
Return ONLY the corrected, complete, working ${language} code.
Wrap the entire corrected code in a single \`\`\`${language} ... \`\`\` block.
DO NOT translate or convert the code to Python or any other language. Maintain native ${language} idioms.
Do NOT include any introduction, explanations, or conversational filler before or after the code fence.

Code to fix:
\`\`\`${language}
${code}
\`\`\``;

  try {
    let rawResult = '';
    if (model.startsWith('gemini')) {
      const gemini = getGeminiClient(customKey);
      if (!gemini) throw new Error('Gemini API key is not configured.');
      rawResult = await generateGeminiWithFallback(gemini, prompt, model);
    } else {
      const groqKey = customKey || process.env.GROQ_API_KEY;
      if (!groqKey) throw new Error('Groq API key is not configured.');
      rawResult = await callGroqSync(groqKey, model, [
        { role: 'system', content: `You are an expert ${language} code fixer. Output only the corrected code block in ${language}.` },
        { role: 'user', content: prompt }
      ]);
    }

    // Extract code between fences
    const match = rawResult.match(/```(?:\w+)?\n([\s\S]*?)```/);
    const fixedCode = match ? match[1].trim() : rawResult.trim();

    res.json({
      success: true,
      originalCode: code,
      fixedCode
    });
  } catch (err: any) {
    console.error('Fix error:', err);
    res.status(500).json({ error: err.message || 'Fix operation failed' });
  }
});

// 3. STRUCTURED SEVERITY-TAGGED BUG LIST
app.post('/api/bugs', async (req: Request, res: Response) => {
  const { code, language: reqLang, filename: reqFilename, model = 'gemini-3.1-flash-lite', customKey } = req.body;

  if (!code || !code.trim()) {
    res.status(400).json({ error: 'Code is required for bug scan' });
    return;
  }

  const { language, filename } = sanitizeAndResolveLanguage(code, reqLang, reqFilename);

  const prompt = `You are a high-precision static code analyzer and security linter specializing in ${language}.
Target Language: ${language} (File: ${filename})
Analyze this ${language} code thoroughly for bugs, performance inefficiencies, and security risks in native ${language}.
DO NOT treat this as Python or any other language.

\`\`\`${language}
${code}
\`\`\`

Return a strictly valid JSON array (and NOTHING else, no markdown fences, no explanatory text) where each object represents a single identified issue with these EXACT keys:
- "bug": concise title and description of the issue
- "category": one of exactly "Bug", "Performance", or "Security"
- "severity": one of exactly "Critical", "High", "Medium", or "Low"
- "line": integer line number where the issue occurs (1-indexed based on the provided code snippet), or 0 if general/unlocalized
- "fix": specific, actionable code fix or recommendation in native ${language}

If there are genuinely zero issues found, return an empty array: []`;

  try {
    let rawText = '';
    if (model.startsWith('gemini')) {
      const gemini = getGeminiClient(customKey);
      if (!gemini) throw new Error('Gemini API key is not configured.');
      rawText = await generateGeminiWithFallback(gemini, prompt, model);
    } else {
      const groqKey = customKey || process.env.GROQ_API_KEY;
      if (!groqKey) throw new Error('Groq API key is not configured.');
      rawText = await callGroqSync(
        groqKey,
        model,
        [
          { role: 'system', content: `You are a JSON-only static analysis engine for ${language}.` },
          { role: 'user', content: prompt }
        ],
        { type: 'json_object' }
      );
    }

    // Clean up potential markdown formatting
    let cleaned = rawText.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let bugsArray: any[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        bugsArray = parsed;
      } else if (parsed.bugs && Array.isArray(parsed.bugs)) {
        bugsArray = parsed.bugs;
      } else if (parsed.issues && Array.isArray(parsed.issues)) {
        bugsArray = parsed.issues;
      }
    } catch (parseErr) {
      console.warn('Could not parse JSON bugs directly:', parseErr, cleaned);
      const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try {
          bugsArray = JSON.parse(match[0]);
        } catch {
          // ignore
        }
      }
    }

    // Normalize items
    const normalizedBugs = bugsArray.map((b, idx) => ({
      id: `bug_${idx}_${Date.now()}`,
      bug: String(b.bug || 'Unspecified issue'),
      category: ['Bug', 'Performance', 'Security'].includes(b.category) ? b.category : 'Bug',
      severity: ['Critical', 'High', 'Medium', 'Low'].includes(b.severity) ? b.severity : 'Medium',
      line: typeof b.line === 'number' ? b.line : parseInt(b.line, 10) || 0,
      fix: String(b.fix || 'Review code logic')
    }));

    const summary = {
      total: normalizedBugs.length,
      critical: normalizedBugs.filter(b => b.severity === 'Critical').length,
      high: normalizedBugs.filter(b => b.severity === 'High').length,
      medium: normalizedBugs.filter(b => b.severity === 'Medium').length,
      low: normalizedBugs.filter(b => b.severity === 'Low').length,
      byCategory: {
        bug: normalizedBugs.filter(b => b.category === 'Bug').length,
        performance: normalizedBugs.filter(b => b.category === 'Performance').length,
        security: normalizedBugs.filter(b => b.category === 'Security').length
      }
    };

    res.json({
      success: true,
      bugs: normalizedBugs,
      summary
    });
  } catch (err: any) {
    console.error('Bugs scan error:', err);
    res.status(500).json({ error: err.message || 'Bug scan failed' });
  }
});

// 4. UNIT TEST CASE GENERATION
app.post('/api/tests', async (req: Request, res: Response) => {
  const { code, language: reqLang, filename: reqFilename, framework: requestedFramework, model = 'gemini-3.1-flash-lite', customKey } = req.body;

  if (!code || !code.trim()) {
    res.status(400).json({ error: 'Code is required to generate unit tests' });
    return;
  }

  const { language, filename, framework } = sanitizeAndResolveLanguage(code, reqLang, reqFilename, requestedFramework);

  const prompt = `You are a test-driven development (TDD) specialist for ${language}.
Target Language: ${language} (File: ${filename})
Test Framework: ${framework}

Write a comprehensive, production-ready unit test suite for the following ${language} code using ${framework}.
DO NOT write tests in Python or any other language; use native ${language} and ${framework}.

Ensure the test suite includes:
1. Happy path / standard cases
2. Edge cases (empty inputs, boundaries, extreme values, null/nil)
3. Negative and error-handling verification
4. Clear assertion statements and descriptive test function names
5. Necessary mocks or fixtures if applicable

Return ONLY the complete test code enclosed in a single \`\`\`${language} ... \`\`\` fence.
Do NOT include any conversational text or markdown headings before or after the code block.

Source Code:
\`\`\`${language}
${code}
\`\`\``;

  try {
    let rawResult = '';
    if (model.startsWith('gemini')) {
      const gemini = getGeminiClient(customKey);
      if (!gemini) throw new Error('Gemini API key is not configured.');
      rawResult = await generateGeminiWithFallback(gemini, prompt, model);
    } else {
      const groqKey = customKey || process.env.GROQ_API_KEY;
      if (!groqKey) throw new Error('Groq API key is not configured.');
      rawResult = await callGroqSync(groqKey, model, [
        { role: 'system', content: `You are a unit testing expert writing ${framework} tests for ${language}.` },
        { role: 'user', content: prompt }
      ]);
    }

    const match = rawResult.match(/```(?:\w+)?\n([\s\S]*?)```/);
    const tests = match ? match[1].trim() : rawResult.trim();

    res.json({
      success: true,
      framework,
      language,
      tests
    });
  } catch (err: any) {
    console.error('Tests error:', err);
    res.status(500).json({ error: err.message || 'Unit test generation failed' });
  }
});

// 5. MULTI-FILE / PROJECT ANALYSIS (Streaming)
app.post('/api/multi-file', async (req: Request, res: Response) => {
  const { files, model = 'gemini-3.1-flash-lite', customKey } = req.body;

  if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
    res.status(400).json({ error: 'Files object { [filename]: content } is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const fileEntries = Object.entries(files).slice(0, 25);
  const combinedFiles = fileEntries
    .map(([filename, content]) => `### File: ${filename}\n\`\`\`\n${String(content).slice(0, 15000)}\n\`\`\``)
    .join('\n\n');

  const prompt = `You are a Principal Software Architect conducting an in-depth code review of a multi-file project.
Analyze the following project files together, paying rigorous attention to architectural boundaries, cross-file imports, shared state, data flow, interface consistency, and circular dependencies.

${combinedFiles}

Format your review with clear markdown headings:
### 1. Project Architecture & Component Flow
Provide a high-level map of the codebase, key modules, responsibilities, and how files communicate.

### 2. Cross-File Inconsistencies & Contract Mismatches
Identify missing exports, mismatched function signatures, circular references, inconsistent type declarations, or broken imports.

### 3. File-by-File Defect & Vulnerability Analysis
List specific bugs, race conditions, unhandled rejections, or memory leaks for each file.

### 4. Architectural & Modularity Recommendations
Provide actionable refactoring suggestions to improve decoupling, maintainability, and clean architecture.`;

  try {
    if (model.startsWith('gemini')) {
      const gemini = getGeminiClient(customKey);
      if (!gemini) throw new Error('Gemini API key is not configured.');

      await streamGeminiWithFallback(gemini, prompt, model, (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });
    } else {
      const groqKey = customKey || process.env.GROQ_API_KEY;
      if (!groqKey) throw new Error('Groq API key is not configured.');
      await callGroqStream(
        groqKey,
        model,
        [
          { role: 'system', content: 'You are an elite multi-file project code reviewer.' },
          { role: 'user', content: prompt }
        ],
        (chunk) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
      );
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Multi-file analyze error:', err);
    res.write(`data: ${JSON.stringify({ error: err.message || 'Project analysis failed' })}\n\n`);
    res.end();
  }
});

// 6. GITHUB REPO FETCHER
const CODE_EXTENSIONS = ['.py', '.java', '.cpp', '.cc', '.c', '.h', '.hpp', '.js', '.jsx', '.ts', '.tsx', '.go', '.rs', '.php', '.rb'];

app.post('/api/github', async (req: Request, res: Response) => {
  const { repoUrl, token: customToken, maxFiles = 15 } = req.body;

  if (!repoUrl) {
    res.status(400).json({ error: 'GitHub repository URL is required' });
    return;
  }

  // Parse owner and repo
  const match = repoUrl.trim().match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) {
    res.status(400).json({ error: 'Invalid GitHub URL format. Example: https://github.com/owner/repository' });
    return;
  }

  const owner = match[1];
  const repo = match[2];
  const token = customToken || process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'BugEZ-Pro-Analyzer'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 1. Get repo details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new Error('Repository not found or is private.');
      } else if (repoRes.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please configure a personal access token.');
      }
      throw new Error(`GitHub API error: ${repoRes.statusText}`);
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // 2. Fetch git tree recursively
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { headers });
    if (!treeRes.ok) {
      throw new Error(`Failed to fetch file tree for branch ${defaultBranch}`);
    }

    const treeData = await treeRes.json();
    const tree = treeData.tree || [];

    // Filter code files
    const codeItems = tree.filter((item: any) => {
      if (item.type !== 'blob') return false;
      const lower = item.path.toLowerCase();
      if (lower.includes('node_modules/') || lower.includes('.git/') || lower.includes('dist/') || lower.includes('build/')) return false;
      return CODE_EXTENSIONS.some(ext => lower.endsWith(ext));
    }).slice(0, Math.min(Number(maxFiles) || 15, 30));

    // 3. Fetch file contents in parallel
    const files: Record<string, string> = {};
    await Promise.all(
      codeItems.map(async (item: any) => {
        try {
          const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${defaultBranch}`, { headers });
          if (!blobRes.ok) return;
          const blobData = await blobRes.json();
          if (blobData.content && blobData.encoding === 'base64') {
            files[item.path] = Buffer.from(blobData.content, 'base64').toString('utf-8');
          }
        } catch {
          // ignore single file fetch failure
        }
      })
    );

    res.json({
      success: true,
      owner,
      repo,
      defaultBranch,
      files,
      fileCount: Object.keys(files).length,
      stars: repoData.stargazers_count,
      description: repoData.description
    });
  } catch (err: any) {
    console.error('GitHub fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch repository files' });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev: load Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In prod: serve dist files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

 app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BugEZ Pro running at http://localhost:${PORT}`);

  if (process.platform === 'win32') {
    exec(`start http://localhost:${PORT}`);
  }
});
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
