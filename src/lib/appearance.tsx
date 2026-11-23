import React, { createContext, useContext, useEffect, useState } from 'react';

export type LogoVariant = 'default' | 'fluffy-3d' | 'oldest' | 'pink-lavender';
export type AccentTheme = 'classic' | 'pink';

interface AppearanceContextValue {
  logoVariant: LogoVariant;
  setLogoVariant: (variant: LogoVariant) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (accent: AccentTheme) => void;
}

const AppearanceContext = createContext<AppearanceContextValue>({
  logoVariant: 'default',
  setLogoVariant: () => {},
  accentTheme: 'classic',
  setAccentTheme: () => {},
});

function readStoredLogoVariant(): LogoVariant {
  try {
    const saved = localStorage.getItem('lc_logo_variant');
    if (
      saved === 'default' ||
      saved === 'fluffy-3d' ||
      saved === 'oldest' ||
      saved === 'pink-lavender'
    ) {
      return saved;
    }
  } catch {}
  return 'default';
}

function readStoredAccentTheme(): AccentTheme {
  try {
    const saved = localStorage.getItem('lc_accent_theme');
    if (saved === 'pink' || saved === 'classic') {
      return saved;
    }
  } catch {}
  return 'classic';
}

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [logoVariant, setLogoVariantState] = useState<LogoVariant>(readStoredLogoVariant);
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>(readStoredAccentTheme);

  // Persist logo selection
  useEffect(() => {
    try {
      localStorage.setItem('lc_logo_variant', logoVariant);
    } catch {}
  }, [logoVariant]);

  // Sync accent theme to DOM and persist
  useEffect(() => {
    if (accentTheme === 'pink') {
      document.documentElement.dataset.accent = 'pink';
    } else {
      delete document.documentElement.dataset.accent;
    }
    try {
      localStorage.setItem('lc_accent_theme', accentTheme);
    } catch {}
  }, [accentTheme]);

  const setLogoVariant = (next: LogoVariant) => {
    setLogoVariantState(next);
  };

  const setAccentTheme = (next: AccentTheme) => {
    setAccentThemeState(next);
    if (next === 'pink') {
      // Automatically switch to the pink & light purple logo when Pink Theme is selected
      // (User can still freely choose any other logo variant right in Settings afterwards)
      setLogoVariantState('pink-lavender');
    } else {
      // Gently restore classic logo if leaving Pink Theme while on the pink-lavender logo
      setLogoVariantState((curr) => (curr === 'pink-lavender' ? 'default' : curr));
    }
  };

  return (
    <AppearanceContext.Provider
      value={{
        logoVariant,
        setLogoVariant,
        accentTheme,
        setAccentTheme,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}
