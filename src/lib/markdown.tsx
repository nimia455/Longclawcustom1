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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API may be blocked in restricted iframe contexts
    }
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg text-[11px] font-medium text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer whitespace-nowrap"
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
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[var(--ac)] text-[var(--on)] text-[11px] font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
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

function sanitizeSafeHttpUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Reject malformed or unsupported schemes
  }
  return null;
}

/**
 * Pure React inline markdown parser (zero dangerouslySetInnerHTML).
 * Supports inline code, links (http/https only), bold, italic, and strikethrough.
 */
function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenRegex =
    /`([^`\n]+)`|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*|~~([^~\n]+)~~|(^|[^*])\*([^*\n]+)\*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const matchStart = match.index;

    // Italic pattern captures an optional leading non-asterisk character in group 6
    const italicPrefix = match[6] && match[7] ? match[6] : '';
    const effectiveStart = matchStart + italicPrefix.length;

    if (effectiveStart > lastIndex) {
      nodes.push(text.slice(lastIndex, effectiveStart));
    }

    const key = `${keyPrefix}-t-${tokenIdx++}`;

    if (match[1] !== undefined) {
      // Inline code
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 rounded-md bg-[var(--surf)] border border-[var(--bd)] text-xs font-mono break-all"
        >
          {match[1]}
        </code>
      );
    } else if (match[2] !== undefined && match[3] !== undefined) {
      // Link (strictly http/https)
      const safeHref = sanitizeSafeHttpUrl(match[3]);
      if (safeHref) {
        nodes.push(
          <a
            key={key}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-[var(--tx)] font-medium hover:opacity-80 break-words"
          >
            {match[2]}
          </a>
        );
      } else {
        nodes.push(match[2]);
      }
    } else if (match[4] !== undefined) {
      // Bold (allow nested inline tokens inside bold)
      nodes.push(
        <strong key={key} className="font-semibold">
          {renderInlineMarkdown(match[4], `${key}-b`)}
        </strong>
      );
    } else if (match[5] !== undefined) {
      // Strikethrough
      nodes.push(
        <del key={key} className="opacity-70">
          {renderInlineMarkdown(match[5], `${key}-s`)}
        </del>
      );
    } else if (match[7] !== undefined) {
      // Italic
      nodes.push(
        <em key={key} className="italic">
          {match[7]}
        </em>
      );
    }

    lastIndex = matchStart + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false;
  const cells = splitTableRow(trimmed);
  return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
}

export function renderMarkdown(
  content: string,
  options?: MarkdownRenderOptions
): React.ReactNode {
  if (!content) return null;

  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([^\n`]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
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
    const trailing = content.slice(lastIndex);
    const unclosedFenceMatch = trailing.match(/```([^\n`]*)\n?([\s\S]*)$/);
    if (unclosedFenceMatch && unclosedFenceMatch.index !== undefined) {
      if (unclosedFenceMatch.index > 0) {
        parts.push(
          renderTextSegment(trailing.slice(0, unclosedFenceMatch.index), lastIndex)
        );
      }
      const lang = (unclosedFenceMatch[1] || '').trim();
      const code = unclosedFenceMatch[2] || '';
      const currentIdx = blockIndex++;
      parts.push(
        <CodeBlock
          key={`code-open-${lastIndex + unclosedFenceMatch.index}-${currentIdx}`}
          language={lang}
          code={code}
          blockIndex={currentIdx}
          options={options}
        />
      );
    } else {
      parts.push(renderTextSegment(trailing, lastIndex));
    }
  }

  return <div className="space-y-2 min-w-0 max-w-full">{parts}</div>;
}

