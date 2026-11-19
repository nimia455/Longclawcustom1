export type ChatModelId =
  | 'longclaw-clawing-1.1-ultra'
  | 'longclaw-clawing-1.1-pro'
  | 'longclaw-clawing-1-pro'
  | 'longclaw-clawing-1-low'
  | 'longclaw-clawing-1';

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
    id: 'longclaw-clawing-1.1-ultra',
    name: 'Longclaw Clawing 1.1 Ultra',
    shortName: 'Clawing 1.1 Ultra',
    tagline: 'Ultra',
    description: 'En zorlu mimari tasarım, uzun araştırma ve çok adımlı akıl yürütme için en üst seviye.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1.1-pro',
    name: 'Longclaw Clawing 1.1 Pro',
    shortName: 'Clawing 1.1 Pro',
    tagline: 'Yeni · Gelişmiş',
    description: 'Clawing 1’in ötesinde; daha keskin kodlama, güçlü bağlam takibi ve hızlı Pro yanıtlar.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1-pro',
    name: 'Longclaw Clawing 1 Pro',
    shortName: 'Clawing 1 Pro',
    tagline: 'Gelişmiş',
    description: 'Karmaşık problemler, kodlama ve derin akıl yürütme için dengeli Pro modeli.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1-low',
    name: 'Longclaw Clawing 1 Low',
    shortName: 'Clawing 1 Low',
    tagline: 'Hızlı',
    description: 'Anlık yanıtlar ve hafif görevler için ultra hızlı model.',
    inFamily: true,
  },
  {
    id: 'longclaw-clawing-1',
    name: 'Longclaw Clawing 1',
    shortName: 'Clawing 1',
    tagline: 'Klasik',
    description: 'İlk nesil standart model. Günlük yazım ve genel sohbetler için klasik seçenek.',
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
