import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type LegalDocType = 'gizlilik' | 'sartlar' | 'kvkk' | null;

interface LegalModalProps {
  type: LegalDocType;
  onClose: () => void;
}

const LEGAL_CONTENT: Record<string, { title: string; content: string[] }> = {
  gizlilik: {
    title: 'Gizlilik Politikası',
    content: [
      'Bu politika, Longclaw’ı kullanırken hangi verilerin işlendiğini ve nasıl korunduğunu açıklar. Hizmetimiz, kullanıcılarımızın gizliliğini en yüksek standartlarda korumayı taahhüt eder.',
      'Hangi verileri topluyoruz? Firebase Authentication aracılığıyla hesap bilgilerin (ad, e-posta adresi, profil fotoğrafı), Firestore üzerinde güvenle şifrelenmiş sohbet kayıtların ve tercihleriniz (tema, derinlik modu).',
      'Ne için kullanıyoruz? Sohbet geçmişini cihazlarınız arasında güvenle eşitlemek, akıllı Gemini yanıtları üretmek ve oturum güvenliğini sağlamak için.',
      'Kimlerle paylaşıyoruz? Veritabanı ve kimlik doğrulama için Google Firebase, yapay zekâ yanıtları üretmek için Google Gemini API kullanılır. Verileriniz asla üçüncü taraflara satılmaz veya pazarlama amacıyla paylaşılmaz.',
      'Saklama ve silme: Sohbet geçmişinizi dilediğiniz zaman tek tek veya profil menüsünden hesabınızı ve tüm verilerinizi tamamen silebilirsiniz.',
    ],
  },
  sartlar: {
    title: 'Kullanım Şartları',
    content: [
      'Longclaw’a hoş geldiniz. Hizmeti kullanarak bu şartları kabul etmiş olursunuz.',
      'Hizmet kapsamı: Longclaw; düşünme, yazma, özetleme ve araştırma süreçlerinizde size yardımcı olan bir yapay zekâ asistanıdır.',
      'Yapay zekâ yanıtları: Yapay zekâ modelleri bazen hatalı veya eksik bilgi üretebilir. Verilen yanıtlar medikal, yasal veya finansal profesyonel tavsiye niteliği taşımaz; kritik kararlarda teyit edilmelidir.',
      'Kabul edilebilir kullanım: Hizmeti yasa dışı faaliyetler, kötü amaçlı içerik üretimi veya sistem güvenliğini aksatacak müdahaleler için kullanamazsınız.',
      'Hesap güvenliği: Oturum bilgilerinizi güvende tutmak kullanıcının sorumluluğundadır.',
    ],
  },
  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    content: [
      '6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca aydınlatma metnidir.',
      'İşlenen kişisel veriler: Kimlik bilgisi (Ad, Soyad), iletişim bilgisi (E-posta), kullanıcı işlem kayıtları ve sohbet içerikleri.',
      'Veri işleme amaçları: Kullanıcı kaydının oluşturulması, yapay zekâ asistan hizmetinin sunulması, veri kaybının önlenmesi ve bilgi güvenliğinin sağlanması.',
      'Veri aktarımı: Kimlik doğrulama ve veritabanı altyapısı Google Firebase üzerinden, yapay zekâ işleme katmanı Google Gemini API üzerinden sunulmaktadır.',
      'Haklarınız: KVKK’nın 11. maddesi uyarınca verilerinize erişme, düzeltilmesini talep etme ve silinmesini isteme hakkına sahipsiniz.',
    ],
  },
};

export function LegalModal({ type, onClose }: LegalModalProps) {
  const doc = type ? LEGAL_CONTENT[type] : null;

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
            className="w-full max-w-xl max-h-[88dvh] overflow-y-auto bg-[var(--card)] text-[var(--tx)] border border-[var(--bd)] rounded-3xl p-5 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--surf)] text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-fraunces text-xl sm:text-2xl font-semibold mb-4 sm:mb-5 pr-10">{doc.title}</h3>

            <div className="space-y-4 text-[14.5px] leading-relaxed text-[var(--mut)]">
              {doc.content.map((p, i) => (
                <p key={i} className="text-[var(--tx)]/85">
                  {p}
                </p>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-7 py-3 rounded-full border border-[var(--bd)] bg-[var(--surf)] hover:bg-[var(--card)] font-medium text-sm transition-all cursor-pointer"
            >
              Kapat
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
