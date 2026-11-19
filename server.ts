import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Multi-key unpaid Gemini client pool (supports up to 3 fallback keys: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3)
const clientPool = new Map<string, GoogleGenAI>();
const keyModelCooldownUntil = new Map<string, number>();
let preferredKeyIndex = 0;

function cooldownKey(apiKey: string, model: string): string {
  return `${apiKey}::${model}`;
}

function isPlaceholderKey(val: string): boolean {
  const trimmed = val.trim();
  return !trimmed || trimmed.startsWith('MY_GEMINI_API_KEY');
}

function getConfiguredApiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : []),
  ];

  const seen = new Set<string>();
  const keys: string[] = [];
  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (isPlaceholderKey(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    keys.push(trimmed);
  }
  return keys;
}

function getOrderedApiKeys(model: string): { healthy: string[]; all: string[] } {
  const keys = getConfiguredApiKeys();
  if (keys.length === 0) return { healthy: [], all: [] };

  const now = Date.now();
  const rotated: string[] = [];
  for (let offset = 0; offset < keys.length; offset++) {
    rotated.push(keys[(preferredKeyIndex + offset) % keys.length]);
  }

  const healthy = rotated.filter(
    (k) => (keyModelCooldownUntil.get(cooldownKey(k, model)) || 0) <= now
  );
  const coolingDown = rotated.filter(
    (k) => (keyModelCooldownUntil.get(cooldownKey(k, model)) || 0) > now
  );
  return { healthy, all: [...healthy, ...coolingDown] };
}

function getGeminiClient(apiKey: string): GoogleGenAI {
  let client = clientPool.get(apiKey);
  if (!client) {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    clientPool.set(apiKey, client);
  }
  return client;
}

function markKeySuccess(apiKey: string, model: string) {
  keyModelCooldownUntil.delete(cooldownKey(apiKey, model));
  const keys = getConfiguredApiKeys();
  const idx = keys.indexOf(apiKey);
  if (idx >= 0) {
    preferredKeyIndex = idx;
  }
}

function markKeyFailure(apiKey: string, model: string, err: any) {
  const status = Number(err?.status || err?.code) || 500;
  const rawMsg = String(err?.message || '').toUpperCase();
  const isQuotaOrAuth =
    status === 429 ||
    status === 401 ||
    status === 403 ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('QUOTA') ||
    rawMsg.includes('API_KEY_INVALID');
  const cooldownMs = isQuotaOrAuth ? 300_000 : status === 503 || status === 504 ? 20_000 : 15_000;
  keyModelCooldownUntil.set(cooldownKey(apiKey, model), Date.now() + cooldownMs);
}

// Supported Longclaw model aliases -> underlying Gemini models
const DEFAULT_PUBLIC_MODEL = 'longclaw-clawing-1.1-pro';
const DEFAULT_BACKEND_MODEL = 'gemini-4-hydrogen';

const PUBLIC_TO_BACKEND_MODEL: Record<string, string> = {
  'longclaw-clawing-1.2-ultra': 'gemini-4-hydrogen',
  'longclaw-clawing-1.1-ultra': 'gemini-4-hydrogen',
  'longclaw-clawing-1.1-pro': 'gemini-4-hydrogen',
  'longclaw-clawing-1-pro': 'gemini-4-hydrogen',
  'longclaw-clawing-1.1': 'gemini-4-hydrogen',
  'longclaw-clawing-1.1-low': 'gemini-3.1-flash-lite',
};

function resolvePublicModel(requestedModel: unknown): string {
  if (requestedModel === 'longclaw-clawing-1-low') {
    return 'longclaw-clawing-1.1-low';
  }
  if (requestedModel === 'longclaw-clawing-1') {
    return 'longclaw-clawing-1.1';
  }
  if (typeof requestedModel === 'string' && requestedModel in PUBLIC_TO_BACKEND_MODEL) {
    return requestedModel;
  }
  return DEFAULT_PUBLIC_MODEL;
}

