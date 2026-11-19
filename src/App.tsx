import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import {
  auth,
  ChatSession,
  ChatMessage,
  subscribeToUserChats,
  saveChatSession,
  deleteChatSession,
  applyActionCode,
  syncUserProfile,
} from './lib/firebase';
import { LandingPage } from './components/LandingPage';
import { ChatWorkspace } from './components/ChatWorkspace';
import { AuthModal } from './components/AuthModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Language, TRANSLATIONS, getInitialLanguage } from './lib/i18n';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App view: 'landing' or 'chat'
  const [view, setView] = useState<'landing' | 'chat'>('landing');

  // Chats state (synced with Firestore when authenticated, local fallback when guest)
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'in' | 'up'>('in');
  const [initialResetCode, setInitialResetCode] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [legalModalType, setLegalModalType] = useState<LegalDocType>(null);

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

  // Sync language with DOM and localStorage
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('lc_lang', lang);
    } catch {}
  }, [lang]);

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
        setView('chat');
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
          const parsed = JSON.parse(local);
          setChats(parsed);
          if (parsed.length > 0 && !currentChatId) {
            setCurrentChatId(parsed[0].id);
          }
        }
      } catch {}
      return;
    }

    // Subscribe to Firestore /users/{uid}/chats
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
                // Migrate first guest chat
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
        } else {
          setChats(fetchedChats);
          if (!currentChatId || !fetchedChats.some((c) => c.id === currentChatId)) {
            setCurrentChatId(fetchedChats[0].id);
          }
        }
      },
      (error) => {
        console.warn('Firestore subscription notice:', error);
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
      const updated = [newChat, ...chats];
      setChats(updated);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(updated));
      } catch {}
    }
    setCurrentChatId(newChat.id);
    setMobileMenuOpen(false);
    setComposerFocusTick((t) => t + 1);
  };

  const handleDeleteChat = async (id: string) => {
    if (user) {
      await deleteChatSession(user.uid, id);
    } else {
      const updated = chats.filter((c) => c.id !== id);
      setChats(updated);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(updated));
      } catch {}
    }

    if (currentChatId === id) {
      const remaining = chats.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleTogglePinChat = async (id: string) => {
    const target = chats.find((c) => c.id === id);
    if (!target) return;
    const updatedChat: ChatSession = { ...target, pin: !target.pin };

    if (user) {
      await saveChatSession(user.uid, updatedChat, false);
    } else {
      const updated = chats.map((c) => (c.id === id ? updatedChat : c));
      setChats(updated);
      try {
        localStorage.setItem('lc_guest_chats', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleRenameChat = async (id: string, newTitle: string) => {
    const target = chats.find((c) => c.id === id);
    if (!target || !newTitle.trim()) return;
    const updatedChat: ChatSession = { ...target, title: newTitle.trim() };

    if (user) {
      await saveChatSession(user.uid, updatedChat, false);
    } else {
      const updated = chats.map((c) => (c.id === id ? updatedChat : c));
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
    const existing = chats.find((c) => c.id === chatId);
    if (!existing) return;

    const updatedChat: ChatSession = {
      ...existing,
      messages,
      ...(newTitle ? { title: newTitle } : {}),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages,
              ...(newTitle ? { title: newTitle } : {}),
            }
          : c
      )
    );

    if (user) {
      await saveChatSession(user.uid, updatedChat, false);
    } else {
      try {
        const nextList = chats.map((c) => (c.id === chatId ? updatedChat : c));
        localStorage.setItem('lc_guest_chats', JSON.stringify(nextList));
      } catch {}
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
      // Delete all user's chats from Firestore
      for (const chat of chats) {
        await deleteChatSession(user.uid, chat.id);
      }
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

  const anyModalOpen = authModalOpen || legalModalType !== null;

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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] font-sans antialiased">
      {actionBanner && (
        <div className="fixed top-4 right-4 z-[60] px-4 py-3 rounded-2xl bg-[var(--card)] border border-[var(--bd)] shadow-xl text-xs font-medium text-[var(--tx)]">
          {actionBanner}
        </div>
      )}

      {view === 'landing' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onOpenLegal={(type) => setLegalModalType(type)}
          theme={theme}
          onToggleTheme={toggleTheme}
          lang={lang}
          onChangeLang={setLang}
        />
      ) : (
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
          onBackToLanding={() => setView('landing')}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          mobileMenuOpen={mobileMenuOpen}
          onSetMobileMenuOpen={setMobileMenuOpen}
          composerFocusTick={composerFocusTick}
          modalsOpen={anyModalOpen}
        />
      )}

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
  );
}
