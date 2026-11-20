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
const DEFAULT_PUBLIC_MODEL = 'longclaw-clawing-1.2-pro';
const DEFAULT_BACKEND_MODEL = 'gemini-4-hydrogen';

const PUBLIC_TO_BACKEND_MODEL: Record<string, string> = {
  'longclaw-clawing-1.2-ultra': 'gemini-4-hydrogen',
  'longclaw-clawing-1.2-pro': 'gemini-4-hydrogen',
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
  'longclaw-clawing-1.2-pro': 'Longclaw Clawing 1.2 Pro',
  'longclaw-clawing-1.1-ultra': 'Longclaw Clawing 1.1 Ultra',
  'longclaw-clawing-1.1-pro': 'Longclaw Clawing 1.1 Pro',
  'longclaw-clawing-1-pro': 'Longclaw Clawing 1 Pro',
  'longclaw-clawing-1.1-low': 'Longclaw Clawing 1.1 Low',
  'longclaw-clawing-1.1': 'Longclaw Clawing 1.1',
};

function buildSystemIdentity(publicModel: string): string {
  const modelDisplayName =
    PUBLIC_MODEL_DISPLAY_NAMES[publicModel] || 'Longclaw Clawing 1.2 Pro';
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
    publicModel === 'longclaw-clawing-1.2-pro' ||
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

async function generateContentWithFailover(params: any, timeoutMs = 15_000) {
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
          timeoutMs,
          `Generate (${attemptParams.model})`
        );
        markKeySuccess(apiKey, attemptParams.model);
        return response;
      } catch (err: any) {
        lastError = err;
        const status = Number(err?.status || err?.code) || 500;
        if (status !== 504) {
          markKeyFailure(apiKey, attemptParams.model, err);
        }
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
    const {
      messages = [],
      depth = 'mid',
      mode = 'chat',
      model,
      gmailConnected = false,
      gmailContext = [],
      workspaceContext = {},
    } = req.body;
    const calEvents = Array.isArray(workspaceContext?.calendar) ? workspaceContext.calendar : [];
    const driveFiles = Array.isArray(workspaceContext?.drive) ? workspaceContext.drive : [];
    const docItems = Array.isArray(workspaceContext?.docs) ? workspaceContext.docs : [];
    const taskItems = Array.isArray(workspaceContext?.tasks) ? workspaceContext.tasks : [];

    const hasGmailContext = Array.isArray(gmailContext) && gmailContext.length > 0;
    const hasAttachedImages = Array.isArray(messages)
      ? messages.some((m: any) => Array.isArray(m?.images) && m.images.length > 0)
      : false;
    const hasWorkspaceContext =
      hasGmailContext ||
      calEvents.length > 0 ||
      driveFiles.length > 0 ||
      docItems.length > 0 ||
      taskItems.length > 0;
    const basicQuestion =
      hasWorkspaceContext || hasAttachedImages ? false : isBasicQuestion(messages, depth);
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
        : !basicQuestion && publicModel === 'longclaw-clawing-1.2-pro'
          ? '\nUzmanlık: Kodlama, günlük üretkenlik ve teknik analizlerde gereksiz uzatma olmadan yüksek kaliteli, temiz ve doğrudan uygulanabilir çözümler üret.'
          : '';
    const langHint =
      uiLang === 'en'
        ? '\nArayüz dili: İngilizce (ancak kullanıcı hangi dilde yazarsa o dilde yanıt ver).'
        : '';

    let gmailInstruction = '';
    if (gmailConnected) {
      gmailInstruction +=
        '\n\nGmail Bağlayıcısı: Kullanıcının Gmail hesabı bağlıdır. Kullanıcı bir e-posta yazmanı, yanıt taslağı hazırlamanı veya e-posta göndermeni isterse, cevabının sonunda aşağıdaki tam JSON formatında tek bir kod bloğu ekle (asla e-postayı otomatik gönderdiğini iddia etme; kullanıcı onay butonuna tıklayınca gönderilecek):\n```gmail-draft\n{"to":"alici@ornek.com","subject":"Konu","body":"E-posta metni"}\n```';
    }
    if (hasGmailContext) {
      const formattedEmails = gmailContext
        .slice(0, 10)
        .map((m: any, idx: number) => {
          const from = String(m?.from || '').slice(0, 160);
          const subject = String(m?.subject || '(Konu yok)').slice(0, 200);
          const date = String(m?.date || '').slice(0, 80);
          const status = m?.unread ? '[OKUNMADI] ' : '';
          const bodyText = String(m?.body || m?.snippet || '').slice(0, 1200);
          return `${idx + 1}. ${status}Gönderen: ${from}\n   Tarih: ${date}\n   Konu: ${subject}\n   İçerik: ${bodyText}`;
        })
        .join('\n\n');
      gmailInstruction += `\n\nKullanıcının izniyle Gmail gelen kutusundan getirilen güncel e-postalar:\n${formattedEmails}\n\nYanıtında yalnızca bu gerçek e-posta verilerine dayan; uydurma e-posta bilgisi ekleme.`;
    }
    if (calEvents.length > 0) {
      const formattedEvents = calEvents
        .slice(0, 10)
        .map((ev: any, idx: number) => {
          const summary = String(ev?.summary || '(Başlıksız)').slice(0, 180);
          const start = String(ev?.start || '').slice(0, 60);
          const end = String(ev?.end || '').slice(0, 60);
          const loc = ev?.location ? ` · Yer: ${String(ev.location).slice(0, 120)}` : '';
          const desc = ev?.description ? `\n   Not: ${String(ev.description).slice(0, 300)}` : '';
          return `${idx + 1}. ${summary} (${start}${end ? ` → ${end}` : ''})${loc}${desc}`;
        })
        .join('\n');
      gmailInstruction += `\n\nKullanıcının izniyle Google Takvim'den getirilen yaklaşan etkinlikler:\n${formattedEvents}`;
    }
    if (driveFiles.length > 0) {
      const formattedDrive = driveFiles
        .slice(0, 12)
        .map((f: any, idx: number) => {
          const name = String(f?.name || 'Dosya').slice(0, 160);
          const type = String(f?.mimeType || '').slice(0, 80);
          const mod = String(f?.modifiedTime || '').slice(0, 40);
          return `${idx + 1}. ${name} (${type}, güncellendi: ${mod})`;
        })
        .join('\n');
      gmailInstruction += `\n\nKullanıcının izniyle Google Drive'dan getirilen güncel dosyalar:\n${formattedDrive}`;
    }
    if (docItems.length > 0) {
      const formattedDocs = docItems
        .slice(0, 5)
        .map((d: any, idx: number) => {
          const name = String(d?.name || 'Doküman').slice(0, 160);
          const excerpt = String(d?.excerpt || d?.content || '').slice(0, 1500);
          return `${idx + 1}. ${name}${excerpt ? `\n   İçerik:\n   ${excerpt}` : ''}`;
        })
        .join('\n\n');
      gmailInstruction += `\n\nKullanıcının izniyle Google Dokümanlar'dan getirilen belgeler:\n${formattedDocs}`;
    }
    if (taskItems.length > 0) {
      const formattedTasks = taskItems
        .slice(0, 15)
        .map((tk: any, idx: number) => {
          const done = tk?.status === 'completed' ? '[TAMAMLANDI]' : '[AÇIK]';
          const title = String(tk?.title || '').slice(0, 180);
          const due = tk?.due ? ` · Son tarih: ${String(tk.due).slice(0, 30)}` : '';
          const notes = tk?.notes ? ` — ${String(tk.notes).slice(0, 200)}` : '';
          return `${idx + 1}. ${done} ${title}${due}${notes}`;
        })
        .join('\n');
      gmailInstruction += `\n\nKullanıcının izniyle Google Görevler'den getirilen görev listesi:\n${formattedTasks}`;
    }

    const systemIdentity = buildSystemIdentity(publicModel);
    const systemPrompt = `${systemIdentity}${ultraSpecialty}${langHint}${gmailInstruction}\n\nMod: ${MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.chat}\nDerinlik: ${depthInstruction}`;

    // Format multimodal contents (text + inline image data) for @google/genai
    const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const contents = messages.map(
      (m: { role: string; content: string; images?: Array<{ mimeType?: string; dataUrl?: string }> }) => {
        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> =
          [];

        if (Array.isArray(m.images) && m.images.length > 0) {
          for (const img of m.images.slice(0, 4)) {
            const raw = String(img?.dataUrl || '');
            const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/);
            if (match) {
              const mimeType = match[1].toLowerCase();
              const data = match[2];
              if (ALLOWED_IMAGE_MIMES.has(mimeType) && data.length > 32) {
                parts.push({ inlineData: { mimeType, data } });
              }
            }
          }
        }

        const textContent = String(m.content || '').trim();
        if (textContent) {
          parts.push({ text: textContent });
        } else if (parts.length > 0) {
          parts.push({
            text:
              uiLang === 'en'
                ? 'Please examine this image and help me with it.'
                : 'Lütfen bu görseli incele ve açıkla.',
          });
        } else {
          parts.push({ text: '' });
        }

        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts,
        };
      }
    );

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

