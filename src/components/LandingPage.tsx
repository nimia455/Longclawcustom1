import React, { useEffect, useState, useRef } from 'react';
import {
  Sun,
  Moon,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import type { User } from 'firebase/auth';
import { LongclawLogo } from './Icons';
import { HeroChatShowcase } from './HeroChatShowcase';
import { DepthsShowcase } from './DepthsShowcase';
import {
  AnimatedCheckItem,
  EditorialPhoto,
  MaskedReveal,
  ParallaxShowcaseCard,
  ScrollMotifClosingCta,
  ScrollTimeline,
  SpotlightModelCard,
} from './LandingMotion';
import { LegalDocType } from './LegalModal';
import { FAMILY_MODELS } from '../lib/models';
import { BenchmarkPage } from './BenchmarkPage';
import { ApiPortal } from './ApiPortal';
import { Language, TRANSLATIONS } from '../lib/i18n';
import {
  EDITORIAL_EASE,
  EDITORIAL_VIEWPORT,
  LIQUID_EASE,
  LIQUID_MORPH,
  LIQUID_SCROLL_SPRING,
  LIQUID_SPRING,
  LIQUID_TAP,
  PROGRESS_SCROLL_SPRING,
} from '../lib/motion';

import heroAlpineDawnImg from '../assets/images/hero_alpine_dawn_1795274723327.jpg';
import heroTwilightHorizonImg from '../assets/images/hero_twilight_horizon_1795274724187.jpg';
import studioReasoningImg from '../assets/images/hero_tactile_studio_1795162964599.jpg';
import sculptedDeskImg from '../assets/images/showcase_sculpted_desk_1795162964245.jpg';

interface LandingPageProps {
  user?: User | null;
  onOpenAuth: (tab: 'in' | 'up') => void;
  onOpenLegal: (type: LegalDocType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
}

type NavTarget = 'top' | 'gun' | 'modlar' | 'sss' | 'benchmarks' | 'api';

export function LandingPage({
  user = null,
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

  const [activePage, setActivePage] = useState<'home' | 'benchmarks' | 'api'>('home');
  const [activeSection, setActiveSection] = useState<'top' | 'gun' | 'modlar' | 'sss'>('top');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Page-wide scroll reading hairline
  const { scrollYProgress: pageScrollProgress } = useScroll();
  const smoothPageProgress = useSpring(pageScrollProgress, PROGRESS_SCROLL_SPRING);

  // Hero scroll-linked atmospheric parallax + gentle copy recession
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const rawHeroParallaxY = useTransform(
    heroScrollProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 64]
  );
  const rawHeroScale = useTransform(
    heroScrollProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1, 1.07]
  );
  const rawHeroHeaderY = useTransform(
    heroScrollProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -24]
  );
  const heroParallaxY = useSpring(rawHeroParallaxY, LIQUID_SCROLL_SPRING);
  const heroParallaxScale = useSpring(rawHeroScale, LIQUID_SCROLL_SPRING);
  const heroHeaderY = useSpring(rawHeroHeaderY, LIQUID_SCROLL_SPRING);

  // Lightweight scroll-spy for gliding top-bar active indicator
  useEffect(() => {
    if (activePage !== 'home' || typeof window === 'undefined') return;
    const sectionIds: Array<'top' | 'modlar' | 'gun' | 'sss'> = ['top', 'modlar', 'gun', 'sss'];
    const observed = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (observed.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          const id = visible[0].target.id as 'top' | 'modlar' | 'gun' | 'sss';
          setActiveSection(id);
        }
      },
      { rootMargin: '-28% 0px -48% 0px', threshold: [0.05, 0.25, 0.5] }
    );

    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activePage]);

  const openBenchmarks = () => {
    setActivePage('benchmarks');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openApiPortal = () => {
    setActivePage('api');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToSection = (sectionId: 'top' | 'gun' | 'modlar' | 'sss') => {
    setActivePage('home');
    setActiveSection(sectionId);
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

  const activeNavKey: NavTarget =
    activePage === 'benchmarks'
      ? 'benchmarks'
      : activePage === 'api'
        ? 'api'
        : activeSection;

  const navItems: Array<{
    key: NavTarget;
    label: string;
    onClick: () => void;
  }> = [
    { key: 'gun', label: t.nav.whatItDoes, onClick: () => navigateToSection('gun') },
    { key: 'modlar', label: t.nav.depths, onClick: () => navigateToSection('modlar') },
    { key: 'benchmarks', label: t.nav.benchmarks, onClick: openBenchmarks },
    { key: 'api', label: t.nav.api, onClick: openApiPortal },
    { key: 'sss', label: t.nav.faq, onClick: () => navigateToSection('sss') },
  ];

  return (
    <div className="ambient-canvas relative min-h-screen font-soft text-[var(--tx)] selection:bg-[var(--tx)] selection:text-[var(--bg)]">
      {/* Ultra-subtle fine-art paper grain */}
      <div
        className="ambient-grain pointer-events-none fixed inset-0 z-0 opacity-[0.032] dark:opacity-[0.045]"
        aria-hidden="true"
      />

      {/* Calm Minimal Top Navigation Bar with Scroll Progress & Gliding Active Indicator */}
      <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-[var(--bg)]/76 backdrop-blur-xl border-b border-[var(--bd)]/65">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Wordmark */}
          <motion.a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('top');
            }}
            whileHover={prefersReducedMotion ? undefined : { x: 1 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            transition={LIQUID_TAP}
            className="group flex items-center gap-2 font-space font-semibold text-base sm:text-[17px] tracking-tight text-[var(--tx)] whitespace-nowrap shrink-0"
          >
            <span className="inline-flex transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-105">
              <LongclawLogo className="w-[27px] h-[27px] text-[var(--tx)]" />
            </span>
            <span>Longclaw</span>
          </motion.a>

          {/* Navigation Links with Shared-Layout Gliding Underline */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--mut)]">
            {navItems.map((item) => {
              const isActive = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--tx)] font-semibold'
                      : 'hover:text-[var(--tx)]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="landing-nav-underline"
                      transition={LIQUID_MORPH}
                      className="absolute inset-x-0 -bottom-0.5 h-[1.5px] rounded-full bg-[var(--ac)]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
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

            <motion.button
              type="button"
              onClick={onToggleTheme}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
              transition={LIQUID_TAP}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer shrink-0 overflow-hidden"
              aria-label={t.nav.toggleTheme}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={prefersReducedMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: LIQUID_EASE }}
                  className="inline-flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <button
              type="button"
              onClick={() => onOpenAuth('in')}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.nav.signIn}
            </button>

            <motion.button
              type="button"
              onClick={() => onOpenAuth('up')}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={LIQUID_TAP}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--ac)] text-[var(--on)] hover:opacity-92 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap shrink-0 transition-opacity"
            >
              <span>{t.nav.start}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.button>
          </div>
        </div>

        {/* Razor-Thin Scroll Reading Progress Hairline */}
        {activePage === 'home' && !prefersReducedMotion && (
          <motion.div
            style={{ scaleX: smoothPageProgress }}
            className="h-[1.5px] w-full bg-[var(--ac)]/65 origin-left will-change-transform"
            aria-hidden="true"
          />
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {activePage === 'benchmarks' ? (
          <motion.div
            key="benchmarks-view"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
            className="relative z-10"
          >
            <BenchmarkPage
              lang={lang}
              onBack={() => navigateToSection('top')}
              onOpenAuth={onOpenAuth}
            />
          </motion.div>
        ) : activePage === 'api' ? (
          <motion.div
            key="api-view"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
            className="relative z-10"
          >
            <ApiPortal
              user={user}
              lang={lang}
              mode="page"
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
            transition={{ duration: 0.24, ease: LIQUID_EASE }}
            className="relative z-10"
          >
            {/* HERO: Theme-Adaptive Atmospheric Horizon (Alpine Dawn in Light / Twilight Lake in Dark) */}
            <section
              ref={heroRef}
              id="top"
              className="relative z-10 overflow-hidden border-b border-[var(--bd)]/65"
            >
              <motion.div
                style={{ y: heroParallaxY, scale: heroParallaxScale }}
                className="absolute -inset-y-10 inset-x-0 will-change-transform"
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
                <motion.div style={{ y: heroHeaderY }} className="will-change-transform">
                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.48, ease: EDITORIAL_EASE }}
                    className="text-xs sm:text-[13px] font-medium text-[var(--tx)]/72 mb-4 tracking-wide"
                  >
                    {l.poweredBy}
                  </motion.p>

                  <h1 className="font-soft text-[2.25rem] sm:text-[3.25rem] lg:text-[3.75rem] font-semibold tracking-[-0.03em] leading-[1.08] text-[var(--tx)] text-balance max-w-3xl mx-auto">
                    <MaskedReveal delay={0.04}>{l.heroTitleLine1}</MaskedReveal>
                    <MaskedReveal delay={0.12}>
                      <span className="font-medium italic text-[var(--tx)]">
                        {l.heroTitleLine2}
                      </span>
                    </MaskedReveal>
                  </h1>

                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.54, delay: 0.18, ease: EDITORIAL_EASE }}
                    className="mt-5 text-[15.5px] sm:text-[17.5px] text-[var(--tx)]/82 max-w-xl mx-auto leading-[1.68]"
                  >
                    {l.heroSubtitle}
                  </motion.p>

                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.52, delay: 0.24, ease: EDITORIAL_EASE }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-5"
                  >
                    <motion.button
                      type="button"
                      onClick={() => onOpenAuth('up')}
                      whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.015 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.975 }}
                      transition={LIQUID_TAP}
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--ac)] text-[var(--on)] hover:opacity-95 text-sm font-medium shadow-[0_12px_30px_-10px_rgba(24,23,21,0.32)] cursor-pointer whitespace-nowrap transition-opacity"
                    >
                      <span>{l.startFree}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={openBenchmarks}
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                      transition={LIQUID_TAP}
                      className="group inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-[var(--card)]/78 backdrop-blur-xl border border-[var(--bd)]/90 text-sm font-medium text-[var(--tx)] hover:bg-[var(--card)]/96 cursor-pointer whitespace-nowrap transition-colors"
                    >
                      <span>{l.benchmarksCta}</span>
                      <ArrowUpRight className="w-4 h-4 text-[var(--mut)] transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Interactive Live Conversation Showcase */}
                <HeroChatShowcase
                  conversations={demoConversations}
                  badgeLabel={l.heroThinkingBadge}
                  lang={lang}
                  onTryLongclaw={() => onOpenAuth('up')}
                />
              </div>
            </section>

            {/* SECTION 01: Warm Editorial Capabilities Showcase (Scroll-Linked Photo Parallax) */}
            <section className="py-16 sm:py-24 border-b border-[var(--bd)]/75">
              <div className="max-w-6xl mx-auto px-4 sm:px-8">
                <div className="max-w-xl mb-10 sm:mb-14">
                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={EDITORIAL_VIEWPORT}
                    transition={{ duration: 0.42, ease: EDITORIAL_EASE }}
                    className="text-xs font-medium text-[var(--mut)] mb-2.5"
                  >
                    {l.showcaseEyebrow}
                  </motion.p>
                  <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                    <MaskedReveal inView delay={0.04}>
                      {l.showcaseTitle}
                    </MaskedReveal>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <ParallaxShowcaseCard
                    src={studioReasoningImg}
                    alt={l.showcaseCards.reasoningAlt}
                    kicker={l.showcaseCards.reasoningKicker}
                    title={l.showcaseCards.reasoningTitle}
                    desc={l.showcaseCards.reasoningDesc}
                    delay={0}
                  />
                  <ParallaxShowcaseCard
                    src={sculptedDeskImg}
                    alt={l.showcaseCards.codingAlt}
                    kicker={l.showcaseCards.codingKicker}
                    title={l.showcaseCards.codingTitle}
                    desc={l.showcaseCards.codingDesc}
                    delay={0.08}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 02: Longclaw Clawing Model Family (Interactive Spotlight Grid) */}
            <section className="relative z-10 py-16 sm:py-24 bg-[var(--surf)]/38 backdrop-blur-[2px] border-b border-[var(--bd)]/75">
              <div className="max-w-6xl mx-auto px-4 sm:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 sm:mb-12">
                  <div className="max-w-xl">
                    <motion.p
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={EDITORIAL_VIEWPORT}
                      transition={{ duration: 0.42, ease: EDITORIAL_EASE }}
                      className="text-xs font-medium text-[var(--mut)] mb-2.5"
                    >
                      {l.familyEyebrow}
                    </motion.p>
                    <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                      <MaskedReveal inView delay={0.04}>
                        {l.familyTitle}
                      </MaskedReveal>
                    </h2>
                    <motion.p
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={EDITORIAL_VIEWPORT}
                      transition={{ duration: 0.46, delay: 0.1, ease: EDITORIAL_EASE }}
                      className="mt-3 text-[15px] text-[var(--mut)] leading-relaxed"
                    >
                      {l.familySubtitle}
                    </motion.p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={openBenchmarks}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={EDITORIAL_VIEWPORT}
                    transition={{ duration: 0.44, delay: 0.12, ease: EDITORIAL_EASE }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                    className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tx)] hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap self-start md:self-end"
                  >
                    <span>{l.compareBenchmarks}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {FAMILY_MODELS.map((m, idx) => {
                    const localizedModel = t.models[m.id];
                    return (
                      <SpotlightModelCard
                        key={m.id}
                        modelId={m.id}
                        name={m.name}
                        tagline={localizedModel.tagline}
                        description={localizedModel.description}
                        index={idx}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SECTION 03: Three Reasoning Depths */}
            <section id="modlar" className="py-16 sm:py-24 border-b border-[var(--bd)]/75">
              <div className="max-w-5xl mx-auto px-4 sm:px-8">
                <div className="max-w-2xl mb-10 sm:mb-12">
                  <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] mb-3 text-balance">
                    <MaskedReveal inView>{l.depthsTitle}</MaskedReveal>
                  </h2>
                  <motion.p
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={EDITORIAL_VIEWPORT}
                    transition={{ duration: 0.46, delay: 0.08, ease: EDITORIAL_EASE }}
                    className="text-[var(--mut)] text-[15px] sm:text-base leading-relaxed"
                  >
                    {l.depthsSubtitle}
                  </motion.p>
                </div>

                {/* Animated Interactive Reasoning Depths Stage */}
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={EDITORIAL_VIEWPORT}
                  transition={{ duration: 0.56, ease: EDITORIAL_EASE }}
                >
                  <DepthsShowcase
                    prompt={l.depthPrompt}
                    answers={depthAnswers}
                    lang={lang}
                  />
                </motion.div>
              </div>
            </section>

            {/* SECTION 04: Daily Workflow Timeline (Scroll-Drawn Vertical Spine) */}
            <section
              id="gun"
              className="relative z-10 py-16 sm:py-24 bg-[var(--surf)]/38 backdrop-blur-[2px] border-b border-[var(--bd)]/75"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-8">
                <div className="max-w-2xl mb-12">
                  <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                    <MaskedReveal inView>{l.timelineTitle}</MaskedReveal>
                  </h2>
                </div>

                <ScrollTimeline items={l.timelineItems} />
              </div>
            </section>

            {/* SECTION 05: The Little Things (Self-Drawing SVG Checkmarks) */}
            <section className="py-16 sm:py-24 border-b border-[var(--bd)]/75">
              <div className="max-w-5xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-4">
                  <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                    <MaskedReveal inView>{l.checklistTitle}</MaskedReveal>
                  </h2>
                </div>

                <ul className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                  {l.checklistItems.map((feat, i) => (
                    <AnimatedCheckItem key={i} label={feat} index={i} />
                  ))}
                </ul>
              </div>
            </section>

            {/* SECTION 06: FAQ + Architectural Closing CTA */}
            <section id="sss" className="py-16 sm:py-24">
              <div className="max-w-4xl mx-auto px-4 sm:px-8">
                <div className="text-center mb-10 sm:mb-12">
                  <h2 className="font-soft text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-balance">
                    <MaskedReveal inView>{l.faqTitle}</MaskedReveal>
                  </h2>
                </div>

                <div className="divide-y divide-[var(--bd)] border-y border-[var(--bd)]">
                  {l.faqs.map((faq, i) => {
                    const isOpen = openFaqIdx === i;
                    return (
                      <motion.div
                        key={i}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={EDITORIAL_VIEWPORT}
                        transition={{
                          duration: 0.42,
                          delay: Math.min(i * 0.045, 0.2),
                          ease: EDITORIAL_EASE,
                        }}
                        className="relative"
                      >
                        {/* Subtle active hairline marker */}
                        <motion.span
                          aria-hidden="true"
                          initial={false}
                          animate={{ scaleY: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                          transition={LIQUID_SPRING}
                          className="absolute left-0 top-4 bottom-4 w-[1.5px] rounded-full bg-[var(--ac)] origin-top"
                        />

                        <button
                          type="button"
                          onClick={() => setOpenFaqIdx(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          className={`w-full py-5 text-left font-soft font-medium text-[15.5px] sm:text-base cursor-pointer flex items-center justify-between gap-4 text-[var(--tx)] transition-all duration-200 ${
                            isOpen ? 'pl-4' : 'pl-0 hover:pl-1.5'
                          }`}
                        >
                          <span>{faq.q}</span>

                          {/* Morphing Plus / Minus Geometric Indicator */}
                          <span
                            className="relative w-5 h-5 flex items-center justify-center shrink-0 text-[var(--mut)]"
                            aria-hidden="true"
                          >
                            <span className="w-3.5 h-[1.5px] rounded-full bg-current" />
                            <motion.span
                              initial={false}
                              animate={{
                                rotate: isOpen ? 90 : 0,
                                scaleY: isOpen ? 0 : 1,
                                opacity: isOpen ? 0 : 1,
                              }}
                              transition={LIQUID_SPRING}
                              className="absolute w-[1.5px] h-3.5 rounded-full bg-current"
                            />
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{
                                height: LIQUID_SPRING,
                                opacity: { duration: 0.22, ease: LIQUID_EASE },
                              }}
                              className="overflow-hidden"
                            >
                              <motion.p
                                initial={prefersReducedMotion ? false : { y: -6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={prefersReducedMotion ? undefined : { y: -4, opacity: 0 }}
                                transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
                                className="pl-4 pb-5 text-[14.5px] sm:text-[15px] text-[var(--mut)] leading-[1.72] max-w-2xl"
                              >
                                {faq.a}
                              </motion.p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                <ScrollMotifClosingCta
                  label={l.getStartedNow}
                  onClick={() => onOpenAuth('up')}
                />
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Calm Minimal Footer */}
      <motion.footer
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={EDITORIAL_VIEWPORT}
        transition={{ duration: 0.48, ease: EDITORIAL_EASE }}
        className="relative z-10 border-t border-[var(--bd)]/75 py-14 sm:py-16 bg-[var(--surf)]/38 backdrop-blur-[2px] text-[var(--mut)] text-xs"
      >
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
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                {l.footerBackToTop}
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('gun')}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                {t.nav.whatItDoes}
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('modlar')}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                {t.nav.depths}
              </button>
              <button
                type="button"
                onClick={openBenchmarks}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                {l.benchmarksCta}
              </button>
              <button
                type="button"
                onClick={openApiPortal}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                Longclaw API
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('sss')}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
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
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                {l.footerPrivacy}
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('sartlar')}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
              >
                {l.footerTerms}
              </button>
              <button
                type="button"
                onClick={() => onOpenLegal('kvkk')}
                className="block py-0.5 hover:text-[var(--tx)] transition-colors text-left cursor-pointer"
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
      </motion.footer>
    </div>
  );
}
