import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Calendar,
  Check,
  Code2,
  Mail,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LongclawLogo } from './Icons';
import { Language } from '../lib/i18n';
import { EDITORIAL_EASE, LIQUID_EASE, LIQUID_MORPH, LIQUID_SPRING, LIQUID_TAP } from '../lib/motion';

interface DemoConversation {
  q: string;
  a: string;
}

interface HeroChatShowcaseProps {
  conversations: DemoConversation[];
  badgeLabel: string;
  lang: Language;
  onTryLongclaw: () => void;
}

type Stage = 'composing' | 'thinking' | 'streaming' | 'done';

/**
 * Miniature interactive stopwatch embedded inside Demo #2
 * so landing-page visitors can literally test live preview in place.
 */
function MiniLiveTimer({ lang }: { lang: Language }) {
  const [running, setRunning] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(14200);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setElapsedMs((prev) => prev + 100);
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  const totalSec = Math.floor(elapsedMs / 1000);
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  const tenths = Math.floor((elapsedMs % 1000) / 100);

  return (
    <div className="mt-3 rounded-2xl border border-[var(--bd)] bg-[#141413] text-[#F5F4F0] px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/55 uppercase tracking-wider shrink-0">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">{lang === 'tr' ? 'Önizleme' : 'Preview'}</span>
        </span>
        <span className="font-mono text-lg sm:text-xl font-semibold tracking-tight tabular-nums text-white">
          {mins}:{secs}
          <span className="text-white/45">.{tenths}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#141413] text-[11px] font-medium hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          <span>
            {running
              ? lang === 'tr'
                ? 'Duraklat'
                : 'Pause'
              : lang === 'tr'
                ? 'Başlat'
                : 'Start'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setElapsedMs(0);
          }}
          aria-label={lang === 'tr' ? 'Sıfırla' : 'Reset'}
          className="w-7 h-7 rounded-full border border-white/15 text-white/75 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function HeroChatShowcase({
  conversations,
  badgeLabel,
  lang,
  onTryLongclaw,
}: HeroChatShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeCount = Math.max(1, conversations.length);

  const [activeIdx, setActiveIdx] = useState(0);
  const [stage, setStage] = useState<Stage>(prefersReducedMotion ? 'done' : 'composing');
  const [composerText, setComposerText] = useState('');
  const [sendPressed, setSendPressed] = useState(false);
  const [sentQuestion, setSentQuestion] = useState('');
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const currentIdx = activeIdx % safeCount;
  const currentConv = conversations[currentIdx] || { q: '', a: '' };

  const scenarios =
    lang === 'tr'
      ? [
          {
            label: 'E-posta',
            thinking: 'Son e-postalar inceleniyor…',
            Icon: Mail,
          },
          {
            label: 'Canlı kod',
            thinking: 'Canlı önizleme hazırlanıyor…',
            Icon: Code2,
          },
          {
            label: '/takvim',
            thinking: 'Takvime ekleniyor…',
            Icon: Calendar,
          },
        ]
      : [
          {
            label: 'Inbox',
            thinking: 'Checking recent emails…',
            Icon: Mail,
          },
          {
            label: 'Live code',
            thinking: 'Preparing live preview…',
            Icon: Code2,
          },
          {
            label: '/calendar',
            thinking: 'Scheduling on Calendar…',
            Icon: Calendar,
          },
        ];

  const activeMeta = scenarios[currentIdx % scenarios.length];

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    if (prefersReducedMotion) {
      setComposerText('');
      setSendPressed(false);
      setSentQuestion(currentConv.q);
      setStreamedAnswer(currentConv.a);
      setStage('done');
      return;
    }

    const runSequence = async () => {
      // Reset cleanly for the selected conversation
      setStage('composing');
      setComposerText('');
      setSendPressed(false);
      setSentQuestion('');
      setStreamedAnswer('');

      // Stage 1: Natural typing inside the composer input bar
      await sleep(180);
      if (cancelled) return;

      const promptChars = Array.from(currentConv.q);
      for (let i = 1; i <= promptChars.length; i++) {
        if (cancelled) return;
        setComposerText(promptChars.slice(0, i).join(''));
        const ch = promptChars[i - 1];
        const delay = ch === ' ' ? 26 : ch === '/' ? 45 : 22;
        await sleep(delay);
      }

      // Brief tactile send press
      await sleep(170);
      if (cancelled) return;
      setSendPressed(true);
      await sleep(140);
      if (cancelled) return;

      // Lift user prompt into the conversation feed
      setSendPressed(false);
      setComposerText('');
      setSentQuestion(currentConv.q);
      setStage('thinking');

      // Stage 2: Calm thinking / workspace check beat
      await sleep(680);
      if (cancelled) return;

      // Stage 3: Organic word-by-word streaming response
      setStage('streaming');
      const words = currentConv.a.split(/(\s+)/);
      let built = '';
      for (let w = 0; w < words.length; w++) {
        if (cancelled) return;
        built += words[w];
        setStreamedAnswer(built);
        const token = words[w];
        if (!token.trim()) continue;
        const endsSentence = /[.!?…]$/.test(token);
        const endsPause = /[,;:—–]$/.test(token);
        await sleep(endsSentence ? 105 : endsPause ? 70 : 44);
      }

      if (cancelled) return;
      setStage('done');

      // Stage 4: Calm read dwell — respects hover pause so users can read or interact freely
      let waited = 0;
      const targetDwell = 4400;
      while (waited < targetDwell) {
        await sleep(200);
        if (cancelled) return;
        if (!isPausedRef.current) {
          waited += 200;
        }
      }

      if (!cancelled) {
        setActiveIdx((prev) => (prev + 1) % safeCount);
      }
    };

    void runSequence();

    return () => {
      cancelled = true;
    };
  }, [currentIdx, lang, prefersReducedMotion, currentConv.q, currentConv.a, safeCount]);

  // Format slash command prefix cleanly inside bubbles & composer
  const renderPromptText = (text: string) => {
    const match = text.match(/^(\/[a-zA-ZçğıöşüÇĞİÖŞÜ0-9_-]+)(.*)$/);
    if (!match) return text;
    return (
      <>
        <span className="inline-flex items-center px-1.5 py-0.5 mr-1 rounded-md bg-[var(--ac)]/12 text-[var(--ac)] font-mono text-[12.5px] font-semibold align-baseline">
          {match[1]}
        </span>
        <span>{match[2]}</span>
      </>
    );
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 26, scale: 0.975 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.62, delay: 0.2, ease: EDITORIAL_EASE }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="mt-12 sm:mt-16 max-w-2xl mx-auto text-left rounded-[26px] bg-[var(--card)]/92 backdrop-blur-2xl border border-[var(--bd)]/90 shadow-[0_30px_75px_-28px_rgba(24,23,21,0.26)] dark:shadow-[0_34px_85px_-28px_rgba(0,0,0,0.72)] overflow-hidden will-change-transform"
    >
      {/* Top Window Chrome: Brand Identity + Interactive Scenario Switcher */}
      <div className="px-4 sm:px-5 py-3 border-b border-[var(--bd)]/75 bg-[var(--bg)]/45 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <LongclawLogo className="w-[20px] h-[20px] text-[var(--tx)] shrink-0" />
          <span className="truncate font-space text-xs sm:text-[13px] font-semibold tracking-tight text-[var(--tx)]">
            {badgeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-full bg-[var(--surf)]/90 border border-[var(--bd)]/70 shrink-0">
          {conversations.map((_, idx) => {
            const meta = scenarios[idx % scenarios.length];
            const Icon = meta.Icon;
            const active = currentIdx === idx;
            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                transition={LIQUID_TAP}
                onClick={() => setActiveIdx(idx)}
                className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'text-[var(--on)]'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="hero-chat-scenario-pill"
                    transition={LIQUID_MORPH}
                    className="absolute inset-0 rounded-full bg-[var(--ac)]"
                    aria-hidden="true"
                  />
                )}
                <Icon className="relative z-10 w-3 h-3 shrink-0" />
                <span className="relative z-10 hidden xs:inline sm:inline">{meta.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Stage */}
      <div className="px-4 sm:px-6 pt-5 pb-4 min-h-[214px] sm:min-h-[224px] flex flex-col justify-between gap-4">
        <div className="space-y-4">
          {/* User Sent Message Bubble — launches smoothly upward from composer */}
          <div className="min-h-[42px] flex justify-end items-start">
            <AnimatePresence mode="wait">
              {sentQuestion && (
                <motion.div
                  key={`${lang}-q-${currentIdx}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                  transition={LIQUID_SPRING}
                  className="inline-block max-w-[88%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[var(--surf)] border border-[var(--bd)]/75 text-[14px] sm:text-[14.5px] font-medium text-[var(--tx)] leading-snug origin-bottom-right"
                >
                  {renderPromptText(sentQuestion)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Longclaw Assistant Reply Row */}
          <AnimatePresence mode="wait">
            {stage !== 'composing' && (
              <motion.div
                key={`${lang}-a-${currentIdx}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
                className="flex items-start gap-3"
              >
                <motion.div
                  animate={
                    !prefersReducedMotion && stage === 'thinking'
                      ? { rotate: [0, 180, 360] }
                      : { rotate: 0 }
                  }
                  transition={
                    stage === 'thinking'
                      ? { duration: 1.6, repeat: Infinity, ease: 'linear' }
                      : { duration: 0.3, ease: LIQUID_EASE }
                  }
                  className="w-7 h-7 rounded-full bg-[var(--surf)] border border-[var(--bd)] flex items-center justify-center shrink-0 mt-0.5"
                >
                  <LongclawLogo className="w-[17px] h-[17px] text-[var(--tx)]" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  {stage === 'thinking' ? (
                    <div className="inline-flex items-center gap-3 py-1 text-xs sm:text-[13px] text-[var(--mut)]">
                      <span>{activeMeta.thinking}</span>
                      {/* Crisp rhythmic hairline wave equalizer (zero blur) */}
                      <span className="inline-flex items-center gap-[3px] h-3" aria-hidden="true">
                        {[0, 1, 2, 3].map((bar) => (
                          <motion.span
                            key={bar}
                            className="w-[2px] h-full rounded-full bg-[var(--ac)] origin-center"
                            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.35, 0.95, 0.35] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.85,
                              delay: bar * 0.12,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-[14px] sm:text-[14.5px] leading-[1.68] text-[var(--tx)]/92">
                        {streamedAnswer}
                        {stage === 'streaming' && (
                          <span
                            className="inline-block w-[2px] h-[0.95em] ml-1 rounded-full bg-[var(--ac)] align-[-0.14em] animate-[blink_0.9s_steps(1)_infinite]"
                            aria-hidden="true"
                          />
                        )}
                      </p>

                      {/* Contextual Micro-Artifact after reply finishes streaming */}
                      <AnimatePresence>
                        {stage === 'done' && (
                          <motion.div
                            key={`artifact-${currentIdx}`}
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 4 }}
                            transition={{ duration: 0.34, ease: EDITORIAL_EASE }}
                          >
                            {currentIdx === 0 && (
                              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[var(--mut)]">
                                {(lang === 'tr'
                                  ? ['Perşembe 14:00', 'Bütçe onaylı', 'Metin onayı bekleniyor']
                                  : ['Thu 14:00 review', 'Budget approved', 'Copy sign-off']
                                ).map((item, idx) => (
                                  <motion.span
                                    key={item}
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                      duration: 0.28,
                                      delay: idx * 0.07,
                                      ease: EDITORIAL_EASE,
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surf)]/85 border border-[var(--bd)]/80 text-[var(--tx)]/82"
                                  >
                                    <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                  </motion.span>
                                ))}
                              </div>
                            )}

                            {currentIdx === 1 && <MiniLiveTimer lang={lang} />}

                            {currentIdx === 2 && (
                              <div className="mt-3 rounded-2xl border border-[var(--bd)] bg-[var(--surf)]/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--bd)] flex items-center justify-center shrink-0">
                                    <Calendar className="w-4 h-4 text-[var(--tx)]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[var(--tx)] truncate">
                                      {lang === 'tr' ? 'Ekip Toplantısı' : 'Team Call'}
                                    </p>
                                    <p className="text-[11px] text-[var(--mut)]">
                                      {lang === 'tr'
                                        ? 'Yarın · 10:00 – 11:00'
                                        : 'Tomorrow · 10:00 – 11:00'}
                                    </p>
                                  </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium shrink-0">
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                    <motion.path
                                      d="M2.5 7.4L5.6 10.4L11.5 3.8"
                                      stroke="currentColor"
                                      strokeWidth="1.9"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.36, delay: 0.1, ease: LIQUID_EASE }}
                                    />
                                  </svg>
                                  <span>{lang === 'tr' ? 'Eklendi' : 'Saved'}</span>
                                </span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tactile Composer Strip (animates prompt typing & opens workspace on click) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onTryLongclaw}
            className="w-full flex items-center justify-between gap-3 pl-4 pr-2 py-2 rounded-2xl bg-[var(--bg)]/80 border border-[var(--bd)]/85 hover:border-[var(--tx)]/25 transition-colors text-left cursor-pointer group"
          >
            <span className="text-xs sm:text-[13px] truncate min-w-0 flex-1">
              {stage === 'composing' ? (
                <span className="text-[var(--tx)] font-medium">
                  {renderPromptText(composerText)}
                  <span
                    className="inline-block w-[1.5px] h-[0.95em] ml-0.5 bg-[var(--tx)] align-[-0.14em] animate-[blink_0.85s_steps(1)_infinite]"
                    aria-hidden="true"
                  />
                </span>
              ) : (
                <span className="text-[var(--mut)] group-hover:text-[var(--tx)]/75 transition-colors">
                  {lang === 'tr'
                    ? 'Longclaw’a bir şey sor veya / komutunu dene…'
                    : 'Ask Longclaw anything or try a / command…'}
                </span>
              )}
            </span>

            <motion.span
              animate={{
                scale: sendPressed ? 0.88 : 1,
                opacity: stage === 'composing' && composerText.length > 0 ? 1 : 0.72,
              }}
              transition={{ duration: 0.14, ease: LIQUID_EASE }}
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                stage === 'composing' && composerText.length > 0
                  ? 'bg-[var(--ac)] text-[var(--on)]'
                  : 'bg-[var(--surf)] text-[var(--tx)] group-hover:bg-[var(--ac)] group-hover:text-[var(--on)]'
              }`}
              aria-hidden="true"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Subtle Bottom Hairline Progress Indicator */}
      <div className="h-[2px] w-full bg-[var(--bd)]/35 overflow-hidden" aria-hidden="true">
        {!prefersReducedMotion && (
          <motion.div
            key={`progress-${currentIdx}-${stage}`}
            className="h-full bg-[var(--ac)]/70 origin-left"
            initial={{
              scaleX:
                stage === 'composing'
                  ? 0
                  : stage === 'thinking'
                    ? 0.28
                    : stage === 'streaming'
                      ? 0.42
                      : 0.68,
            }}
            animate={{
              scaleX:
                stage === 'composing'
                  ? 0.28
                  : stage === 'thinking'
                    ? 0.42
                    : stage === 'streaming'
                      ? 0.68
                      : isPaused
                        ? 0.68
                        : 1,
            }}
            transition={{
              duration:
                stage === 'composing'
                  ? 1.1
                  : stage === 'thinking'
                    ? 0.68
                    : stage === 'streaming'
                      ? 1.2
                      : isPaused
                        ? 0.2
                        : 4.4,
              ease: 'linear',
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
