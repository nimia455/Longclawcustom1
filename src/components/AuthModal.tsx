import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  auth,
  googleProvider,
  appleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  verifyPasswordResetCode,
  confirmPasswordReset,
  syncUserProfile,
} from '../lib/firebase';
import { GoogleIcon, AppleIcon } from './Icons';
import { LegalDocType } from './LegalModal';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'in' | 'up';
  initialResetCode?: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onOpenLegal: (type: LegalDocType) => void;
}

type AuthViewMode = 'email' | 'forgot';

export function AuthModal({
  isOpen,
  initialTab = 'in',
  initialResetCode = null,
  onClose,
  onSuccess,
  onOpenLegal,
}: AuthModalProps) {
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialResetCode ? 'forgot' : 'email');
  const [tab, setTab] = useState<'in' | 'up'>(initialTab);

  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTos, setAcceptTos] = useState(false);

  // Forgot password + email verification states
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>(
    initialResetCode ? 'verify' : 'request'
  );
  const [resetCode, setResetCode] = useState(initialResetCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [verifiedResetEmail, setVerifiedResetEmail] = useState<string | null>(null);

  // General UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialResetCode) {
      setViewMode('forgot');
      setForgotStep('verify');
      setResetCode(initialResetCode);
    }
  }, [initialResetCode]);

  const resetMessages = () => {
    setError(null);
    setInfo(null);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      resetMessages();
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Giriş penceresi kapatıldı.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('Bu e-posta adresiyle başka bir oturum sağlayıcısı ilişkilendirilmiş.');
      } else {
        setError(err.message || 'Google ile giriş yapılırken bir sorun oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      resetMessages();
      const res = await signInWithPopup(auth, appleProvider);
      if (res.user) {
        await syncUserProfile(res.user);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Apple auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Apple giriş penceresi kapatıldı.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Apple ile giriş Firebase konsolunda etkinleştirilmemiş.');
      } else {
        setError(err.message || 'Apple ile giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (tab === 'up' && !acceptTos) {
      setError('Devam etmek için Kullanım Şartları ve Gizlilik Politikasını kabul etmelisiniz.');
      return;
    }

    try {
      setLoading(true);
      if (tab === 'up') {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        if (name.trim()) {
          await updateProfile(res.user, { displayName: name.trim() });
        }
        try {
          await sendEmailVerification(res.user);
        } catch (verifyErr) {
          console.warn('Email verification dispatch error:', verifyErr);
        }
        await syncUserProfile(res.user);
        setInfo('Hesabınız oluşturuldu ve e-posta adresinize doğrulama bağlantısı gönderildi.');
        setTimeout(() => onSuccess(), 900);
      } else {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        await syncUserProfile(res.user);
        onSuccess();
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-posta veya şifre hatalı.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Bu e-posta ile kayıtlı bir hesap bulunamadı.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('E-posta/şifre girişi Firebase Console > Authentication üzerinden etkinleştirilmelidir.');
      } else {
        setError(err.message || 'İşlem sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password Step 1: Send verification & reset email
  const handleSendPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Doğrulama e-postası için lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      setForgotStep('verify');
      setInfo(
        `${cleanEmail} adresine şifre sıfırlama ve e-posta doğrulama bağlantısı gönderildi. Gelen kutunuzdaki bağlantıya tıklayın veya bağlantıdaki doğrulama kodunu aşağıya girin.`
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.');
      } else {
        setError('Doğrulama e-postası gönderilemedi: ' + (err.message || 'Hata oluştu'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot password Step 2: Verify email oobCode and confirm new password
  const handleConfirmResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    let cleanCode = resetCode.trim();
    // Extract oobCode automatically if the user pasted the entire verification URL
    if (cleanCode.includes('oobCode=')) {
      try {
        const parsed = new URL(cleanCode);
        cleanCode = parsed.searchParams.get('oobCode') || cleanCode;
      } catch {
        const match = cleanCode.match(/oobCode=([^&]+)/);
        if (match) cleanCode = decodeURIComponent(match[1]);
      }
    }

    if (!cleanCode) {
      setError('Lütfen e-postanızdaki doğrulama kodunu veya bağlantısını yapıştırın.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      const verifiedEmail = await verifyPasswordResetCode(auth, cleanCode);
      setVerifiedResetEmail(verifiedEmail);
      await confirmPasswordReset(auth, cleanCode, newPassword);
      setInfo(
        `${verifiedEmail} hesabı doğrulandı ve şifreniz güncellendi! Şimdi yeni şifrenizle giriş yapabilirsiniz.`
      );
      setEmail(verifiedEmail);
      setPassword('');
      setNewPassword('');
      setResetCode('');
      setTimeout(() => {
        setViewMode('email');
        setTab('in');
        setForgotStep('request');
      }, 1600);
    } catch (err: any) {
      console.error('Reset verification error:', err);
      if (err.code === 'auth/expired-action-code') {
        setError('Doğrulama kodunun süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.');
      } else if (err.code === 'auth/invalid-action-code') {
        setError('Geçersiz veya daha önce kullanılmış doğrulama kodu.');
      } else {
        setError(err.message || 'Şifre sıfırlama doğrulanamadı.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[430px] max-h-[92dvh] overflow-y-auto bg-[var(--card)] text-[var(--tx)] border border-[var(--bd)] rounded-3xl sm:rounded-[28px] p-5 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--surf)] text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-fraunces text-2xl font-semibold text-center mb-1">
              {viewMode === 'forgot'
                ? 'Şifre Sıfırlama & Doğrulama'
                : 'Longclaw’a Hoş Geldin'}
            </h3>
            <p className="text-xs text-[var(--mut)] text-center mb-5">
              Google Firebase & Gemini destekli akıllı asistan
            </p>

            <AnimatePresence mode="wait">
              {/* Sub-view: Forgot Password with Email Verification */}
              {viewMode === 'forgot' && (
                <motion.div
                  key="forgot-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
            <button
              type="button"
              onClick={() => {
                setViewMode('email');
                setForgotStep('request');
                resetMessages();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giriş ekranına dön</span>
            </button>

            {forgotStep === 'request' ? (
              <form onSubmit={handleSendPasswordReset} className="space-y-3">
                <p className="text-xs text-[var(--mut)] leading-relaxed">
                  Hesabınıza kayıtlı e-posta adresinizi girin. Kimliğinizi doğrulamanız için size bir
                  doğrulama ve şifre sıfırlama bağlantısı göndereceğiz.
                </p>

                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5 sm:top-3.5" />
                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] placeholder:text-[var(--mut)] text-base sm:text-sm outline-none focus:border-[var(--tx)] transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {info && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{info}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[var(--ac)] text-[var(--on)] font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading ? 'Gönderiliyor...' : 'Doğrulama E-postası Gönder'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('verify');
                    resetMessages();
                  }}
                  className="w-full text-center text-xs text-[var(--mut)] hover:text-[var(--tx)] pt-1 cursor-pointer"
                >
                  Zaten doğrulama kodun var mı? Kodu gir
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetCode} className="space-y-3">
                <div className="p-3 rounded-xl bg-[var(--surf)] border border-[var(--bd)] text-xs text-[var(--mut)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--tx)] font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>E-posta Doğrulama Adımı</span>
                  </div>
                  <p className="leading-relaxed">
                    {verifiedResetEmail
                      ? `${verifiedResetEmail} adresi doğrulandı. Yeni şifrenizi belirleyin.`
                      : 'E-postanızdaki sıfırlama bağlantısına doğrudan tıklayabilir veya bağlantıdaki doğrulama kodunu aşağıya yapıştırarak şifrenizi yenileyebilirsiniz.'}
                  </p>
                </div>

                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="E-postadaki doğrulama kodu veya bağlantısı"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] placeholder:text-[var(--mut)] text-base sm:text-sm outline-none focus:border-[var(--tx)] transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="Yeni şifre (en az 6 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] placeholder:text-[var(--mut)] text-base sm:text-sm outline-none focus:border-[var(--tx)] transition-colors"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {info && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{info}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[var(--ac)] text-[var(--on)] font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading ? 'Doğrulanıyor...' : 'E-postayı Doğrula ve Şifreyi Güncelle'}
                </button>

                {email && (
                  <button
                    type="button"
                    onClick={() => handleSendPasswordReset()}
                    disabled={loading}
                    className="w-full text-center text-xs text-[var(--mut)] hover:text-[var(--tx)] pt-1 cursor-pointer"
                  >
                    Doğrulama e-postasını tekrar gönder
                  </button>
                )}
                </form>
              )}
                </motion.div>
              )}

              {/* Default View: Social + Email/Password */}
              {viewMode === 'email' && (
                <motion.div
                  key="email-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Social Logins */}
                  <div className="space-y-2.5 mb-5">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-[var(--bd)] bg-[var(--card)] hover:bg-[var(--surf)] text-[var(--tx)] font-medium text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <GoogleIcon className="w-4 h-4" />
                      <span>Google ile Devam Et</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-[var(--bd)] bg-[var(--card)] hover:bg-[var(--surf)] text-[var(--tx)] font-medium text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <AppleIcon className="w-4 h-4" />
                      <span>Apple ile Giriş Yap</span>
                    </button>
                  </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-[var(--bd)]" />
              <span className="absolute px-3 bg-[var(--card)] text-xs text-[var(--mut)]">
                veya e-posta ile
              </span>
            </div>

            {/* Tabs */}
            <div className="flex bg-[var(--surf)] rounded-full p-1 mb-4">
              <button
                type="button"
                onClick={() => {
                  setTab('in');
                  resetMessages();
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  tab === 'in'
                    ? 'bg-[var(--card)] text-[var(--tx)] shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                Giriş yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('up');
                  resetMessages();
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  tab === 'up'
                    ? 'bg-[var(--card)] text-[var(--tx)] shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
              >
                Kayıt ol
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {tab === 'up' && (
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Adın"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] placeholder:text-[var(--mut)] text-base sm:text-sm outline-none focus:border-[var(--tx)] transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] placeholder:text-[var(--mut)] text-base sm:text-sm outline-none focus:border-[var(--tx)] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="Şifre (en az 6 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === 'up' ? 'new-password' : 'current-password'}
                  required
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] placeholder:text-[var(--mut)] text-base sm:text-sm outline-none focus:border-[var(--tx)] transition-colors"
                />
              </div>

              {tab === 'in' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setForgotStep('request');
                      resetMessages();
                    }}
                    className="text-xs text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer"
                  >
                    Şifremi unuttum (E-posta ile doğrula)
                  </button>
                </div>
              )}

              {tab === 'up' && (
                <label className="flex items-start gap-2.5 text-xs text-[var(--mut)] cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={acceptTos}
                    onChange={(e) => setAcceptTos(e.target.checked)}
                    className="mt-0.5 rounded border-[var(--bd)] accent-[var(--tx)]"
                  />
                  <span>
                    <button
                      type="button"
                      onClick={() => onOpenLegal('sartlar')}
                      className="underline hover:text-[var(--tx)] text-[var(--tx)] font-medium"
                    >
                      Kullanım Şartları
                    </button>
                    ’nı ve{' '}
                    <button
                      type="button"
                      onClick={() => onOpenLegal('gizlilik')}
                      className="underline hover:text-[var(--tx)] text-[var(--tx)] font-medium"
                    >
                      Gizlilik Politikası
                    </button>
                    ’nı okudum, kabul ediyorum.
                  </span>
                </label>
              )}

              {error && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {info && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{info}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[var(--ac)] text-[var(--on)] font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer shadow-md mt-2"
              >
                {loading ? 'İşleniyor...' : tab === 'up' ? 'Hesap oluştur' : 'Giriş yap'}
              </button>
            </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[11px] text-[var(--mut)] text-center mt-5">
              Verileriniz Firebase Firestore üzerinde şifrelenir ve korunur.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
