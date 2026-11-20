import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Pencil,
  Check,
  Sun,
  Moon,
  Globe,
  Terminal,
} from 'lucide-react';
import { ConnectorsIcon } from './Icons';
import { AnimatePresence, motion } from 'motion/react';
import { User } from 'firebase/auth';
import { CustomSlashCommand } from '../lib/firebase';
import {
  getBuiltInCommands,
  getStarterCommandTemplates,
  normalizeCommandName,
} from '../lib/commands';
import { Language } from '../lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  initialTab?: 'commands' | 'general';
  user: User | null;
  lang: Language;
  theme: 'light' | 'dark';
  customCommands: CustomSlashCommand[];
  workspaceConnected: boolean;
  workspaceEmail: string | null;
  onSaveCommand: (
    cmd: { id?: string; name: string; description: string; prompt: string }
  ) => Promise<void>;
  onDeleteCommand: (commandId: string) => Promise<void>;
  onToggleTheme: () => void;
  onChangeLang: (lang: Language) => void;
  onOpenConnectors: () => void;
  onClose: () => void;
}

export function SettingsModal({
  isOpen,
  initialTab = 'commands',
  user,
  lang,
  theme,
  customCommands,
  workspaceConnected,
  workspaceEmail,
  onSaveCommand,
  onDeleteCommand,
  onToggleTheme,
  onChangeLang,
  onOpenConnectors,
  onClose,
}: SettingsModalProps) {
  const isTr = lang === 'tr';
  const [activeTab, setActiveTab] = useState<'commands' | 'general'>(initialTab);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFormError(null);
    }
  }, [isOpen, initialTab]);

  const builtIns = getBuiltInCommands(lang);
  const starters = getStarterCommandTemplates(lang);

  const resetForm = () => {
    setEditingId(null);
    setNameInput('');
    setDescInput('');
    setPromptInput('');
    setFormError(null);
  };

  const handleStartEdit = (cmd: CustomSlashCommand) => {
    setEditingId(cmd.id);
    setNameInput(cmd.name);
    setDescInput(cmd.description || '');
    setPromptInput(cmd.prompt);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const normalized = normalizeCommandName(nameInput);
    const trimmedPrompt = promptInput.trim();
    const trimmedDesc = descInput.trim();

    if (!normalized) {
      setFormError(
        isTr
          ? 'Komut adı en az bir harf veya rakamla başlamalı (örn. email, ozet).'
          : 'Command name must start with a letter or number (e.g. email, standup).'
      );
      return;
    }

    if (!trimmedPrompt) {
      setFormError(
        isTr
          ? 'Bu komut çalıştığında ne yapılacağını yazmalısın.'
          : 'Add the instruction this command should run.'
      );
      return;
    }

    const duplicate = customCommands.find(
      (c) => c.name.toLowerCase() === normalized && c.id !== editingId
    );
    if (duplicate) {
      setFormError(
        isTr
          ? `/${normalized} adında bir komutun zaten var.`
          : `You already have a /${normalized} command.`
      );
      return;
    }

    try {
      setSaving(true);
      await onSaveCommand({
        id: editingId || undefined,
        name: normalized,
        description: trimmedDesc,
        prompt: trimmedPrompt,
      });
      const label = editingId
        ? isTr
          ? `/${normalized} güncellendi.`
          : `Updated /${normalized}.`
        : isTr
          ? `/${normalized} eklendi. Artık sohbette yazabilirsin.`
          : `Added /${normalized}. You can type it in chat now.`;
      resetForm();
      setSavedNotice(label);
      setTimeout(() => setSavedNotice((curr) => (curr === label ? null : curr)), 3000);
    } catch (err: any) {
      setFormError(
        err?.message ||
          (isTr ? 'Komut kaydedilemedi. Tekrar dene.' : 'Could not save command. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAddStarter = async (tpl: {
    name: string;
    description: string;
    prompt: string;
  }) => {
    const exists = customCommands.some(
      (c) => c.name.toLowerCase() === tpl.name.toLowerCase()
    );
    if (exists) return;
    try {
      setSaving(true);
      await onSaveCommand(tpl);
      const label = isTr ? `/${tpl.name} eklendi.` : `Added /${tpl.name}.`;
      setSavedNotice(label);
      setTimeout(() => setSavedNotice((curr) => (curr === label ? null : curr)), 2600);
    } catch {
      // handled silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[75] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="surface-3d-elevated w-full max-w-2xl max-h-[86dvh] rounded-2xl flex flex-col overflow-hidden text-[var(--tx)]"
          >
            {/* Header */}
            <div className="px-5 sm:px-6 pt-5 pb-0 border-b border-[var(--bd)] shrink-0">
              <div className="flex items-center justify-between gap-3 pb-4">
                <div>
                  <h2 className="font-serif-fraunces text-xl font-semibold tracking-tight">
                    {isTr ? 'Ayarlar' : 'Settings'}
                  </h2>
                  <p className="text-xs text-[var(--mut)] mt-0.5">
                    {isTr
                      ? 'Özel /komutlarını yönet ve çalışma alanını düzenle.'
                      : 'Manage your /commands and workspace preferences.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={isTr ? 'Kapat' : 'Close'}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Clean underline tabs */}
              <div className="flex items-center gap-6 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab('commands')}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'commands'
                      ? 'border-[var(--tx)] text-[var(--tx)] font-semibold'
                      : 'border-transparent text-[var(--mut)] hover:text-[var(--tx)]'
                  }`}
                >
                  {isTr ? 'Komutlar (/)' : 'Commands (/)'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'general'
                      ? 'border-[var(--tx)] text-[var(--tx)] font-semibold'
                      : 'border-transparent text-[var(--mut)] hover:text-[var(--tx)]'
                  }`}
                >
                  {isTr ? 'Genel' : 'General'}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
              {activeTab === 'commands' ? (
                <>
                  {/* Add / Edit Command Form */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">
                        {editingId
                          ? isTr
                            ? 'Komutu düzenle'
                            : 'Edit command'
                          : isTr
                            ? 'Yeni komut ekle'
                            : 'Add a command'}
                      </h3>
                      {editingId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-xs text-[var(--mut)] hover:text-[var(--tx)] cursor-pointer"
                        >
                          {isTr ? 'Vazgeç' : 'Cancel edit'}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--mut)] mb-1">
                          {isTr ? 'Komut adı' : 'Command name'}
                        </label>
                        <div className="well-3d flex items-center rounded-xl px-3 h-9.5 focus-within:border-[var(--tx)]/45 transition-colors">
                          <span className="font-mono text-sm text-[var(--mut)] select-none mr-0.5">
                            /
                          </span>
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => {
                              setNameInput(e.target.value);
                              if (formError) setFormError(null);
                            }}
                            placeholder={isTr ? 'ornek-komut' : 'email'}
                            maxLength={32}
                            className="w-full bg-transparent border-0 outline-none text-sm font-mono text-[var(--tx)] placeholder:text-[var(--mut)]/65"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[var(--mut)] mb-1">
                          {isTr ? 'Kısa açıklama (isteğe bağlı)' : 'Short description (optional)'}
                        </label>
                        <input
                          type="text"
                          value={descInput}
                          onChange={(e) => setDescInput(e.target.value)}
                          placeholder={
                            isTr
                              ? 'Örn. Kısa ve nazik bir e-posta yaz'
                              : 'e.g. Draft a concise reply'
                          }
                          maxLength={140}
                          className="well-3d w-full rounded-xl px-3 h-9.5 outline-none text-sm text-[var(--tx)] placeholder:text-[var(--mut)]/65 focus:border-[var(--tx)]/45 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <label className="text-[11px] font-medium text-[var(--mut)]">
                          {isTr ? 'Komut yönergesi' : 'Prompt instruction'}
                        </label>
                        <span className="text-[11px] text-[var(--mut)]">
                          {isTr
                            ? 'Yazdığın metnin yerleşeceği yer için {input} kullanabilirsin'
                            : 'Use {input} where your message text should go'}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={promptInput}
                        onChange={(e) => {
                          setPromptInput(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder={
                          isTr
                            ? 'Şu notlara göre kısa ve net bir e-posta taslağı hazırla:\n{input}'
                            : 'Write a clear, concise email based on these notes:\n{input}'
                        }
                        maxLength={2000}
                        className="well-3d w-full rounded-xl px-3 py-2.5 outline-none text-sm leading-relaxed text-[var(--tx)] placeholder:text-[var(--mut)]/65 resize-none focus:border-[var(--tx)]/45 transition-colors"
                      />
                    </div>

                    {formError && (
                      <p className="text-xs text-red-500">{formError}</p>
                    )}

                    {savedNotice && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>{savedNotice}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <span className="text-[11px] text-[var(--mut)]">
                        {nameInput.trim()
                          ? `${isTr ? 'Önizleme:' : 'Trigger:'} /${normalizeCommandName(nameInput) || '...'}`
                          : isTr
                            ? 'Sohbette / yazarak komut menüsünü açabilirsin.'
                            : 'Type / in the chat bar to use any command.'}
                      </span>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-3d-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium cursor-pointer disabled:opacity-45"
                      >
                        {editingId ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isTr ? 'Değişiklikleri kaydet' : 'Save changes'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isTr ? 'Komut ekle' : 'Add command'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Custom Commands List */}
                  <div className="pt-5 border-t border-[var(--bd)] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-sm font-semibold">
                        {isTr ? 'Senin komutların' : 'Your commands'}
                      </h3>
                      <span className="text-[11px] text-[var(--mut)]">
                        {customCommands.length}
                      </span>
                    </div>

                    {customCommands.length === 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-[var(--mut)] leading-relaxed">
                          {isTr
                            ? 'Henüz özel bir komutun yok. Yukarıdan kendi komutunu ekleyebilir veya şu örneklerden biriyle başlayabilirsin:'
                            : 'No custom commands yet. Create one above, or add a quick starter:'}
                        </p>
                        <div className="divide-y divide-[var(--bd)]/75 border-y border-[var(--bd)]/75">
                          {starters.map((tpl) => (
                            <div
                              key={tpl.name}
                              className="py-2.5 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <span className="font-mono text-xs font-semibold text-[var(--tx)]">
                                  /{tpl.name}
                                </span>
                                <p className="text-xs text-[var(--mut)] truncate mt-0.5">
                                  {tpl.description}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => void handleQuickAddStarter(tpl)}
                                className="btn-3d-soft px-3 py-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer"
                              >
                                {isTr ? 'Ekle' : 'Add'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-[var(--bd)]/80 border-y border-[var(--bd)]/80">
                        {customCommands.map((cmd) => (
                          <div
                            key={cmd.id}
                            className="py-3 flex items-start justify-between gap-3 group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-mono text-xs font-semibold text-[var(--tx)]">
                                  /{cmd.name}
                                </span>
                                {cmd.description && (
                                  <span className="text-xs text-[var(--mut)]">
                                    {cmd.description}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--mut)]/85 mt-1 line-clamp-2 leading-relaxed">
                                {cmd.prompt}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(cmd)}
                                title={isTr ? 'Düzenle' : 'Edit'}
                                className="p-1.5 rounded-lg text-[var(--mut)] hover:text-[var(--tx)] hover:bg-[var(--surf)] transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingId === cmd.id) resetForm();
                                  void onDeleteCommand(cmd.id);
                                }}
                                title={isTr ? 'Sil' : 'Delete'}
                                className="p-1.5 rounded-lg text-[var(--mut)] hover:text-red-500 hover:bg-[var(--surf)] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Built-in Commands Reference */}
                  <div className="pt-5 border-t border-[var(--bd)] space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-[var(--mut)]" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--mut)]">
                        {isTr ? 'Hazır komutlar' : 'Built-in commands'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1">
                      {builtIns.map((cmd) => (
                        <div
                          key={cmd.id}
                          className="flex items-baseline justify-between gap-3 py-1.5 border-b border-[var(--bd)]/55 text-xs"
                        >
                          <span className="font-mono font-medium text-[var(--tx)] shrink-0">
                            /{cmd.name}
                          </span>
                          <span className="text-[var(--mut)] truncate text-right">
                            {cmd.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="divide-y divide-[var(--bd)]/80">
                  {/* Appearance */}
                  <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {isTr ? 'Görünüm' : 'Appearance'}
                      </p>
                      <p className="text-xs text-[var(--mut)] mt-0.5">
                        {theme === 'dark'
                          ? isTr
                            ? 'Koyu tema etkin'
                            : 'Dark theme active'
                          : isTr
                            ? 'Açık tema etkin'
                            : 'Light theme active'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleTheme}
                      className="btn-3d-soft inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Açık tema' : 'Switch to light'}</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5" />
                          <span>{isTr ? 'Koyu tema' : 'Switch to dark'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Language */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {isTr ? 'Dil' : 'Language'}
                      </p>
                      <p className="text-xs text-[var(--mut)] mt-0.5">
                        {isTr
                          ? 'Arayüz ve hazır komut açıklamaları'
                          : 'Interface and built-in command labels'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChangeLang(lang === 'tr' ? 'en' : 'tr')}
                      className="btn-3d-soft inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'}</span>
                    </button>
                  </div>

                  {/* Connectors */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {isTr ? 'Google Workspace bağlayıcıları' : 'Google Workspace connectors'}
                      </p>
                      <p className="text-xs text-[var(--mut)] mt-0.5 truncate">
                        {workspaceConnected
                          ? workspaceEmail || (isTr ? 'Bağlı' : 'Connected')
                          : isTr
                            ? 'Gmail, Takvim, Drive, Dokümanlar ve Görevler'
                            : 'Gmail, Calendar, Drive, Docs, and Tasks'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenConnectors();
                      }}
                      className="btn-3d-soft inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium shrink-0 cursor-pointer"
                    >
                      <ConnectorsIcon className="w-3.5 h-3.5" />
                      <span>{isTr ? 'Yönet' : 'Manage'}</span>
                    </button>
                  </div>

                  {/* Account summary */}
                  {user && (
                    <div className="py-4">
                      <p className="text-sm font-medium">
                        {isTr ? 'Hesap' : 'Account'}
                      </p>
                      <p className="text-xs text-[var(--mut)] mt-0.5">
                        {user.displayName ? `${user.displayName} · ` : ''}
                        {user.email || ''}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
