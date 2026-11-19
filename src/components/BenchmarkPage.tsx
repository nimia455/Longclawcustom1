import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { ModelLogo, BenchmarkModelLogo } from './Icons';
import { ChatModelId } from '../lib/models';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface BenchmarkPageProps {
  lang: Language;
  onBack: () => void;
  onOpenAuth: (tab: 'in' | 'up') => void;
}

type CategoryId = 'all' | 'general' | 'coding' | 'math' | 'speed';

interface BenchmarkEntry {
  model: string;
  provider: string;
  value: number;
  isLongclaw?: boolean;
  modelId?: ChatModelId;
}

interface BenchmarkCard {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  title: string;
  subtitle: string;
  unit: string;
  maxScale: number;
  note: string;
  entries: BenchmarkEntry[];
}

const CATEGORY_TAB_IDS: CategoryId[] = ['all', 'general', 'coding', 'math', 'speed'];

const BENCHMARK_CARDS: BenchmarkCard[] = [
  {
    id: 'tr-bench',
    category: 'general',
    title: 'TR-Bench (Türkçe Anlama & Nüans)',
    subtitle: 'Deyim, resmi dil, özetleme ve bağlam tutarlılığı değerlendirmesi',
    unit: '%',
    maxScale: 100,
    note: '5-shot · İnsan değerlendirmesi + otomatik doğrulama',
    entries: [
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 88.4, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 86.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Gemini 3', provider: 'Google', value: 86.4 },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 85.9, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 85.3 },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 84.2, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 83.1, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 82.7 },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 79.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
      { model: 'GPT-4', provider: 'OpenAI', value: 79.4 },
    ],
  },
  {
    id: 'mmlu-pro',
    category: 'general',
    title: 'MMLU-Pro',
    subtitle: '14 farklı akademik ve mesleki alanda çoktan seçmeli genel bilgi',
    unit: '%',
    maxScale: 100,
    note: 'Zero-shot CoT · 10 seçenekli zorlu set',
    entries: [
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 84.6, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'Gemini 3', provider: 'Google', value: 81.2 },
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 79.9 },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 78.4 },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 77.6, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 75.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 74.1, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 73.2, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'GPT-4', provider: 'OpenAI', value: 72.6 },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 69.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
    ],
  },
  {
    id: 'livecodebench',
    category: 'coding',
    title: 'LiveCodeBench',
    subtitle: 'Güncel yarışma ve algoritma problemlerinde tek denemede çözüm oranı',
    unit: '%',
    maxScale: 100,
    note: 'Pass@1 · Zaman sızıntısı olmayan güncel problemler',
    entries: [
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 66.8 },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 66.3 },
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 66.1, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'Gemini 3', provider: 'Google', value: 65.1 },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 63.4, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 61.2, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 58.9, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 56.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'GPT-4', provider: 'OpenAI', value: 52.4 },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 51.6, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
    ],
  },
  {
    id: 'swe-bench',
    category: 'coding',
    title: 'SWE-bench Verified',
    subtitle: 'Gerçek açık kaynak kod depolarında hata tespiti ve yama üretimi',
    unit: '%',
    maxScale: 70,
    note: 'Agentless harness · 500 doğrulanmış GitHub görevi',
    entries: [
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 51.4 },
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 48.3, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 46.2 },
      { model: 'Gemini 3', provider: 'Google', value: 45.8 },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 44.1, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 41.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 39.6, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 37.9, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'GPT-4', provider: 'OpenAI', value: 35.6 },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 33.2, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
    ],
  },
  {
    id: 'math-500',
    category: 'math',
    title: 'MATH-500',
    subtitle: 'Lise ve olimpiyat seviyesinde çok adımlı matematiksel akıl yürütme',
    unit: '%',
    maxScale: 100,
    note: 'Zero-shot · Adım adım çözüm doğrulaması',
    entries: [
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 91.8 },
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 91.2, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'Gemini 3', provider: 'Google', value: 90.5 },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 88.4, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 86.4 },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 85.7, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 83.2, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 81.4, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 75.4, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
      { model: 'GPT-4', provider: 'OpenAI', value: 73.2 },
    ],
  },
  {
    id: 'gpqa-diamond',
    category: 'math',
    title: 'GPQA Diamond',
    subtitle: 'Fizik, kimya ve biyolojide doktora düzeyinde muhakeme soruları',
    unit: '%',
    maxScale: 100,
    note: 'Zero-shot · Uzmanların bile zorlandığı alt küme',
    entries: [
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 71.4, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'Gemini 3', provider: 'Google', value: 68.9 },
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 68.2 },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 65.8, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 64.7 },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 62.4, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 59.8, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 57.2, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'GPT-4', provider: 'OpenAI', value: 50.8 },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 50.2, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
    ],
  },
  {
    id: 'ifeval',
    category: 'speed',
    title: 'IFEval (Talimat Uyumu)',
    subtitle: 'Biçim, uzunluk, ton ve kısıt kurallarına birebir sadık kalma oranı',
    unit: '%',
    maxScale: 100,
    note: 'Strict Prompt Accuracy · Günlük iş akışları için kritik metrik',
    entries: [
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 90.6, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 89.4, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 89.1 },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 88.7, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Gemini 3', provider: 'Google', value: 88.4 },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 87.2, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 86.6, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 86.2 },
      { model: 'GPT-4', provider: 'OpenAI', value: 85.1 },
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 83.9, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
    ],
  },
  {
    id: 'throughput',
    category: 'speed',
    title: 'Çıktı Hızı (Token / saniye)',
    subtitle: 'Orta efor seviyesinde saniyede üretilen ortalama token miktarı',
    unit: ' tok/s',
    maxScale: 200,
    note: 'Medyan akış hızı · Yüksek değer daha hızlıdır',
    entries: [
      { model: 'Longclaw Clawing 1.1 Low', provider: 'Longclaw', value: 184, isLongclaw: true, modelId: 'longclaw-clawing-1.1-low' },
      { model: 'Gemini 3', provider: 'Google', value: 132 },
      { model: 'Longclaw Clawing 1.1', provider: 'Longclaw', value: 126, isLongclaw: true, modelId: 'longclaw-clawing-1.1' },
      { model: 'Longclaw Clawing 1.1 Pro', provider: 'Longclaw', value: 88, isLongclaw: true, modelId: 'longclaw-clawing-1.1-pro' },
      { model: 'Claude Sonnet 4', provider: 'Anthropic', value: 79 },
      { model: 'Longclaw Clawing 1 Pro', provider: 'Longclaw', value: 76, isLongclaw: true, modelId: 'longclaw-clawing-1-pro' },
      { model: 'DeepSeek V4', provider: 'DeepSeek', value: 72 },
      { model: 'GPT-4', provider: 'OpenAI', value: 68 },
      { model: 'Longclaw Clawing 1.1 Ultra', provider: 'Longclaw', value: 58, isLongclaw: true, modelId: 'longclaw-clawing-1.1-ultra' },
      { model: 'Longclaw Clawing 1.2 Ultra', provider: 'Longclaw', value: 52, isLongclaw: true, modelId: 'longclaw-clawing-1.2-ultra' },
    ],
  },
];

