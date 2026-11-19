import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Check, Search, Pin, BarChart2, Globe } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LongclawLogo, ModelLogo } from './Icons';
import { LegalDocType } from './LegalModal';
import { FAMILY_MODELS } from '../lib/models';
import { BenchmarkPage } from './BenchmarkPage';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface LandingPageProps {
  onOpenAuth: (tab: 'in' | 'up') => void;
  onOpenLegal: (type: LegalDocType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
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

  // Live typewriter simulation
  const [convIdx, setConvIdx] = useState(0);
  const [displayedQ, setDisplayedQ] = useState('');
  const [displayedA, setDisplayedA] = useState('');
  const [depthIdx, setDepthIdx] = useState(1);
  const [activePage, setActivePage] = useState<'home' | 'benchmarks'>('home');

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

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayedQ(demoConversations[0].q);
      setDisplayedA(demoConversations[0].a);
      return;
    }

    const runTypewriter = async () => {
      const current = demoConversations[convIdx % demoConversations.length];
      setDisplayedQ(current.q);
      setDisplayedA('');

      await new Promise((r) => setTimeout(r, 700));
      if (isCancelled) return;

      for (let i = 0; i <= current.a.length; i++) {
        if (isCancelled) return;
        setDisplayedA(current.a.slice(0, i));
        await new Promise((r) => setTimeout(r, 26));
      }

      await new Promise((r) => setTimeout(r, 3200));
      if (isCancelled) return;

      setDisplayedQ('');
      setDisplayedA('');

      await new Promise((r) => setTimeout(r, 400));
      if (isCancelled) return;

      setConvIdx((prev) => prev + 1);
    };

    runTypewriter();

    return () => {
      isCancelled = true;
    };
  }, [convIdx, lang]);

  return (
    <div className="min-h-screen font-soft bg-[var(--bg)] text-[var(--tx)] selection:bg-[var(--tx)] selection:text-[var(--bg)]">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--bd)] transition-all">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('top');
            }}
            className="flex items-center gap-1.5 sm:gap-2 font-space font-bold text-base sm:text-xl tracking-tight text-[var(--tx)] group whitespace-nowrap shrink-0"
          >
            <div className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
              <LongclawLogo className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span>Longclaw</span>
          </a>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateToSection('gun')}
              className="hidden md:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1 whitespace-nowrap cursor-pointer"
            >
              {t.nav.whatItDoes}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('modlar')}
              className="hidden md:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1 whitespace-nowrap cursor-pointer"
            >
              {t.nav.depths}
            </button>
            <button
              type="button"
              onClick={openBenchmarks}
              className={`hidden md:inline-block text-sm font-medium transition-colors px-2 py-1 whitespace-nowrap cursor-pointer ${
                activePage === 'benchmarks'
                  ? 'text-[var(--tx)] underline underline-offset-4'
                  : 'text-[var(--mut)] hover:text-[var(--tx)]'
              }`}
            >
              {t.nav.benchmarks}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('sss')}
              className="hidden md:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1 whitespace-nowrap cursor-pointer"
            >
              {t.nav.faq}
            </button>

            {/* Language Switcher (EN / TR) */}
            <div
              role="group"
              aria-label={t.nav.chooseLanguage}
              title={t.nav.chooseLanguage}
              className="inline-flex items-center p-0.5 rounded-full border border-[var(--bd)] bg-[var(--card)] shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--mut)] ml-1.5 mr-0.5 hidden sm:block shrink-0" />
              {(['en', 'tr'] as const).map((code) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onChangeLang(code)}
                    aria-pressed={active}
                    className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--ac)] text-[var(--on)] shadow-xs'
                        : 'text-[var(--mut)] hover:text-[var(--tx)]'
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onToggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--bd)] bg-[var(--card)] flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:border-[var(--tx)] transition-all cursor-pointer shrink-0"
              aria-label={t.nav.toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onOpenAuth('in')}
              className="text-xs sm:text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              {t.nav.signIn}
            </button>

            <button
              onClick={() => onOpenAuth('up')}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[var(--ac)] text-[var(--on)] text-xs sm:text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{t.nav.start}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {activePage === 'benchmarks' ? (
        <BenchmarkPage
          lang={lang}
          onBack={() => navigateToSection('top')}
          onOpenAuth={onOpenAuth}
        />
      ) : (
        <>
          {/* Hero Section */}
          <section id="top" className="relative pt-12 sm:pt-24 pb-14 sm:pb-20 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--bd)] bg-[var(--surf)] text-xs text-[var(--mut)] mb-5 sm:mb-7 font-medium"
              >
                <LongclawLogo className="w-3.5 h-3.5 shrink-0" />
                <span>{l.poweredBy}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="font-soft text-[2.15rem] sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.12] sm:leading-[1.08] max-w-3xl mx-auto text-balance"
              >
                {l.heroTitleLine1} <br className="hidden sm:inline" />
                <em className="italic font-medium">{l.heroTitleLine2}</em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 sm:mt-6 text-base sm:text-xl text-[var(--mut)] max-w-xl mx-auto leading-relaxed px-1 sm:px-0"
              >
                {l.heroSubtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
              >
                <button
                  onClick={() => onOpenAuth('up')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[var(--ac)] text-[var(--on)] font-medium text-[15px] sm:text-base hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{l.startFree}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={openBenchmarks}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] font-medium text-[15px] sm:text-base hover:border-[var(--tx)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <BarChart2 className="w-4 h-4 text-[var(--mut)]" />
                  <span>{l.benchmarksCta}</span>
                </button>
              </motion.div>

              {/* Interactive Window Simulation */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 sm:mt-16 max-w-4xl mx-auto relative"
              >
                <div className="relative border border-[var(--tx)] rounded-[18px] sm:rounded-[20px] bg-[var(--card)] shadow-[5px_5px_0_var(--bd)] sm:shadow-[8px_8px_0_var(--bd)] overflow-hidden text-left">
                  <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[var(--bd)] bg-[var(--surf)]/50 text-xs text-[var(--mut)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--bd)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--bd)]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--bd)]" />
                    <span className="ml-2 font-soft text-xs font-medium">Longclaw</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[230px_1fr] min-h-[280px] sm:min-h-[410px]">
                    <div className="hidden sm:flex flex-col gap-3 p-4 border-r border-[var(--bd)] bg-[var(--surf)]">
                      <div className="h-7 rounded-lg bg-[var(--tx)] text-[var(--on)] text-xs flex items-center px-3 font-medium">
                        {l.sidebarMockTitle}
                      </div>
                      <div className="h-6 rounded-lg bg-[var(--bd)]/80 w-full" />
                      <div className="h-6 rounded-lg bg-[var(--bd)]/80 w-3/4" />
                      <div className="h-6 rounded-lg bg-[var(--bd)]/80 w-3/5" />
                    </div>

                    <div className="p-5 sm:p-8 flex flex-col gap-4 sm:gap-5 font-soft text-[15px] sm:text-[17px] leading-relaxed">
                      {displayedQ && (
                        <div className="self-end max-w-[90%] sm:max-w-[86%] bg-[var(--ac)] text-[var(--on)] px-4 py-2.5 rounded-[18px] rounded-br-[4px] animate-pop">
                          {displayedQ}
                        </div>
                      )}

                      <div className="max-w-[95%] sm:max-w-[92%] text-[var(--tx)] min-h-[5.5em]">
                        {displayedA}
                        <span className="inline-block w-[2px] h-[1.05em] ml-0.5 bg-[var(--tx)] align-[-0.17em] animate-[blink_1s_steps(1)_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Longclaw Clawing Models Strip */}
          <section className="border-y border-[var(--bd)] py-12 sm:py-16 bg-[var(--surf)]/25">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7 sm:mb-10">
                <div>
                  <p className="text-xs font-medium text-[var(--mut)] mb-1.5">
                    {l.familyEyebrow}
                  </p>
                  <h2 className="font-soft text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                    {l.familyTitle}
                  </h2>
                </div>
                <p className="text-sm text-[var(--mut)] max-w-sm leading-relaxed">
                  {l.familySubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-5 sm:p-6 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--surf)] border border-[var(--bd)] flex items-center justify-center shrink-0">
                          <ModelLogo modelId={m.id} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-soft text-base font-semibold text-[var(--tx)] truncate">
                            {m.name}
                          </h3>
                          <span className="text-xs text-[var(--mut)]">{localizedModel.tagline}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--mut)] leading-relaxed">
                        {localizedModel.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-[var(--bd)]">
                <p className="text-xs sm:text-sm text-[var(--mut)]">
                  {l.compareBenchmarks}
                </p>
                <button
                  type="button"
                  onClick={openBenchmarks}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--tx)] hover:opacity-75 transition-opacity cursor-pointer whitespace-nowrap shrink-0 py-1.5"
                >
                  <span>{l.benchmarksCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Daily Timeline */}
          <section id="gun" className="py-16 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-soft text-[1.85rem] sm:text-5xl font-semibold tracking-tight text-center mb-12 sm:mb-20 text-balance">
              {l.timelineTitle}
            </h2>

            <div className="relative border-l-2 border-[var(--bd)] ml-2.5 sm:ml-20 md:ml-28 space-y-10 sm:space-y-14">
              {l.timelineItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(idx * 0.06, 0.24),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative pl-6 sm:pl-9 group"
                >
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[var(--card)] border-2 border-[var(--tx)] transition-transform duration-200 group-hover:scale-125" />

                  <span className="block font-soft text-xs font-medium tracking-wider text-[var(--mut)] uppercase tabular-nums">
                    {item.time}
                  </span>
                  <h3 className="font-soft text-xl sm:text-2xl font-semibold tracking-tight mt-1.5 mb-2.5 sm:mb-3">
                    {item.title}
                  </h3>

                  <div className="inline-block max-w-full italic text-sm text-[var(--mut)] border border-[var(--bd)] rounded-xl px-3.5 sm:px-4 py-2 bg-[var(--card)] mb-3 transition-colors duration-200 group-hover:border-[var(--mut)]">
                    {item.prompt}
                  </div>

                  <div className="bg-[var(--surf)] border border-[var(--bd)] rounded-xl p-4 sm:p-5 text-sm leading-relaxed text-[var(--tx)]/90 whitespace-pre-line max-w-xl transition-colors duration-200">
                    <span className="block text-[10px] font-semibold tracking-widest text-[var(--mut)] uppercase mb-1.5">
                      Longclaw
                    </span>
                    {item.answer}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Same question, three depths */}
          <section id="modlar" className="py-16 sm:py-28 border-t border-[var(--bd)] bg-[var(--surf)]/20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2 className="font-soft text-[1.85rem] sm:text-5xl font-semibold tracking-tight text-center mb-3 sm:mb-4 text-balance">
                {l.depthsTitle}
              </h2>
              <p className="text-center text-[var(--mut)] text-[15px] sm:text-base max-w-md mx-auto mb-8 sm:mb-12 leading-relaxed">
                {l.depthsSubtitle}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-6 sm:gap-8 lg:gap-10 items-stretch">
                <div className="border border-[var(--bd)] rounded-2xl bg-[var(--card)] p-5 sm:p-8 shadow-md flex flex-col justify-between">
                  <div>
                    <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto bg-[var(--surf)] p-1 rounded-full border border-[var(--bd)] mb-6 sm:mb-7">
                      {depthAnswers.map((d, i) => (
                        <button
                          key={d.title}
                          onClick={() => setDepthIdx(i)}
                          className={`px-3 sm:px-4 py-2 sm:py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 text-center ${
                            depthIdx === i
                              ? 'bg-[var(--ac)] text-[var(--on)] shadow-xs'
                              : 'text-[var(--mut)] hover:text-[var(--tx)]'
                          }`}
                        >
                          {d.title}
                        </button>
                      ))}
                    </div>

                    <p className="font-soft italic text-lg sm:text-xl text-[var(--mut)] font-medium mb-3 sm:mb-4">
                      {l.depthPrompt}
                    </p>

                    <div className="text-[15px] sm:text-base leading-relaxed text-[var(--tx)] whitespace-pre-line min-h-[130px] sm:min-h-[144px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${lang}-${depthIdx}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {depthAnswers[depthIdx].text}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[var(--bd)] mt-6 sm:mt-7 overflow-hidden">
                    <div
                      className="h-full bg-[var(--ac)] rounded-full transition-all duration-500 ease-out"
                      style={{ width: depthAnswers[depthIdx].width }}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 sm:gap-4">
                  {depthAnswers.map((d, i) => (
                    <div
                      key={d.title}
                      onClick={() => setDepthIdx(i)}
                      className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex-1 flex flex-col justify-center ${
                        depthIdx === i
                          ? 'border-[var(--tx)] bg-[var(--card)] shadow-xs'
                          : 'border-[var(--bd)] bg-transparent hover:border-[var(--mut)]'
                      }`}
                    >
                      <b className="font-soft text-base sm:text-lg font-semibold block mb-1">
                        {d.title}
                      </b>
                      <span className="text-xs text-[var(--mut)] leading-relaxed">{d.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Feature Checklist */}
          <section className="py-16 sm:py-28 border-t border-[var(--bd)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <h2 className="font-soft text-2xl sm:text-4xl font-semibold tracking-tight mb-8 sm:mb-10 text-balance">
                {l.checklistTitle}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-14 items-center">
                <motion.ul
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  {l.checklistItems.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3.5 text-sm text-[var(--tx)]/90">
                      <div className="w-5 h-5 rounded-full bg-[var(--surf)] border border-[var(--bd)] flex items-center justify-center shrink-0 text-[var(--tx)]">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 'some' }}
                  transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="border border-[var(--bd)] rounded-2xl bg-[var(--card)] p-5 shadow-lg text-xs space-y-2.5"
                >
                  <div className="flex items-center gap-2.5 border border-[var(--bd)] rounded-xl px-3.5 py-2.5 text-[var(--mut)] bg-[var(--bg)]">
                    <Search className="w-3.5 h-3.5" />
                    <span>{l.mockSearchPlaceholder}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--surf)] font-medium">
                    <Pin className="w-3.5 h-3.5 text-[var(--ac)]" />
                    <span>{l.mockPinnedTitle}</span>
                  </div>
                  <div className="px-3 py-2 text-[var(--mut)]">{l.mockNote1}</div>
                  <div className="px-3 py-2 text-[var(--mut)]">{l.mockNote2}</div>
                  <div className="px-3 py-2 text-[var(--mut)]">{l.mockNote3}</div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="sss" className="py-16 sm:py-28 border-t border-[var(--bd)] bg-[var(--surf)]/20">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <h2 className="font-soft text-2xl sm:text-4xl font-semibold tracking-tight mb-8 sm:mb-10 text-center text-balance">
                {l.faqTitle}
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {l.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group border border-[var(--bd)] rounded-xl bg-[var(--card)] p-4 sm:p-5 transition-all"
                  >
                    <summary className="font-medium text-sm cursor-pointer list-none flex items-center justify-between gap-4 py-0.5">
                      <span>{faq.q}</span>
                      <span className="text-[var(--mut)] transition-transform group-open:rotate-180 shrink-0">
                        ↓
                      </span>
                    </summary>
                    <p className="mt-3 text-[13px] sm:text-sm text-[var(--mut)] leading-relaxed border-t border-[var(--bd)] pt-3">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>

              <div className="text-center mt-10 sm:mt-14">
                <button
                  onClick={() => onOpenAuth('up')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[var(--ac)] text-[var(--on)] font-medium text-sm hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  {l.getStartedNow}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--bd)] py-12 sm:py-16 bg-[var(--bg)] text-[var(--mut)] text-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 mb-10 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 font-space font-bold text-lg text-[var(--tx)] mb-2.5">
              <LongclawLogo className="w-5 h-5" />
              <span>Longclaw</span>
            </div>
            <p className="leading-relaxed mb-4">{l.footerTagline}</p>

            {/* Footer Language Picker */}
            <div
              role="group"
              aria-label={t.nav.chooseLanguage}
              className="inline-flex items-center p-0.5 rounded-full border border-[var(--bd)] bg-[var(--card)]"
            >
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[var(--ac)] text-[var(--on)]'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('tr')}
                aria-pressed={lang === 'tr'}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  lang === 'tr'
                    ? 'bg-[var(--ac)] text-[var(--on)]'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                Türkçe
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[var(--tx)] uppercase tracking-wider text-[11px] mb-3.5">
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
            <h5 className="font-semibold text-[var(--tx)] uppercase tracking-wider text-[11px] mb-3.5">
              {l.footerLegalHeading}
            </h5>
            <div className="space-y-2.5">
              <button
                onClick={() => onOpenLegal('gizlilik')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerPrivacy}
              </button>
              <button
                onClick={() => onOpenLegal('sartlar')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerTerms}
              </button>
              <button
                onClick={() => onOpenLegal('kvkk')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                {l.footerKvkk}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 border-t border-[var(--bd)] flex flex-wrap items-center justify-between gap-4">
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