const TRIVIAL_CHAT_PATTERN =
  /^(merhaba+|selam+|günaydın|iyi\s*(akşamlar|geceler|günler)|nasılsın\??|naber\??|ne\s*haber\??|teşekkür(ler| ederim)?|sağ\s*ol|eyvallah|tamam|ok(ay)?|peki|evet|hayır|görüşürüz|hoşça\s*kal|hi+|hello+|hey+|good\s*(morning|afternoon|evening|night)|how\s*are\s*you\??|thanks?(\s*you)?|bye|goodbye|yes|no|sure|hangi\s*modelsin\??|what\s*model\s*are\s*you\??|sen\s*kimsin\??|who\s*are\s*you\??)[!.\s?]*$/i;

const COMPLEX_PROMPT_PATTERN =
  /```|kod|code|script|algoritma|mimari|architecture|refactor|debug|hata\s*ayıkla|stack\s*trace|traceback|exception|analiz|analyze|karşılaştır|compare|kanıt|proof|prove|türev|integral|denklem|equation|matrix|matris|sql|regex|docker|kubernetes|terraform|typescript|javascript|python|react|nextjs|html|css|svg|api|adım\s*adım|step\s*by\s*step|detaylı|kapsamlı|araştır|makale|essay|özetle|summarize|çevir|translate|plan|strateji|neden|niçin|nasıl|açıkla|anlat|mantık|çöz|hesapla|fark|tasarla|oluştur|yaz|why|how|explain|solve|calculate|reason|difference|design|write|build|mmlu|fizik|kimya|biyoloji|matematik|tarih|felsefe|ekonomi|hukuk|physics|chemistry|biology|math|function|component/i;

function isBasicQuestion(
  messages: Array<{ role?: string; content?: string }>,
  depth: string
): boolean {
  const lastUser = [...messages].reverse().find((m) => m.role !== 'assistant');
  const text = (lastUser?.content || '').trim();
  if (!text) return true;

  // Greetings and direct identity questions always answer fast
  if (TRIVIAL_CHAT_PATTERN.test(text)) {
    return true;
  }

  if (depth === 'deep') {
    return false;
  }

  if (depth === 'fast') {
    return true;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Short casual statements/queries without reasoning/coding/math cues stay fast
  if (
    text.length <= 100 &&
    wordCount <= 16 &&
    !text.includes('\n') &&
    !COMPLEX_PROMPT_PATTERN.test(text)
  ) {
    return true;
  }

  return false;
}

function resolveBackendModel(publicModel: string, depth?: string, basicQuestion = false): string {
  if (depth === 'fast' || basicQuestion) {
    return 'gemini-3.1-flash-lite';
  }
  return PUBLIC_TO_BACKEND_MODEL[publicModel] || DEFAULT_BACKEND_MODEL;
}

const PUBLIC_MODEL_DISPLAY_NAMES: Record<string, string> = {
  'longclaw-clawing-1.2-ultra': 'Longclaw Clawing 1.2 Ultra',
  'longclaw-clawing-1.1-ultra': 'Longclaw Clawing 1.1 Ultra',
  'longclaw-clawing-1.1-pro': 'Longclaw Clawing 1.1 Pro',
  'longclaw-clawing-1-pro': 'Longclaw Clawing 1 Pro',
  'longclaw-clawing-1.1-low': 'Longclaw Clawing 1.1 Low',
  'longclaw-clawing-1.1': 'Longclaw Clawing 1.1',
};

function buildSystemIdentity(publicModel: string): string {
  const modelDisplayName =
    PUBLIC_MODEL_DISPLAY_NAMES[publicModel] || 'Longclaw Clawing 1.1 Pro';
  return `Sen Longclaw adlı yapay zekâ asistanısın. Normal yanıtlarda asla adını, kendini veya hangi model olduğunu durduk yere söyleme — kullanıcı sormadıkça kendini tanıtma ve doğrudan soruya odaklan. Yalnızca kullanıcı açıkça kim olduğunu veya hangi model olduğunu sorarsa ("hangi modelsin?", "what model are you?", "sen kimsin?" gibi), o zaman ${modelDisplayName} (Longclaw Clawing ailesi) olduğunu belirt; dahili API veya altyapı sağlayıcı ayrıntılarını paylaşma. Kullanıcının yazdığı dilde, kısa, net ve samimi yanıt ver.`;
}

const DEPTH_INSTRUCTIONS: Record<string, string> = {
  fast: 'Hızlı mod: Yanıtı kısa, net ve doğrudan tut; gereksiz giriş yapma.',
  mid: 'Orta mod: Net, akıcı ve doğrudan yanıt ver; gereksiz uzatmalardan kaçın.',
  deep: 'Derin mod: Konuyu adım adım, düzenli ve somut örneklerle kapsamlı işle.',
};

const MODE_INSTRUCTIONS: Record<string, string> = {
  chat: 'Sıcak, net ve yardımsever bir asistan olarak sohbet et.',
  sum: 'Kullanıcı bir metin yapıştırırsa kısa ve düzenli özetle; çeviri istenirse istenen dile doğal biçimde çevir.',
  write: 'E-posta, mesaj ve metin taslakları yaz; istenen tona (resmi, samimi, kısa) uy.',
};

function getThinkingConfig(
  publicModel: string,
  backendModel: string,
  depth: string,
  basicQuestion = false
): { level: ThinkingLevel; includeThoughts: boolean } {
  if (basicQuestion || depth === 'fast') {
    return {
      level: backendModel === 'gemini-3.1-flash-lite' ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
      includeThoughts: false,
    };
  }

  let config: { level: ThinkingLevel; includeThoughts: boolean };

  if (backendModel === 'gemini-3.1-flash-lite' || publicModel === 'longclaw-clawing-1.1-low') {
    config = {
      level: ThinkingLevel.LOW,
      includeThoughts: true,
    };
  } else if (
    publicModel === 'longclaw-clawing-1.2-ultra' ||
    publicModel === 'longclaw-clawing-1.1-ultra' ||
    publicModel === 'longclaw-clawing-1.1-pro' ||
    publicModel === 'longclaw-clawing-1-pro'
  ) {
    config =
      depth === 'deep'
        ? { level: ThinkingLevel.MEDIUM, includeThoughts: true }
        : { level: ThinkingLevel.LOW, includeThoughts: true };
  } else {
    config = { level: ThinkingLevel.LOW, includeThoughts: true };
  }

  // gemini-4-hydrogen does not support ThinkingLevel.MINIMAL (returns HTTP 400)
  if (backendModel !== 'gemini-3.1-flash-lite' && config.level === ThinkingLevel.MINIMAL) {
    return { ...config, level: ThinkingLevel.LOW };
  }

  return config;
}

function formatGeminiError(err: any, lang: 'en' | 'tr' = 'tr'): { status: number; message: string } {
  const isEn = lang === 'en';
  const rawMsg =
    err?.message || String(err || (isEn ? 'An unknown error occurred.' : 'Bilinmeyen bir hata oluştu.'));
  const status = Number(err?.status || err?.code) || 500;
  const upper = rawMsg.toUpperCase();

  if (status === 429 || upper.includes('RESOURCE_EXHAUSTED') || upper.includes('QUOTA')) {
    return {
      status: 429,
      message: isEn
        ? 'API quota or rate limit reached (429 RESOURCE_EXHAUSTED). Please wait a few seconds and try again or check your API key quota in Settings > Secrets.'
        : 'API kullanım kotasına veya hız sınırına ulaşıldı (429 RESOURCE_EXHAUSTED). Lütfen birkaç saniye bekleyip tekrar deneyin veya Settings > Secrets panelinden API anahtarınızın kotasını kontrol edin.',
    };
  }

  if (status === 503 || upper.includes('UNAVAILABLE') || upper.includes('OVERLOADED')) {
    return {
      status: 503,
      message: isEn
        ? 'The AI service is currently busy (503). Please try again in a few seconds.'
        : 'Yapay zekâ servisi şu anda yoğun (503). Lütfen birkaç saniye sonra tekrar deneyin.',
    };
  }

  if (
    status === 401 ||
    status === 403 ||
    upper.includes('API_KEY_INVALID') ||
    upper.includes('PERMISSION_DENIED') ||
    (status === 400 && (upper.includes('API KEY') || upper.includes('API_KEY')))
  ) {
    return {
      status: status === 400 ? 400 : 403,
      message: isEn
        ? 'Gemini API key is invalid or unauthorized. Please check GEMINI_API_KEY in Settings > Secrets.'
        : 'Gemini API anahtarı geçersiz veya yetkisiz. Lütfen Settings > Secrets panelinden GEMINI_API_KEY ayarınızı kontrol edin.',
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: rawMsg,
  };
}

const FALLBACK_UNPAID_MODEL = 'gemini-3.1-flash-lite';

function buildFallbackParams(params: any, depth?: string, basicQuestion = false) {
  const showThoughts = !basicQuestion && depth !== 'fast';
  return {
    ...params,
    model: FALLBACK_UNPAID_MODEL,
    config: {
      ...(params?.config || {}),
      thinkingConfig: {
        thinkingLevel: showThoughts ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL,
        includeThoughts: showThoughts,
      },
    },
  };
}

function isRetryableUpstreamError(err: any): boolean {
  const status = Number(err?.status || err?.code) || 500;
  const upper = String(err?.message || '').toUpperCase();
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    upper.includes('UNAVAILABLE') ||
    upper.includes('RESOURCE_EXHAUSTED') ||
    upper.includes('OVERLOADED')
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  // Prevent unhandled rejection if the underlying promise rejects after timeout
  promise.catch(() => {});
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err: any = new Error(`${label} zaman aşımına uğradı`);
      err.status = 504;
      reject(err);
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function generateStreamWithFailover(
  params: any,
  depth?: string,
  basicQuestion = false
) {
  const configuredKeys = getConfiguredApiKeys();
  if (configuredKeys.length === 0) {
    throw new Error('GEMINI_API_KEY yapılandırılmamış.');
  }

  const attempts =
    params?.model && params.model !== FALLBACK_UNPAID_MODEL
      ? [params, buildFallbackParams(params, depth, basicQuestion)]
      : [params];

  let lastError: any = null;

  for (let pass = 0; pass < attempts.length; pass++) {
    const attemptParams = attempts[pass];
    const hasNextModelPass = pass < attempts.length - 1;
    const { healthy, all } = getOrderedApiKeys(attemptParams.model);

    // If all keys are already cooling down for the primary model and a fast fallback model exists, skip straight to fallback
    if (hasNextModelPass && healthy.length === 0) {
      continue;
    }

    const passKeys = hasNextModelPass ? healthy : all;

    for (let i = 0; i < passKeys.length; i++) {
      const apiKey = passKeys[i];
      const client = getGeminiClient(apiKey);
      const hasFallbackRemaining = hasNextModelPass || i < passKeys.length - 1;
      const firstChunkTimeoutMs = hasNextModelPass
        ? 6_500
        : hasFallbackRemaining
          ? 9_000
          : 25_000;

      try {
        const startAndFirstChunk = (async () => {
          const stream = await client.models.generateContentStream(attemptParams);
          const iterator = stream[Symbol.asyncIterator]();
          const firstResult = await iterator.next();
          return { iterator, firstResult };
        })();

        const result = await withTimeout(
          startAndFirstChunk,
          firstChunkTimeoutMs,
          `Stream (${attemptParams.model})`
        );
        markKeySuccess(apiKey, attemptParams.model);
        return result;
      } catch (err: any) {
        lastError = err;
        markKeyFailure(apiKey, attemptParams.model, err);
        console.log(
          `[Longclaw] Key slot #${i + 1} (${attemptParams.model}) returned ${err?.status || err?.code || 'ERR'}, trying next fallback...`
        );
        // If the primary model timed out (504), switch immediately to the fallback model instead of stalling on every key
        if (hasNextModelPass && Number(err?.status) === 504) {
          break;
        }
      }
    }

    if (lastError && !isRetryableUpstreamError(lastError)) {
      break;
    }
  }

  throw lastError || new Error('Tüm Gemini API anahtarları başarısız oldu.');
}

