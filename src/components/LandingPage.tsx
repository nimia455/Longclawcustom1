import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { LongclawLogo, ModelLogo } from './Icons';
import { HeroChatShowcase } from './HeroChatShowcase';
import { LegalDocType } from './LegalModal';
import { FAMILY_MODELS } from '../lib/models';
import { BenchmarkPage } from './BenchmarkPage';
import { Language, TRANSLATIONS } from '../lib/i18n';
import {
  LIQUID_EASE,
  LIQUID_MORPH,
  LIQUID_SCROLL_SPRING,
  LIQUID_SPRING,
  LIQUID_TAP,
  LIQUID_VIEWPORT,
} from '../lib/motion';

import heroAlpineDawnImg from '../assets/images/hero_alpine_dawn_1795274723327.jpg';
import heroTwilightHorizonImg from '../assets/images/hero_twilight_horizon_1795274724187.jpg';
import studioReasoningImg from '../assets/images/hero_tactile_studio_1795162964599.jpg';
import sculptedDeskImg from '../assets/images/showcase_sculpted_desk_1795162964245.jpg';
import opticalPrismsImg from '../assets/images/showcase_optical_prisms_1795162964901.jpg';

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
        className={`flex flex-col items-center justify-center bg-[var(--surf)] text-[var(--mut)] ${className}`}
        role="img"
        aria-label={alt}
      >
        <LongclawLogo className="w-[34px] h-[34px] opacity-65 mb-2" />
        {fallbackLabel && (
          <span className="text-xs opacity-75 px-4 text-center">{fallbackLabel}</span>
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
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const rawHeroParallaxY = useTransform(
    heroScrollProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 48]
  );
  const heroParallaxY = useSpring(rawHeroParallaxY, LIQUID_SCROLL_SPRING);

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

  const depthProgressScale = depthIdx === 0 ? 0.33 : depthIdx === 1 ? 0.66 : 1;

  return (
    <div className="ambient-canvas relative min-h-screen font-soft text-[var(--tx)] selection:bg-[var(--tx)] selection:text-[var(--bg)]">
      {/* Ultra-subtle fine-art paper grain */}
      <div
        className="ambient-grain pointer-events-none fixed inset-0 z-0 opacity-[0.032] dark:opacity-[0.045]"
        aria-hidden="true"
      />
      {/* Calm Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-[var(--bg)]/72 backdrop-blur-xl border-b border-[var(--bd)]/65">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('top');
            }}
            className="flex items-center gap-2 font-space font-semibold text-base sm:text-[17px] tracking-tight text-[var(--tx)] whitespace-nowrap shrink-0"
          >
            <LongclawLogo className="w-[27px] h-[27px] text-[var(--tx)]" />
            <span>Longclaw</span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--mut)]">
            <button
              type="button"
              onClick={() => navigateToSection('gun')}
              className="nav-underline hover:text-[var(--tx)] transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.whatItDoes}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('modlar')}
              className="nav-underline hover:text-[var(--tx)] transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.depths}
            </button>
            <button
              type="button"
              onClick={openBenchmarks}
              data-active={activePage === 'benchmarks'}
              className={`nav-underline transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'benchmarks'
                  ? 'text-[var(--tx)] font-semibold'
                  : 'hover:text-[var(--tx)]'
              }`}
            >
              {t.nav.benchmarks}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('sss')}
              className="nav-underline hover:text-[var(--tx)] transition-colors py-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.faq}
            </button>
          </nav>

          {/* Utility + Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <div
              role="group"
              aria-label={t.nav.chooseLanguage}
              className="hidden sm:inline-flex items-center gap-1 text-xs shrink-0"
            >
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-1 py-1 transition-colors cursor-pointer whitespace-nowrap ${
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
                className={`px-1 py-1 transition-colors cursor-pointer whitespace-nowrap ${
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer shrink-0"
              aria-label={t.nav.toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('in')}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.nav.signIn}
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('up')}
              className="smooth-btn group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--ac)] text-[var(--on)] hover:opacity-92 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{t.nav.start}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait" initial={false}>
      {activePage === 'benchmarks' ? (
        <motion.div
          key="benchmarks-view"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: LIQUID_EASE }}
          className="relative z-10"
        >
          <BenchmarkPage
            lang={lang}
            onBack={() => navigateToSection('top')}
            onOpenAuth={onOpenAuth}
          />
        </motion.div>
      ) : (
        <motion.main
          key="home-view"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.22, ease: LIQUID_EASE }}
          className="relative z-10"
        >
          {/* HERO: Theme-Adaptive Atmospheric Horizon (Alpine Dawn in Light / Twilight Lake in Dark) */}
          <section
            ref={heroRef}
            id="top"
            className="relative z-10 overflow-hidden border-b border-[var(--bd)]/65"
          >
            <motion.div
              style={{ y: heroParallaxY }}
              className="absolute -inset-y-8 inset-x-0 will-change-transform"
            >
              {/* Light Mode: Sunlit Alpine Dawn Above Clouds */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  theme === 'dark' ? 'opacity-0' : 'opacity-100'
                }`}
                aria-hidden={theme === 'dark'}
              >
                <EditorialPhoto
                  src={heroAlpineDawnImg}
                  alt={l.heroImageAlt}
                  fallbackLabel="Longclaw"
                  className="hero-drift w-full h-full object-cover object-center"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/34 via-[#FAF9F6]/6 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/66 to-transparent"
                  aria-hidden="true"
                />
              </div>

              {/* Dark Mode: Serene Blue-Hour Alpine Lake Reflection */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  theme === 'dark' ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={theme !== 'dark'}
              >
                <EditorialPhoto
                  src={heroTwilightHorizonImg}
                  alt={l.heroImageAlt}
                  fallbackLabel="Longclaw"
                  className="hero-drift w-full h-full object-cover object-center"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-[#111110]/39 via-[#111110]/10 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/74 to-transparent"
                  aria-hidden="true"
                />
              </div>
            </motion.div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="text-xs sm:text-[13px] font-medium text-[var(--tx)]/70 mb-4"
              >
                {l.poweredBy}
              </motion.p>

              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.04, ease: LIQUID_EASE }}
                className="font-soft text-[2.25rem] sm:text-[3.25rem] lg:text-[3.75rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[var(--tx)] text-balance max-w-3xl mx-auto"
              >
                {l.heroTitleLine1}{' '}
                <span className="font-medium italic text-[var(--tx)]">{l.heroTitleLine2}</span>
              </motion.h1>

              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.09, ease: LIQUID_EASE }}
                className="mt-5 text-[15.5px] sm:text-[17.5px] text-[var(--tx)]/82 max-w-xl mx-auto leading-[1.68]"
              >
                {l.heroSubtitle}
              </motion.p>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.14, ease: LIQUID_EASE }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-5"
              >
                <button
                  type="button"
                  onClick={() => onOpenAuth('up')}
                  className="smooth-btn group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--ac)] text-[var(--on)] hover:opacity-94 text-sm font-medium shadow-[0_12px_30px_-10px_rgba(24,23,21,0.32)] cursor-pointer whitespace-nowrap"
                >
                  <span>{l.startFree}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </button>

                <button
                  type="button"
                  onClick={openBenchmarks}
                  className="smooth-btn group inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-[var(--card)]/78 backdrop-blur-xl border border-[var(--bd)]/90 text-sm font-medium text-[var(--tx)] hover:bg-[var(--card)]/95 cursor-pointer whitespace-nowrap"
                >
                  <span>{l.benchmarksCta}</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--mut)] transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </motion.div>

              {/* Restyled Interactive Live Conversation Showcase */}
              <HeroChatShowcase
                conversations={demoConversations}
                badgeLabel={l.heroThinkingBadge}
                lang={lang}
                onTryLongclaw={() => onOpenAuth('up')}
              />
            </div>
          </section>

          {/* SECTION 01: Warm Editorial Capabilities Showcase */}
          <section className="py-16 sm:py-24 border-b border-[var(--bd)]/75">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="max-w-xl mb-10 sm:mb-14"
              >
                <p className="text-xs font-medium text-[var(--mut)] mb-2.5">
                  {l.showcaseEyebrow}
                </p>
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                  {l.showcaseTitle}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <motion.article
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={LIQUID_VIEWPORT}
                  transition={{ duration: 0.38, ease: LIQUID_EASE }}
                  className="smooth-card group rounded-3xl bg-[var(--card)] border border-[var(--bd)] overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/10] bg-[var(--surf)] overflow-hidden">
                    <EditorialPhoto
                      src={studioReasoningImg}
                      alt={l.showcaseCards.reasoningAlt}
                      fallbackLabel={l.showcaseCards.reasoningTitle}
                      className="smooth-photo w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-8 space-y-2.5">
                    <p className="text-xs font-medium text-[var(--mut)]">
                      {l.showcaseCards.reasoningKicker}
                    </p>
                    <h3 className="font-soft text-xl sm:text-2xl font-semibold tracking-tight text-[var(--tx)] text-balance">
                      {l.showcaseCards.reasoningTitle}
                    </h3>
                    <p className="text-[15px] text-[var(--mut)] leading-[1.7]">
                      {l.showcaseCards.reasoningDesc}
                    </p>
                  </div>
                </motion.article>

                <motion.article
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={LIQUID_VIEWPORT}
                  transition={{ duration: 0.38, delay: 0.06, ease: LIQUID_EASE }}
                  className="smooth-card group rounded-3xl bg-[var(--card)] border border-[var(--bd)] overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/10] bg-[var(--surf)] overflow-hidden">
                    <EditorialPhoto
                      src={sculptedDeskImg}
                      alt={l.showcaseCards.codingAlt}
                      fallbackLabel={l.showcaseCards.codingTitle}
                      className="smooth-photo w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 sm:p-8 space-y-2.5">
                    <p className="text-xs font-medium text-[var(--mut)]">
                      {l.showcaseCards.codingKicker}
                    </p>
                    <h3 className="font-soft text-xl sm:text-2xl font-semibold tracking-tight text-[var(--tx)] text-balance">
                      {l.showcaseCards.codingTitle}
                    </h3>
                    <p className="text-[15px] text-[var(--mut)] leading-[1.7]">
                      {l.showcaseCards.codingDesc}
                    </p>
                  </div>
                </motion.article>
              </div>
            </div>
          </section>

          {/* SECTION 02: Longclaw Clawing Model Family */}
          <section className="relative z-10 py-16 sm:py-24 bg-[var(--surf)]/38 backdrop-blur-[2px] border-b border-[var(--bd)]/75">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12"
              >
                <div className="max-w-xl">
                  <p className="text-xs font-medium text-[var(--mut)] mb-2.5">
                    {l.familyEyebrow}
                  </p>
                  <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                    {l.familyTitle}
                  </h2>
                  <p className="mt-3 text-[15px] text-[var(--mut)] leading-relaxed">
                    {l.familySubtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openBenchmarks}
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tx)] hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap self-start md:self-end"
                >
                  <span>{l.compareBenchmarks}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </button>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {FAMILY_MODELS.map((m, idx) => {
                  const localizedModel = t.models[m.id];
                  return (
                    <motion.div
                      key={m.id}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={LIQUID_VIEWPORT}
                      transition={{ duration: 0.34, delay: idx * 0.035, ease: LIQUID_EASE }}
                      className="smooth-card rounded-2xl bg-[var(--card)] border border-[var(--bd)] p-5 sm:p-6 space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <ModelLogo modelId={m.id} className="w-6 h-6 shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-soft text-[15.5px] font-semibold text-[var(--tx)] truncate">
                            {m.name}
                          </h3>
                          <p className="text-xs text-[var(--mut)] truncate">
                            {localizedModel.tagline}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--mut)] leading-[1.68]">
                        {localizedModel.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 03: Three Reasoning Depths */}
          <section id="modlar" className="py-16 sm:py-24 border-b border-[var(--bd)]/75">
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="max-w-2xl mb-10 sm:mb-12"
              >
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] mb-3 text-balance">
                  {l.depthsTitle}
                </h2>
                <p className="text-[var(--mut)] text-[15px] sm:text-base leading-relaxed">
                  {l.depthsSubtitle}
                </p>
              </motion.div>

              {/* Optical Prisms Photography */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.4, ease: LIQUID_EASE }}
                className="group rounded-3xl overflow-hidden border border-[var(--bd)] bg-[var(--surf)] aspect-[21/9] mb-8"
              >
                <EditorialPhoto
                  src={opticalPrismsImg}
                  alt={l.depthsImageAlt}
                  fallbackLabel={l.depthsTitle}
                  className="smooth-photo w-full h-full object-cover object-center"
                />
              </motion.div>

              {/* Depth Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {depthAnswers.map((d, i) => {
                  const active = depthIdx === i;
                  return (
                    <motion.button
                      key={d.title}
                      type="button"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                      transition={LIQUID_TAP}
                      onClick={() => setDepthIdx(i)}
                      className={`relative p-5 rounded-2xl text-left transition-colors cursor-pointer border ${
                        active
                          ? 'border-[var(--tx)]'
                          : 'bg-[var(--surf)]/60 border-[var(--bd)] hover:bg-[var(--card)]/75'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="landing-depth-active-card"
                          transition={LIQUID_MORPH}
                          className="absolute inset-0 rounded-2xl bg-[var(--card)] shadow-[0_14px_30px_-20px_rgba(24,23,21,0.22)]"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative z-10">
                        <div className="font-soft text-base font-semibold text-[var(--tx)] mb-1">
                          {d.title}
                        </div>
                        <p className="text-xs text-[var(--mut)] leading-relaxed">{d.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Live Depth Response Card */}
              <div className="rounded-3xl bg-[var(--card)] border border-[var(--bd)] p-6 sm:p-8 space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[var(--bd)]/75">
                  <p className="font-soft text-base sm:text-lg font-medium text-[var(--tx)]">
                    “{l.depthPrompt}”
                  </p>
                  <span className="text-xs text-[var(--mut)] shrink-0">
                    {depthAnswers[depthIdx].title}
                  </span>
                </div>

                <div className="text-[15px] sm:text-[16px] leading-[1.78] text-[var(--tx)]/90 whitespace-pre-line min-h-[150px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${lang}-${depthIdx}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: LIQUID_EASE }}
                    >
                      {depthAnswers[depthIdx].text}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="pt-4 border-t border-[var(--bd)]/75 flex items-center gap-4">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--surf)] overflow-hidden">
                    <motion.div
                      className="h-full w-full origin-left rounded-full bg-[var(--ac)]"
                      animate={{ scaleX: depthProgressScale }}
                      transition={LIQUID_MORPH}
                    />
                  </div>
                  <span className="text-xs font-mono tabular-nums text-[var(--mut)] shrink-0">
                    0{depthIdx + 1} / 03
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 04: Daily Workflow Timeline */}
          <section id="gun" className="relative z-10 py-16 sm:py-24 bg-[var(--surf)]/38 backdrop-blur-[2px] border-b border-[var(--bd)]/75">
            <div className="max-w-5xl mx-auto px-4 sm:px-8">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="max-w-2xl mb-12"
              >
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                  {l.timelineTitle}
                </h2>
              </motion.div>

              <div className="divide-y divide-[var(--bd)] border-y border-[var(--bd)]">
                {l.timelineItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={LIQUID_VIEWPORT}
                    transition={{ duration: 0.34, delay: idx * 0.04, ease: LIQUID_EASE }}
                    className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start"
                  >
                    <div className="md:col-span-4 space-y-1">
                      <span className="block font-mono text-xs tabular-nums text-[var(--mut)]">
                        {item.time}
                      </span>
                      <h3 className="font-soft text-lg font-semibold text-[var(--tx)]">
                        {item.title}
                      </h3>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      <p className="text-[15px] font-medium text-[var(--tx)] leading-snug">
                        “{item.prompt}”
                      </p>
                      <p className="text-[14.5px] sm:text-[15px] text-[var(--mut)] leading-[1.75] whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 05: The Little Things */}
          <section className="py-16 sm:py-24 border-b border-[var(--bd)]/75">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="lg:col-span-4"
              >
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                  {l.checklistTitle}
                </h2>
              </motion.div>

              <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {l.checklistItems.map((feat, i) => (
                  <motion.li
                    key={i}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={LIQUID_VIEWPORT}
                    transition={{ duration: 0.3, delay: i * 0.025, ease: LIQUID_EASE }}
                    className="flex items-start gap-3 text-[15px] text-[var(--tx)]/88 leading-relaxed"
                  >
                    <Check className="w-4 h-4 text-[var(--tx)] shrink-0 mt-1" />
                    <span>{feat}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 06: FAQ + Quiet Closing CTA */}
          <section id="sss" className="py-16 sm:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-8">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="text-center mb-10 sm:mb-12"
              >
                <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                  {l.faqTitle}
                </h2>
              </motion.div>

              <div className="divide-y divide-[var(--bd)] border-y border-[var(--bd)]">
                {l.faqs.map((faq, i) => {
                  const isOpen = openFaqIdx === i;
                  return (
                    <div key={i}>
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="w-full py-5 text-left font-soft font-medium text-[15.5px] sm:text-base cursor-pointer flex items-center justify-between gap-4 text-[var(--tx)] transition-colors hover:opacity-80"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[var(--mut)] shrink-0 transition-transform duration-200 ease-out ${
                            isOpen ? 'rotate-180 text-[var(--tx)]' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              height: LIQUID_SPRING,
                              opacity: { duration: 0.2, ease: LIQUID_EASE },
                            }}
                            className="overflow-hidden"
                          >
                            <p className="pb-5 text-[14.5px] sm:text-[15px] text-[var(--mut)] leading-[1.72] max-w-2xl">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={LIQUID_VIEWPORT}
                transition={{ duration: 0.36, ease: LIQUID_EASE }}
                className="mt-14 text-center"
              >
                <button
                  type="button"
                  onClick={() => onOpenAuth('up')}
                  className="smooth-btn group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[var(--ac)] text-[var(--on)] hover:opacity-94 font-medium text-sm shadow-[0_14px_32px_-12px_rgba(24,23,21,0.32)] cursor-pointer whitespace-nowrap"
                >
                  <span>{l.getStartedNow}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </button>
              </motion.div>
            </div>
          </section>
        </motion.main>
      )}
      </AnimatePresence>

      {/* Calm Minimal Footer */}
      <footer className="relative z-10 border-t border-[var(--bd)]/75 py-14 sm:py-16 bg-[var(--surf)]/38 backdrop-blur-[2px] text-[var(--mut)] text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 font-space font-semibold text-base tracking-tight text-[var(--tx)] mb-2.5">
              <LongclawLogo className="w-[22px] h-[22px] text-[var(--tx)]" />
              <span>Longclaw</span>
            </div>
            <p className="leading-relaxed mb-5 max-w-xs">{l.footerTagline}</p>

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
                    ? 'text-[var(--tx)] font-semibold'
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
                    ? 'text-[var(--tx)] font-semibold'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                Türkçe
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-soft font-semibold text-[var(--tx)] text-xs mb-3.5">
              {l.footerNavHeading}
            </h5>
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
            <h5 className="font-soft font-semibold text-[var(--tx)] text-xs mb-3.5">
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

        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 border-t border-[var(--bd)]/75 flex flex-wrap items-center justify-between gap-4">
          <span>{l.footerCopyright}</span>
          <span className="inline-flex items-center gap-1.5 font-space">
            <LongclawLogo className="w-[17px] h-[17px] text-[var(--tx)] shrink-0" />
            <span>{l.poweredBy}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
