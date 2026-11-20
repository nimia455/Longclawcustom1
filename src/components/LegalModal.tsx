import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Language, TRANSLATIONS } from '../lib/i18n';

export type LegalDocType = 'gizlilik' | 'sartlar' | 'kvkk' | null;

interface LegalModalProps {
  type: LegalDocType;
  lang: Language;
  onClose: () => void;
}

export function LegalModal({ type, lang, onClose }: LegalModalProps) {
  const t = TRANSLATIONS[lang].legal;
  const doc = type ? t.docs[type] : null;

  return (
    <AnimatePresence>
      {type && doc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="surface-3d-elevated w-full max-w-xl max-h-[88dvh] overflow-y-auto text-[var(--tx)] rounded-3xl p-5 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 flex items-center justify-center rounded-full text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer"
              aria-label={t.close}
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="font-serif-fraunces text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 pr-10">
              {doc.title}
            </h3>

            <div className="space-y-4 text-[14.5px] leading-relaxed text-[var(--mut)]">
              {doc.content.map((p, i) => (
                <p key={i} className="text-[var(--tx)]/85">
                  {p}
                </p>
              ))}
            </div>

            <button
              onClick={onClose}
              className="btn-3d-soft w-full mt-7 py-3 rounded-full font-medium text-sm cursor-pointer"
            >
              {t.close}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