async function generateContentWithFailover(params: any) {
  const configuredKeys = getConfiguredApiKeys();
  if (configuredKeys.length === 0) {
    throw new Error('GEMINI_API_KEY yapılandırılmamış.');
  }

  const attempts =
    params?.model && params.model !== FALLBACK_UNPAID_MODEL
      ? [params, buildFallbackParams(params)]
      : [params];

  let lastError: any = null;

  for (let pass = 0; pass < attempts.length; pass++) {
    const attemptParams = attempts[pass];
    const hasNextModelPass = pass < attempts.length - 1;
    const { healthy, all } = getOrderedApiKeys(attemptParams.model);

    if (hasNextModelPass && healthy.length === 0) {
      continue;
    }

    const passKeys = hasNextModelPass ? healthy : all;

    for (let i = 0; i < passKeys.length; i++) {
      const apiKey = passKeys[i];
      const client = getGeminiClient(apiKey);

      try {
        const response = await withTimeout(
          client.models.generateContent(attemptParams),
          8_000,
          `Generate (${attemptParams.model})`
        );
        markKeySuccess(apiKey, attemptParams.model);
        return response;
      } catch (err: any) {
        lastError = err;
        markKeyFailure(apiKey, attemptParams.model, err);
        console.log(
          `[Longclaw] Key slot #${i + 1} failed on name-chat (${err?.status || err?.code || 'ERR'}), trying next fallback...`
        );
      }
    }

    if (lastError && !isRetryableUpstreamError(lastError)) {
      break;
    }
  }

  throw lastError || new Error('Tüm Gemini API anahtarları başarısız oldu.');
}

