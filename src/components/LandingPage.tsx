import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Check, Search, Pin, BarChart2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LongclawLogo, ModelLogo } from './Icons';
import { LegalDocType } from './LegalModal';
import { FAMILY_MODELS } from '../lib/models';
import { BenchmarkPage } from './BenchmarkPage';

interface LandingPageProps {
  onOpenAuth: (tab: 'in' | 'up') => void;
  onOpenLegal: (type: LegalDocType) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const DEMO_CONVERSATIONS = [
  {
    q: 'Toplantıyı ertelemek için kısa bir mesaj yaz.',
    a: 'Merhaba, yarınki toplantıyı perşembeye alabilir miyiz? Önüme beklenmedik acil bir iş çıktı.',
  },
  {
    q: '“Görüşmek üzere” İngilizcede nasıl denir?',
    a: 'Resmi yazışmada “Looking forward to speaking with you”, samimi ortamda “See you soon” iyi çalışır.',
  },
  {
    q: 'Bunu daha samimi yap: Talebiniz değerlendirilmiştir.',
    a: 'Mesajını aldım, hemen bir bakıp sana dönüyorum!',
  },
];

const DEPTH_ANSWERS = [
  {
    title: 'Hızlı',
    desc: 'Acelen varsa ve soru basitse.',
    width: '30%',
    text: 'Güneş ışığındaki mavi, atmosferdeki gaz moleküllerinde en çok saçılan renk olduğu için.',
  },
  {
    title: 'Orta',
    desc: 'Günlük işlerin ve genel açıklamaların çoğu için.',
    width: '65%',
    text: 'Güneş ışığı beyaz görünür ama aslında tüm renkleri barındırır. Atmosferdeki gaz molekülleri kısa dalga boylu mavi ışığı diğer renklere göre çok daha fazla saçar.\n\nBu saçılan mavi her yönden gözümüze ulaştığı için gökyüzünü mavi görürüz.',
  },
  {
    title: 'Derin',
    desc: 'Karmaşık konular, karşılaştırmalar, neden-sonuç zinciri.',
    width: '100%',
    text: 'Bu olaya Rayleigh saçılması denir. Saçılma şiddeti ışığın dalga boyunun dördüncü kuvvetiyle ters orantılıdır; yani yaklaşık 450 nm dalga boyundaki mavi ışık, kırmızıya oranla atmosfere girdiğinde 6 kata yakın daha fazla saçılır.\n\nPeki neden mor değil? Çünkü Güneş spektrumu moru mavi kadar yoğun yaymaz ve insan gözündeki reseptörler maviye çok daha duyarlıdır.',
  },
];


export function LandingPage({
  onOpenAuth,
  onOpenLegal,
  theme,
  onToggleTheme,
}: LandingPageProps) {
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
      setDisplayedQ(DEMO_CONVERSATIONS[0].q);
      setDisplayedA(DEMO_CONVERSATIONS[0].a);
      return;
    }

