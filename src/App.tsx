import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';
import { WifiOff, Wifi } from 'lucide-react';
import { LIQUID_EASE } from './lib/motion';
import {
  auth,
  ChatSession,
  ChatMessage,
  subscribeToUserChats,
  saveChatSession,
  deleteChatSession,
  deleteUserProfileAndCommands,
  applyActionCode,
  syncUserProfile,
} from './lib/firebase';
import { LandingPage } from './components/LandingPage';
import { ChatWorkspace } from './components/ChatWorkspace';
import { AuthModal } from './components/AuthModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { FontPreference } from './components/SettingsModal';
import { LoginLoadingScreen } from './components/LoginLoadingScreen';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Language, TRANSLATIONS, getInitialLanguage } from './lib/i18n';
import { AppearanceProvider } from './lib/appearance';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginGateActive, setLoginGateActive] = useState(false);
  const [chatsReadyForUid, setChatsReadyForUid] = useState<string | null>(null);
  const verifiedUidRef = useRef<string | null>(null);

  // App view: 'landing' or 'chat'
  const [view, setView] = useState<'landing' | 'chat'>('landing');

  // Chats state (synced with Firestore when authenticated, local fallback when guest)
  const [chats, setChats] = useState<ChatSession[]>([]);
  const chatsRef = useRef<ChatSession[]>([]);
  chatsRef.current = chats;
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'in' | 'up'>('in');
  const [initialResetCode, setInitialResetCode] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [legalModalType, setLegalModalType] = useState<LegalDocType>(null);
  const [networkState, setNetworkState] = useState<'online' | 'offline' | 'reconnected'>(() =>
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online'
  );

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('lc_theme') as 'light' | 'dark' | null;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Language state ('en' | 'tr')
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const t = TRANSLATIONS[lang];

  // Font preference state ('auto' automatically applies Turkish-optimized DM Sans + Source Serif 4 in TR)
  const [fontPref, setFontPref] = useState<FontPreference>(() => {
    try {
      const saved = localStorage.getItem('lc_font');
      if (saved === 'tr-sans' || saved === 'jakarta' || saved === 'serif' || saved === 'auto') {
        return saved;
      }
    } catch {}
    return 'auto';
  });

  // Sidebar & composer focus state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('lc_sidebar_open');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [composerFocusTick, setComposerFocusTick] = useState(0);

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('lc_theme', theme);
    } catch {}
  }, [theme]);

  // Sync language, localized page title, description, canonical URL, and og:url
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('lc_lang', lang);
    } catch {}

    const title =
      lang === 'tr'
        ? 'Longclaw – Yazma, Kodlama ve Düşünme için Sakin Yapay Zekâ Çalışma Alanı'
        : 'Longclaw – Calm AI Workspace for Writing, Coding & Thinking';
    const description =
      lang === 'tr'
        ? 'Longclaw; yazma, canlı önizlemeli kodlama, görsel üretimi ve doğrudan Google Workspace komutları için sakin bir yapay zekâ çalışma alanıdır.'
        : 'Longclaw is a calm AI workspace for writing, coding with live preview, image generation, and direct Google Workspace commands across desktop and mobile.';

    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    if (typeof window !== 'undefined') {
      const canonicalHref = `${window.location.origin}${window.location.pathname}`;
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalHref;

      let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.setAttribute('content', canonicalHref);
    }
  }, [lang]);

  // Monitor browser online/offline transitions without cluttering idle UI
  useEffect(() => {
    let reconnectTimer: number | undefined;
    const handleOffline = () => {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      setNetworkState('offline');
    };
    const handleOnline = () => {
      setNetworkState('reconnected');
      reconnectTimer = window.setTimeout(() => setNetworkState('online'), 2600);
    };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Sync font preference with DOM and localStorage
  useEffect(() => {
    if (fontPref === 'auto') {
      delete document.documentElement.dataset.font;
    } else {
      document.documentElement.dataset.font = fontPref;
    }
    try {
      localStorage.setItem('lc_font', fontPref);
    } catch {}
  }, [fontPref]);

  // Persist desktop sidebar state
  useEffect(() => {
    try {
      localStorage.setItem('lc_sidebar_open', String(sidebarOpen));
    } catch {}
  }, [sidebarOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      setSidebarOpen((prev) => !prev);
    } else {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setAuthModalOpen(false);
        setInitialResetCode(null);
        if (verifiedUidRef.current !== currentUser.uid) {
          setLoginGateActive(true);
        }
        setView('chat');
      } else {
        verifiedUidRef.current = null;
        setChatsReadyForUid(null);
        setLoginGateActive(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle Firebase Email Action Links (?mode=verifyEmail&oobCode=... or ?mode=resetPassword&oobCode=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');

    if (!mode || !oobCode) return;

    if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await auth.currentUser.reload();
            await syncUserProfile(auth.currentUser);
          }
          setActionBanner(TRANSLATIONS[getInitialLanguage()].app.emailVerifiedBanner);
          setTimeout(() => setActionBanner(null), 5000);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('Email verification link error:', err);
          setActionBanner(TRANSLATIONS[getInitialLanguage()].app.emailVerifyErrorBanner);
          setTimeout(() => setActionBanner(null), 5000);
        });
    } else if (mode === 'resetPassword') {
      setInitialResetCode(oobCode);
      setAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Real-time Firestore sync when user is authenticated
  useEffect(() => {
    if (!user) {
      // Guest mode: load from localStorage if exists
      try {
        const local = localStorage.getItem('lc_guest_chats');
        if (local) {
          const parsed: ChatSession[] = JSON.parse(local);
          setChats(parsed);
          if (parsed.length > 0) {
            setCurrentChatId((prev) =>
              prev && parsed.some((c) => c.id === prev) ? prev : parsed[0].id
            );
          }
        }
      } catch {}
      return;
    }

    // Subscribe to Firestore /users/{uid}/chats
    setChatsReadyForUid(null);
    const unsubscribe = subscribeToUserChats(
      user.uid,
      (fetchedChats) => {
        if (fetchedChats.length === 0) {
          // If user has no chats yet, check if there are guest chats to migrate
          const local = localStorage.getItem('lc_guest_chats');
          if (local) {
            try {
              const parsed: ChatSession[] = JSON.parse(local);
              if (parsed.length > 0) {
                // Migrate guest chats
                parsed.forEach((c) => {
                  saveChatSession(user.uid, { ...c, userId: user.uid }, true);
                });
                localStorage.removeItem('lc_guest_chats');
                return;
              }
            } catch {}
          }

          // Create initial starter chat
          const initialChat: ChatSession = {
            id: `chat-${Date.now()}`,
            userId: user.uid,
            title: TRANSLATIONS[getInitialLanguage()].common.newChat,
            mode: 'chat',
            depth: 'mid',
            pin: false,
            messages: [],
          };
          saveChatSession(user.uid, initialChat, true);
          setChats([initialChat]);
          setCurrentChatId(initialChat.id);
          setChatsReadyForUid(user.uid);
        } else {
          setChats(fetchedChats);
          setCurrentChatId((prev) =>
            prev && fetchedChats.some((c) => c.id === prev) ? prev : fetchedChats[0].id
          );
          setChatsReadyForUid(user.uid);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice:', error);
        setChatsReadyForUid(user.uid);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Operations
  const handleNewChat = async () => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      userId: user?.uid || 'guest',
      title: t.common.newChat,
      mode: 'chat',
      depth: 'mid',
      pin: false,
      messages: [],
    };

    if (user) {
      await saveChatSession(user.uid, newChat, true);
    } else {
      const updated = [newChat, ...chatsRef.current];
      setChats(updated);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(updated));
      } catch {}
    }
    setCurrentChatId(newChat.id);
    setMobileMenuOpen(false);
    setComposerFocusTick((tick) => tick + 1);
  };

  const handleDeleteChat = async (id: string) => {
    const remaining = chatsRef.current.filter((c) => c.id !== id);
    if (user) {
      await deleteChatSession(user.uid, id);
    } else {
      setChats(remaining);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(remaining));
      } catch {}
    }

    if (currentChatId === id) {
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      } else {
        void handleNewChat();
      }
    }
  };

  const handleTogglePinChat = async (id: string) => {
    const target = chatsRef.current.find((c) => c.id === id);
    if (!target) return;
    const updatedChat: ChatSession = { ...target, pin: !target.pin };

    if (user) {
      await saveChatSession(user.uid, updatedChat, false);
    } else {
      const updated = chatsRef.current.map((c) => (c.id === id ? updatedChat : c));
      setChats(updated);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    const target = chatsRef.current.find((c) => c.id === id);
    if (!target || !newTitle.trim()) return;
    const updatedChat: ChatSession = { ...target, title: newTitle.trim() };

    if (user) {
      await saveChatSession(user.uid, updatedChat, false);
    } else {
      const updated = chatsRef.current.map((c) => (c.id === id ? updatedChat : c));
      setChats(updated);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleUpdateChatMessages = async (
    chatId: string,
    messages: ChatMessage[],
    newTitle?: string
  ) => {
    const existing = chatsRef.current.find((c) => c.id === chatId);
    if (!existing) return;

    const updatedChat: ChatSession = {
      ...existing,
      messages,
      ...(newTitle ? { title: newTitle } : {}),
    };

    setChats((prev) => {
      const next = prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages,
              ...(newTitle ? { title: newTitle } : {}),
            }
          : c
      );
      if (!user) {
        try {
          localStorage.setItem('lc_guest_chats', JSON.stringify(next));
        } catch {}
      }
      return next;
    });

    if (user) {
      try {
        await saveChatSession(user.uid, updatedChat, false);
      } catch (err) {
        console.warn('Could not persist chat update:', err);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView('landing');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      // Delete all user's chats, custom commands, and profile document from Firestore
      for (const chat of chatsRef.current) {
        await deleteChatSession(user.uid, chat.id);
      }
      await deleteUserProfileAndCommands(user.uid);
      // Delete user account
      await user.delete();
      setView('landing');
    } catch (err: any) {
      console.error('Delete account error:', err);
      // Fallback sign out if re-authentication is required
      await handleSignOut();
    }
  };

  const handleOpenAuth = (tab: 'in' | 'up') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const showLoginLoadingScreen = authLoading || (Boolean(user) && loginGateActive);
  const anyModalOpen = authModalOpen || legalModalType !== null || showLoginLoadingScreen;

  useKeyboardShortcuts([
    {
      key: 'k',
      mod: true,
      shift: false,
      alt: false,
      allowInInput: true,
      enabled: !anyModalOpen,
      handler: () => {
        if (view === 'landing') {
          if (user) {
            setView('chat');
            void handleNewChat();
          } else {
            handleOpenAuth('up');
          }
          return;
        }
        void handleNewChat();
      },
    },
    {
      key: 'b',
      mod: true,
      shift: false,
      alt: false,
      allowInInput: true,
      enabled: view === 'chat' && !anyModalOpen,
      handler: () => {
        handleToggleSidebar();
      },
    },
    {
      key: 'Escape',
      allowInInput: true,
      enabled: anyModalOpen,
      handler: () => {
        if (legalModalType !== null) {
          setLegalModalType(null);
        } else if (authModalOpen) {
          setAuthModalOpen(false);
          setInitialResetCode(null);
        }
      },
    },
  ]);

  return (
    <AppearanceProvider>
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] font-sans antialiased">
      <AnimatePresence>
        {networkState !== 'online' && (
          <motion.div
            key="network-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: LIQUID_EASE }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[85] inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--card)] border border-[var(--bd)] shadow-xl text-xs font-medium text-[var(--tx)]"
          >
            {networkState === 'offline' ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {lang === 'tr'
                    ? 'İnternet bağlantısı kesildi. Çevrimdışısın.'
                    : 'Connection lost. You are currently offline.'}
                </span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  {lang === 'tr' ? 'Bağlantı yeniden kuruldu.' : 'Back online.'}
                </span>
              </>
            )}
          </motion.div>
        )}

        {actionBanner && (
          <motion.div
            key="app-action-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: LIQUID_EASE }}
            className="fixed top-4 right-4 z-[80] px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--bd)] shadow-xl text-xs font-medium text-[var(--tx)]"
          >
            {actionBanner}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginLoadingScreen && (
          <LoginLoadingScreen
            theme={theme}
            lang={lang}
            authResolving={authLoading}
            user={user}
            chatsReady={Boolean(user && chatsReadyForUid === user.uid)}
            onComplete={() => {
              if (user) {
                verifiedUidRef.current = user.uid;
              }
              setLoginGateActive(false);
              setView('chat');
            }}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>

      {!authLoading && view === 'landing' ? (
        <div key="landing-shell" className="animate-fade">
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onOpenLegal={(type) => setLegalModalType(type)}
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            onChangeLang={setLang}
          />
        </div>
      ) : !authLoading ? (
        <div key="workspace-shell" className="animate-fade">
          <ChatWorkspace
            user={user}
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={(id) => setCurrentChatId(id)}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onTogglePinChat={handleTogglePinChat}
            onRenameChat={handleRenameChat}
            onUpdateChatMessages={handleUpdateChatMessages}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            onChangeLang={setLang}
            fontPref={fontPref}
            onChangeFontPref={setFontPref}
            onBackToLanding={() => setView('landing')}
            sidebarOpen={sidebarOpen}
            onOpenSidebar={() => setSidebarOpen(true)}
            onToggleSidebar={handleToggleSidebar}
            mobileMenuOpen={mobileMenuOpen}
            onSetMobileMenuOpen={setMobileMenuOpen}
            composerFocusTick={composerFocusTick}
            modalsOpen={anyModalOpen}
          />
        </div>
      ) : null}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        initialResetCode={initialResetCode}
        lang={lang}
        onClose={() => {
          setAuthModalOpen(false);
          setInitialResetCode(null);
        }}
        onSuccess={() => {
          setAuthModalOpen(false);
          setInitialResetCode(null);
          setView('chat');
        }}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      {/* Legal & Compliance Modal */}
      <LegalModal type={legalModalType} lang={lang} onClose={() => setLegalModalType(null)} />
    </div>
    </AppearanceProvider>
  );
}
