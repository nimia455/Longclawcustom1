import React, { useId } from 'react';
import type { ChatModelId } from '../lib/models';

const GEMINI_OFFICIAL_PATH =
  'M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z';

export function LongclawLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="11.5" cy="16" r="8.5" stroke="currentColor" strokeWidth="3.6" />
      <circle cx="20.5" cy="16" r="8.5" stroke="currentColor" strokeWidth="3.6" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke="var(--bg)" strokeWidth="6.4" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke="currentColor" strokeWidth="3.6" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke="var(--bg)" strokeWidth="6.4" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke="currentColor" strokeWidth="3.6" />
    </svg>
  );
}

/**
 * Official Google Gemini 4-color sparkle logo (used on Landing Page)
 */
export function GeminiLogo({ className = 'w-4 h-4' }: { className?: string }) {
  const id = useId();
  const clipId = `gemini-clip-${id}`;
  const redGradId = `gemini-red-${id}`;
  const yellowGradId = `gemini-yellow-${id}`;
  const greenGradId = `gemini-green-${id}`;

  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={GEMINI_OFFICIAL_PATH} />
        </clipPath>
        <radialGradient id={redGradId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(5 8) scale(16)">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="70%" stopColor="#EA4335" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#EA4335" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={yellowGradId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(4 16) scale(14)">
          <stop offset="0%" stopColor="#FBBC04" />
          <stop offset="65%" stopColor="#FBBC04" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FBBC04" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={greenGradId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 26) scale(16)">
          <stop offset="0%" stopColor="#34A853" />
          <stop offset="65%" stopColor="#34A853" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#34A853" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="28" height="28" fill="#4285F4" />
        <circle cx="5" cy="8" r="16" fill={`url(#${redGradId})`} />
        <circle cx="4" cy="16" r="14" fill={`url(#${yellowGradId})`} />
        <circle cx="12" cy="26" r="16" fill={`url(#${greenGradId})`} />
      </g>
    </svg>
  );
}

/**
 * Longclaw Clawing 1 Pro: Interlocking Longclaw rings with warm amber-indigo metallic gradient
 */
export function ClawingProLogo({ className = 'w-4 h-4' }: { className?: string }) {
  const id = useId();
  const gradId = `clawing-pro-${id}`;
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="3" y1="6" x2="29" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      <circle cx="11.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.6" />
      <circle cx="20.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.6" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke="var(--bg)" strokeWidth="6.4" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke={`url(#${gradId})`} strokeWidth="3.6" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke="var(--bg)" strokeWidth="6.4" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke={`url(#${gradId})`} strokeWidth="3.6" />
    </svg>
  );
}

/**
 * Longclaw Clawing 1 Low: Lightweight sky-emerald gradient Longclaw rings
 */
export function ClawingLowLogo({ className = 'w-4 h-4' }: { className?: string }) {
  const id = useId();
  const gradId = `clawing-low-${id}`;
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="3" y1="6" x2="29" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <circle cx="11.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.4" />
      <circle cx="20.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.4" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke="var(--bg)" strokeWidth="6.2" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke={`url(#${gradId})`} strokeWidth="3.4" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke="var(--bg)" strokeWidth="6.2" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke={`url(#${gradId})`} strokeWidth="3.4" />
    </svg>
  );
}

/**
 * Longclaw Clawing 1.1 Ultra: Interlocking Longclaw rings with violet-magenta-cyan prism gradient
 */
export function ClawingUltraLogo({ className = 'w-4 h-4' }: { className?: string }) {
  const id = useId();
  const gradId = `clawing-ultra-${id}`;
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="3" y1="6" x2="29" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="11.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.8" />
      <circle cx="20.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.8" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke="var(--bg)" strokeWidth="6.6" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke={`url(#${gradId})`} strokeWidth="3.8" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke="var(--bg)" strokeWidth="6.6" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke={`url(#${gradId})`} strokeWidth="3.8" />
    </svg>
  );
}

/**
 * Longclaw Clawing 1.1 Pro: Interlocking Longclaw rings with sky-indigo-amber next-gen gradient
 */
