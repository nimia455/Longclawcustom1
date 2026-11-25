import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Square,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import { CHAT_MODELS, ChatModelId, DEFAULT_CHAT_MODEL } from '../lib/models';
import { Language } from '../lib/i18n';
import {
  apiUrl,
  getStaticHostNotice,
  isStaticHostErrorResponse,
  isStaticHostWithoutBackend,
} from '../lib/api';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: number;
  lastUsedAt: number | null;
  requestCount: number;
  revokedAt: number | null;
}

interface ApiPortalProps {
  user: User | null;
  lang: Language;
  mode?: 'page' | 'modal';
  onBack?: () => void;
  onOpenAuth?: (tab: 'in' | 'up') => void;
}

type PortalTab = 'keys' | 'playground' | 'docs';
type SnippetLang = 'curl' | 'js' | 'python';
type ResponseView = 'output' | 'raw';

function resolvePublicApiOrigin(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://longclawtr.ai';
}

function formatShortDate(ts: number | null, lang: Language): string {
  if (!ts) return lang === 'tr' ? 'Henüz kullanılmadı' : 'Never';
  try {
    return new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

export function ApiPortal({
  user,
  lang,
  mode = 'page',
  onBack,
  onOpenAuth,
}: ApiPortalProps) {
  const isTr = lang === 'tr';
  const staticHost = isStaticHostWithoutBackend();
  const baseOrigin = useMemo(() => resolvePublicApiOrigin(), []);
  const v1BaseUrl = `${baseOrigin}/v1`;

  const [activeTab, setActiveTab] = useState<PortalTab>('keys');

  // API Keys state
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [maxActiveKeys, setMaxActiveKeys] = useState(10);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [freshSecretKey, setFreshSecretKey] = useState<{
    name: string;
    secretKey: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Playground state (API key kept strictly in memory, never persisted to localStorage)
  const [pgApiKey, setPgApiKey] = useState('');
  const [showPgKey, setShowPgKey] = useState(false);
  const [pgModel, setPgModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL);
  const [pgStream, setPgStream] = useState(true);
  const [pgSystem, setPgSystem] = useState(
    isTr
      ? 'Net, kısa ve doğrudan yardımcı ol.'
      : 'Be concise, accurate, and directly helpful.'
  );
  const [pgPrompt, setPgPrompt] = useState(
    isTr
      ? 'REST API tasarımında idempotency neden önemlidir? İki cümlede özetle.'
      : 'Why does idempotency matter in REST API design? Summarize in two sentences.'
  );
  const [pgRunning, setPgRunning] = useState(false);
  const [pgStatus, setPgStatus] = useState<number | null>(null);
  const [pgLatencyMs, setPgLatencyMs] = useState<number | null>(null);
  const [pgTokens, setPgTokens] = useState<number | null>(null);
  const [pgOutput, setPgOutput] = useState('');
  const [pgRaw, setPgRaw] = useState('');
  const [pgError, setPgError] = useState<string | null>(null);
  const [pgResponseView, setPgResponseView] = useState<ResponseView>('output');
  const pgAbortRef = useRef<AbortController | null>(null);

  // Docs state
  const [snippetLang, setSnippetLang] = useState<SnippetLang>('curl');

  const copyText = (id: string, value: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr));
    }, 1800);
  };

  const fetchKeys = useCallback(async () => {
    if (!user || staticHost) {
      setKeys([]);
      return;
    }
    setLoadingKeys(true);
    setKeysError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(apiUrl('/api/keys'), {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (isStaticHostErrorResponse(res)) {
        setKeysError(getStaticHostNotice(lang));
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            (isTr ? 'API anahtarları yüklenemedi.' : 'Could not load API keys.')
        );
      }
      setKeys(Array.isArray(data.keys) ? data.keys : []);
      if (typeof data.maxActiveKeys === 'number') {
        setMaxActiveKeys(data.maxActiveKeys);
      }
    } catch (err: any) {
      setKeysError(
        err?.message ||
          (isTr ? 'API anahtarları yüklenemedi.' : 'Could not load API keys.')
      );
    } finally {
      setLoadingKeys(false);
    }
  }, [user, staticHost, lang, isTr]);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  useEffect(() => {
    return () => {
      pgAbortRef.current?.abort();
    };
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || creatingKey || staticHost) return;
    const trimmed = newKeyName.trim();
    if (!trimmed) return;

    setCreatingKey(true);
    setKeysError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(apiUrl('/api/keys'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });
      if (isStaticHostErrorResponse(res)) {
        setKeysError(getStaticHostNotice(lang));
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            (isTr ? 'API anahtarı oluşturulamadı.' : 'Could not create API key.')
        );
      }
      if (data?.key) {
        setKeys((prev) => [data.key, ...prev]);
      }
      if (typeof data?.secretKey === 'string') {
        setFreshSecretKey({ name: trimmed, secretKey: data.secretKey });
      }
      setNewKeyName('');
    } catch (err: any) {
      setKeysError(
        err?.message ||
          (isTr ? 'API anahtarı oluşturulamadı.' : 'Could not create API key.')
      );
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!user || revokingId || staticHost) return;
    setRevokingId(id);
    setKeysError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(apiUrl(`/api/keys/${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.error ||
            (isTr ? 'Anahtar iptal edilemedi.' : 'Could not revoke API key.')
        );
      }
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, revokedAt: data.revokedAt || Date.now() } : k
        )
      );
      setRevokeConfirmId(null);
    } catch (err: any) {
      setKeysError(
        err?.message ||
          (isTr ? 'Anahtar iptal edilemedi.' : 'Could not revoke API key.')
      );
    } finally {
      setRevokingId(null);
    }
  };

  const handleUseInPlayground = (secretKey: string) => {
    setPgApiKey(secretKey);
    setActiveTab('playground');
  };

  const handleStopPlayground = () => {
    pgAbortRef.current?.abort();
    pgAbortRef.current = null;
    setPgRunning(false);
  };

  const handleRunPlayground = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pgRunning || staticHost) return;

    const trimmedKey = pgApiKey.trim();
    const trimmedPrompt = pgPrompt.trim();
    if (!trimmedKey) {
      setPgError(
        isTr
          ? 'Test isteği göndermek için önce bir Longclaw API anahtarı oluşturup buraya yapıştır.'
          : 'Paste a Longclaw API key first (you can generate one in the API Keys tab).'
      );
      return;
    }
    if (!trimmedPrompt) {
      setPgError(isTr ? 'Bir kullanıcı mesajı gir.' : 'Enter a user message.');
      return;
    }

    pgAbortRef.current?.abort();
    const controller = new AbortController();
    pgAbortRef.current = controller;

    setPgRunning(true);
    setPgError(null);
    setPgStatus(null);
    setPgLatencyMs(null);
    setPgTokens(null);
    setPgOutput('');
    setPgRaw('');

    const startedAt = performance.now();
    const messages: Array<{ role: string; content: string }> = [];
    if (pgSystem.trim()) {
      messages.push({ role: 'system', content: pgSystem.trim() });
    }
    messages.push({ role: 'user', content: trimmedPrompt });

    try {
      const res = await fetch(apiUrl('/v1/chat/completions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${trimmedKey}`,
        },
        body: JSON.stringify({
          model: pgModel,
          messages,
          stream: pgStream,
        }),
        signal: controller.signal,
      });

      setPgStatus(res.status);

      if (isStaticHostErrorResponse(res)) {
        setPgError(getStaticHostNotice(lang));
        return;
      }

      if (!res.ok) {
        const errText = await res.text();
        setPgRaw(errText);
        try {
          const parsed = JSON.parse(errText);
          setPgError(parsed?.error?.message || parsed?.error || `HTTP ${res.status}`);
        } catch {
          setPgError(`HTTP ${res.status}`);
        }
        setPgLatencyMs(Math.round(performance.now() - startedAt));
        return;
      }

      if (pgStream && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';
        let rawFrames = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          buffer += chunkStr;
          rawFrames += chunkStr;
          setPgRaw(rawFrames);

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith('data:')) continue;
            const payloadStr = line.slice(5).trim();
            if (!payloadStr || payloadStr === '[DONE]') continue;
            try {
              const evt = JSON.parse(payloadStr);
              if (evt?.error?.message) {
                setPgError(evt.error.message);
                continue;
              }
              const delta = evt?.choices?.[0]?.delta?.content;
              if (typeof delta === 'string' && delta) {
                accumulatedText += delta;
                setPgOutput(accumulatedText);
              }
            } catch {
              // ignore partial frames
            }
          }
        }
        setPgLatencyMs(Math.round(performance.now() - startedAt));
      } else {
        const data = await res.json();
        setPgLatencyMs(Math.round(performance.now() - startedAt));
        setPgRaw(JSON.stringify(data, null, 2));
        const content = data?.choices?.[0]?.message?.content || '';
        setPgOutput(content);
        if (typeof data?.usage?.total_tokens === 'number' && data.usage.total_tokens > 0) {
          setPgTokens(data.usage.total_tokens);
        }
      }

      // Refresh key usage stats in background
      if (user) {
        void fetchKeys();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setPgError(
          err?.message ||
            (isTr ? 'İstek tamamlanamadı.' : 'Request could not be completed.')
        );
      }
    } finally {
      if (pgAbortRef.current === controller) {
        pgAbortRef.current = null;
      }
      setPgRunning(false);
    }
  };

  const activeKeyCount = keys.filter((k) => !k.revokedAt).length;
  const totalRequests = keys.reduce((sum, k) => sum + (k.requestCount || 0), 0);

  const codeSnippets = useMemo(() => {
    const model = pgModel;
    return {
      curl: `curl ${v1BaseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $LONGCLAW_API_KEY" \\
  -d '{
    "model": "${model}",
    "messages": [
      {"role": "system", "content": "You are a concise assistant."},
      {"role": "user", "content": "Explain WebSockets in two sentences."}
    ],
    "stream": false
  }'`,
      js: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LONGCLAW_API_KEY,
  baseURL: "${v1BaseUrl}",
});

const response = await client.chat.completions.create({
  model: "${model}",
  messages: [
    { role: "system", content: "You are a concise assistant." },
    { role: "user", content: "Explain WebSockets in two sentences." },
  ],
});

console.log(response.choices[0].message.content);`,
      python: `import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["LONGCLAW_API_KEY"],
    base_url="${v1BaseUrl}",
)