function buildLocalFallbackTitle(raw: string, fallbackDefault: string): string {
  const cleaned = String(raw || '')
    .replace(/\s+/g, ' ')
    .replace(/^["'“”’.\s]+|["'“”’.\s]+$/g, '')
    .trim();
  if (!cleaned) return fallbackDefault;
  if (cleaned.length <= 36) return cleaned;
  const sliced = cleaned.slice(0, 36);
  const lastSpace = sliced.lastIndexOf(' ');
  return (lastSpace > 14 ? sliced.slice(0, lastSpace) : sliced).trim();
}

// Auto-title chat endpoint (uses fast unpaid model with multi-key failover and silent title fallback)
app.post('/api/name-chat', async (req: Request, res: Response) => {
  const uiLang: 'en' | 'tr' = req.body?.lang === 'en' ? 'en' : 'tr';
  const fallbackDefault = uiLang === 'en' ? 'New chat' : 'Yeni sohbet';
  const localTitle = buildLocalFallbackTitle(req.body?.userMessage || '', fallbackDefault);
  try {
    const { userMessage = '', assistantMessage = '' } = req.body;
    if (getConfiguredApiKeys().length === 0) {
      return res.json({ title: localTitle });
    }

    const prompt = `Aşağıdaki konuşmanın ne hakkında olduğunu anla ve ona 2-4 kelimelik kısa, net bir başlık ver (kullanıcının dilinde). Tırnak, nokta, emoji ve fazladan açıklama olmadan SADECE başlığı yaz.

Kullanıcı: ${userMessage.slice(0, 500)}
Asistan: ${assistantMessage.slice(0, 500)}`;

    const response = await generateContentWithFailover({
      model: FALLBACK_UNPAID_MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 24,
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

    res.json({ title: cleanTitle || localTitle });
  } catch {
    res.json({ title: localTitle });
  }
});

const serverImageCache = new Map<string, { buffer: Buffer; contentType: string }>();

function cacheServerImage(url: string, data: { buffer: Buffer; contentType: string }) {
  serverImageCache.set(url, data);
  if (serverImageCache.size > 40) {
    const oldest = serverImageCache.keys().next().value;
    if (oldest) serverImageCache.delete(oldest);
  }
}

function isAllowedPollinationsUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'image.pollinations.ai' &&
      parsed.pathname.startsWith('/prompt/')
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

class PollinationsRateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = 'PollinationsRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

async function fetchPollinationsImage(
  imageUrl: string,
  timeoutMs = 35_000
): Promise<{ buffer: Buffer; contentType: string }> {
  const cached = serverImageCache.get(imageUrl);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(imageUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'image/jpeg,image/png,image/webp,image/*',
      },
    });
    if (res.status === 402 || res.status === 429) {
      const bodyText = await res.text().catch(() => '');
      const retryMatch = bodyText.match(/retry\s+after\s+(\d+)\s*s/i);
      const retryAfterSeconds = retryMatch ? Math.max(1, Number(retryMatch[1])) : 30;
      throw new PollinationsRateLimitError(
        `Rate limit reached; retry after ${retryAfterSeconds}s`,
        retryAfterSeconds
      );
    }
    if (!res.ok) {
      throw new Error(`Image service returned HTTP ${res.status}`);
    }
    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    if (!contentType.startsWith('image/')) {
      throw new Error(`Unexpected response type from image service: ${contentType}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1024) {
      throw new Error('Generated image payload was unexpectedly small.');
    }
    const result = { buffer, contentType };
    cacheServerImage(imageUrl, result);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

// Same-origin proxy strictly limited to Pollinations generated image URLs (with in-memory LRU cache)
app.get('/api/image-proxy', async (req: Request, res: Response) => {
  const rawUrl = String(req.query.url || '').trim();
  const parsed = isAllowedPollinationsUrl(rawUrl);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid image URL' });
  }
  try {
    const { buffer, contentType } = await fetchPollinationsImage(parsed.toString(), 35_000);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  } catch (err: any) {
    console.error('Image proxy error:', err?.message || err);
    return res.status(err instanceof PollinationsRateLimitError ? 429 : 502).json({
      error: 'Could not load generated image.',
    });
  }
});

// Two-stage real raster image generation without a paid image API:
// 1) Free-tier Gemini (gemini-4-hydrogen) art-directs & translates the user's request into a vivid English diffusion prompt + localized title/caption.
// 2) Free zero-key Pollinations.ai diffusion engine renders the actual pixel image.
app.post('/api/generate-image', async (req: Request, res: Response) => {
  const uiLang: 'en' | 'tr' = req.body?.lang === 'en' ? 'en' : 'tr';
  try {
    const prompt = String(req.body?.prompt || '').trim();
    const rawRatio = String(req.body?.aspectRatio || '1:1');
    const aspectRatio: '1:1' | '16:9' | '4:3' | '9:16' =
      rawRatio === '16:9' || rawRatio === '4:3' || rawRatio === '9:16' ? rawRatio : '1:1';

    if (!prompt) {
      return res.status(400).json({
        error:
          uiLang === 'en'
            ? 'Please describe the image you want.'
            : 'Lütfen oluşturmak istediğin görseli tarif et.',
      });
    }

    const dims =
      aspectRatio === '16:9'
        ? { w: 1024, h: 576 }
        : aspectRatio === '4:3'
          ? { w: 896, h: 672 }
          : aspectRatio === '9:16'
            ? { w: 576, h: 1024 }
            : { w: 896, h: 896 };

    let title = buildLocalFallbackTitle(
      prompt,
      uiLang === 'en' ? 'Generated Image' : 'Oluşturulan Görsel'
    );
    let caption =
      uiLang === 'en'
        ? 'Here is the generated image for your request.'
        : 'İstediğin tarife göre görseli oluşturdum.';
    let enhancedPrompt = prompt;

    // Stage 1: Ask free-tier Gemini to craft a rich English visual prompt + localized title & caption
    if (getConfiguredApiKeys().length > 0) {
      try {
        const promptSystemInstruction = `You are an expert visual art director and diffusion prompt engineer.
Given a user's image request in any language, output ONLY a JSON object with:
- "title": a crisp 2-5 word title in ${uiLang === 'en' ? 'English' : 'Turkish'}.
- "caption": 1 short, natural, friendly sentence in ${uiLang === 'en' ? 'English' : 'Turkish'} presenting the image.
- "enhancedPrompt": a vivid, detailed English image-generation prompt (30-55 words, single paragraph, under 320 characters) faithfully capturing the user's exact subject with rich lighting, composition, textures, lens/art style, and atmosphere. Do not add watermarks, logos, or unwanted text.`;

        const geminiRes = await generateContentWithFailover(
          {
            model: DEFAULT_BACKEND_MODEL,
            contents: `User image request: "${prompt}"\nAspect ratio: ${aspectRatio}`,
            config: {
              systemInstruction: promptSystemInstruction,
              responseMimeType: 'application/json',
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          },
          18_000
        );

        const rawText = (geminiRes.text || '').trim();
        let parsed: { title?: string; caption?: string; enhancedPrompt?: string } = {};
        try {
          parsed = JSON.parse(rawText);
        } catch {
          const cleaned = rawText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          parsed = JSON.parse(cleaned);
        }

        if (parsed.title && typeof parsed.title === 'string') {
          title = parsed.title.trim().slice(0, 60);
        }
        if (parsed.caption && typeof parsed.caption === 'string') {
          caption = parsed.caption.trim().slice(0, 240);
        }
        if (parsed.enhancedPrompt && typeof parsed.enhancedPrompt === 'string') {
          enhancedPrompt = parsed.enhancedPrompt.trim().replace(/\s+/g, ' ').slice(0, 340);
        }
      } catch (geminiErr: any) {
        console.log(
          '[Longclaw] Gemini prompt enhancement skipped, using direct prompt:',
          geminiErr?.message || 'err'
        );
      }
    }

    // Stage 2: Render the real pixel image via Pollinations.ai (no API key required)
    const seed = Math.floor(Math.random() * 900_000_000) + 100_000;
    const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dims.w}&height=${dims.h}&nologo=true&seed=${seed}`;

    let fetched: { buffer: Buffer; contentType: string };
    try {
      fetched = await fetchPollinationsImage(finalUrl, 35_000);
    } catch (firstErr: any) {
      if (firstErr instanceof PollinationsRateLimitError) {
        // If only a short cooldown remains (<= 18s), wait smoothly and succeed automatically
        if (firstErr.retryAfterSeconds <= 18) {
          await new Promise((resolve) =>
            setTimeout(resolve, (firstErr.retryAfterSeconds + 1) * 1000)
          );
          fetched = await fetchPollinationsImage(finalUrl, 35_000);
        } else {
          return res.status(429).json({
            error:
              uiLang === 'en'
                ? `Please wait ${firstErr.retryAfterSeconds} seconds before creating another image.`
                : `Yeni bir görsel oluşturmadan önce lütfen ${firstErr.retryAfterSeconds} saniye bekle.`,
          });
        }
      } else {
        throw firstErr;
      }
    }

    const imageDataUrl = `data:${fetched.contentType};base64,${fetched.buffer.toString('base64')}`;

    return res.json({
      title,
      caption,
      enhancedPrompt,
      imageUrl: finalUrl,
      imageDataUrl,
      aspectRatio,
    });
  } catch (err: any) {
    if (err instanceof PollinationsRateLimitError) {
      return res.status(429).json({
        error:
          uiLang === 'en'
            ? `Please wait ${err.retryAfterSeconds} seconds before creating another image.`
            : `Yeni bir görsel oluşturmadan önce lütfen ${err.retryAfterSeconds} saniye bekle.`,
      });
    }
    console.error('Image generation error:', err?.message || err);
    return res.status(502).json({
      error:
        uiLang === 'en'
          ? 'Could not create the image right now. Please try again in a few seconds.'
          : 'Görsel şu an oluşturulamadı. Birkaç saniye sonra tekrar dene.',
    });
  }
});

// Direct Google Workspace connector command planner (/gmail, /takvim, /drive, /döküman, /görev)
// Plans an immediate, zero-question action payload in strict JSON so the client executes it directly.
app.post('/api/workspace-command', async (req: Request, res: Response) => {
  const uiLang: 'en' | 'tr' = req.body?.lang === 'en' ? 'en' : 'tr';
  try {
    const connector = String(req.body?.connector || '').trim() as
      | 'gmail'
      | 'calendar'
      | 'drive'
      | 'docs'
      | 'tasks';
    const instruction = String(req.body?.instruction || '').trim();
    const nowIso = String(req.body?.nowIso || new Date().toISOString());
    const timeZone = String(req.body?.timeZone || 'UTC');
    const context = req.body?.context || {};

    if (!['gmail', 'calendar', 'drive', 'docs', 'tasks'].includes(connector)) {
      return res.status(400).json({ error: 'Invalid connector.' });
    }

    if (getConfiguredApiKeys().length === 0) {
      return res.status(500).json({
        error:
          uiLang === 'en'
            ? 'API key is not configured.'
            : 'API anahtarı yapılandırılmamış.',
      });
    }

    const connectorSchemas: Record<string, string> = {
      gmail: `Connector: Gmail
Allowed operations:
1) "create_draft": Save a real draft directly in Gmail.
   payload: { "to": string (email if known, else ""), "subject": string, "body": string }
2) "send_email": Only when the user explicitly says send/gönder/yolla AND provides or implies a valid recipient email address (or matches one in context).
   payload: { "to": string (valid email address), "subject": string, "body": string }
3) "read_summary": When the user wants to read, search, check, or summarize their inbox/emails (or gave an empty instruction).
   payload: {}
   reply: detailed, helpful markdown answer based ONLY on the provided Gmail context.`,

      calendar: `Connector: Google Calendar