interface SummaryRow {
  model: string;
  provider: string;
  isLongclaw?: boolean;
  modelId?: ChatModelId;
  trBench: string;
  mmluPro: string;
  liveCode: string;
  sweBench: string;
  math500: string;
  ifeval: string;
  speed: string;
}

const SUMMARY_ROWS: SummaryRow[] = [
  {
    model: 'Longclaw Clawing 1.2 Ultra',
    provider: 'Longclaw',
    isLongclaw: true,
    modelId: 'longclaw-clawing-1.2-ultra',
    trBench: '88.4%',
    mmluPro: '84.6%',
    liveCode: '66.1%',
    sweBench: '48.3%',
    math500: '91.2%',
    ifeval: '90.6%',
    speed: '52 tok/s',
  },
  {
    model: 'Longclaw Clawing 1.1 Ultra',
    provider: 'Longclaw',
    isLongclaw: true,
    modelId: 'longclaw-clawing-1.1-ultra',
    trBench: '86.8%',
    mmluPro: '77.6%',
    liveCode: '63.4%',
    sweBench: '44.1%',
    math500: '88.4%',
    ifeval: '89.4%',
    speed: '58 tok/s',
  },
  {
    model: 'Longclaw Clawing 1.1 Pro',
    provider: 'Longclaw',
    isLongclaw: true,
    modelId: 'longclaw-clawing-1.1-pro',
    trBench: '85.9%',
    mmluPro: '75.8%',
    liveCode: '61.2%',
    sweBench: '41.8%',
    math500: '85.7%',
    ifeval: '88.7%',
    speed: '88 tok/s',
  },
  {
    model: 'Longclaw Clawing 1 Pro',
    provider: 'Longclaw',
    isLongclaw: true,
    modelId: 'longclaw-clawing-1-pro',
    trBench: '84.2%',
    mmluPro: '74.1%',
    liveCode: '58.9%',
    sweBench: '39.6%',
    math500: '83.2%',
    ifeval: '87.2%',
    speed: '76 tok/s',
  },
  {
    model: 'Longclaw Clawing 1.1',
    provider: 'Longclaw',
    isLongclaw: true,
    modelId: 'longclaw-clawing-1.1',
    trBench: '83.1%',
    mmluPro: '73.2%',
    liveCode: '56.8%',
    sweBench: '37.9%',
    math500: '81.4%',
    ifeval: '86.6%',
    speed: '126 tok/s',
  },
  {
    model: 'Longclaw Clawing 1.1 Low',
    provider: 'Longclaw',
    isLongclaw: true,
    modelId: 'longclaw-clawing-1.1-low',
    trBench: '79.8%',
    mmluPro: '69.8%',
    liveCode: '51.6%',
    sweBench: '33.2%',
    math500: '75.4%',
    ifeval: '83.9%',
    speed: '184 tok/s',
  },
  {
    model: 'Gemini 3',
    provider: 'Google',
    trBench: '86.4%',
    mmluPro: '81.2%',
    liveCode: '65.1%',
    sweBench: '45.8%',
    math500: '90.5%',
    ifeval: '88.4%',
    speed: '132 tok/s',
  },
  {
    model: 'Claude Sonnet 4',
    provider: 'Anthropic',
    trBench: '85.3%',
    mmluPro: '79.9%',
    liveCode: '66.8%',
    sweBench: '51.4%',
    math500: '86.4%',
    ifeval: '89.1%',
    speed: '79 tok/s',
  },
  {
    model: 'DeepSeek V4',
    provider: 'DeepSeek',
    trBench: '82.7%',
    mmluPro: '78.4%',
    liveCode: '66.3%',
    sweBench: '46.2%',
    math500: '91.8%',
    ifeval: '86.2%',
    speed: '72 tok/s',
  },
  {
    model: 'GPT-4',
    provider: 'OpenAI',
    trBench: '79.4%',
    mmluPro: '72.6%',
    liveCode: '52.4%',
    sweBench: '35.6%',
    math500: '73.2%',
    ifeval: '85.1%',
    speed: '68 tok/s',
  },
];