// Healthcheck and status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const keys = getConfiguredApiKeys();
  res.json({
    status: 'ok',
    geminiConfigured: keys.length > 0,
    configuredKeyCount: keys.length,
    model: DEFAULT_PUBLIC_MODEL,
    models: Object.keys(PUBLIC_TO_BACKEND_MODEL),
    appName: 'Longclaw',
  });
});

// Stream Gemini Chat completion
app.post('/api/chat', async (req: Request, res: Response) => {
  const uiLang: 'en' | 'tr' = req.body?.lang === 'en' ? 'en' : 'tr';
  try {
    const { messages = [], depth = 'mid', mode = 'chat', model } = req.body;
    const basicQuestion = isBasicQuestion(messages, depth);
    const publicModel = resolvePublicModel(model);
    const selectedModel = resolveBackendModel(publicModel, depth, basicQuestion);

    if (!messages.length) {
      return res.status(400).json({
        error: uiLang === 'en' ? 'Messages list cannot be empty.' : 'Mesaj listesi boş olamaz.',
      });
    }

    if (getConfiguredApiKeys().length === 0) {
      return res.status(500).json({
        error:
          uiLang === 'en'
            ? 'GEMINI_API_KEY is not configured. Please add at least one API key in Settings > Secrets.'
            : 'GEMINI_API_KEY yapılandırılmamış. Lütfen Settings > Secrets panelinden en az bir API anahtarı ekleyin.',
      });
    }

    const depthInstruction = basicQuestion
      ? 'Hızlı yanıt: Soru basit olduğu için düşünmeden doğrudan, kısa ve net cevap ver.'
      : DEPTH_INSTRUCTIONS[depth] || DEPTH_INSTRUCTIONS.mid;
    const ultraSpecialty =
      !basicQuestion && publicModel === 'longclaw-clawing-1.2-ultra'
        ? '\nUzmanlık: Karmaşık akademik, bilimsel, hukuki, teknik ve çoktan seçmeli (MMLU-Pro tarzı) sorularda seçenekleri titizlikle karşılaştırıp en doğru sonuca ulaş.'
        : '';
    const langHint =
      uiLang === 'en'
        ? '\nArayüz dili: İngilizce (ancak kullanıcı hangi dilde yazarsa o dilde yanıt ver).'
        : '';
    const systemIdentity = buildSystemIdentity(publicModel);
    const systemPrompt = `${systemIdentity}${ultraSpecialty}${langHint}\n\nMod: ${MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.chat}\nDerinlik: ${depthInstruction}`;

    // Format contents for @google/genai
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // Adjust thinking effort via thinkingConfig for the selected model
    const effort = getThinkingConfig(publicModel, selectedModel, depth, basicQuestion);

    const config: any = {
      systemInstruction: systemPrompt,
      thinkingConfig: {
        thinkingLevel: effort.level,
        includeThoughts: effort.includeThoughts,
      },
    };

    const { iterator, firstResult } = await generateStreamWithFailover(
      {
        model: selectedModel,
        contents,
        config,
      },
      depth,
      basicQuestion
    );

    // Set streaming headers (JSON Lines / ndjson) only after stream starts cleanly
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const writeChunk = (chunk: any) => {
      const candidate = chunk?.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      let emittedFromParts = false;

      for (const part of parts) {
        if (!part.text) continue;
        if ((part as any).thought) {
          res.write(JSON.stringify({ t: 'th', x: part.text }) + '\n');
        } else {
          emittedFromParts = true;
          res.write(JSON.stringify({ t: 'tx', x: part.text }) + '\n');
        }
      }

      // Fallback if chunk.text is populated outside parts
      if (!emittedFromParts && chunk?.text) {
        res.write(JSON.stringify({ t: 'tx', x: chunk.text }) + '\n');
      }
    };

    if (!firstResult.done && firstResult.value) {
      writeChunk(firstResult.value);
    }

    while (true) {
      const next = await iterator.next();
      if (next.done) break;
      if (next.value) writeChunk(next.value);
    }

    res.end();
  } catch (err: any) {
    console.error('Gemini Chat error:', err);
    const formatted = formatGeminiError(err, uiLang);
    if (res.headersSent) {
      res.write(JSON.stringify({ t: 'err', x: formatted.message }) + '\n');
      res.end();
    } else {
      res.status(formatted.status).json({ error: formatted.message });
    }
  }
});

