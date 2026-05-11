'use client';

import { useSession, signOut } from 'next-auth/react';
import { useSidebarStore, useThemeStore } from '@/store';

export function Header() {
  const { data: session } = useSession();
  const { toggle } = useSidebarStore();
  const { theme, toggle: toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Left: Menu toggle */}
      <button onClick={toggle} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors lg:hidden">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-slate-400">Welcome back,</h2>
        <p className="text-sm font-semibold text-slate-100">{session?.user?.name || 'Admin'}</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-slate-700 pl-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {session?.user?.name?.charAt(0) || 'A'}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