export function BenchmarkPage({ lang, onBack, onOpenAuth }: BenchmarkPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const b = TRANSLATIONS[lang].benchmarks;

  const visibleCards =
    selectedCategory === 'all'
      ? BENCHMARK_CARDS
      : BENCHMARK_CARDS.filter((card) => card.category === selectedCategory);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--bg)] text-[var(--tx)]">
      {/* Header / Intro */}
      <section className="pt-8 sm:pt-14 pb-10 sm:pb-14 border-b border-[var(--bd)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[var(--mut)] hover:text-[var(--tx)] transition-colors mb-6 sm:mb-8 py-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{b.backToHome}</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-end">
            <div>
              <p className="text-xs font-medium text-[var(--mut)] mb-2.5">
                {b.eyebrow}
              </p>
              <h1 className="font-soft text-[2rem] sm:text-5xl font-semibold tracking-tight leading-[1.12] max-w-2xl text-balance">
                {b.title}
              </h1>
              <p className="mt-3.5 sm:mt-4 text-sm sm:text-base text-[var(--mut)] max-w-2xl leading-relaxed">
                {b.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onOpenAuth('up')}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--ac)] text-[var(--on)] text-sm font-medium hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>{b.testYourself}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Honest Takeaways Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10 pt-8 border-t border-[var(--bd)]">
            <div className="p-4 sm:p-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)]">
              <div className="flex items-center gap-2.5 mb-2">
                <ModelLogo modelId="longclaw-clawing-1.2-ultra" className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">Clawing 1.2 Ultra</span>
              </div>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                {b.takeaways.ultra12}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)]">
              <div className="flex items-center gap-2.5 mb-2">
                <ModelLogo modelId="longclaw-clawing-1.1-ultra" className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">Clawing 1.1 Ultra</span>
              </div>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                {b.takeaways.ultra11}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)]">
              <div className="flex items-center gap-2.5 mb-2">
                <ModelLogo modelId="longclaw-clawing-1.1-pro" className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">Clawing 1.1 Pro</span>
              </div>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                {b.takeaways.pro11}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border border-[var(--bd)] bg-[var(--card)]">
              <div className="flex items-center gap-2.5 mb-2">
                <ModelLogo modelId="longclaw-clawing-1.1-low" className="w-4 h-4 shrink-0" />
                <span className="text-sm font-semibold">Clawing 1.1 Low</span>
              </div>
              <p className="text-xs text-[var(--mut)] leading-relaxed">
                {b.takeaways.low11}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs + Benchmark Bar Charts */}
      <section className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
              {CATEGORY_TAB_IDS.map((tabId) => {
                const active = selectedCategory === tabId;
                return (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setSelectedCategory(tabId)}
                    className={`px-3.5 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                      active
                        ? 'bg-[var(--ac)] text-[var(--on)] border-[var(--ac)] shadow-xs'
                        : 'bg-[var(--card)] text-[var(--mut)] border-[var(--bd)] hover:text-[var(--tx)] hover:border-[var(--mut)]'
                    }`}
                  >
                    {b.tabs[tabId]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 text-xs text-[var(--mut)] shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--ac)] inline-block" />
                <span>{b.legendLongclaw}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--bd)] inline-block" />
                <span>{b.legendOthers}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {visibleCards.map((card, cardIdx) => {
              const topValue = Math.max(...card.entries.map((e) => e.value));
              const cardText = b.cards[card.id];

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(cardIdx * 0.04, 0.2),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-5 sm:p-6 flex flex-col justify-between gap-5"
                >
                  <div>
                    <h2 className="font-soft text-base sm:text-lg font-semibold text-[var(--tx)]">
                      {cardText?.title || card.title}
                    </h2>
                    <p className="text-xs text-[var(--mut)] mt-1 leading-relaxed">
                      {cardText?.subtitle || card.subtitle}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {card.entries.map((entry) => {
                      const pct = Math.min(100, Math.round((entry.value / card.maxScale) * 100));
                      const isLeader = entry.value === topValue;

                      return (
                        <div key={entry.model} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <BenchmarkModelLogo
                                provider={entry.provider}
                                modelId={entry.modelId}
                                className="w-3.5 h-3.5 shrink-0"
                              />
                              <span
                                className={`truncate ${
                                  entry.isLongclaw
                                    ? 'font-semibold text-[var(--tx)]'
                                    : 'text-[var(--mut)]'
                                }`}
                              >
                                {entry.model}
                              </span>
                            </div>

                            <span
                              className={`font-mono tabular-nums shrink-0 ${
                                isLeader
                                  ? 'font-semibold text-[var(--tx)]'
                                  : entry.isLongclaw
                                  ? 'font-medium text-[var(--tx)]/90'
                                  : 'text-[var(--mut)]'
                              }`}
                            >
                              {entry.value}
                              {cardText?.unit || card.unit}
                            </span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-[var(--surf)] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                entry.isLongclaw
                                  ? entry.modelId === 'longclaw-clawing-1.2-ultra'
                                    ? 'bg-[var(--ac)]'
                                    : entry.modelId === 'longclaw-clawing-1.1-ultra'
                                    ? 'bg-[var(--tx)]/95'
                                    : entry.modelId === 'longclaw-clawing-1.1-pro'
                                    ? 'bg-[var(--tx)]/80'
                                    : entry.modelId === 'longclaw-clawing-1-pro'
                                    ? 'bg-[var(--tx)]/65'
                                    : entry.modelId === 'longclaw-clawing-1.1'
                                    ? 'bg-[var(--tx)]/50'
                                    : 'bg-[var(--tx)]/35'
                                  : 'bg-[var(--bd)]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-[var(--bd)] text-[11px] text-[var(--mut)]">
                    {cardText?.note || card.note}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full Comparison Matrix Table */}
      <section className="py-10 sm:py-16 border-t border-[var(--bd)] bg-[var(--surf)]/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-soft text-xl sm:text-2xl font-semibold tracking-tight">
                {b.tableTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--mut)] mt-1">
                {b.tableSubtitle}
              </p>
            </div>
            <span className="text-[11px] text-[var(--mut)] sm:hidden inline-flex items-center gap-1">
              <span>{b.scrollHint}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="rounded-2xl border border-[var(--bd)] bg-[var(--card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[var(--bd)] bg-[var(--surf)]/60 text-[11px] font-medium text-[var(--mut)]">
                    <th className="py-3.5 px-4 sm:px-5">{b.colModel}</th>
                    <th className="py-3.5 px-3 text-right">TR-Bench</th>
                    <th className="py-3.5 px-3 text-right">MMLU-Pro</th>
                    <th className="py-3.5 px-3 text-right">LiveCode</th>
                    <th className="py-3.5 px-3 text-right">SWE-bench</th>
                    <th className="py-3.5 px-3 text-right">MATH-500</th>
                    <th className="py-3.5 px-3 text-right">IFEval</th>
                    <th className="py-3.5 px-4 sm:px-5 text-right">{b.colSpeed}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--bd)] text-xs sm:text-[13px]">
                  {SUMMARY_ROWS.map((row) => (
                    <tr
                      key={row.model}
                      className={
                        row.isLongclaw
                          ? 'bg-[var(--surf)]/35 font-medium text-[var(--tx)]'
                          : 'text-[var(--mut)]'
                      }
                    >
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <BenchmarkModelLogo
                            provider={row.provider}
                            modelId={row.modelId}
                            className="w-4 h-4 shrink-0"
                          />
                          <div>
                            <span className={row.isLongclaw ? 'font-semibold text-[var(--tx)]' : 'text-[var(--tx)]/85'}>
                              {row.model}
                            </span>
                            <span className="ml-2 text-[11px] text-[var(--mut)] font-normal">
                              · {row.provider}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">{row.trBench}</td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">{row.mmluPro}</td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">{row.liveCode}</td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">{row.sweBench}</td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">{row.math500}</td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums">{row.ifeval}</td>
                      <td className="py-3.5 px-4 sm:px-5 text-right font-mono tabular-nums whitespace-nowrap">{row.speed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 text-xs text-[var(--mut)]">
            <p className="leading-relaxed max-w-2xl">
              {b.methodologyNote}
            </p>
            <button
              type="button"
              onClick={() => onOpenAuth('up')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--ac)] text-[var(--on)] text-xs sm:text-sm font-medium hover:opacity-90 active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{b.startChatting}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