response = client.chat.completions.create(
    model="${model}",
    messages=[
        {"role": "system", "content": "You are a concise assistant."},
        {"role": "user", "content": "Explain WebSockets in two sentences."},
    ],
)

print(response.choices[0].message.content)`,
    };
  }, [v1BaseUrl, pgModel]);

  const containerClass =
    mode === 'modal'
      ? 'w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] overflow-hidden shadow-2xl'
      : 'max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 text-[var(--tx)]';

  return (
    <div className={containerClass} onClick={(e) => mode === 'modal' && e.stopPropagation()}>
      {/* Header */}
      <div
        className={
          mode === 'modal'
            ? 'px-5 sm:px-7 py-5 border-b border-[var(--bd)] flex items-start justify-between gap-4 shrink-0 bg-[var(--bg)]'
            : 'pb-8 border-b border-[var(--bd)]/75'
        }
      >
        <div className="space-y-2 min-w-0">
          {mode === 'page' && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isTr ? 'Ana sayfaya dön' : 'Back to home'}</span>
            </button>
          )}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1
              className={
                mode === 'modal'
                  ? 'font-serif-fraunces text-xl sm:text-2xl font-semibold tracking-tight text-[var(--tx)]'
                  : 'font-serif-fraunces text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--tx)]'
              }
            >
              Longclaw API
            </h1>
            <span className="text-xs font-mono text-[var(--mut)]">
              OpenAI-compatible · v1
            </span>
          </div>
          <p className="text-sm text-[var(--mut)] max-w-2xl leading-relaxed">
            {isTr
              ? 'OpenAI uyumlu uç noktalarla Longclaw Clawing modellerini uygulamalarına, komut satırına ve araçlarına doğrudan bağla.'
              : 'Connect Longclaw Clawing models directly to your apps, scripts, and SDKs through OpenAI-compatible HTTP endpoints.'}
          </p>

          {/* Live Base URL row */}
          <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            <span className="text-[var(--mut)]">{isTr ? 'Temel adres' : 'Base URL'}</span>
            <code className="font-mono text-[var(--tx)] select-all break-all">
              {v1BaseUrl}
            </code>
            <button
              type="button"
              onClick={() => copyText('base-url', v1BaseUrl)}
              className="inline-flex items-center gap-1 text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer"
            >
              {copiedId === 'base-url' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">{isTr ? 'Kopyalandı' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {mode === 'modal' && onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={isTr ? 'Kapat' : 'Close'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Static host warning if applicable */}
      {staticHost && (
        <div className={mode === 'modal' ? 'px-5 sm:px-7 pt-4' : 'pt-6'}>
          <div className="px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/8 text-xs text-[var(--tx)] leading-relaxed">
            {getStaticHostNotice(lang)}
          </div>
        </div>
      )}

      {/* Primary Section Tabs */}
      <div
        className={
          mode === 'modal'
            ? 'px-5 sm:px-7 border-b border-[var(--bd)] flex items-center gap-6 text-sm shrink-0 overflow-x-auto'
            : 'mt-6 border-b border-[var(--bd)] flex items-center gap-7 text-sm overflow-x-auto'
        }
      >
        {(
          [
            {
              id: 'keys' as PortalTab,
              label: isTr ? 'API Anahtarları' : 'API Keys',
              icon: KeyRound,
            },
            {
              id: 'playground' as PortalTab,
              label: isTr ? 'Canlı Test' : 'Live Playground',
              icon: Terminal,
            },
            {
              id: 'docs' as PortalTab,
              label: isTr ? 'Hızlı Başlangıç & Referans' : 'Quickstart & Reference',
              icon: Code2,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex items-center gap-2 py-3.5 whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'text-[var(--tx)] font-semibold'
                  : 'text-[var(--mut)] hover:text-[var(--tx)] font-medium'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--tx)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable Content Body */}
      <div
        className={
          mode === 'modal'
            ? 'flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-6'
            : 'pt-8 space-y-8'
        }
      >
        {/* ================= TAB 1: API KEYS ================= */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            {!user ? (
              <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <h2 className="font-serif-fraunces text-lg font-semibold text-[var(--tx)]">
                    {isTr
                      ? 'Anahtar oluşturmak için giriş yap'
                      : 'Sign in to generate API keys'}
                  </h2>
                  <p className="text-sm text-[var(--mut)] max-w-xl">
                    {isTr
                      ? 'Hesabına bağlı gizli anahtarlar (lc_live_...) yalnızca bir kez gösterilir ve sunucuda SHA-256 özeti olarak saklanır.'
                      : 'Secret keys (lc_live_...) are tied to your account, shown once at creation, and stored server-side as SHA-256 hashes.'}
                  </p>
                </div>
                {onOpenAuth && (
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenAuth('in')}
                      className="px-4 py-2 rounded-full border border-[var(--bd)] text-xs font-medium text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer"
                    >
                      {isTr ? 'Giriş yap' : 'Sign in'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('up')}
                      className="px-4 py-2 rounded-full bg-[var(--ac)] text-[var(--on)] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      {isTr ? 'Ücretsiz hesap aç' : 'Create account'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Compact Account Usage Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--bd)]/75 text-xs">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[var(--mut)]">
                    <span>
                      {isTr ? 'Aktif anahtar' : 'Active keys'}:{' '}
                      <strong className="text-[var(--tx)] font-semibold tabular-nums">
                        {activeKeyCount} / {maxActiveKeys}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {isTr ? 'Toplam istek' : 'Total requests'}:{' '}
                      <strong className="text-[var(--tx)] font-semibold tabular-nums">
                        {totalRequests.toLocaleString()}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {isTr ? 'Limit' : 'Rate limit'}:{' '}
                      <strong className="text-[var(--tx)] font-semibold tabular-nums">
                        30 req / min
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void fetchKeys()}
                    disabled={loadingKeys}
                    className="inline-flex items-center gap-1.5 text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingKeys ? 'animate-spin' : ''}`} />
                    <span>{isTr ? 'Yenile' : 'Refresh'}</span>
                  </button>
                </div>

                {/* Create New Key Form */}
                <form
                  onSubmit={handleCreateKey}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    maxLength={60}
                    disabled={creatingKey || staticHost}
                    placeholder={
                      isTr
                        ? 'Anahtar adı (örn. Üretim sunucusu, Yerel betik)'
                        : 'Key name (e.g., Production backend, Local script)'
                    }
                    className="flex-1 h-10 px-3.5 rounded-xl border border-[var(--bd)] bg-[var(--card)] text-sm text-[var(--tx)] placeholder:text-[var(--mut)] focus:outline-none focus:border-[var(--tx)]/45"
                  />
                  <button
                    type="submit"
                    disabled={creatingKey || !newKeyName.trim() || staticHost}
                    className="h-10 px-4 rounded-xl bg-[var(--ac)] text-[var(--on)] text-xs font-medium inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-45 cursor-pointer shrink-0"
                  >
                    {creatingKey ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{isTr ? 'Yeni gizli anahtar oluştur' : 'Create secret key'}</span>
                  </button>
                </form>

                {/* One-time Secret Key Reveal */}
                {freshSecretKey && (
                  <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.06] p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-[var(--tx)]">
                          {isTr
                            ? `"${freshSecretKey.name}" oluşturuldu — şimdi kopyala`
                            : `"${freshSecretKey.name}" created — copy it now`}
                        </p>
                        <p className="text-xs text-[var(--mut)]">
                          {isTr
                            ? 'Güvenlik nedeniyle bu gizli anahtar bir daha tam olarak gösterilmeyecektir.'
                            : 'For security, this secret key will not be shown in full again.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFreshSecretKey(null)}
                        aria-label={isTr ? 'Kapat' : 'Dismiss'}
                        className="text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <code className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--bd)] font-mono text-xs text-[var(--tx)] break-all select-all">
                        {freshSecretKey.secretKey}
                      </code>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyText('fresh-key', freshSecretKey.secretKey)}
                          className="h-9 px-3.5 rounded-xl border border-[var(--bd)] bg-[var(--card)] hover:bg-[var(--surf)] text-xs font-medium text-[var(--tx)] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedId === 'fresh-key' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{isTr ? 'Kopyalandı' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUseInPlayground(freshSecretKey.secretKey)}
                          className="h-9 px-3.5 rounded-xl bg-[var(--ac)] text-[var(--on)] text-xs font-medium inline-flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Testte kullan' : 'Use in Playground'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {keysError && (
                  <p className="text-xs text-red-500" role="alert">
                    {keysError}
                  </p>
                )}

                {/* Keys Table */}
                <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] overflow-hidden">
                  {loadingKeys && keys.length === 0 ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-xs text-[var(--mut)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isTr ? 'Anahtarlar yükleniyor…' : 'Loading keys…'}</span>
                    </div>
                  ) : keys.length === 0 ? (
                    <div className="p-8 text-center space-y-1">
                      <p className="text-sm font-medium text-[var(--tx)]">
                        {isTr ? 'Henüz API anahtarın yok' : 'No API keys yet'}
                      </p>
                      <p className="text-xs text-[var(--mut)]">
                        {isTr
                          ? 'Yukarıdan bir isim girerek ilk gizli anahtarını oluştur ve hemen /v1/chat/completions isteği gönder.'
                          : 'Create your first secret key above to start calling /v1/chat/completions.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[var(--bd)] text-[var(--mut)] font-medium">
                            <th className="py-3 px-4">{isTr ? 'Ad' : 'Name'}</th>
                            <th className="py-3 px-4">{isTr ? 'Anahtar' : 'Secret Key'}</th>
                            <th className="py-3 px-4">{isTr ? 'Oluşturuldu' : 'Created'}</th>
                            <th className="py-3 px-4">{isTr ? 'Son kullanım' : 'Last used'}</th>
                            <th className="py-3 px-4 text-right">{isTr ? 'İstek' : 'Requests'}</th>
                            <th className="py-3 px-4 text-right">{isTr ? 'İşlem' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--bd)]/70">
                          {keys.map((item) => {
                            const isRevoked = Boolean(item.revokedAt);
                            const confirming = revokeConfirmId === item.id;
                            return (
                              <tr
                                key={item.id}
                                className={isRevoked ? 'opacity-55' : 'hover:bg-[var(--surf)]/50'}
                              >
                                <td className="py-3 px-4 font-medium text-[var(--tx)] whitespace-nowrap">
                                  {item.name}
                                </td>
                                <td className="py-3 px-4 font-mono text-[var(--mut)] whitespace-nowrap">
                                  {item.keyPrefix}
                                </td>
                                <td className="py-3 px-4 text-[var(--mut)] whitespace-nowrap tabular-nums">
                                  {formatShortDate(item.createdAt, lang)}
                                </td>
                                <td className="py-3 px-4 text-[var(--mut)] whitespace-nowrap tabular-nums">
                                  {formatShortDate(item.lastUsedAt, lang)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono text-[var(--tx)] tabular-nums">
                                  {(item.requestCount || 0).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  {isRevoked ? (
                                    <span className="text-[var(--mut)]">
                                      {isTr ? 'İptal edildi' : 'Revoked'}
                                    </span>
                                  ) : confirming ? (
                                    <span className="inline-flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={revokingId === item.id}
                                        onClick={() => void handleRevokeKey(item.id)}
                                        className="text-red-500 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                                      >
                                        {revokingId === item.id
                                          ? isTr
                                            ? 'İptal ediliyor…'
                                            : 'Revoking…'
                                          : isTr
                                            ? 'Onayla'
                                            : 'Confirm'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRevokeConfirmId(null)}
                                        className="text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer"
                                      >
                                        {isTr ? 'Vazgeç' : 'Cancel'}
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setRevokeConfirmId(item.id)}
                                      className="inline-flex items-center gap-1 text-[var(--mut)] hover:text-red-500 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>{isTr ? 'İptal et' : 'Revoke'}</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 2: LIVE PLAYGROUND ================= */}
        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Request Builder */}
            <form onSubmit={handleRunPlayground} className="lg:col-span-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--mut)]">
                  {isTr ? 'Longclaw API Anahtarı' : 'Longclaw API Key'}
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPgKey ? 'text' : 'password'}
                    value={pgApiKey}
                    onChange={(e) => setPgApiKey(e.target.value)}
                    placeholder="lc_live_..."
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-[var(--bd)] bg-[var(--card)] font-mono text-xs text-[var(--tx)] placeholder:text-[var(--mut)] focus:outline-none focus:border-[var(--tx)]/45"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPgKey((v) => !v)}
                    aria-label={showPgKey ? 'Hide key' : 'Show key'}
                    className="absolute right-2.5 p-1 text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer"
                  >
                    {showPgKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--mut)]">
                    {isTr ? 'Model' : 'Model'}
                  </label>
                  <select
                    value={pgModel}
                    onChange={(e) => setPgModel(e.target.value as ChatModelId)}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--bd)] bg-[var(--card)] text-xs font-mono text-[var(--tx)] focus:outline-none focus:border-[var(--tx)]/45"
                  >
                    {CHAT_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--mut)]">
                    {isTr ? 'Yanıt modu' : 'Response mode'}
                  </label>
                  <div className="h-10 p-1 rounded-xl border border-[var(--bd)] bg-[var(--card)] grid grid-cols-2 gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPgStream(true)}
                      className={`rounded-lg font-medium transition-colors cursor-pointer ${
                        pgStream
                          ? 'bg-[var(--tx)] text-[var(--bg)]'
                          : 'text-[var(--mut)] hover:text-[var(--tx)]'
                      }`}
                    >
                      Stream (SSE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPgStream(false)}
                      className={`rounded-lg font-medium transition-colors cursor-pointer ${
                        !pgStream
                          ? 'bg-[var(--tx)] text-[var(--bg)]'
                          : 'text-[var(--mut)] hover:text-[var(--tx)]'
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--mut)]">
                  {isTr ? 'Sistem yönergesi (isteğe bağlı)' : 'System prompt (optional)'}
                </label>
                <input
                  type="text"
                  value={pgSystem}
                  onChange={(e) => setPgSystem(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-[var(--bd)] bg-[var(--card)] text-xs text-[var(--tx)] placeholder:text-[var(--mut)] focus:outline-none focus:border-[var(--tx)]/45"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--mut)]">
                  {isTr ? 'Kullanıcı mesajı' : 'User message'}
                </label>
                <textarea
                  rows={4}
                  value={pgPrompt}
                  onChange={(e) => setPgPrompt(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-[var(--bd)] bg-[var(--card)] text-sm text-[var(--tx)] placeholder:text-[var(--mut)] focus:outline-none focus:border-[var(--tx)]/45 resize-y"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <code className="text-[11px] font-mono text-[var(--mut)]">
                  POST /v1/chat/completions
                </code>
                {pgRunning ? (
                  <button
                    type="button"
                    onClick={handleStopPlayground}
                    className="h-10 px-4 rounded-xl border border-[var(--bd)] bg-[var(--card)] text-xs font-medium text-[var(--tx)] inline-flex items-center gap-1.5 hover:bg-[var(--surf)] cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{isTr ? 'Durdur' : 'Stop'}</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={staticHost}
                    className="h-10 px-4 rounded-xl bg-[var(--ac)] text-[var(--on)] text-xs font-medium inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity disabled:opacity-45 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isTr ? 'İsteği gönder' : 'Send request'}</span>
                  </button>
                )}
              </div>
            </form>

            {/* Live Response Inspector */}
            <div className="lg:col-span-6 rounded-2xl border border-[var(--bd)] bg-[var(--card)] flex flex-col min-h-[340px] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--bd)] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setPgResponseView('output')}
                    className={`cursor-pointer transition-colors ${
                      pgResponseView === 'output'
                        ? 'text-[var(--tx)] font-semibold'
                        : 'text-[var(--mut)] hover:text-[var(--tx)]'
                    }`}
                  >
                    {isTr ? 'Yanıt' : 'Output'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPgResponseView('raw')}
                    className={`cursor-pointer transition-colors ${
                      pgResponseView === 'raw'
                        ? 'text-[var(--tx)] font-semibold'
                        : 'text-[var(--mut)] hover:text-[var(--tx)]'
                    }`}
                  >
                    {pgStream ? 'Raw SSE' : 'Raw JSON'}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] font-mono tabular-nums text-[var(--mut)]">
                  {pgStatus !== null && (
                    <span
                      className={
                        pgStatus >= 200 && pgStatus < 300
                          ? 'text-emerald-500 font-semibold'
                          : 'text-red-500 font-semibold'
                      }
                    >
                      HTTP {pgStatus}
                    </span>
                  )}
                  {pgLatencyMs !== null && <span>· {pgLatencyMs} ms</span>}
                  {pgTokens !== null && <span>· {pgTokens} tok</span>}
                  {(pgOutput || pgRaw) && (
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          'pg-res',
                          pgResponseView === 'raw' ? pgRaw : pgOutput
                        )
                      }
                      className="text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer ml-1"
                      aria-label={isTr ? 'Yanıtı kopyala' : 'Copy response'}
                    >
                      {copiedId === 'pg-res' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                {pgError && (
                  <p className="text-xs text-red-500 mb-3 leading-relaxed" role="alert">
                    {pgError}
                  </p>
                )}

                {pgRunning && !pgOutput && !pgRaw ? (
                  <div className="h-full flex items-center justify-center gap-2 text-xs text-[var(--mut)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isTr ? 'Yanıt bekleniyor…' : 'Waiting for response…'}</span>
                  </div>
                ) : pgResponseView === 'output' ? (
                  pgOutput ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--tx)]">
                      {pgOutput}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--mut)]">
                      {isTr
                        ? 'Canlı yanıtı ve gerçek gecikme süresini görmek için bir istek gönder.'
                        : 'Send a request to inspect the live response and measured latency.'}
                    </p>
                  )
                ) : pgRaw ? (
                  <pre className="text-[11px] leading-relaxed font-mono text-[var(--tx)] whitespace-pre-wrap break-words">
                    {pgRaw}
                  </pre>
                ) : (
                  <p className="text-xs text-[var(--mut)]">
                    {isTr
                      ? 'Ham JSON veya SSE akışı burada görünür.'
                      : 'Raw JSON or SSE frames will appear here.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUICKSTART & REFERENCE ================= */}
        {activeTab === 'docs' && (
          <div className="space-y-8">
            {/* Code Snippet Block */}
            <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--bd)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-5 text-xs">
                  {(
                    [
                      { id: 'curl' as SnippetLang, label: 'cURL' },
                      { id: 'js' as SnippetLang, label: 'JavaScript (OpenAI SDK)' },
                      { id: 'python' as SnippetLang, label: 'Python (OpenAI SDK)' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSnippetLang(item.id)}
                      className={`cursor-pointer transition-colors ${
                        snippetLang === item.id
                          ? 'text-[var(--tx)] font-semibold'
                          : 'text-[var(--mut)] hover:text-[var(--tx)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={pgModel}
                    onChange={(e) => setPgModel(e.target.value as ChatModelId)}
                    aria-label="Model"
                    className="h-7 px-2 rounded-lg border border-[var(--bd)] bg-[var(--bg)] font-mono text-[11px] text-[var(--tx)]"
                  >
                    {CHAT_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => copyText(`snippet-${snippetLang}`, codeSnippets[snippetLang])}
                    className="inline-flex items-center gap-1 text-xs text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer"
                  >
                    {copiedId === `snippet-${snippetLang}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">{isTr ? 'Kopyalandı' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isTr ? 'Kopyala' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="p-4 sm:p-5 overflow-x-auto text-xs font-mono leading-relaxed text-[var(--tx)] bg-[var(--bg)]/55">
                <code>{codeSnippets[snippetLang]}</code>
              </pre>
            </div>

            {/* Endpoints Table */}
            <div className="space-y-3">
              <h2 className="font-serif-fraunces text-lg font-semibold text-[var(--tx)]">
                {isTr ? 'Uç noktalar' : 'Endpoints'}
              </h2>
              <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] divide-y divide-[var(--bd)]/75 text-xs">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-semibold text-emerald-500">GET</span>
                    <span className="text-[var(--tx)]">/v1/models</span>
                  </div>
                  <p className="text-[var(--mut)]">
                    {isTr
                      ? 'Kullanılabilir tüm Longclaw Clawing modellerini OpenAI biçiminde listeler.'
                      : 'Lists all available Longclaw Clawing models in OpenAI list format.'}
                  </p>
                </div>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-semibold text-sky-500">POST</span>
                    <span className="text-[var(--tx)]">/v1/chat/completions</span>
                  </div>
                  <p className="text-[var(--mut)]">
                    {isTr
                      ? 'Bearer anahtarıyla doğrulanan sohbet tamamlamaları (JSON ve SSE akışı desteklenir).'
                      : 'Bearer-authenticated chat completions supporting JSON and SSE streaming.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Request Parameters */}
            <div className="space-y-3">
              <h2 className="font-serif-fraunces text-lg font-semibold text-[var(--tx)]">
                {isTr ? 'İstek parametreleri' : 'Request parameters'}
              </h2>
              <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] divide-y divide-[var(--bd)]/75 text-xs">
                {[
                  {
                    name: 'model',
                    type: 'string',
                    desc: isTr
                      ? 'Varsayılan: longclaw-clawing-1.2-pro. Desteklenen herhangi bir Longclaw model kimliği.'
                      : 'Defaults to longclaw-clawing-1.2-pro. Any supported Longclaw model ID.',
                  },
                  {
                    name: 'messages',
                    type: 'array (required)',
                    desc: isTr
                      ? '{ role: "system" | "user" | "assistant", content: string } nesnelerinden oluşan dizi.'
                      : 'Array of { role: "system" | "user" | "assistant", content: string } objects.',
                  },
                  {
                    name: 'stream',
                    type: 'boolean',
                    desc: isTr
                      ? 'true yapıldığında yanıtı text/event-stream (SSE) parçaları halinde akıtır.'
                      : 'When true, streams incremental chat.completion.chunk events over text/event-stream.',
                  },
                  {
                    name: 'temperature',
                    type: 'number (0–2)',
                    desc: isTr
                      ? 'İsteğe bağlı örnekleme sıcaklığı.'
                      : 'Optional sampling temperature.',
                  },
                  {
                    name: 'max_tokens',
                    type: 'integer (1–8192)',
                    desc: isTr
                      ? 'Üretilecek maksimum çıktı token sayısı (max_completion_tokens da desteklenir).'
                      : 'Maximum output tokens to generate (max_completion_tokens is also accepted).',
                  },
                ].map((param) => (
                  <div
                    key={param.name}
                    className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-4"
                  >
                    <div className="sm:col-span-3 font-mono font-semibold text-[var(--tx)]">
                      {param.name}
                    </div>
                    <div className="sm:col-span-3 font-mono text-[var(--mut)]">{param.type}</div>
                    <div className="sm:col-span-6 text-[var(--mut)] leading-relaxed">
                      {param.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