Allowed operations:
1) "create_event": Create a new event on the user's primary calendar right away.
   payload: { "summary": string, "startIso": string (full ISO-8601 with timezone offset or Z), "endIso": string (default 1 hour after startIso if not specified), "location": string, "description": string }
2) "update_event": Update an existing event from context when the user explicitly asks to move/reschedule/rename an existing event.
   payload: { "eventId": string (exact id from context), "existingSummary": string, "summary": string, "startIso": string, "endIso": string, "location": string, "description": string }
3) "delete_event": Delete an existing event from context when the user explicitly asks to delete/cancel/remove an event.
   payload: { "eventId": string (exact id from context), "existingSummary": string }
4) "read_summary": When the user asks to view/check/summarize their schedule or gave an empty instruction.
   payload: {}
   reply: clear markdown answer based ONLY on the provided Calendar events.`,

      drive: `Connector: Google Drive
Allowed operations:
1) "create_folder": Create a new folder in Google Drive when the user asks to make/create a folder/klasör.
   payload: { "name": string }
2) "create_file": Create a new text/markdown/csv/json file with full ready-to-use content in Google Drive.
   payload: { "name": string (include extension like .txt or .md), "content": string (write complete, high-quality content), "mimeType": "text/plain" | "text/markdown" | "text/csv" | "application/json" }