// Auto-title chat endpoint (uses fast unpaid model with multi-key failover and silent title fallback)
app.post('/api/name-chat', async (req: Request, res: Response) => {
  const uiLang: 'en' | 'tr' = req.body?.lang === 'en' ? 'en' : 'tr';
  const fallbackDefault = uiLang === 'en' ? 'New chat' : 'Yeni sohbet';
  try {
    const { userMessage = '', assistantMessage = '' } = req.body;
    if (getConfiguredApiKeys().length === 0) {
      return res.json({ title: userMessage.slice(0, 30) || fallbackDefault });
    }

    const prompt = `Aşağıdaki konuşmanın ne hakkında olduğunu anla ve ona 2-4 kelimelik kısa, net bir başlık ver (kullanıcının dilinde). Tırnak, nokta, emoji ve fazladan açıklama olmadan SADECE başlığı yaz.

Kullanıcı: ${userMessage.slice(0, 600)}
Asistan: ${assistantMessage.slice(0, 600)}`;

    const response = await generateContentWithFailover({
      model: FALLBACK_UNPAID_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      },
    });

    const cleanTitle = (response.text || '')
      .trim()
      .split('\n')[0]
      .replace(/^["'“”’.\s]+|["'“”’.\s]+$/g, '')
      .slice(0, 40);

    res.json({ title: cleanTitle || userMessage.slice(0, 30) || fallbackDefault });
  } catch (err: any) {
    console.log('[Longclaw] Auto-title fallback used:', err?.status || err?.code || 'ERR');
    res.json({ title: req.body?.userMessage?.slice(0, 30) || fallbackDefault });
  }
});

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Longclaw] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
