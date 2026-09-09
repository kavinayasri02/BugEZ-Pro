export const EXT_MAP: Record<string, string> = {
  '.py': 'Python',
  '.java': 'Java',
  '.cpp': 'C++',
  '.cc': 'C++',
  '.cxx': 'C++',
  '.c': 'C',
  '.h': 'C',
  '.hpp': 'C++',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.go': 'Go',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.cs': 'C#',
  '.rs': 'Rust',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.bash': 'Shell',
  '.kt': 'Kotlin',
  '.swift': 'Swift'
};

export const LANG_TO_EXT: Record<string, string> = {
  'Python': '.py',
  'Java': '.java',
  'C++': '.cpp',
  'C': '.c',
  'JavaScript': '.js',
  'TypeScript': '.ts',
  'Go': '.go',
  'Rust': '.rs',
  'C#': '.cs',
  'PHP': '.php',
  'Ruby': '.rb',
  'SQL': '.sql',
  'Shell': '.sh',
  'Kotlin': '.kt',
  'Swift': '.swift'
};

export function detectFromFilename(filename: string | null | undefined): string | null {
  if (!filename) return null;
  const lower = filename.toLowerCase().trim();
  for (const [ext, lang] of Object.entries(EXT_MAP)) {
    if (lower.endsWith(ext)) return lang;
  }
  return null;
}