export function Clawing11ProLogo({ className = 'w-4 h-4' }: { className?: string }) {
  const id = useId();
  const gradId = `clawing-11-pro-${id}`;
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="3" y1="6" x2="29" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="55%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="11.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.7" />
      <circle cx="20.5" cy="16" r="8.5" stroke={`url(#${gradId})`} strokeWidth="3.7" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke="var(--bg)" strokeWidth="6.5" />
      <path d="M13 7.6A8.5 8.5 0 0 1 18.4 11" stroke={`url(#${gradId})`} strokeWidth="3.7" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke="var(--bg)" strokeWidth="6.5" />
      <path d="M19 24.4A8.5 8.5 0 0 1 13.5 20.9" stroke={`url(#${gradId})`} strokeWidth="3.7" />
    </svg>
  );
}

export function ModelLogo({
  modelId,
  className = 'w-4 h-4',
}: {
  modelId: ChatModelId;
  className?: string;
}) {
  if (modelId === 'longclaw-clawing-1.1-ultra') {
    return <ClawingUltraLogo className={className} />;
  }
  if (modelId === 'longclaw-clawing-1.1-pro') {
    return <Clawing11ProLogo className={className} />;
  }
  if (modelId === 'longclaw-clawing-1-pro') {
    return <ClawingProLogo className={className} />;
  }
  if (modelId === 'longclaw-clawing-1-low') {
    return <ClawingLowLogo className={className} />;
  }
  return <LongclawLogo className={className} />;
}

/**
 * Official OpenAI blossom mark
 */
export function OpenAILogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

/**
 * Official Anthropic Claude starburst mark
 */
export function ClaudeLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#D97757" aria-hidden="true">
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.273-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
    </svg>
  );
}

/**
 * DeepSeek whale emblem
 */
export function DeepSeekLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="#4D6BFE"
        d="M21.8 11.4c-.3-2.6-1.9-5.1-4.3-6.1-.8-.3-1.7-.3-2.1.4-.3.6 0 1.4.4 2 .3.5.4 1.2.1 1.7-.5.8-1.7.9-2.5.4-.9-.6-1.5-1.6-2.4-2.2-1.3-.9-3-.9-4.3-.1-.7.4-1.3 1-1.7 1.7-.8-.3-1.7-.5-2.6-.4-.8.1-1.7.5-2 1.3-.3.9.4 1.8 1.2 2.1.6.2 1.2.2 1.8.3-.2 2.4.7 4.9 2.6 6.5 2.4 2 6 2.5 9.1 1.6 3.5-1 6.3-4.1 6.7-7.8.1-.5.1-1 0-1.4z"
      />
      <path
        fill="#FFFFFF"
        fillOpacity="0.9"
        d="M16.9 12.1a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"
      />
      <path
        fill="#4D6BFE"
        d="M11.6 15.8c1.4.5 3 .2 4.1-.7.3-.2.7 0 .6.4-.4 1.1-1.4 2-2.7 2.2-1.2.2-2.4-.3-3-1.2-.2-.3.2-.9.6-.8l.4.1z"
      />
    </svg>
  );
}

export function BenchmarkModelLogo({
  provider,
  modelId,
  className = 'w-4 h-4',
}: {
  provider: string;
  modelId?: ChatModelId;
  className?: string;
}) {
  if (modelId) {
    return <ModelLogo modelId={modelId} className={className} />;
  }
  const p = provider.toLowerCase();
  if (p.includes('google') || p.includes('gemini')) {
    return <GeminiLogo className={className} />;
  }
  if (p.includes('anthropic') || p.includes('claude')) {
    return <ClaudeLogo className={className} />;
  }
  if (p.includes('openai') || p.includes('gpt')) {
    return <OpenAILogo className={className} />;
  }
  if (p.includes('deepseek')) {
    return <DeepSeekLogo className={className} />;
  }
  return <LongclawLogo className={className} />;
}

export function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AppleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.65-1.05 1.71-.92 2.73 1.01.08 2.01-.48 2.62-1.23z" />
    </svg>
  );
}
