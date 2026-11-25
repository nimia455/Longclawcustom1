import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { EyeShape, VoiceMood, VoicePhase } from '../lib/voiceCommandEngine';
import { LIQUID_EASE } from '../lib/motion';

interface VoiceCompanionEyesProps {
  shape: EyeShape;
  mood: VoiceMood;
  phase: VoicePhase;
  inputLevel: number; // 0..1 live microphone amplitude
  outputLevel: number; // 0..1 live TTS speaking amplitude
  gazeOffset?: { x: number; y: number }; // -1..1 subtle pointer gaze
}

const EYE_SPRING = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 28,
  mass: 0.85,
};

const LID_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 34,
  mass: 0.75,
};

const SHAPE_DIMENSIONS: Record<
  EyeShape,
  { width: number; height: number; borderRadius: number }
> = {
  round: { width: 136, height: 136, borderRadius: 68 },
  oval: { width: 100, height: 158, borderRadius: 50 },
  square: { width: 132, height: 132, borderRadius: 24 },
};

const PLAYFUL_SHAPES: EyeShape[] = ['round', 'oval', 'square'];

export function VoiceCompanionEyes({
  shape,
  mood,
  phase,
  inputLevel,
  outputLevel,
  gazeOffset = { x: 0, y: 0 },
}: VoiceCompanionEyesProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isBlinking, setIsBlinking] = useState(false);
  const [wanderGaze, setWanderGaze] = useState({ x: 0, y: 0 });
  const [playfulStep, setPlayfulStep] = useState(0);
  const [scanTick, setScanTick] = useState(0);

  // Natural organic blinking (with occasional double-blink)
  useEffect(() => {
    if (prefersReducedMotion) return;
    let cancelled = false;
    let timer: number | null = null;

    const scheduleBlink = () => {
      const waitMs =
        mood === 'sleepy'
          ? 2400 + Math.random() * 1800
          : phase === 'thinking'
            ? 3800 + Math.random() * 2200
            : 2800 + Math.random() * 2600;

      timer = window.setTimeout(() => {
        if (cancelled) return;
        setIsBlinking(true);
        window.setTimeout(() => {
          if (cancelled) return;
          setIsBlinking(false);
          // 22% chance of a charming quick double-blink
          if (Math.random() < 0.22 && mood !== 'sleepy') {
            window.setTimeout(() => {
              if (cancelled) return;
              setIsBlinking(true);
              window.setTimeout(() => {
                if (!cancelled) setIsBlinking(false);
              }, 115);
            }, 130);
          }
          scheduleBlink();
        }, mood === 'sleepy' ? 230 : 125);
      }, waitMs);
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [mood, phase, prefersReducedMotion]);

  // Subtle autonomous gaze drift when idle or thinking
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (phase === 'thinking' || mood === 'coding') {
      const id = window.setInterval(() => {
        setScanTick((t) => (t + 1) % 4);
      }, mood === 'coding' ? 480 : 620);
      return () => window.clearInterval(id);
    }

    if (phase === 'idle') {
      const id = window.setInterval(() => {
        const targets = [
          { x: 0, y: 0 },
          { x: 0.45, y: -0.18 },
          { x: -0.42, y: 0.12 },
          { x: 0.18, y: -0.32 },
          { x: 0, y: 0 },
        ];
        const next = targets[Math.floor(Math.random() * targets.length)];
        setWanderGaze(next);
      }, 2600);
      return () => window.clearInterval(id);
    }

    setWanderGaze({ x: 0, y: 0 });
  }, [phase, mood, prefersReducedMotion]);

  // Playful dance/sing mode smoothly cycles Round -> Oval -> Square in rhythm
  useEffect(() => {
    if (prefersReducedMotion || mood !== 'playful') {
      setPlayfulStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setPlayfulStep((s) => (s + 1) % PLAYFUL_SHAPES.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [mood, prefersReducedMotion]);

  // Active eye shape (playful cycles all 3 shapes unless listening)
  const effectiveShape: EyeShape =
    mood === 'playful' && phase !== 'listening'
      ? PLAYFUL_SHAPES[playfulStep]
      : shape;

  const baseDims = SHAPE_DIMENSIONS[effectiveShape];

  // Calculate live audio reactivity boost (smooth, clamped, zero jitter)
  const liveBoost =
    phase === 'listening'
      ? Math.min(0.14, inputLevel * 0.16)
      : phase === 'speaking'
        ? Math.min(0.13, outputLevel * 0.18)
        : 0;

  // Compute gaze displacement in pixels for specular catchlights
  let pupilX = 0;
  let pupilY = 0;
  if (phase === 'thinking') {
    const seq = [-14, 14, 10, -10];
    pupilX = seq[scanTick];
    pupilY = -14;
  } else if (mood === 'coding') {
    const seq = [-16, -5, 7, 16];
    pupilX = seq[scanTick];
    pupilY = 2;
  } else if (mood === 'sleepy') {
    pupilX = 0;
    pupilY = 12;
  } else if (phase === 'listening') {
    pupilX = gazeOffset.x * 8;
    pupilY = -4 + gazeOffset.y * 6;
  } else {
    pupilX = (gazeOffset.x * 0.65 + wanderGaze.x * 0.55) * 16;
    pupilY = (gazeOffset.y * 0.65 + wanderGaze.y * 0.55) * 12;
  }

  // Whole-face expressive posture (head tilt, bounce, playful sway)
  const rigAnimate = prefersReducedMotion
    ? { x: 0, y: 0, rotate: 0, scale: 1 }
    : mood === 'playful'
      ? {
          x: [0, -12, 0, 12, 0],
          y: [0, -10, 0, -10, 0],
          rotate: [0, -5, 0, 5, 0],
          scale: 1 + liveBoost * 0.5,
        }
      : mood === 'curious'
        ? { x: 0, y: -4, rotate: -6, scale: 1 + liveBoost * 0.45 }
        : mood === 'sleepy'
          ? {
              x: 0,
              y: [0, 6, 0],
              rotate: [-2.5, 2.5, -2.5],
              scale: 0.97,
            }
          : mood === 'surprised'
            ? { x: 0, y: -10, rotate: 0, scale: 1.07 + liveBoost * 0.4 }
            : mood === 'happy'
              ? {
                  x: 0,
                  y: phase === 'speaking' ? -4 - outputLevel * 10 : -5,
                  rotate: 0,
                  scale: 1.02 + liveBoost * 0.5,
                }
              : mood === 'love'
                ? {
                    x: 0,
                    y: -3,
                    rotate: 3,
                    scale: 1.02 + liveBoost * 0.45,
                  }
                : mood === 'serious'
                  ? { x: 0, y: 2, rotate: 0, scale: 1 + liveBoost * 0.25 }
                  : {
                      x: 0,
                      y: phase === 'speaking' ? -outputLevel * 9 : 0,
                      rotate: 0,
                      scale: 1 + liveBoost * 0.5,
                    };

  const rigTransition =
    mood === 'playful'
      ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const }
      : mood === 'sleepy'
        ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const }
        : EYE_SPRING;

  // Eye fill color adapts tastefully to theme + emotional accent
  const useAccentEyeColor =
    mood === 'love' || mood === 'surprised' || (mood === 'playful' && playfulStep === 2);

  // Per-eye geometry & eyelid configuration
  const getEyeConfig = (side: 'left' | 'right') => {
    const isLeft = side === 'left';
    let width = baseDims.width;
    let height = baseDims.height;
    let borderRadius = baseDims.borderRadius;
    let eyeScaleX = 1;
    let eyeScaleY = 1;
    let eyeRotate = 0;
    let upperLidPct = 0; // 0 = open, 100 = fully closed
    let upperLidRotate = 0;
    let lowerCheekPct = 0; // 0 = hidden, 55 = joyful crescent smile

    if (phase === 'listening') {
      eyeScaleX = 1 + inputLevel * 0.09;
      eyeScaleY = 1 + inputLevel * 0.11;
    } else if (phase === 'speaking') {
      eyeScaleX = 1 + outputLevel * 0.06;
      eyeScaleY = 1 + outputLevel * 0.1;
    }

    if (mood === 'happy') {
      lowerCheekPct = 44;
      eyeScaleX *= 1.04;
      eyeScaleY *= 0.96;
    } else if (mood === 'love') {
      lowerCheekPct = 36;
      eyeRotate = isLeft ? -4 : 4;
    } else if (mood === 'coding') {
      upperLidPct = 18;
      if (effectiveShape === 'square') {
        borderRadius = 20;
      }
    } else if (mood === 'serious') {
      upperLidPct = 32;
      upperLidRotate = isLeft ? 14 : -14;
      eyeScaleY *= 0.9;
    } else if (mood === 'sleepy') {
      upperLidPct = 52;
      upperLidRotate = isLeft ? -7 : 7;
      eyeScaleY *= 0.92;
    } else if (mood === 'curious') {
      if (isLeft) {
        eyeScaleX *= 1.08;
        eyeScaleY *= 1.08;
      } else {
        eyeScaleX *= 0.9;
        eyeScaleY *= 0.86;
        upperLidPct = 16;
      }
    } else if (mood === 'surprised') {
      eyeScaleX *= 1.1;
      eyeScaleY *= 1.12;
      if (effectiveShape === 'round') {
        borderRadius = 999;
      }
    }

    if (isBlinking) {
      eyeScaleY = 0.06;
      eyeScaleX *= 1.06;
    }

    return {
      width,
      height,
      borderRadius,
      eyeScaleX,
      eyeScaleY,
      eyeRotate,
      upperLidPct,
      upperLidRotate,
      lowerCheekPct,
    };
  };

  const leftEye = getEyeConfig('left');
  const rightEye = getEyeConfig('right');

  return (
    <div
      className="relative flex items-center justify-center w-full h-[230px] sm:h-[290px] select-none"
      aria-hidden="true"
    >
      {/* Crisp Audio-Reactive Listening Rings (Zero Blur) */}
      <AnimatePresence>
        {phase === 'listening' && !prefersReducedMotion && (
          <motion.div
            key="listen-rings"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: LIQUID_EASE }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: 1 + inputLevel * 0.22,
                opacity: 0.16 + inputLevel * 0.28,
              }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="w-[300px] sm:w-[400px] h-[200px] sm:h-[245px] rounded-full border border-[var(--ac)]"
            />
            <motion.div
              animate={{
                scale: 1.08 + inputLevel * 0.34,
                opacity: 0.08 + inputLevel * 0.18,
              }}
              transition={{ duration: 0.14, ease: 'linear' }}
              className="absolute w-[335px] sm:w-[445px] h-[225px] sm:h-[275px] rounded-full border border-dashed border-[var(--tx)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisp Thinking Orbital Arc (Zero Blur) */}
      <AnimatePresence>
        {(phase === 'thinking' || phase === 'transcribing') && !prefersReducedMotion && (
          <motion.svg
            key="thinking-orbit"
            viewBox="0 0 420 240"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: LIQUID_EASE }}
            className="pointer-events-none absolute w-[320px] sm:w-[430px] h-auto"
          >
            <motion.ellipse
              cx="210"
              cy="120"
              rx="192"
              ry="104"
              fill="none"
              stroke="var(--ac)"
              strokeWidth="1.4"
              strokeDasharray="18 14"
              animate={{ strokeDashoffset: [0, -128] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Speaking Side Waveform Hairlines */}
      <AnimatePresence>
        {phase === 'speaking' && !prefersReducedMotion && (
          <motion.div
            key="speaking-waves"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-between max-w-[440px] sm:max-w-[520px] mx-auto px-3 sm:px-4"
          >
            {[0, 1].map((sideIdx) => (
              <div key={sideIdx} className="flex items-center gap-1.5 h-16">
                {[0.55, 1, 0.7].map((mult, barIdx) => (
                  <motion.span
                    key={barIdx}
                    animate={{
                      scaleY: Math.max(0.22, Math.min(1, 0.24 + outputLevel * mult * 1.1)),
                    }}
                    transition={{ duration: 0.08, ease: 'linear' }}
                    className="w-[3px] h-14 rounded-full bg-[var(--ac)]/55 origin-center"
                  />
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sculptural Eye Pair (Responsive scale preserves exact spring morphing) */}
      <motion.div
        animate={rigAnimate}
        transition={rigTransition}
        className="relative z-10 flex items-center justify-center gap-9 sm:gap-12 scale-[0.74] sm:scale-100 will-change-transform"
      >
        {(
          [
            { side: 'left' as const, cfg: leftEye },
            { side: 'right' as const, cfg: rightEye },
          ]
        ).map(({ side, cfg }) => (
          <div key={side} className="relative flex items-center justify-center">
            {/* Technical Square Corner Reticle Brackets in Coding Mood */}
            <AnimatePresence>
              {mood === 'coding' && effectiveShape === 'square' && (
                <motion.svg
                  key={`brackets-${side}`}
                  viewBox="0 0 160 160"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 0.55, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.28, ease: LIQUID_EASE }}
                  className="pointer-events-none absolute w-[164px] h-[164px]"
                >
                  <path
                    d="M 22 6 H 6 V 22 M 138 6 H 154 V 22 M 6 138 V 154 H 22 M 154 138 V 154 H 138"
                    fill="none"
                    stroke="var(--ac)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>

            {/* The Big Morphing Geometric Eye (Round / Oval / Square) */}
            <motion.div
              animate={{
                width: cfg.width,
                height: cfg.height,
                borderRadius: cfg.borderRadius,
                scaleX: cfg.eyeScaleX,
                scaleY: cfg.eyeScaleY,
                rotate: cfg.eyeRotate,
                backgroundColor: useAccentEyeColor ? 'var(--ac)' : 'var(--tx)',
              }}
              transition={EYE_SPRING}
              className="relative overflow-hidden shadow-[0_22px_48px_-24px_rgba(24,23,21,0.36)] dark:shadow-[0_24px_56px_-20px_rgba(0,0,0,0.75)] will-change-transform"
            >
              {/* Luminous Gaze-Tracking Specular Catchlights */}
              <motion.div
                animate={{
                  x: pupilX,
                  y: pupilY,
                  scale: mood === 'surprised' ? 1.18 : mood === 'sleepy' ? 0.82 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {mood === 'surprised' || mood === 'happy' ? (
                  /* Crisp 4-point star sparkle + companion dot for joyful/surprised commands */
                  <div className="relative -translate-x-4 -translate-y-4">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 36 36"
                      fill="none"
                      className="text-[var(--bg)]"
                    >
                      <path
                        d="M18 3L21.6 14.4L33 18L21.6 21.6L18 33L14.4 21.6L3 18L14.4 14.4L18 3Z"
                        fill="currentColor"
                        opacity="0.92"
                      />
                    </svg>
                    <span className="absolute left-8 top-8 w-3.5 h-3.5 rounded-full bg-[var(--bg)] opacity-75" />
                  </div>
                ) : (
                  /* Sculpted dual specular reflections */
                  <div className="relative -translate-x-4 -translate-y-4">
                    <motion.span
                      animate={{
                        width: effectiveShape === 'square' ? 28 : 30,
                        height: effectiveShape === 'oval' ? 38 : 30,
                        borderRadius: effectiveShape === 'square' ? 8 : 999,
                      }}
                      transition={EYE_SPRING}
                      className="block bg-[var(--bg)] opacity-92"
                    />
                    <motion.span
                      animate={{
                        borderRadius: effectiveShape === 'square' ? 3 : 999,
                      }}
                      transition={EYE_SPRING}
                      className="block w-3 h-3 bg-[var(--bg)] opacity-72 translate-x-7 translate-y-2"
                    />
                  </div>
                )}
              </motion.div>

              {/* Coding Mode Crisp Horizontal Scan Hairline inside Square Eyes */}
              <AnimatePresence>
                {mood === 'coding' && !prefersReducedMotion && (
                  <motion.div
                    key={`scan-${side}`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.18, 0.55, 0.18],
                      y: [-42, 42, -42],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.9,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="pointer-events-none absolute inset-x-3 top-1/2 h-[2px] rounded-full bg-[var(--bg)]"
                  />
                )}
              </AnimatePresence>

              {/* Upper Eyelid Mask (Sleepy / Coding / Serious / Curious) */}
              <motion.div
                initial={false}
                animate={{
                  y: `${cfg.upperLidPct - 102}%`,
                  rotate: cfg.upperLidRotate,
                }}
                transition={LID_SPRING}
                className="pointer-events-none absolute -left-8 -right-8 top-0 h-full bg-[var(--bg)] origin-bottom"
              />

              {/* Lower Curved Cheek Mask (Joyful Crescent Eyes in Happy / Love) */}
              <motion.div
                initial={false}
                animate={{
                  y: `${104 - cfg.lowerCheekPct}%`,
                }}
                transition={LID_SPRING}
                className="pointer-events-none absolute -left-4 -right-4 bottom-0 h-[78%] rounded-t-[100%] bg-[var(--bg)]"
              />
            </motion.div>

            {/* Affectionate Rosy Cheek Accent beneath Eyes in Love Mood */}
            <AnimatePresence>
              {mood === 'love' && (
                <motion.span
                  key={`blush-${side}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 0.35, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.3, ease: LIQUID_EASE }}
                  className={`pointer-events-none absolute -bottom-7 w-9 h-3 rounded-full bg-[var(--ac)] ${
                    side === 'left' ? '-left-2' : '-right-2'
                  }`}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
