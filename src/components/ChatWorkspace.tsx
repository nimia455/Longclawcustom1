import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Send,
  Square,
  Paperclip,
  Globe,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  RotateCw,
  Zap,
  ListFilter,
  Layers,
  Menu,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChatSession,
  ChatMessage,
  sendEmailVerification,
  syncUserProfile,
} from '../lib/firebase';
import { LongclawLogo, ModelLogo } from './Icons';
import { CodePreviewPanel } from './CodePreviewPanel';
import {
  extractCodeBlocks,
  getSiblingWebAssets,
  isPreviewableCode,
  normalizeCodeLanguage,
} from '../lib/codeRunner';
import { renderMarkdown } from '../lib/markdown';
import { useKeyboardShortcuts, formatModKey } from '../hooks/useKeyboardShortcuts';
import {
  FAMILY_MODELS,
  OTHER_MODELS,
  ChatModelId,
  DEFAULT_CHAT_MODEL,
  getChatModelOption,
  isValidChatModel,
} from '../lib/models';
import { Language, TRANSLATIONS } from '../lib/i18n';

interface ChatWorkspaceProps {
  user: User | null;
  chats: ChatSession[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onTogglePinChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onUpdateChatMessages: (chatId: string, messages: ChatMessage[], newTitle?: string) => Promise<void>;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onBackToLanding: () => void;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onToggleSidebar: () => void;
  mobileMenuOpen: boolean;
  onSetMobileMenuOpen: (open: boolean) => void;
  composerFocusTick: number;
  modalsOpen?: boolean;
}

export function ChatWorkspace({
  user,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onTogglePinChat,
  onRenameChat,
  onUpdateChatMessages,
  onSignOut,
  onDeleteAccount,
  theme,
  onToggleTheme,
  lang,
  onChangeLang,
  onBackToLanding,
  sidebarOpen,
  onOpenSidebar,
  onToggleSidebar,
  mobileMenuOpen,
  onSetMobileMenuOpen,
  composerFocusTick,
  modalsOpen = false,
}: ChatWorkspaceProps) {
  const t = TRANSLATIONS[lang];
  const cText = t.chat;
  const currentChat = chats.find((c) => c.id === currentChatId) || chats[0] || null;
  const modKey = formatModKey();

  const isDefaultChatTitle = (title?: string | null) =>
    !title || title === 'Yeni sohbet' || title === 'New chat';
  const formatChatTitle = (title?: string | null) =>
    isDefaultChatTitle(title) ? t.common.newChat : title!;

  // Local chat settings
  const [depth, setDepth] = useState<'fast' | 'mid' | 'deep'>(currentChat?.depth || 'mid');
  const [selectedModel, setSelectedModel] = useState<ChatModelId>(() => {
    try {
      const saved = localStorage.getItem('lc_selected_model');
      if (saved === 'longclaw-clawing-1-low') {
        return 'longclaw-clawing-1.1-low';
      }
      if (saved === 'longclaw-clawing-1') {
        return 'longclaw-clawing-1.1';
      }
      return isValidChatModel(saved) ? saved : DEFAULT_CHAT_MODEL;
    } catch {
      return DEFAULT_CHAT_MODEL;
    }
  });
  const activeModel = getChatModelOption(selectedModel);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [otherModelsOpen, setOtherModelsOpen] = useState(() =>
    OTHER_MODELS.some((m) => m.id === selectedModel)
  );
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [deleteArm, setDeleteArm] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<string | null>(null);
  const [checkingVerify, setCheckingVerify] = useState(false);
  const [userVersion, setUserVersion] = useState(0);
  const [codePreview, setCodePreview] = useState<{
    code: string;
    language: string;
    siblingCss?: string;
    siblingJs?: string;
  } | null>(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // Input & streaming
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingThoughts, setStreamingThoughts] = useState('');
  const [streamingText, setStreamingText] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const modelMenuRef = useRef<HTMLDivElement | null>(null);

  // Persist selected model
  useEffect(() => {
    try {
      localStorage.setItem('lc_selected_model', selectedModel);
    } catch {}
  }, [selectedModel]);

  // Close model selector when clicking outside
  useEffect(() => {
    if (!modelMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target as Node)) {
        setModelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [modelMenuOpen]);

  // Sync depth and reset active code preview when chat changes
  useEffect(() => {
    if (currentChat) {
      setDepth(currentChat.depth || 'mid');
    }
    setCodePreview(null);
    setPreviewExpanded(false);
  }, [currentChat?.id]);

  const openCodePreview = (
    messageContent: string,
    code: string,
    rawLanguage: string,
    blockIndex: number
  ) => {
    const normalized = normalizeCodeLanguage(rawLanguage, code) || rawLanguage;
    const assets =
      normalized === 'html'
        ? getSiblingWebAssets(messageContent, blockIndex)
        : { siblingCss: undefined, siblingJs: undefined };
    setCodePreview({
      code,
      language: normalized,
      siblingCss: assets.siblingCss || undefined,
      siblingJs: assets.siblingJs || undefined,
    });
  };

  // Focus composer when a new chat is triggered via shortcut or button
  useEffect(() => {
    if (composerFocusTick > 0) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [composerFocusTick]);

  const focusSidebarSearch = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
      onOpenSidebar();
    } else {
      onSetMobileMenuOpen(true);
    }
    setTimeout(() => searchInputRef.current?.focus(), 80);
  };

  useKeyboardShortcuts([
    {
      key: 'f',
      mod: true,
      shift: true,
      alt: false,
      allowInInput: true,
      enabled: !modalsOpen,
      handler: focusSidebarSearch,
    },
    {
      key: '/',
      mod: false,
      shift: false,
      alt: false,
      allowInInput: false,
      enabled: !modalsOpen,
      handler: focusSidebarSearch,
    },
    {
      key: 'Escape',
      allowInInput: true,
      enabled:
        !modalsOpen &&
        Boolean(editingTitleId || modelMenuOpen || profileMenuOpen || mobileMenuOpen || codePreview),
      handler: () => {
        if (editingTitleId) {
          setEditingTitleId(null);
        } else if (modelMenuOpen) {
          setModelMenuOpen(false);
        } else if (profileMenuOpen) {
          setProfileMenuOpen(false);
        } else if (mobileMenuOpen) {
          onSetMobileMenuOpen(false);
        } else if (codePreview) {
          setCodePreview(null);
          setPreviewExpanded(false);
        }
      },
    },
  ]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: streamingText ? 'auto' : 'smooth',
    });
  }, [currentChat?.messages?.length, streamingText]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    if (currentChat && streamingText) {
      const updatedMessages = [
        ...(currentChat.messages || []),
        {
          id: `msg-${Date.now()}`,
          role: 'assistant' as const,
          content: streamingText || cText.stoppedFallback,
          thoughts: streamingThoughts,
          stopped: true,
          modelId: selectedModel,
          createdAt: Date.now(),
        },
      ];
      onUpdateChatMessages(currentChat.id, updatedMessages);
    }
    setStreamingText('');
    setStreamingThoughts('');
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (isStreaming) return;
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!text || !currentChat) return;

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    const currentList = currentChat.messages || [];
    const updatedWithUser = [...currentList, newUserMsg];

    // Optimistically update without blocking the /api/chat network request
    void onUpdateChatMessages(currentChat.id, updatedWithUser);

    // Prepare API call
    setIsStreaming(true);
    setStreamingText('');
    setStreamingThoughts('');

    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedWithUser.map((m) => ({ role: m.role, content: m.content })),
          depth,
          mode: 'chat',
          model: selectedModel,
          lang,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error(cText.readBodyError);

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      let accumulatedThoughts = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line) continue;

          try {
            const event = JSON.parse(line);
            if (event.t === 'tx') {
              accumulatedText += event.x;
              setStreamingText(accumulatedText);
            } else if (event.t === 'th') {
              accumulatedThoughts += event.x;
              setStreamingThoughts(accumulatedThoughts);
            } else if (event.t === 'err') {
              throw new Error(event.x || cText.streamError);
            }
          } catch (parseErr: any) {
            if (parseErr instanceof SyntaxError) {
              // Ignored partial JSON chunk
            } else {
              throw parseErr;
            }
          }
        }
      }

      const finalDuration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const newAssistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: accumulatedText || cText.noResponseFallback,
        thoughts: accumulatedThoughts,
        dur: finalDuration,
        modelId: selectedModel,
        createdAt: Date.now(),
      };

      const finalMessages = [...updatedWithUser, newAssistantMsg];
      void onUpdateChatMessages(currentChat.id, finalMessages);

      // Auto-title in the background so the chat completes immediately without waiting for a second API round-trip
      if (isDefaultChatTitle(currentChat.title) && updatedWithUser.length === 1) {
        const chatIdToTitle = currentChat.id;
        void (async () => {
          let newTitle = text.slice(0, 30);
          try {
            const titleRes = await fetch('/api/name-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userMessage: text,
                assistantMessage: accumulatedText,
                lang,
              }),
            });
            if (titleRes.ok) {
              const titleData = await titleRes.json();
              if (titleData.title) {
                newTitle = titleData.title;
              }
            }
          } catch {}
          if (newTitle) {
            await onUpdateChatMessages(chatIdToTitle, finalMessages, newTitle);
          }
        })();
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: cText.chatErrorMessage(err.message || cText.connectionError),
        createdAt: Date.now(),
      };
      await onUpdateChatMessages(currentChat.id, [...updatedWithUser, errorMsg]);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
      setStreamingThoughts('');
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (isStreaming || !currentChat?.messages?.length) return;
    const msgs = [...currentChat.messages];
    if (msgs[msgs.length - 1].role === 'assistant') {
      msgs.pop();
    }
    const lastUser = msgs[msgs.length - 1];
    if (lastUser && lastUser.role === 'user') {
      await onUpdateChatMessages(currentChat.id, msgs);
      handleSendMessage(lastUser.content);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const fileContent = String(reader.result || '').slice(0, 30000);
      const snippet = `[${cText.fileLabel}: ${file.name}]\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
      setInputMessage((prev) => snippet + prev);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportChat = () => {
    if (!currentChat || !currentChat.messages?.length) return;
    const markdown = `# ${formatChatTitle(currentChat.title)}\n\n${currentChat.messages
      .map((m) => `**${m.role === 'user' ? cText.exportUserLabel : 'Longclaw'}:**\n${m.content}`)
      .join('\n\n---\n\n')}`;

    navigator.clipboard.writeText(markdown);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1600);
  };

  // Filtered chats list
  const filteredChats = chats
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchContent = c.messages?.some((m) => m.content.toLowerCase().includes(q));
      return matchTitle || matchContent;
    })
    .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0));

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[var(--bg)] text-[var(--tx)]">
      {/* Sidebar Overlay on mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
          onClick={() => onSetMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 h-full shrink-0 overflow-hidden bg-[var(--surf)] border-[var(--bd)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] w-[82vw] max-w-[300px] md:w-72 border-r ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${
          sidebarOpen
            ? 'md:w-72 md:border-r md:opacity-100'
            : 'md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none'
        }`}
      >
        <div className="w-[82vw] max-w-[300px] md:w-72 h-full flex flex-col p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] gap-3">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1.5 py-1">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 font-space font-bold text-lg text-[var(--tx)] hover:opacity-80 transition-opacity cursor-pointer"
              title={cText.backToLandingTitle}
            >
              <LongclawLogo className="w-6 h-6" />
              <span>Longclaw</span>
            </button>

            <button
              onClick={() => onSetMobileMenuOpen(false)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--card)] cursor-pointer"
              aria-label={cText.closeMenuAria}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              onSetMobileMenuOpen(false);
            }}
            title={`${cText.newChatTitle} (${modKey}+K)`}
            className="w-full flex items-center justify-between py-3 md:py-2.5 px-3.5 rounded-xl bg-[var(--ac)] text-[var(--on)] font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 shrink-0" />
              <span>{cText.newChatTitle}</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-[var(--on)]/15 text-[10px] font-sans font-medium tracking-wide opacity-80">
              {modKey}+K
            </kbd>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--mut)] absolute left-3 top-3 md:top-2.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={cText.searchPlaceholder}
              title={`${cText.searchTitle} (/ · ${modKey}+Shift+F)`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 md:py-2 text-base md:text-xs rounded-xl bg-[var(--card)] border border-[var(--bd)] text-[var(--tx)] placeholder:text-[var(--mut)] outline-none focus:border-[var(--tx)] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[var(--mut)] hover:text-[var(--tx)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--mut)]">
                {searchQuery ? cText.noResults : cText.noChatsYet}
              </div>
            ) : (
              filteredChats.map((c) => {
                const isActive = c.id === currentChat?.id;
                const isEditing = editingTitleId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectChat(c.id);
                      onSetMobileMenuOpen(false);
                    }}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-xl text-[13px] md:text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[var(--card)] text-[var(--tx)] shadow-xs'
                      : 'text-[var(--mut)] hover:bg-[var(--card)]/60 hover:text-[var(--tx)]'
                  }`}
                >
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1.5 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onRenameChat(c.id, editTitleInput);
                            setEditingTitleId(null);
                          } else if (e.key === 'Escape') {
                            setEditingTitleId(null);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-[var(--bg)] border border-[var(--bd)] px-2 py-1 rounded text-base md:text-xs text-[var(--tx)] outline-none"
                      />
                      <button
                        onClick={() => {
                          onRenameChat(c.id, editTitleInput);
                          setEditingTitleId(null);
                        }}
                        className="p-1.5 hover:text-emerald-500"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTitleId(null)}
                        className="p-1.5 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{formatChatTitle(c.title)}</span>

                      <div
                        className={`flex items-center gap-0.5 transition-opacity ${
                          isActive
                            ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinChat(c.id);
                          }}
                          className={`p-1 rounded hover:bg-[var(--surf)] ${
                            c.pin ? 'opacity-100 text-[var(--tx)]' : 'text-[var(--mut)]'
                          }`}
                          title={c.pin ? cText.unpinTitle : cText.pinTitle}
                        >
                          <Pin className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(c.id);
                            setEditTitleInput(formatChatTitle(c.title));
                          }}
                          className="p-1 rounded text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)]"
                          title={cText.renameTitle}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(c.id);
                          }}
                          className="p-1 rounded text-[var(--mut)] hover:text-red-500 hover:bg-[var(--surf)]"
                          title={cText.deleteTitle}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User Profile Footer */}
        <div className="relative pt-2 border-t border-[var(--bd)]">
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-14 left-0 right-0 bg-[var(--card)] border border-[var(--bd)] rounded-2xl p-2 shadow-xl space-y-1 text-xs z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-[var(--bd)] space-y-1">
                  <p className="font-medium text-[var(--tx)] truncate">
                    {user?.displayName || t.common.defaultUser}
                  </p>
                  <p className="text-[11px] text-[var(--mut)] truncate">
                    {user?.email || ''}
                  </p>
                  {user?.email && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          user.emailVerified
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                        {user.emailVerified ? cText.emailVerified : cText.emailUnverified}
                      </span>
                    </div>
                  )}
                </div>

              <button
                onClick={() => {
                  onToggleTheme();
                  setProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--surf)] text-[var(--tx)] cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? cText.switchToLight : cText.switchToDark}</span>
              </button>

              <button
                onClick={() => {
                  onChangeLang(lang === 'tr' ? 'en' : 'tr');
                  setProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--surf)] text-[var(--tx)] cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>{cText.switchLanguageLabel}</span>
              </button>

              <button
                onClick={() => {
                  onSignOut();
                  setProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-[var(--surf)] text-[var(--tx)] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{cText.signOut}</span>
              </button>

              <button
                onClick={async () => {
                  if (!deleteArm) {
                    setDeleteArm(true);
                    setTimeout(() => setDeleteArm(false), 4000);
                    return;
                  }
                  await onDeleteAccount();
                  setProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-red-500/10 text-red-500 font-medium cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteArm ? cText.deleteAccountConfirm : cText.deleteAccount}</span>
              </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-[var(--card)] border border-[var(--bd)] hover:border-[var(--tx)] text-left transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--ac)] text-[var(--on)] flex items-center justify-center font-semibold text-xs shrink-0">
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--tx)] truncate">
                {user?.displayName || t.common.defaultUser}
              </p>
              <p className="text-[10px] text-[var(--mut)] truncate">
                {user?.email || 'Firebase Auth'}
              </p>
            </div>
            <ChevronUp className={`w-3.5 h-3.5 text-[var(--mut)] shrink-0 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        </div>
      </aside>

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Control Bar */}
        <header className="h-14 border-b border-[var(--bd)] px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 bg-[var(--bg)] shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={() => onSetMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--bd)] text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer shrink-0"
              aria-label={cText.openSidebarAria}
              title={`${cText.sidebarLabel} (${modKey}+B)`}
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSidebar}
              className="hidden md:inline-flex items-center justify-center p-2 rounded-xl border border-[var(--bd)] hover:bg-[var(--surf)] text-[var(--mut)] hover:text-[var(--tx)] transition-colors cursor-pointer shrink-0"
              aria-label={sidebarOpen ? cText.hideSidebar : cText.showSidebar}
              title={`${sidebarOpen ? cText.hideSidebar : cText.showSidebar} (${modKey}+B)`}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>

            <h2 className="font-serif-fraunces text-[15px] sm:text-base font-semibold truncate max-w-[140px] sm:max-w-md">
              {formatChatTitle(currentChat?.title)}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Depth Selector Buttons */}
            <div className="flex items-center bg-[var(--surf)] p-1 rounded-full border border-[var(--bd)] text-xs">
              <button
                onClick={() => setDepth('fast')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full font-medium transition-all cursor-pointer ${
                  depth === 'fast'
                    ? 'bg-[var(--ac)] text-[var(--on)] shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
                title={cText.depthFastTitle}
              >
                <Zap className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{cText.depthFast}</span>
              </button>

              <button
                onClick={() => setDepth('mid')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full font-medium transition-all cursor-pointer ${
                  depth === 'mid'
                    ? 'bg-[var(--ac)] text-[var(--on)] shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
                title={cText.depthMidTitle}
              >
                <ListFilter className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{cText.depthMid}</span>
              </button>

              <button
                onClick={() => setDepth('deep')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-full font-medium transition-all cursor-pointer ${
                  depth === 'deep'
                    ? 'bg-[var(--ac)] text-[var(--on)] shadow-xs'
                    : 'text-[var(--mut)] hover:text-[var(--tx)]'
                }`}
                title={cText.depthDeepTitle}
              >
                <Layers className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{cText.depthDeep}</span>
              </button>
            </div>

            {/* Export Chat Button */}
            <button
              onClick={handleExportChat}
              disabled={!currentChat?.messages?.length}
              className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl border border-[var(--bd)] hover:bg-[var(--surf)] text-[var(--mut)] hover:text-[var(--tx)] transition-all cursor-pointer disabled:opacity-30 shrink-0"
              title={cText.exportMarkdownTitle}
            >
              {copiedExport ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Email Verification Banner (when user has an unverified email) */}
        {user && user.email && !user.emailVerified && userVersion >= 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {emailVerifyStatus || cText.emailUnverifiedBanner(user.email)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={checkingVerify}
                onClick={async () => {
                  try {
                    setCheckingVerify(true);
                    await sendEmailVerification(user);
                    setEmailVerifyStatus(cText.emailVerificationSent);
                  } catch (err: any) {
                    setEmailVerifyStatus(err.message || cText.emailSendFailed);
                  } finally {
                    setCheckingVerify(false);
                  }
                }}
                className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-medium cursor-pointer"
              >
                {cText.sendVerification}
              </button>
              <button
                type="button"
                disabled={checkingVerify}
                onClick={async () => {
                  try {
                    setCheckingVerify(true);
                    await user.reload();
                    await syncUserProfile(user);
                    setUserVersion((v) => v + 1);
                    if (!user.emailVerified) {
                      setEmailVerifyStatus(cText.emailStillUnverified);
                    }
                  } finally {
                    setCheckingVerify(false);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${checkingVerify ? 'animate-spin' : ''}`} />
                <span>{cText.checkAgain}</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Messages Thread */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 sm:p-6 space-y-5 sm:space-y-6">
          <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
            {(!currentChat?.messages || currentChat.messages.length === 0) && (
              <div className="text-center py-6 sm:py-16 space-y-5 sm:space-y-6 animate-up">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--surf)] border border-[var(--bd)] mx-auto flex items-center justify-center text-[var(--tx)] shadow-sm">
                  <LongclawLogo className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>

                <div className="px-2">
                  <h3 className="font-serif-fraunces text-2xl sm:text-3xl font-semibold">
                    {cText.helloUser(
                      user?.displayName ? user.displayName.split(' ')[0] : cText.defaultFriendName
                    )}
                  </h3>
                  <p className="text-sm text-[var(--mut)] mt-1.5 max-w-md mx-auto leading-relaxed">
                    {cText.emptySubtitle}
                  </p>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 max-w-xl mx-auto text-left pt-1 sm:pt-2">
                  {cText.suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (sug.endsWith(':')) {
                          setInputMessage(sug + ' ');
                          textareaRef.current?.focus();
                        } else {
                          handleSendMessage(sug);
                        }
                      }}
                      className="p-4 sm:p-3.5 rounded-2xl border border-[var(--bd)] bg-[var(--card)] hover:border-[var(--tx)] text-[13px] sm:text-xs text-[var(--tx)]/90 transition-all text-left shadow-2xs hover:-translate-y-0.5 cursor-pointer leading-relaxed"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Existing Messages */}
            {currentChat?.messages?.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-[88%] sm:max-w-[82%] bg-[var(--ac)] text-[var(--on)] px-4 py-3 rounded-2xl rounded-tr-xs text-[15px] sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full flex gap-2.5 sm:gap-3 items-start animate-pop">
                    <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--surf)] border border-[var(--bd)] flex items-center justify-center text-[var(--tx)] mt-1">
                      <LongclawLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2.5">
                      {/* Thought block */}
                      {msg.thoughts && (
                        <div className="border border-[var(--bd)] rounded-xl bg-[var(--surf)]/60 overflow-hidden text-xs">
                          <button
                            onClick={() =>
                              setExpandedThoughts((prev) => ({
                                ...prev,
                                [msg.id]: !prev[msg.id],
                              }))
                            }
                            className="w-full px-3 py-2 flex items-center justify-between text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 font-medium">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>
                                {cText.thoughtsLabel}{' '}
                                {msg.dur ? `· ${msg.dur} ${cText.secondsShort}` : ''}
                              </span>
                            </span>
                            {expandedThoughts[msg.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <AnimatePresence initial={false}>
                            {expandedThoughts[msg.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 pt-1 border-t border-[var(--bd)] text-[var(--mut)] whitespace-pre-line leading-relaxed">
                                  {msg.thoughts}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Content */}
                      <div className="text-[15px] sm:text-[14.5px] leading-[1.65] sm:leading-relaxed text-[var(--tx)] break-words">
                        {renderMarkdown(msg.content, {
                          onOpenPreview: (code, language, blockIndex) =>
                            openCodePreview(msg.content, code, language, blockIndex),
                          openResultLabel: cText.codePreview.openResult,
                          copyCodeLabel: cText.codePreview.copyCode,
                          copiedCodeLabel: cText.codePreview.copiedCode,
                          enablePreviewButtons: true,
                        })}
                      </div>

                      {/* Action Tools */}
                      {(() => {
                        const previewableBlocks = extractCodeBlocks(msg.content).filter((b) =>
                          isPreviewableCode(b.language, b.code)
                        );
                        const primaryBlock =
                          previewableBlocks.find((b) =>
                            ['html', 'jsx', 'tsx', 'react', 'svg', 'mermaid'].includes(b.language)
                          ) || previewableBlocks[0];

                        return (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[var(--mut)]">
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-[var(--surf)] hover:text-[var(--tx)] transition-colors cursor-pointer"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-500 font-medium">{cText.copied}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>{cText.copy}</span>
                                </>
                              )}
                            </button>

                            {primaryBlock && (
                              <button
                                onClick={() =>
                                  openCodePreview(
                                    msg.content,
                                    primaryBlock.code,
                                    primaryBlock.language,
                                    primaryBlock.index
                                  )
                                }
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--surf)] border border-[var(--bd)] text-[var(--tx)] hover:border-[var(--tx)] transition-colors cursor-pointer font-medium"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>{cText.codePreview.openResult}</span>
                              </button>
                            )}

                            {idx === (currentChat?.messages?.length || 0) - 1 && (
                              <button
                                onClick={handleRegenerate}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-2 sm:py-1 rounded-lg hover:bg-[var(--surf)] hover:text-[var(--tx)] transition-colors cursor-pointer"
                              >
                                <RotateCw className="w-3 h-3" />
                                <span>{cText.regenerate}</span>
                              </button>
                            )}

                            {msg.modelId && isValidChatModel(msg.modelId) && (
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] text-[var(--mut)]/90 select-none sm:ml-auto"
                                title={getChatModelOption(msg.modelId).name}
                              >
                                <ModelLogo modelId={msg.modelId} className="w-3 h-3 shrink-0" />
                                <span>{getChatModelOption(msg.modelId).shortName}</span>
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Streaming Bubble */}
            {isStreaming && (
              <div className="w-full flex gap-2.5 sm:gap-3 items-start animate-pop">
                <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--surf)] border border-[var(--bd)] flex items-center justify-center text-[var(--tx)] mt-1">
                  <LongclawLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                  {streamingThoughts && (
                    <div className="border border-[var(--bd)] rounded-xl bg-[var(--surf)]/70 p-3 text-xs text-[var(--mut)] space-y-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="animate-shimmer">{cText.thinking}</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{streamingThoughts}</p>
                    </div>
                  )}

                  {streamingText ? (
                    <div className="text-[15px] leading-[1.65] sm:leading-relaxed text-[var(--tx)] font-soft break-words">
                      {renderMarkdown(streamingText, {
                        copyCodeLabel: cText.codePreview.copyCode,
                        copiedCodeLabel: cText.codePreview.copiedCode,
                        enablePreviewButtons: false,
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 py-2.5">
                      <span
                        className="w-[7px] h-[7px] rounded-full bg-[var(--mut)] animate-[bn_1.1s_infinite]"
                        style={{ animationDelay: '0s' }}
                      />
                      <span
                        className="w-[7px] h-[7px] rounded-full bg-[var(--mut)] animate-[bn_1.1s_infinite]"
                        style={{ animationDelay: '0.15s' }}
                      />
                      <span
                        className="w-[7px] h-[7px] rounded-full bg-[var(--mut)] animate-[bn_1.1s_infinite]"
                        style={{ animationDelay: '0.3s' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Composer */}
        <div className="px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-5 border-t border-[var(--bd)] bg-[var(--bg)] shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Unified Typing Bar */}
            <div className="relative border border-[var(--bd)] focus-within:border-[var(--tx)] rounded-[26px] sm:rounded-3xl bg-[var(--card)] px-3.5 pt-3 pb-2.5 shadow-sm transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.json,.csv,.py,.js,.html,.ts"
                onChange={handleFileUpload}
                className="hidden"
              />

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={cText.inputPlaceholder}
                className="w-full bg-transparent border-0 outline-none resize-none px-1 pb-2 text-base sm:text-sm leading-relaxed text-[var(--tx)] placeholder:text-[var(--mut)] max-h-44 min-h-[38px]"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Attach File */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer shrink-0"
                    title={cText.attachFileTitle}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Model Selector inside Typing Bar */}
                  <div ref={modelMenuRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setModelMenuOpen((prev) => !prev)}
                      aria-expanded={modelMenuOpen}
                      aria-haspopup="listbox"
                      className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-2.5 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-full border border-[var(--bd)] bg-[var(--surf)]/70 hover:bg-[var(--surf)] hover:border-[var(--tx)] text-xs font-medium text-[var(--tx)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                      title={cText.selectModelTitle}
                    >
                      <ModelLogo modelId={selectedModel} className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">{activeModel.name}</span>
                      <span className="sm:hidden">{activeModel.shortName}</span>
                      <ChevronUp
                        className={`w-3.5 h-3.5 text-[var(--mut)] transition-transform duration-200 ${
                          modelMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {modelMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          role="listbox"
                          aria-label={cText.modelSelectionAria}
                          className="absolute left-[-46px] sm:left-0 bottom-12 sm:bottom-11 w-[min(20rem,calc(100vw-1.5rem))] sm:w-80 max-h-[min(70dvh,30rem)] overflow-y-auto rounded-2xl border border-[var(--bd)] bg-[var(--card)] p-1.5 shadow-xl z-50 space-y-1"
                        >
                          <div className="px-2.5 py-1.5 text-[11px] font-medium text-[var(--mut)]">
                            {cText.chooseModel}
                          </div>
                          {FAMILY_MODELS.map((m) => {
                            const isSelected = m.id === selectedModel;
                            const localizedModel = t.models[m.id];
                            return (
                              <button
                                key={m.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setSelectedModel(m.id);
                                  setModelMenuOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 p-3 sm:p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[var(--surf)] text-[var(--tx)]'
                                    : 'hover:bg-[var(--surf)]/60 text-[var(--tx)]'
                                }`}
                              >
                                <div className="w-8 h-8 rounded-xl bg-[var(--bg)] border border-[var(--bd)] flex items-center justify-center shrink-0 mt-0.5">
                                  <ModelLogo modelId={m.id} className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--tx)]">
                                    <span className="truncate">{m.name}</span>
                                    <span className="text-[11px] font-normal text-[var(--mut)] shrink-0">
                                      · {localizedModel.tagline}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[var(--mut)] leading-snug mt-0.5">
                                    {localizedModel.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-[var(--tx)] shrink-0 mt-1" />
                                )}
                              </button>
                            );
                          })}

                          {OTHER_MODELS.length > 0 && (
                            <div className="pt-1 mt-1 border-t border-[var(--bd)] space-y-1">
                              <button
                                type="button"
                                onClick={() => setOtherModelsOpen((prev) => !prev)}
                                className="w-full flex items-center justify-between px-2.5 py-2 sm:py-1.5 rounded-xl text-[11px] font-medium text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)]/50 transition-colors cursor-pointer"
                              >
                                <span>{cText.otherModels}</span>
                                <ChevronDown
                                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                    otherModelsOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              {otherModelsOpen &&
                                OTHER_MODELS.map((m) => {
                                  const isSelected = m.id === selectedModel;
                                  const localizedModel = t.models[m.id];
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      role="option"
                                      aria-selected={isSelected}
                                      onClick={() => {
                                        setSelectedModel(m.id);
                                        setModelMenuOpen(false);
                                      }}
                                      className={`w-full flex items-start gap-3 p-3 sm:p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                        isSelected
                                          ? 'bg-[var(--surf)] text-[var(--tx)]'
                                          : 'hover:bg-[var(--surf)]/60 text-[var(--tx)]'
                                      }`}
                                    >
                                      <div className="w-8 h-8 rounded-xl bg-[var(--bg)] border border-[var(--bd)] flex items-center justify-center shrink-0 mt-0.5">
                                        <ModelLogo modelId={m.id} className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--tx)]">
                                          <span className="truncate">{m.name}</span>
                                          <span className="text-[11px] font-normal text-[var(--mut)] shrink-0">
                                            · {localizedModel.tagline}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--mut)] leading-snug mt-0.5">
                                          {localizedModel.description}
                                        </p>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-4 h-4 text-[var(--tx)] shrink-0 mt-1" />
                                      )}
                                    </button>
                                  );
                                })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStopStreaming}
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 hover:bg-red-600 transition-colors shadow-xs cursor-pointer"
                    title={cText.stopTitle}
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[var(--ac)] text-[var(--on)] flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    title={cText.sendTitle}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-between text-[11px] text-[var(--mut)] px-2">
              <span className="hidden sm:inline">{cText.composerHint}</span>
              <span className="inline-flex items-center gap-1.5">
                <ModelLogo modelId={selectedModel} className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeModel.name} ·{' '}
                  {depth === 'fast'
                    ? cText.effortLow
                    : depth === 'deep'
                    ? cText.effortHigh
                    : cText.effortBalanced}
                </span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {codePreview && (
        <CodePreviewPanel
          code={codePreview.code}
          language={codePreview.language}
          siblingCss={codePreview.siblingCss}
          siblingJs={codePreview.siblingJs}
          theme={theme}
          lang={lang}
          isExpanded={previewExpanded}
          onToggleExpand={() => setPreviewExpanded((prev) => !prev)}
          onClose={() => {
            setCodePreview(null);
            setPreviewExpanded(false);
          }}
        />
      )}
    </div>
  );
}
