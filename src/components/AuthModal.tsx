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
import { Language, TRANSLATIONS } from '../lib/i18n';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'in' | 'up';
  initialResetCode?: string | null;
  lang: Language;
  onClose: () => void;
  onSuccess: () => void;
  onOpenLegal: (type: LegalDocType) => void;
}

type AuthViewMode = 'email' | 'forgot';

export function AuthModal({
  isOpen,
  initialTab = 'in',
  initialResetCode = null,
  lang,
  onClose,
  onSuccess,
  onOpenLegal,
}: AuthModalProps) {
  const t = TRANSLATIONS[lang];
  const a = t.auth;
  const errs = a.errors;

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
        setError(errs.popupClosed);
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError(errs.accountExistsDifferentCred);
      } else {
        setError(err.message || errs.googleGeneric);
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
        setError(errs.applePopupClosed);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(errs.appleNotAllowed);
      } else {
        setError(err.message || errs.appleGeneric);
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
      setError(errs.invalidEmail);
      return;
    }

    if (password.length < 6) {
      setError(errs.shortPassword);
      return;
    }

    if (tab === 'up' && !acceptTos) {
      setError(errs.acceptTos);
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
        setInfo(errs.accountCreatedInfo);
        setTimeout(() => onSuccess(), 900);
      } else {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        await syncUserProfile(res.user);
        onSuccess();
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError(errs.emailInUse);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError(errs.invalidCredential);
      } else if (err.code === 'auth/user-not-found') {
        setError(errs.userNotFound);
      } else if (err.code === 'auth/operation-not-allowed') {
        setError(errs.operationNotAllowed);
      } else {
        setError(err.message || errs.genericAuth);
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
      setError(errs.invalidEmailReset);
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      setForgotStep('verify');
      setInfo(errs.resetSentInfo(cleanEmail));
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError(errs.resetUserNotFound);
      } else {
        setError(errs.resetSendFailed(err.message || errs.genericAuth));
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
      setError(errs.missingResetCode);
      return;
    }

    if (newPassword.length < 6) {
      setError(errs.shortNewPassword);
      return;
    }

    try {
      setLoading(true);
      const verifiedEmail = await verifyPasswordResetCode(auth, cleanCode);
      setVerifiedResetEmail(verifiedEmail);
      await confirmPasswordReset(auth, cleanCode, newPassword);
      setInfo(errs.resetSuccessInfo(verifiedEmail));
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
        setError(errs.expiredActionCode);
      } else if (err.code === 'auth/invalid-action-code') {
        setError(errs.invalidActionCode);
      } else {
        setError(err.message || errs.resetVerifyFailed);
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
              aria-label={t.common.close}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-fraunces text-2xl font-semibold text-center mb-1">
              {viewMode === 'forgot' ? a.titleForgot : a.titleDefault}
            </h3>
            <p className="text-xs text-[var(--mut)] text-center mb-5">{a.subtitle}</p>

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
                    <span>{a.backToSignIn}</span>
                  </button>

                  {forgotStep === 'request' ? (
                    <form onSubmit={handleSendPasswordReset} className="space-y-3">
                      <p className="text-xs text-[var(--mut)] leading-relaxed">{a.forgotDesc}</p>

                      <div className="relative">
                        <Mail className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5 sm:top-3.5" />
                        <input
                          type="email"
                          placeholder={a.emailPlaceholder}
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
                        {loading ? a.sending : a.sendVerificationEmail}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep('verify');
                          resetMessages();
                        }}
                        className="w-full text-center text-xs text-[var(--mut)] hover:text-[var(--tx)] pt-1 cursor-pointer"
                      >
                        {a.haveCodePrompt}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleConfirmResetCode} className="space-y-3">
                      <div className="p-3 rounded-xl bg-[var(--surf)] border border-[var(--bd)] text-xs text-[var(--mut)] space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--tx)] font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>{a.verificationStepTitle}</span>
                        </div>
                        <p className="leading-relaxed">
                          {verifiedResetEmail
                            ? a.verificationStepVerified(verifiedResetEmail)
                            : a.verificationStepDefault}
                        </p>
                      </div>

                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder={a.codePlaceholder}
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
                          placeholder={a.newPasswordPlaceholder}
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
                        {loading ? a.verifying : a.verifyAndUpdatePassword}
                      </button>

                      {email && (
                        <button
                          type="button"
                          onClick={() => handleSendPasswordReset()}
                          disabled={loading}
                          className="w-full text-center text-xs text-[var(--mut)] hover:text-[var(--tx)] pt-1 cursor-pointer"
                        >
                          {a.resendVerificationEmail}
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
                      <span>{a.continueWithGoogle}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAppleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-[var(--bd)] bg-[var(--card)] hover:bg-[var(--surf)] text-[var(--tx)] font-medium text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      <AppleIcon className="w-4 h-4" />
                      <span>{a.continueWithApple}</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="w-full border-t border-[var(--bd)]" />
                    <span className="absolute px-3 bg-[var(--card)] text-xs text-[var(--mut)]">
                      {a.orWithEmail}
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
                      {a.tabSignIn}
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
                      {a.tabSignUp}
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    {tab === 'up' && (
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[var(--mut)] absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder={a.namePlaceholder}
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
                        placeholder={a.emailShortPlaceholder}
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
                        placeholder={a.passwordPlaceholder}
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
                          {a.forgotPasswordLink}
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
                          {a.tosPrefix}
                          <button
                            type="button"
                            onClick={() => onOpenLegal('sartlar')}
                            className="underline hover:text-[var(--tx)] text-[var(--tx)] font-medium"
                          >
                            {a.tosTerms}
                          </button>
                          {a.tosAnd}
                          <button
                            type="button"
                            onClick={() => onOpenLegal('gizlilik')}
                            className="underline hover:text-[var(--tx)] text-[var(--tx)] font-medium"
                          >
                            {a.tosPrivacy}
                          </button>
                          {a.tosSuffix}
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
                      {loading ? a.processing : tab === 'up' ? a.createAccount : a.signInBtn}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[11px] text-[var(--mut)] text-center mt-5">{a.footerSecurity}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