3) "read_summary": When the user wants to find, list, check, or summarize their Drive files (or gave an empty instruction).
   payload: {}
   reply: clear markdown answer based ONLY on the provided Drive files.`,

      docs: `Connector: Google Docs
Allowed operations:
1) "create_doc": Create a brand-new Google Doc and write full, polished, well-structured content inside it immediately.
   payload: { "title": string, "content": string (write rich, ready-to-use document body text with clean headings/paragraphs; no markdown code fences) }
2) "append_doc": Append new text to an existing Google Doc from context when the user explicitly names an existing doc to add/append to.
   payload: { "documentId": string (exact id from context), "existingTitle": string, "content": string }
3) "read_summary": When the user wants to read, inspect, or summarize their existing Google Docs (or gave an empty instruction).
   payload: {}
   reply: clear markdown answer based ONLY on the provided Docs context.`,

      tasks: `Connector: Google Tasks
Allowed operations:
1) "create_task": Add a new task immediately.
   payload: { "title": string, "notes": string, "dueDate": string (YYYY-MM-DD or empty string if no due date) }
2) "complete_task": Mark an existing task from context as completed/done.
   payload: { "taskId": string (exact id from context), "taskTitle": string, "completed": boolean }
3) "delete_task": Delete an existing task from context when explicitly requested.
   payload: { "taskId": string (exact id from context), "taskTitle": string }
