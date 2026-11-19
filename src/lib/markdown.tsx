import React, { useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import {
  isPreviewableCode,
  normalizeCodeLanguage,
} from './codeRunner';

export interface MarkdownRenderOptions {
  onOpenPreview?: (code: string, language: string, blockIndex: number) => void;
  openResultLabel?: string;
  copyCodeLabel?: string;
  copiedCodeLabel?: string;
  enablePreviewButtons?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
  blockIndex: number;
  options?: MarkdownRenderOptions;
}

function CodeBlock({ language, code, blockIndex, options }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const detectedLang = normalizeCodeLanguage(language, code);
  const displayLang = language || detectedLang;
  const canPreview =
    options?.enablePreviewButtons !== false &&
    Boolean(options?.onOpenPreview) &&
    isPreviewableCode(language, code);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="my-3 w-full max-w-full rounded-xl overflow-hidden border border-[var(--bd)] bg-[var(--surf)]">
      <div className="px-3.5 py-2 border-b border-[var(--bd)] bg-[var(--bg)]/60 flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-[var(--mut)] uppercase tracking-wider truncate">
          {displayLang || 'code'}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">
                  {options?.copiedCodeLabel || 'Copied'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{options?.copyCodeLabel || 'Copy'}</span>
              </>
            )}
          </button>

          {canPreview && (
            <button
              type="button"
              onClick={() =>
                options?.onOpenPreview?.(code, detectedLang || language, blockIndex)
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--ac)] text-[var(--on)] text-[11px] font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{options?.openResultLabel || 'Open result'}</span>
            </button>
          )}
        </div>
      </div>

      <pre className="p-3.5 overflow-x-auto max-w-full text-xs font-mono text-[var(--tx)] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderMarkdown(
  content: string,
  options?: MarkdownRenderOptions
): React.ReactNode {
  if (!content) return null;

  // Split content by code blocks first
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([^\n`]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Content before code block
    if (match.index > lastIndex) {
      parts.push(renderTextSegment(content.slice(lastIndex, match.index), lastIndex));
    }

    const lang = (match[1] || '').trim();
    const code = match[2] || '';
    const currentIdx = blockIndex++;

    parts.push(
      <CodeBlock
        key={`code-${match.index}-${currentIdx}`}
        language={lang}
        code={code}
        blockIndex={currentIdx}
        options={options}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(renderTextSegment(content.slice(lastIndex), lastIndex));
  }

  return <div className="space-y-2">{parts}</div>;
}

function renderTextSegment(text: string, baseKey: number): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let isNumbered = false;

  const flushList = () => {
    if (listItems.length === 0) return;
    const ListTag = isNumbered ? 'ol' : 'ul';
    elements.push(
      <ListTag
        key={`list-${baseKey}-${elements.length}`}
        className={`my-2 pl-5 space-y-1.5 text-[15px] sm:text-sm leading-[1.65] sm:leading-relaxed break-words ${isNumbered ? 'list-decimal' : 'list-disc'}`}
      >
        {listItems.map((item, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
        ))}
      </ListTag>
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`${baseKey}-${idx}`} className="font-serif-fraunces text-base font-semibold mt-3 mb-1">
          {trimmed.replace('### ', '')}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`${baseKey}-${idx}`} className="font-serif-fraunces text-lg font-semibold mt-4 mb-1.5">
          {trimmed.replace('## ', '')}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`${baseKey}-${idx}`} className="font-serif-fraunces text-xl font-bold mt-4 mb-2">
          {trimmed.replace('# ', '')}
        </h2>
      );
      return;
    }

    // Unordered List
    if (/^[-*•]\s+/.test(trimmed)) {
      if (isNumbered) flushList();
      isNumbered = false;
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }

    // Numbered List
    if (/^\d+[.)]\s+/.test(trimmed)) {
      if (!isNumbered && listItems.length > 0) flushList();
      isNumbered = true;
      listItems.push(trimmed.replace(/^\d+[.)]\s+/, ''));
      return;
    }

    // Quote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`${baseKey}-${idx}`}
          className="my-2 pl-3.5 border-l-2 border-[var(--ac)] text-[var(--mut)] italic text-sm"
          dangerouslySetInnerHTML={{ __html: inlineMarkdown(trimmed.replace('> ', '')) }}
        />
      );
      return;
    }

    flushList();

    if (!trimmed) {
      return;
    }

    elements.push(
      <p
        key={`${baseKey}-${idx}`}
        className="text-[15px] sm:text-[14.5px] leading-[1.65] sm:leading-relaxed text-[var(--tx)] break-words"
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }}
      />
    );
  });

  flushList();
  return elements;
}

function inlineMarkdown(str: string): string {
  let s = escapeHtml(str);
  // Bold
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  // Italic
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>');
  // Inline Code
  s = s.replace(/`([^`\n]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-[var(--surf)] border border-[var(--bd)] text-xs font-mono break-all">$1</code>');
  // Links
  s = s.replace(
    /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 text-[var(--tx)] font-medium hover:opacity-80 break-words">$1</a>'
  );
  return s;
}
