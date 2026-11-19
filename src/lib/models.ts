export type ChatModelId =
  | 'longclaw-clawing-1.2-ultra'
  | 'longclaw-clawing-1.1-ultra'
  | 'longclaw-clawing-1.1-pro'
  | 'longclaw-clawing-1-pro'
  | 'longclaw-clawing-1.1-low'
  | 'longclaw-clawing-1.1';

export interface ChatModelOption {
  id: ChatModelId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  inFamily: boolean;
}

export const DEFAULT_CHAT_MODEL: ChatModelId = 'longclaw-clawing-1.1-pro';

export const CHAT_MODELS: ChatModelOption[] = [
  {
    id: 'longclaw-clawing-1.2-ultra',
    name: 'Longclaw Clawing 1.2 Ultra',
    shortName: 'Clawing 1.2 Ultra',
    tagline: 'MMLU-Pro Uzmanı',
    description: 'MMLU-Pro ve doktora düzeyi çok adımlı akıl yürütme için geliştirilen amiral gemisi canavar model.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1.1-ultra',
    name: 'Longclaw Clawing 1.1 Ultra',
    shortName: 'Clawing 1.1 Ultra',
    tagline: 'Ultra',
    description: 'En zorlu mimari tasarım, uzun araştırma ve çok adımlı akıl yürütme için üst seviye.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1.1-pro',
    name: 'Longclaw Clawing 1.1 Pro',
    shortName: 'Clawing 1.1 Pro',
    tagline: 'Yeni · Gelişmiş',
    description: 'Clawing 1.1 temelinin Pro yükseltmesi; daha keskin kodlama, güçlü bağlam takibi ve hızlı Pro yanıtlar.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1-pro',
    name: 'Longclaw Clawing 1 Pro',
    shortName: 'Clawing 1 Pro',
    tagline: 'Önceki Pro',
    description: 'Karmaşık problemler, kodlama ve derin akıl yürütme için önceki nesil Pro modeli.',
    inFamily: false,
  },
  {
    id: 'longclaw-clawing-1.1-low',
    name: 'Longclaw Clawing 1.1 Low',
    shortName: 'Clawing 1.1 Low',
    tagline: 'Yeni · Ultra Hızlı',
    description: '1 Low’un geliştirilmiş 1.1 sürümü; daha keskin Türkçe, temiz biçimlendirme ve sıfır gecikmeye yakın yanıtlar.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1.1',
    name: 'Longclaw Clawing 1.1',
    shortName: 'Clawing 1.1',
    tagline: 'Yeni · Standart',
    description: '1.1 nesli standart model; daha doğal Türkçe, düzenli anlatım ve akıcı günlük sohbetler için.',
    inFamily: false,
  },
];

export const FAMILY_MODELS: ChatModelOption[] = CHAT_MODELS.filter((m) => m.inFamily);
export const OTHER_MODELS: ChatModelOption[] = CHAT_MODELS.filter((m) => !m.inFamily);

export function isValidChatModel(value: unknown): value is ChatModelId {
  return typeof value === 'string' && CHAT_MODELS.some((m) => m.id === value);
}

export function getChatModelOption(id: ChatModelId): ChatModelOption {
  return CHAT_MODELS.find((m) => m.id === id) || CHAT_MODELS[1];
}