    const runTypewriter = async () => {
      const current = DEMO_CONVERSATIONS[convIdx % DEMO_CONVERSATIONS.length];
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
  }, [convIdx]);

  return (
    <div className="min-h-screen font-soft bg-[var(--bg)] text-[var(--tx)] selection:bg-[var(--tx)] selection:text-[var(--bg)]">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--bd)] transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateToSection('top');
            }}
            className="flex items-center gap-2 font-space font-bold text-lg sm:text-xl tracking-tight text-[var(--tx)] group whitespace-nowrap shrink-0"
          >
            <div className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
              <LongclawLogo className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span>Longclaw</span>
          </a>

          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigateToSection('gun')}
              className="hidden md:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1 whitespace-nowrap cursor-pointer"
            >
              Neler yapar
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('modlar')}
              className="hidden md:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1 whitespace-nowrap cursor-pointer"
            >
              Derinlikler
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
              Benchmark
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('sss')}
              className="hidden md:inline-block text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2 py-1 whitespace-nowrap cursor-pointer"
            >
              Sorular
            </button>

            <button
              onClick={onToggleTheme}
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full border border-[var(--bd)] bg-[var(--card)] flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:border-[var(--tx)] transition-all cursor-pointer shrink-0"
              aria-label="Temayı değiştir"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onOpenAuth('in')}
              className="text-xs sm:text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors px-2.5 sm:px-3 py-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              Giriş yap
            </button>

            <button
              onClick={() => onOpenAuth('up')}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[var(--ac)] text-[var(--on)] text-xs sm:text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Başla</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {activePage === 'benchmarks' ? (
        <BenchmarkPage
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
            <span>LongClaw Clawing ile güçlendirilmiş</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-soft text-[2.15rem] sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.12] sm:leading-[1.08] max-w-3xl mx-auto text-balance"
          >
            Aklındakini yaz, <br className="hidden sm:inline" />
            <em className="italic font-medium">Longclaw toparlasın.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 sm:mt-6 text-base sm:text-xl text-[var(--mut)] max-w-xl mx-auto leading-relaxed px-1 sm:px-0"
          >
            E-posta yazarken, uzun bir metni okumaya üşenirken ya da bir konuyu üçüncü kez anlamaya
            çalışırken yanında duran sessiz arkadaş.
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
              <span>Ücretsiz başla</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={openBenchmarks}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[var(--bd)] bg-[var(--card)] text-[var(--tx)] font-medium text-[15px] sm:text-base hover:border-[var(--tx)] transition-all cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <BarChart2 className="w-4 h-4 text-[var(--mut)]" />
              <span>Benchmarklar</span>
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
                    Günlük Notlar
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
                LongClaw Clawing Ailesi
              </p>
              <h2 className="font-soft text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                Her ihtiyaca uygun üç ayrı model.
              </h2>
            </div>
            <p className="text-sm text-[var(--mut)] max-w-sm leading-relaxed">
              Sohbet çubuğundan dilediğin an ultra, gelişmiş veya hızlı moda geç.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {FAMILY_MODELS.filter((m) => m.id !== 'longclaw-clawing-1-pro').map((m, idx) => (
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
                    <span className="text-xs text-[var(--mut)]">{m.tagline}</span>
                  </div>
                </div>
                <p className="text-sm text-[var(--mut)] leading-relaxed">
                  {m.description}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-[var(--bd)]">
            <p className="text-xs sm:text-sm text-[var(--mut)]">
              Türkçe anlama, kodlama, matematik ve çıktı hızında bağımsız test skorlarını incele.
            </p>
            <button
              type="button"
              onClick={openBenchmarks}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--tx)] hover:opacity-75 transition-opacity cursor-pointer whitespace-nowrap shrink-0 py-1.5"
            >
              <span>Diğer modellerle kıyasla (Benchmark)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* "Bir günde Longclaw'a ne sorulur?" Timeline */}
      <section id="gun" className="py-16 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="font-soft text-[1.85rem] sm:text-5xl font-semibold tracking-tight text-center mb-12 sm:mb-20 text-balance">
          Bir günde Longclaw’a ne sorulur?
        </h2>

        <div className="relative border-l-2 border-[var(--bd)] ml-2.5 sm:ml-20 md:ml-28 space-y-10 sm:space-y-14">
          {[
            {
              time: '09:12',
              title: 'Kısa bir e-posta',
              prompt: '“Müşteriye teşekkür eden iki cümlelik bir mail yaz.”',
              answer:
                '“Merhaba, desteğiniz ve güveniniz için içtenlikle teşekkür ederiz. Bir sonraki adımı sizinle planlamaktan memnuniyet duyarız.”',
            },
            {
              time: '11:40',
              title: 'Toplantı notları',
              prompt: '“Bu dağınık notları üç maddeye indir.”',
              answer:
                '• Bütçe revizyonu onaylandı\n• Lansman tarihi 14 Kasım olarak belirlendi\n• Arayüz tasarımları cuma günü teslim edilecek',
            },
            {
              time: '14:05',
              title: 'İngilizce bir cümle',
              prompt: '“Bunu daha resmi ve nazik nasıl söylerim?”',
              answer:
                '“Would you mind sharing the updated project report by Friday afternoon?”',
            },
            {
              time: '17:30',
              title: 'Yarının planı',
              prompt: '“Yarın için öncelikli yapılacaklar listesi hazırla.”',
              answer:
                '1. Çeyrek raporunu tamamla\n2. Faturaları muhasebeye ilet\n3. Diş hekimi randevusunu takvime işle',
            },
            {
              time: '22:10',
              title: 'Ders çalışırken',
              prompt: '“Osmoz ile difüzyon arasındaki temel fark ne?”',
              answer:
                'Osmoz sadece su moleküllerinin yarı geçirgen bir zardan geçişidir. Difüzyon ise genel olarak herhangi bir maddenin yüksek yoğunluklu ortamdan düşük yoğunluklu ortama kendiliğinden yayılmasıdır.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 'some' }}
              transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.24), ease: [0.16, 1, 0.3, 1] }}
              className="relative pl-6 sm:pl-9 group"
            >
              <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[var(--card)] border-2 border-[var(--tx)] transition-transform duration-200 group-hover:scale-125" />

              <span className="block font-soft text-xs font-medium tracking-wider text-[var(--mut)] uppercase tabular-nums">
                {item.time}
              </span>
              <h3 className="font-soft text-xl sm:text-2xl font-semibold tracking-tight mt-1.5 mb-2.5 sm:mb-3">{item.title}</h3>

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

      {/* "Aynı soru, üç derinlik" Section */}
      <section id="modlar" className="py-16 sm:py-28 border-t border-[var(--bd)] bg-[var(--surf)]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-soft text-[1.85rem] sm:text-5xl font-semibold tracking-tight text-center mb-3 sm:mb-4 text-balance">
            Aynı soru, üç derinlik.
          </h2>
          <p className="text-center text-[var(--mut)] text-[15px] sm:text-base max-w-md mx-auto mb-8 sm:mb-12 leading-relaxed">
            Aynı model; Hızlı, Orta ve Derin düşünme eforlarıyla nasıl yanıt verir? İncele.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-6 sm:gap-8 lg:gap-10 items-stretch">
            <div className="border border-[var(--bd)] rounded-2xl bg-[var(--card)] p-5 sm:p-8 shadow-md flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto bg-[var(--surf)] p-1 rounded-full border border-[var(--bd)] mb-6 sm:mb-7">
                  {DEPTH_ANSWERS.map((d, i) => (
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
                  “Neden gökyüzü mavi?”
                </p>

                <div className="text-[15px] sm:text-base leading-relaxed text-[var(--tx)] whitespace-pre-line min-h-[130px] sm:min-h-[144px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={depthIdx}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {DEPTH_ANSWERS[depthIdx].text}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[var(--bd)] mt-6 sm:mt-7 overflow-hidden">
                <div
                  className="h-full bg-[var(--ac)] rounded-full transition-all duration-500 ease-out"
                  style={{ width: DEPTH_ANSWERS[depthIdx].width }}
                />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 sm:gap-4">
              {DEPTH_ANSWERS.map((d, i) => (
                <div
                  key={d.title}
                  onClick={() => setDepthIdx(i)}
                  className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex-1 flex flex-col justify-center ${
                    depthIdx === i
                      ? 'border-[var(--tx)] bg-[var(--card)] shadow-xs'
                      : 'border-[var(--bd)] bg-transparent hover:border-[var(--mut)]'
                  }`}
                >
                  <b className="font-soft text-base sm:text-lg font-semibold block mb-1">{d.title}</b>
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
            Küçük şeyler
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-14 items-center">
            <motion.ul
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 'some' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {[
                'Google, Apple ve E-posta doğrulamalı güvenli giriş',
                'Firebase Firestore ile tüm cihazlarda bulut eşitleme',
                'Tek model üzerinde Hızlı / Orta / Derin düşünme eforu',
                'Web’de canlı arama ve kaynak alıntıları',
                'Hızlı klavye kısayolları: Yeni sohbet (Ctrl/⌘ + K) ve Kenar çubuğu (Ctrl/⌘ + B)',
                'Önemli konuşmaları üste sabitleme',
                'Kod ve metin dosyası ekleme (.txt, .md, .py)',
                'Yanıtı tek tıkla kopyalama & Markdown dışa aktarma',
                'Açık ve koyu tema desteği',
              ].map((feat, i) => (
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
                <span>özet...</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--surf)] font-medium">
                <Pin className="w-3.5 h-3.5 text-[var(--ac)]" />
                <span>Toplantı özeti (Sabitlenmiş)</span>
              </div>
              <div className="px-3 py-2 text-[var(--mut)]">Özet çıkarma yöntemleri</div>
              <div className="px-3 py-2 text-[var(--mut)]">Haftalık plan</div>
              <div className="px-3 py-2 text-[var(--mut)]">İngilizce e-posta taslağı</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SSS / FAQ */}
      <section id="sss" className="py-16 sm:py-28 border-t border-[var(--bd)] bg-[var(--surf)]/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-soft text-2xl sm:text-4xl font-semibold tracking-tight mb-8 sm:mb-10 text-center text-balance">
            Merak edilenler
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {[
              {
                q: 'Ücretli mi?',
                a: 'Longclaw’ı denemek tamamen ücretsizdir. Firebase ve Google Gemini altyapısıyla çalışır.',
              },
              {
                q: 'Yazdıklarım nerede saklanıyor?',
                a: 'Oturum açtığında tüm sohbetlerin Firebase Firestore üzerinde güvenle şifrelenerek hesabına kaydedilir. Dilediğin an tüm verilerini silebilirsin.',
              },
              {
                q: 'Google ve Apple ile nasıl giriş yapabilirim?',
                a: 'Giriş ekranında yer alan Google veya Apple düğmesine basarak şifre girmeden tek tıkla hesabına bağlanabilirsin.',
              },
              {
                q: 'Hangi dillerde çalışır?',
                a: 'Hangi dilde yazarsan yaz, Longclaw o dilde doğal ve akıcı bir şekilde karşılık verir.',
              },
            ].map((faq, i) => (
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
              Hemen Başla
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
            <p className="leading-relaxed">Yaz, özetle, çevir, düşün. Hepsi tek bir sohbette.</p>
          </div>

          <div>
            <h5 className="font-semibold text-[var(--tx)] uppercase tracking-wider text-[11px] mb-3.5">
              Gezinme
            </h5>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => navigateToSection('top')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Başa dön
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('gun')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Neler yapar
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('modlar')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Derinlikler
              </button>
              <button
                type="button"
                onClick={openBenchmarks}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Benchmarklar
              </button>
              <button
                type="button"
                onClick={() => navigateToSection('sss')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Sorular
              </button>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[var(--tx)] uppercase tracking-wider text-[11px] mb-3.5">
              Yasal & Güvenlik
            </h5>
            <div className="space-y-2.5">
              <button
                onClick={() => onOpenLegal('gizlilik')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Gizlilik Politikası
              </button>
              <button
                onClick={() => onOpenLegal('sartlar')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                Kullanım Şartları
              </button>
              <button
                onClick={() => onOpenLegal('kvkk')}
                className="block py-0.5 hover:text-[var(--tx)] text-left cursor-pointer"
              >
                KVKK Aydınlatma Metni
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 border-t border-[var(--bd)] flex flex-wrap items-center justify-between gap-4">
          <span>Longclaw © 2026. Tüm hakları saklıdır.</span>
          <span className="inline-flex items-center gap-1.5">
            <LongclawLogo className="w-3.5 h-3.5 shrink-0" />
            <span>LongClaw Clawing ile güçlendirilmiş</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
