import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  ArrowRight,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'motion/react';
import { LongclawLogo, ModelLogo } from './Icons';
import { LegalDocType } from './LegalModal';
import { FAMILY_MODELS } from '../lib/models';
import { BenchmarkPage } from './BenchmarkPage';
import { Language, TRANSLATIONS } from '../lib/i18n';

import heroBeachImg from '../assets/images/hero_beach_backdrop_1795172387702.jpg';
import reasoningAtelierImg from '../assets/images/showcase_sculpted_desk_1795162964245.jpg';
import liveCodingImg from '../assets/images/showcase_live_coding_1795115872731.jpg';
import depthsOpticsImg from '../assets/images/showcase_optical_prisms_1795162964901.jpg';

interface LandingPageProps {
  onOpenAuth: (tab: 'in' | 'up') => void;
  onOpenLegal: (type: LegalDocType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
}

interface EditorialPhotoProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

function EditorialPhoto({ src, alt, className = '', fallbackLabel }: EditorialPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-neutral-300 ${className}`}
        role="img"
        aria-label={alt}
      >
        <LongclawLogo className="w-8 h-8 opacity-60 mb-2" />
        {fallbackLabel && (
          <span className="text-xs tracking-wide opacity-70 px-4 text-center">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const;

export function LandingPage({
  onOpenAuth,
  onOpenLegal,
  theme,
  onToggleTheme,
  lang,
  onChangeLang,
}: LandingPageProps) {
  const t = TRANSLATIONS[lang];
  const l = t.landing;
  const demoConversations = l.demoConversations;
  const depthAnswers = l.depthAnswers;
  const prefersReducedMotion = useReducedMotion();

  const [convIdx, setConvIdx] = useState(0);
  const [displayedQ, setDisplayedQ] = useState('');
  const [displayedA, setDisplayedA] = useState('');
  const [depthIdx, setDepthIdx] = useState(1);
  const [activePage, setActivePage] = useState<'home' | 'benchmarks'>('home');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const openBenchmarks = () => {
    setActivePage('benchmarks');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToSection = (sectionId: string) => {
    setActivePage('home');
    setTimeout(() => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 30);
  };

  useEffect(() => {
    let isCancelled = false;

    if (prefersReducedMotion) {
      const current = demoConversations[convIdx % demoConversations.length];
      setDisplayedQ(current.q);
      setDisplayedA(current.a);
      return;
    }

    const runTypewriter = async () => {
      const current = demoConversations[convIdx % demoConversations.length];
      setDisplayedQ(current.q);
      setDisplayedA('');

      await new Promise((r) => setTimeout(r, 520));
      if (isCancelled) return;

      for (let i = 0; i <= current.a.length; i++) {
        if (isCancelled) return;
        setDisplayedA(current.a.slice(0, i));
        await new Promise((r) => setTimeout(r, 22));
      }

      await new Promise((r) => setTimeout(r, 3400));
      if (isCancelled) return;

      setConvIdx((prev) => (prev + 1) % demoConversations.length);
    };

    runTypewriter();

    return () => {
      isCancelled = true;
    };
  }, [convIdx, lang, prefersReducedMotion, demoConversations]);

  const depthProgressScale = depthIdx === 0 ? 0.33 : depthIdx === 1 ? 0.66 : 1;

  return (
    <div className="relative isolate min-h-screen font-soft text-[var(--tx)] selection:bg-[var(--tx)] selection:text-[var(--bg)]">
      {/* Full-Page Fixed Coastal Beach Background */}
      <div className="fixed inset-0 -z-30 pointer-events-none" aria-hidden="true">
        <EditorialPhoto
          src={heroBeachImg}
          alt={l.heroImageAlt}
          fallbackLabel="Longclaw Beach"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-white/82 dark:bg-black/84 backdrop-blur-[2px]" />
      </div>

      {/* Clean Top Navigation Bar */}
      <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--bd)] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('top');
            }}
            className="flex items-center gap-2 font-space font-semibold text-[15px] sm:text-lg tracking-tight text-[var(--tx)] whitespace-nowrap shrink-0"
          >
            <LongclawLogo className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
            <span>Longclaw</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--mut)]">
            <button
              type="button"
              onClick={() => navigateToSection('gun')}
              className="hover:text-[var(--tx)] transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.whatItDoes}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('modlar')}
              className="hover:text-[var(--tx)] transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.depths}
            </button>
            <button
              type="button"
              onClick={openBenchmarks}
              className={`transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'benchmarks'
                  ? 'text-[var(--tx)] underline underline-offset-4'
                  : 'hover:text-[var(--tx)]'
              }`}
            >
              {t.nav.benchmarks}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('sss')}
              className="hover:text-[var(--tx)] transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.faq}
            </button>
          </nav>

          {/* Unboxed Utility Controls + Single Primary CTA */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <div
              role="group"
              aria-label={t.nav.chooseLanguage}
              className="inline-flex items-center gap-1 text-xs tracking-wide shrink-0"
            >
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-1 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  lang === 'en'
                    ? 'text-[var(--tx)] font-semibold'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                EN
              </button>
              <span className="text-[var(--bd)] select-none" aria-hidden="true">
                /
              </span>
              <button
                type="button"
                onClick={() => onChangeLang('tr')}
                aria-pressed={lang === 'tr'}
                className={`px-1 py-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  lang === 'tr'
                    ? 'text-[var(--tx)] font-semibold'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                TR
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)]/75 transition-colors cursor-pointer shrink-0"
              aria-label={t.nav.toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('in')}
              className="hidden sm:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.nav.signIn}
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('up')}
              className="btn-3d-primary inline-flex items-center gap-1.5 px-4 sm:px-4.5 py-2 rounded-full text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{t.nav.start}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {activePage === 'benchmarks' ? (
        <BenchmarkPage
          lang={lang}
          onBack={() => navigateToSection('top')}
          onOpenAuth={onOpenAuth}
        />
      ) : (
        <main>
          {/* Hero: Full-Bleed Beach Backdrop */}
          <section
            id="top"
            className="relative isolate min-h-[78svh] sm:min-h-[84vh] flex flex-col justify-center pt-14 sm:pt-24 pb-20 sm:pb-28 overflow-hidden bg-black text-white"
          >
            {/* Full-Bleed Beach Photograph */}
            <div className="absolute inset-0 -z-20" aria-hidden="true">
              <EditorialPhoto
                src={heroBeachImg}
                alt={l.heroImageAlt}
                fallbackLabel="Longclaw Beach"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Measured Monochrome Contrast Scrim over Beach */}
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-b from-black/52 via-black/38 to-black/72 pointer-events-none"
              aria-hidden="true"
            />

            {/* Soft Transition into Lower Sections */}
            <div
              className="absolute inset-x-0 bottom-0 h-20 sm:h-28 -z-10 bg-gradient-to-t from-[var(--bg)]/90 via-[var(--bg)]/35 to-transparent pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-xs sm:text-[13px] font-medium text-white/75 mb-4">
                  {l.poweredBy}
                </p>

                <h1 className="font-soft text-[2.25rem] sm:text-[3.5rem] lg:text-[4rem] font-semibold tracking-tight leading-[1.1] text-white text-balance">
                  {l.heroTitleLine1} <br className="hidden sm:inline" />
                  <em className="font-serif-fraunces italic font-normal">{l.heroTitleLine2}</em>
                </h1>

                <p className="mt-5 text-[15.5px] sm:text-[17px] text-white/85 max-w-xl mx-auto leading-[1.7]">
                  {l.heroSubtitle}
                </p>

                <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-7">
                  <button
                    type="button"
                    onClick={() => onOpenAuth('up')}
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-white text-black hover:bg-neutral-200 active:scale-[0.985] transition-all font-medium text-[15px] cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <span>{l.startFree}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={openBenchmarks}
                    className="group inline-flex items-center gap-2 py-2 text-[15px] font-medium text-white/85 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span className="border-b border-white/35 group-hover:border-white pb-0.5 transition-colors">
                      {l.benchmarksCta}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Quiet Sample Conversation Over the Background */}
              <div className="mt-12 sm:mt-16 max-w-2xl mx-auto rounded-2xl p-5 sm:p-7 bg-black/65 backdrop-blur-md border border-white/15">
                <div className="flex items-center justify-between gap-4 pb-3.5 mb-5 border-b border-white/15">
                  <div className="flex items-center gap-2 text-xs text-white/75 min-w-0">
                    <LongclawLogo className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate font-medium">{l.heroThinkingBadge}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {demoConversations.map((_, idx) => {
                      const active = convIdx % demoConversations.length === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setConvIdx(idx)}
                          className={`py-0.5 text-xs font-mono tabular-nums transition-colors cursor-pointer border-b ${
                            active
                              ? 'text-white font-semibold border-white'
                              : 'text-white/55 hover:text-white/85 border-transparent'
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3.5 min-h-[138px] sm:min-h-[144px]">
                  <AnimatePresence mode="wait">
                    {displayedQ && (
                      <motion.p
                        key={`${lang}-q-${convIdx % demoConversations.length}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-serif-fraunces italic text-lg sm:text-[1.25rem] leading-snug text-white"
                      >
                        “{displayedQ}”
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <p className="text-[15px] leading-[1.75] text-white/90 min-h-[4.2em]">
                    {displayedA}
                    <span className="inline-block w-[1.5px] h-[1em] ml-0.5 bg-white/80 align-[-0.15em] animate-[blink_1s_steps(1)_infinite]" />
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Editorial Photographic Spread — Borderless Photos with Open Typography Beneath */}
          <section className="py-14 sm:py-32">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 'some' }}
                transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
                className="max-w-xl mb-8 sm:mb-16"
              >
                <p className="text-xs font-medium text-[var(--mut)] mb-2.5">
                  {l.showcaseEyebrow}
                </p>
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                  {l.showcaseTitle}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
                {/* Feature 01: Visible Reasoning */}
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                  className="lg:col-span-7 group"
                >
                  <div className="photo-frame-3d overflow-hidden rounded-2xl bg-[var(--surf)] aspect-[4/3]">
                    <EditorialPhoto
                      src={reasoningAtelierImg}
                      alt={l.showcaseCards.reasoningAlt}
                      fallbackLabel={l.showcaseCards.reasoningTitle}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 max-w-lg">
                    <p className="text-xs font-medium text-[var(--mut)] mb-1.5">
                      {l.showcaseCards.reasoningKicker}
                    </p>
                    <h3 className="font-serif-fraunces text-xl sm:text-2xl font-semibold tracking-tight text-[var(--tx)] text-balance">
                      {l.showcaseCards.reasoningTitle}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-[var(--mut)] leading-[1.72]">
                      {l.showcaseCards.reasoningDesc}
                    </p>
                  </div>
                </motion.article>

                {/* Feature 02: Live Code Preview */}
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.6, delay: 0.08, ease: EASE_EDITORIAL }}
                  className="lg:col-span-5 lg:mt-16 group"
                >
                  <div className="photo-frame-3d overflow-hidden rounded-2xl bg-[var(--surf)] aspect-[4/3]">
                    <EditorialPhoto
                      src={liveCodingImg}
                      alt={l.showcaseCards.codingAlt}
                      fallbackLabel={l.showcaseCards.codingTitle}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <p className="text-xs font-medium text-[var(--mut)] mb-1.5">
                      {l.showcaseCards.codingKicker}
                    </p>
                    <h3 className="font-serif-fraunces text-xl sm:text-2xl font-semibold tracking-tight text-[var(--tx)] text-balance">
                      {l.showcaseCards.codingTitle}
                    </h3>
                    <p className="mt-2.5 text-[15px] text-[var(--mut)] leading-[1.72]">
                      {l.showcaseCards.codingDesc}
                    </p>
                  </div>
                </motion.article>
              </div>
            </div>
          </section>

          {/* Longclaw Clawing Models — Sculpted Tactile Slabs */}
          <section className="py-14 sm:py-28 border-t border-[var(--bd)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9 sm:mb-14">
                <div>
                  <p className="text-xs font-medium text-[var(--mut)] mb-2.5">
                    {l.familyEyebrow}
                  </p>
                  <h2 className="font-serif-fraunces text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                    {l.familyTitle}
                  </h2>
                </div>
                <p className="text-[15px] text-[var(--mut)] max-w-sm leading-relaxed">
                  {l.familySubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {FAMILY_MODELS.map((m, idx) => {
                  const localizedModel = t.models[m.id];
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 'some' }}
                      transition={{
                        duration: 0.45,
                        delay: idx * 0.06,
                        ease: EASE_EDITORIAL,
                      }}
                      className="pt-5 border-t border-[var(--bd)] flex flex-col gap-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <ModelLogo modelId={m.id} className="w-4.5 h-4.5 shrink-0" />
                        <h3 className="font-soft text-[15px] font-semibold text-[var(--tx)] leading-snug">
                          {m.name}
                        </h3>
                      </div>
                      <p className="text-xs font-medium text-[var(--mut)]">
                        {localizedModel.tagline}
                      </p>
                      <p className="text-sm text-[var(--mut)] leading-[1.7] mt-0.5">
                        {localizedModel.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-12 sm:mt-14 pt-6 border-t border-[var(--bd)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-[var(--mut)]">{l.compareBenchmarks}</p>
                <button
                  type="button"
                  onClick={openBenchmarks}
                  className="group inline-flex items-center gap-2 py-1 text-sm font-medium text-[var(--tx)] cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  <span className="border-b border-[var(--tx)]/35 group-hover:border-[var(--tx)] pb-0.5 transition-colors">
                    {l.benchmarksCta}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Same Question, Three Depths — Borderless Panorama + Underline Tabs */}
          <section id="modlar" className="py-14 sm:py-32 border-t border-[var(--bd)]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 'some' }}
                transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
                className="max-w-xl mb-8 sm:mb-14"
              >
                <h2 className="font-soft text-3xl sm:text-5xl font-semibold tracking-tight mb-3 sm:mb-4 text-balance">
                  {l.depthsTitle}
                </h2>
                <p className="text-[var(--mut)] text-[15px] sm:text-base leading-relaxed">
                  {l.depthsSubtitle}
                </p>
              </motion.div>

              {/* Calm Optical Panorama */}
              <div className="photo-frame-3d relative rounded-2xl overflow-hidden bg-[var(--surf)] aspect-[21/9] sm:aspect-[24/9]">
                <EditorialPhoto
                  src={depthsOpticsImg}
                  alt={l.depthsImageAlt}
                  fallbackLabel={l.depthsTitle}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Prompt set openly beneath the photograph */}
              <div className="mt-6 sm:mt-8 mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <p className="font-serif-fraunces italic text-xl sm:text-2xl text-[var(--tx)]">
                  “{l.depthPrompt}”
                </p>
                <span className="text-xs text-[var(--mut)] shrink-0">
                  {depthAnswers[depthIdx].title} · {depthAnswers[depthIdx].desc}
                </span>
              </div>

              {/* Open Editorial Interactive Depth Switcher — Zero Card Boxes */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14 items-start">
                <div>
                  {/* Clean Hairline Underline Tabs */}
                  <div className="flex items-center gap-7 border-b border-[var(--bd)] mb-7 overflow-x-auto no-scrollbar">
                    {depthAnswers.map((d, i) => {
                      const active = depthIdx === i;
                      return (
                        <button
                          key={d.title}
                          type="button"
                          onClick={() => setDepthIdx(i)}
                          className={`relative pb-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            active
                              ? 'text-[var(--tx)]'
                              : 'text-[var(--mut)] hover:text-[var(--tx)]'
                          }`}
                        >
                          <span>{d.title}</span>
                          {active && (
                            <motion.span
                              layoutId="landingDepthUnderline"
                              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                              className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-[var(--tx)]"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[16px] sm:text-[17px] leading-[1.8] text-[var(--tx)] whitespace-pre-line min-h-[145px] sm:min-h-[160px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${lang}-${depthIdx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: EASE_EDITORIAL }}
                      >
                        {depthAnswers[depthIdx].text}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Minimal Hairline Progress Rule */}
                  <div className="w-full h-[2px] bg-[var(--bd)]/75 mt-8 overflow-hidden">
                    <motion.div
                      className="h-full w-full bg-[var(--tx)] origin-left"
                      animate={{ scaleX: depthProgressScale }}
                      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
                    />
                  </div>
                </div>

                {/* Open Hairline Mode Index */}
                <div className="divide-y divide-[var(--bd)] border-y border-[var(--bd)]">
                  {depthAnswers.map((d, i) => {
                    const active = depthIdx === i;
                    return (
                      <button
                        key={d.title}
                        type="button"
                        onClick={() => setDepthIdx(i)}
                        className="w-full py-4 text-left transition-colors cursor-pointer group flex items-start justify-between gap-3"
                      >
                        <div>
                          <span
                            className={`font-soft text-[15px] block mb-1 transition-colors ${
                              active
                                ? 'font-semibold text-[var(--tx)]'
                                : 'font-medium text-[var(--mut)] group-hover:text-[var(--tx)]'
                            }`}
                          >
                            {d.title}
                          </span>
                          <span className="text-xs text-[var(--mut)] leading-relaxed block">
                            {d.desc}
                          </span>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 shrink-0 mt-1 transition-all duration-200 ${
                            active
                              ? 'text-[var(--tx)] opacity-100 translate-x-0'
                              : 'text-[var(--mut)] opacity-0 -translate-x-1 group-hover:opacity-65 group-hover:translate-x-0'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Daily Timeline — Open Prose Directly on the Page, Separated by Hairlines */}
          <section id="gun" className="py-14 sm:py-32 border-t border-[var(--bd)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 'some' }}
                transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
                className="font-soft text-3xl sm:text-5xl font-semibold tracking-tight mb-9 sm:mb-20 text-balance"
              >
                {l.timelineTitle}
              </motion.h2>

              <div className="divide-y divide-[var(--bd)] border-y border-[var(--bd)]">
                {l.timelineItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 'some' }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(idx * 0.04, 0.16),
                      ease: EASE_EDITORIAL,
                    }}
                    className="py-9 sm:py-11 grid grid-cols-1 md:grid-cols-[110px_1fr] gap-3 sm:gap-8 items-start"
                  >
                    <span className="font-mono text-xs sm:text-sm text-[var(--mut)] tabular-nums pt-1">
                      {item.time}
                    </span>

                    <div className="space-y-3.5 max-w-2xl">
                      <h3 className="font-soft text-xl sm:text-2xl font-semibold tracking-tight">
                        {item.title}
                      </h3>

                      <p className="font-serif-fraunces italic text-[15px] sm:text-base text-[var(--mut)]">
                        {item.prompt}
                      </p>

                      <div className="pt-1 text-[15px] leading-[1.75] text-[var(--tx)]/90 whitespace-pre-line">
                        <span className="block text-[11px] font-medium text-[var(--mut)] mb-1">
                          Longclaw
                        </span>
                        {item.answer}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* The Little Things — Clean Open 2-Column Editorial List (No Fake Mockup Box) */}
          <section className="py-14 sm:py-28 border-t border-[var(--bd)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              <div className="lg:col-span-4">
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
                  {l.checklistTitle}
                </h2>
              </div>

              <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                {l.checklistItems.map((feat, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 'some' }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(i * 0.03, 0.24),
                      ease: EASE_EDITORIAL,
                    }}
                    className="flex items-start gap-3 py-4 border-t border-[var(--bd)] text-[15px] text-[var(--tx)]/90 leading-relaxed"
                  >
                    <Check className="w-4 h-4 text-[var(--mut)] shrink-0 mt-1" />
                    <span>{feat}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          {/* FAQ — Classic Editorial Hairline Accordion, Zero Card Boxes */}
          <section id="sss" className="py-14 sm:py-32 border-t border-[var(--bd)]">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-tight mb-8 sm:mb-12 text-balance">
                {l.faqTitle}
              </h2>

              <div className="divide-y divide-[var(--bd)] border-y border-[var(--bd)]">
                {l.faqs.map((faq, i) => {
                  const isOpen = openFaqIdx === i;
                  return (
                    <div key={i}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="w-full py-5 text-left font-medium text-[15px] sm:text-base cursor-pointer flex items-center justify-between gap-4 text-[var(--tx)] hover:opacity-80 transition-opacity"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[var(--mut)] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
                            className="overflow-hidden"
                          >
                            <p className="pb-5 text-[14.5px] sm:text-[15px] text-[var(--mut)] leading-[1.72] max-w-xl">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 sm:mt-16">
                <button
                  type="button"
                  onClick={() => onOpenAuth('up')}
                  className="btn-3d-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm cursor-pointer whitespace-nowrap"
                >
                  <span>{l.getStartedNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Footer — Unboxed Language Links & Calm Columns */}
      <footer className="border-t border-[var(--bd)] py-14 sm:py-16 bg-[var(--bg)]/88 backdrop-blur-md text-[var(--mut)] text-xs">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 font-space font-bold text-lg text-[var(--tx)] mb-2.5">
              <LongclawLogo className="w-5 h-5" />
              <span>Longclaw</span>
            </div>
            <p className="leading-relaxed mb-5 max-w-xs">{l.footerTagline}</p>

            {/* Unboxed Editorial Language Switcher */}
            <div
              role="group"
              aria-label={t.nav.chooseLanguage}
              className="inline-flex items-center gap-2.5 text-xs"
            >
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                aria-pressed={lang === 'en'}
                className={`py-0.5 transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'text-[var(--tx)] font-semibold underline underline-offset-4'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                English
              </button>
              <span className="text-[var(--bd)] select-none" aria-hidden="true">
                /
              </span>
              <button
                type="button"
                onClick={() => onChangeLang('tr')}
                aria-pressed={lang === 'tr'}
                className={`py-0.5 transition-colors cursor-pointer ${
                  lang === 'tr'
                    ? 'text-[var(--tx)] font-semibold underline underline-offset-4'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                Türkçe
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[var(--tx)] text-xs mb-3.5">{l.footerNavHeading}</h5>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigateToSection('top')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerBackToTop}
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('gun')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {t.nav.whatItDoes}
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('modlar')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {t.nav.depths}
              </button>
              <button
                type="button"
                onClick={openBenchmarks}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.benchmarksCta}
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('sss')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {t.nav.faq}
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[var(--tx)] text-xs mb-3.5">
              {l.footerLegalHeading}
            </h5>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenLegal('gizlilik')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerPrivacy}
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('sartlar')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerTerms}
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('kvkk')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerKvkk}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-8 border-t border-[var(--bd)] flex flex-wrap items-center justify-between gap-4">
          <span>{l.footerCopyright}</span>
          <span className="inline-flex items-center gap-1.5">
            <LongclawLogo className="w-3.5 h-3.5 shrink-0" />
            <span>{l.poweredBy}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
