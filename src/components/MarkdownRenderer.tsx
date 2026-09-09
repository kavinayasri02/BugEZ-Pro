import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple clean markdown parser for headings, code blocks, lists, bold text
  const renderFormatted = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let blockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeText = codeBuffer.join('\n');
          const currentIndex = blockIndex++;
          elements.push(
            <div key={`code-${currentIndex}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-xl">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-2 font-semibold text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  {codeLanguage || 'code'}
                </span>
                <button
                  onClick={() => copyToClipboard(codeText, currentIndex)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedIndex === currentIndex ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-200 leading-relaxed">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-cyan-300 mt-6 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-cyan-400"></span>
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-white mt-7 mb-3 border-b border-slate-800 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-extrabold text-white mt-8 mb-4">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-5 text-slate-300 list-disc my-1 leading-relaxed">
            {renderInlineMarkdown(line.slice(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={i} className="ml-5 text-slate-300 list-decimal my-1 leading-relaxed">
            {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-3" />);
      } else {
        elements.push(
          <p key={i} className="text-slate-300 my-1.5 leading-relaxed text-sm">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    }

    if (inCodeBlock && codeBuffer.length > 0) {
      elements.push(
        <pre key="unclosed-code" className="my-4 p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-sm font-mono text-slate-200">
          <code>{codeBuffer.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Process bold **text** and inline `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700/50">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1 text-slate-200">{renderFormatted()}</div>;
};
