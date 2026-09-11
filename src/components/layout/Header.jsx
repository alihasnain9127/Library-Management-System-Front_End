'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Bell, Search, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Header({ isCollapsed, setIsCollapsed, setIsMobileOpen }) {
  const { user } = useSelector((state) => state.auth);
  const [hasMounted, setHasMounted] = useState(false);
  const [hasNotification] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setHasMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const displayName = hasMounted ? user?.name || 'Academic User' : 'Academic User';
  const displayRole = hasMounted ? user?.role || 'Guest' : 'Guest';
  const avatarLetter = hasMounted && user?.name ? user.name.charAt(0).toUpperCase() : null;

  const roleLabel = displayRole === 'admin' ? 'Administrator' : displayRole === 'user' ? 'Scholar' : displayRole;
  const roleBadgeStyle = displayRole === 'admin'
    ? 'text-purple-700 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40'
    : 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40';

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200"
      style={{ boxShadow: 'var(--shadow-e1)' }}
    >
      {/* ── Left Area: Sidebar toggle + Mobile trigger + Search ── */}
      <div className="flex items-center gap-2 flex-1 max-w-xl">

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation menu"
          className="p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 transition-colors lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop sidebar collapse toggle — shown only on lg+ */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full hidden md:block ml-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search catalog, records, or members…"
            aria-label="Global quick search"
            className="w-full h-10 pl-10 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-150"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── Right Area: Actions + User Identity ─────────── */}
      <div className="flex items-center gap-3">

        {/* Notification bell with pulse ping */}
        <button
          aria-label="View notifications"
          className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          {hasNotification && (
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Identity pill */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-slate-50">
              {displayName}
            </p>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5 ${roleBadgeStyle}`}>
              {roleLabel}
            </span>
          </div>

          {/* Avatar initial */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-900 select-none"
            aria-hidden="true"
          >
            {avatarLetter || <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}