4) "read_summary": When the user wants to view/list/summarize their tasks (or gave an empty instruction).
   payload: {}
   reply: clear markdown answer based ONLY on the provided Tasks context.`,
    };

    const systemInstruction = `You are Longclaw's direct Google Workspace action planner.
Current user local time: ${nowIso}
User timezone: ${timeZone}
Preferred response language: ${uiLang === 'en' ? 'English' : 'Turkish'} (always match the user's instruction language if they wrote in another language).

CRITICAL RULES:
- NEVER ask clarifying follow-up questions. Always infer sensible, complete defaults and immediately produce an executable action.
- If the user asks to create a document, write the full, thoughtful document content right away — do not leave placeholders.
- If the user asks to schedule a meeting/event without specifying duration, default to 1 hour. If no time of day is specified for a date, default to 10:00 local time. Always output valid ISO-8601 timestamps with the correct offset for ${timeZone}.
- If the user asks to write an email without saying "send/gönder", or without providing an email address, use "create_draft" so it saves straight to Gmail Drafts immediately.
- If the user explicitly asks to send an email AND an email address is known (in instruction or context), use "send_email".
- Output ONLY a single valid JSON object matching:
{
  "operation": string,
  "payload": object,
  "reply": string
}
- "reply" should be a concise, natural, human-sounding confirmation (or full summary for read_summary) written in the user's language.

${connectorSchemas[connector]}`;

    const compactContext = JSON.stringify(context).slice(0, 12_000);
    const userPrompt = `User command instruction: ${instruction || '(List / summarize current items)'}\n\nLive connector context:\n${compactContext}`;

    const aiRes = await generateContentWithFailover(
      {
        model: DEFAULT_BACKEND_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      },
      22_000
    );

    const rawText = (aiRes.text || '').trim();
    let parsed: { operation?: string; payload?: Record<string, any>; reply?: string } = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    }

    if (!parsed || typeof parsed.operation !== 'string') {
      throw new Error('Could not plan Workspace action.');
    }

    return res.json({
      connector,
      operation: parsed.operation,
      payload: parsed.payload && typeof parsed.payload === 'object' ? parsed.payload : {},
      reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '',
    });
  } catch (err: any) {
    console.error('Workspace command planner error:', err);
    const formatted = formatGeminiError(err, uiLang);
    return res.status(formatted.status).json({ error: formatted.message });
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
