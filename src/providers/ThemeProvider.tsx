'use client';

import { useThemeStore } from '@/store';
import { useEffect } from 'react';
import { Toaster } from 'sonner';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        theme={theme}
        toastOptions={{
          style: { fontFamily: 'var(--font-inter)' },
        }}
      />
    </>
  );
}