export function detectFromContent(code: string): string {
  if (!code || !code.trim()) return 'Other';
  const trimmed = code.trim();

  const scores: Record<string, number> = {
    Java: 0,
    Python: 0,
    'C++': 0,
    C: 0,
    TypeScript: 0,
    JavaScript: 0,
    Go: 0,
    Rust: 0,
    'C#': 0,
    PHP: 0,
    Ruby: 0,
    SQL: 0,
    Shell: 0
  };

  // --- Java Heuristics ---
  if (/import\s+java\b/m.test(trimmed)) scores.Java += 25;
  if (/import\s+javax\b/m.test(trimmed)) scores.Java += 25;
  if (/public\s+class\s+\w+/m.test(trimmed)) scores.Java += 25;
  if (/public\s+static\s+void\s+main/m.test(trimmed)) scores.Java += 30;
  if (/System\.(out|in|err)\./m.test(trimmed)) scores.Java += 20;
  if (/new\s+Scanner\(/m.test(trimmed)) scores.Java += 20;
  if (/Integer\.(MIN_VALUE|MAX_VALUE|parseInt)/m.test(trimmed)) scores.Java += 15;
  if (/@Override\b/m.test(trimmed)) scores.Java += 15;
  if (/\b(int|double|float|long|boolean|char|String|void)\s+\w+\s*(=|\[\]|\()/m.test(trimmed) && trimmed.includes(';')) {
    scores.Java += 10;
  }

  // --- Python Heuristics ---
  if (/^\s*def\s+\w+\s*\(.*?\)\s*:/m.test(trimmed)) scores.Python += 25;
  if (/^\s*from\s+[\w.]+\s+import\b/m.test(trimmed)) scores.Python += 25;
  if (/^\s*import\s+(sys|os|json|time|math|re|random|requests|numpy|pandas|typing|sqlite3|hashlib|collections|datetime|itertools)\b/m.test(trimmed)) {
    scores.Python += 25;
  }
  if (/^\s*elif\s+.*?:/m.test(trimmed)) scores.Python += 20;
  if (/^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m.test(trimmed)) scores.Python += 30;
  if (/\bself\.\w+/m.test(trimmed)) scores.Python += 15;
  if (/^\s*class\s+\w+(\(.*?\))?\s*:/m.test(trimmed)) scores.Python += 15;
  // Penalize Python heavily if Java/C-style semicolons and curly braces are dominant
  const semicolonCount = (trimmed.match(/;/g) || []).length;
  const braceCount = (trimmed.match(/\{/g) || []).length;
  if (semicolonCount > 3 && braceCount > 1) {
    scores.Python = Math.max(0, scores.Python - 30);
  }

  // --- C++ Heuristics ---
  if (/#include\s*<(iostream|vector|string|algorithm|map|memory|cstring)>/m.test(trimmed)) scores['C++'] += 35;
  if (/\bstd::/m.test(trimmed)) scores['C++'] += 25;
  if (/cout\s*<</m.test(trimmed) || /cin\s*>>/m.test(trimmed)) scores['C++'] += 25;
  if (/namespace\s+\w+\s*\{/m.test(trimmed)) scores['C++'] += 20;

  // --- C Heuristics ---
  if (/#include\s*<(stdio|stdlib|string|unistd)\.h>/m.test(trimmed)) scores.C += 35;
  if (/\bprintf\s*\(/.test(trimmed) && !trimmed.includes('System.out')) scores.C += 15;
  if (/\b(malloc|free|memcpy)\s*\(/.test(trimmed)) scores.C += 20;

  // --- Go Heuristics ---
  if (/^\s*package\s+\w+/m.test(trimmed)) scores.Go += 30;
  if (/func\s+\w+\s*\(/.test(trimmed)) scores.Go += 20;
  if (/fmt\.(Println|Printf|Print)/.test(trimmed)) scores.Go += 25;
  if (/:=/.test(trimmed)) scores.Go += 10;

  // --- Rust Heuristics ---
  if (/fn\s+main\s*\(/.test(trimmed)) scores.Rust += 25;
  if (/let\s+mut\s+/.test(trimmed)) scores.Rust += 20;
  if (/println!\s*\(/.test(trimmed)) scores.Rust += 25;
  if (/impl\s+\w+/.test(trimmed)) scores.Rust += 20;

  // --- TypeScript Heuristics ---
  if (/interface\s+\w+\s*\{/m.test(trimmed)) scores.TypeScript += 20;
  if (/type\s+\w+\s*=/m.test(trimmed)) scores.TypeScript += 20;
  if (/:\s*(string|number|boolean|any|void)\b/m.test(trimmed)) scores.TypeScript += 15;
  if (/import\s+type\b/m.test(trimmed)) scores.TypeScript += 20;

  // --- JavaScript Heuristics ---
  if (/console\.log\s*\(/.test(trimmed)) scores.JavaScript += 15;
  if (/\bconst\s+\w+\s*=/.test(trimmed) || /\blet\s+\w+\s*=/.test(trimmed)) scores.JavaScript += 10;
  if (/require\s*\(['"]\w+['"]\)/.test(trimmed)) scores.JavaScript += 20;
  if (/export\s+default\b/.test(trimmed)) scores.JavaScript += 15;

  // --- C# Heuristics ---
  if (/using\s+System(\.|\b)/m.test(trimmed)) scores['C#'] += 30;
  if (/Console\.WriteLine\s*\(/.test(trimmed)) scores['C#'] += 25;

  // --- PHP Heuristics ---
  if (/<\?php/m.test(trimmed)) scores.PHP += 40;
  if (/\$\w+\s*=/m.test(trimmed)) scores.PHP += 15;

  // --- Ruby Heuristics ---
  if (/^\s*def\s+\w+[^(:]*$/m.test(trimmed)) scores.Ruby += 15;
  if (/\bputs\s+/.test(trimmed)) scores.Ruby += 15;

  // --- SQL Heuristics ---
  if (/\b(SELECT|INSERT\s+INTO|CREATE\s+TABLE|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i.test(trimmed)) {
    scores.SQL += 30;
  }

  // --- Shell Heuristics ---
  if (/^#!\/bin\/(bash|sh|zsh)/m.test(trimmed)) scores.Shell += 40;

  // Find maximum score
  let maxLang = 'Other';
  let maxScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxLang = lang;
    }
  }

  // If score is high enough to be confident
  if (maxScore >= 15) {
    return maxLang;
  }

  return 'Other';
}

export function suggestFilename(code: string, language: string, currentFilename?: string): string {
  const ext = LANG_TO_EXT[language] || '.txt';

  // For Java, extract class name if available: public class MyClass -> MyClass.java
  if (language === 'Java') {
    const classMatch = code.match(/public\s+class\s+(\w+)/) || code.match(/class\s+(\w+)/);
    if (classMatch && classMatch[1]) {
      return `${classMatch[1]}.java`;
    }
    return 'Main.java';
  }

  // For Python, check if there's a main function or class name
  if (language === 'Python') {
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch && classMatch[1]) {
      return `${classMatch[1].toLowerCase()}.py`;
    }
    const defMatch = code.match(/def\s+(\w+)/);
    if (defMatch && defMatch[1]) {
      return `${defMatch[1]}.py`;
    }
    return 'main.py';
  }

  // For C++
  if (language === 'C++') {
    return 'main.cpp';
  }

  // For C
  if (language === 'C') {
    return 'main.c';
  }

  // For Go
  if (language === 'Go') {
    return 'main.go';
  }

  // For Rust
  if (language === 'Rust') {
    return 'main.rs';
  }

  // For JavaScript / TypeScript
  if (language === 'JavaScript') return 'index.js';
  if (language === 'TypeScript') return 'index.ts';

  // For C#
  if (language === 'C#') {
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch && classMatch[1]) {
      return `${classMatch[1]}.cs`;
    }
    return 'Program.cs';
  }

  // If currentFilename exists and user just wants matching extension:
  if (currentFilename && currentFilename.includes('.')) {
    const base = currentFilename.substring(0, currentFilename.lastIndexOf('.'));
    return `${base}${ext}`;
  }

  return `snippet${ext}`;
}

export function detectLanguage(code: string, filename?: string | null): string {
  // First check content to see if there's a strong signature
  const fromContent = detectFromContent(code);
  if (fromContent && fromContent !== 'Other') {
    return fromContent;
  }
  
  // Fall back to filename if content is ambiguous
  const fromFile = detectFromFilename(filename);
  if (fromFile) return fromFile;

  return 'Other';
}

export const SUPPORTED_LANGUAGES = [
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'C++',
  'C',
  'Go',
  'Rust',
  'C#',
  'PHP',
  'Ruby',
  'SQL',
  'Shell',
  'Other'
];