function renderTextSegment(text: string, baseKey: number): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let isNumbered = false;

  const flushList = () => {
    if (listItems.length === 0) return;
    const ListTag = isNumbered ? 'ol' : 'ul';
    const listKey = `list-${baseKey}-${elements.length}`;
    elements.push(
      <ListTag
        key={listKey}
        className={`my-2 pl-5 space-y-1.5 text-[15px] sm:text-sm leading-[1.65] sm:leading-relaxed break-words ${isNumbered ? 'list-decimal' : 'list-disc'}`}
      >
        {listItems.map((item, idx) => (
          <li key={idx}>{renderInlineMarkdown(item, `${listKey}-li-${idx}`)}</li>
        ))}
      </ListTag>
    );
    listItems = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    // Markdown table detection (header row + separator row)
    if (
      trimmed.includes('|') &&
      idx + 1 < lines.length &&
      isTableSeparatorLine(lines[idx + 1])
    ) {
      flushList();
      const headers = splitTableRow(trimmed);
      const rows: string[][] = [];
      let rowCursor = idx + 2;
      while (rowCursor < lines.length) {
        const nextTrimmed = lines[rowCursor].trim();
        if (!nextTrimmed || !nextTrimmed.includes('|')) break;
        rows.push(splitTableRow(nextTrimmed));
        rowCursor++;
      }
      const tableKey = `table-${baseKey}-${idx}`;
      elements.push(
        <div
          key={tableKey}
          className="my-3 w-full overflow-x-auto rounded-xl border border-[var(--bd)] bg-[var(--surf)]/40"
        >
          <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-[var(--bd)] bg-[var(--surf)]">
                {headers.map((header, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-3.5 py-2.5 font-semibold text-[var(--tx)] whitespace-nowrap"
                  >
                    {renderInlineMarkdown(header, `${tableKey}-h-${hIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b last:border-b-0 border-[var(--bd)]/70"
                >
                  {headers.map((_, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3.5 py-2 text-[var(--tx)] align-top"
                    >
                      {renderInlineMarkdown(row[cIdx] || '', `${tableKey}-r-${rIdx}-c-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      idx = rowCursor - 1;
      continue;
    }

    // Horizontal rule
    if (/^(?:---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushList();
      elements.push(
        <hr key={`${baseKey}-${idx}`} className="my-3 border-t border-[var(--bd)]" />
      );
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`${baseKey}-${idx}`}
          className="font-serif-fraunces text-base font-semibold mt-3 mb-1"
        >
          {renderInlineMarkdown(trimmed.slice(4), `${baseKey}-h4-${idx}`)}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3
          key={`${baseKey}-${idx}`}
          className="font-serif-fraunces text-lg font-semibold mt-4 mb-1.5"
        >
          {renderInlineMarkdown(trimmed.slice(3), `${baseKey}-h3-${idx}`)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2
          key={`${baseKey}-${idx}`}
          className="font-serif-fraunces text-xl font-bold mt-4 mb-2"
        >
          {renderInlineMarkdown(trimmed.slice(2), `${baseKey}-h2-${idx}`)}
        </h2>
      );
      continue;
    }

    // Unordered List
    if (/^[-*•]\s+/.test(trimmed)) {
      if (isNumbered) flushList();
      isNumbered = false;
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    // Numbered List
    if (/^\d+[.)]\s+/.test(trimmed)) {
      if (!isNumbered && listItems.length > 0) flushList();
      isNumbered = true;
      listItems.push(trimmed.replace(/^\d+[.)]\s+/, ''));
      continue;
    }

    // Quote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`${baseKey}-${idx}`}
          className="my-2 pl-3.5 border-l-2 border-[var(--ac)] text-[var(--mut)] italic text-sm"
        >
          {renderInlineMarkdown(trimmed.slice(2), `${baseKey}-bq-${idx}`)}
        </blockquote>
      );
      continue;
    }

    flushList();

    if (!trimmed) {
      continue;
    }

    elements.push(
      <p
        key={`${baseKey}-${idx}`}
        className="text-[15px] sm:text-[14.5px] leading-[1.65] sm:leading-relaxed text-[var(--tx)] break-words"
      >
        {renderInlineMarkdown(line, `${baseKey}-p-${idx}`)}
      </p>
    );
  }

  flushList();
  return elements;
}
