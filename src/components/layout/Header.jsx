'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Header({ setIsMobileOpen }) {
  const { user } = useSelector((state) => state.auth);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  const displayName = hasMounted ? user?.name || 'Academic User' : 'Academic User';
  const displayRole = hasMounted ? user?.role || 'Guest' : 'Guest';
  const avatarLetter = hasMounted && user?.name ? user.name.charAt(0).toUpperCase() : null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      
      {/* Left Area: Mobile Trigger & Search Context */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Bar Interface */}
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search books, ISBNS, system tracking logs..."
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Right Area: Identity Profile Matrix */}
      <div className="flex items-center gap-4">
        {/* Alerts / Activity Notifications Engine */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ping" />
        </button>

        {/* Vertical Divider Divider */}
        <div className="w-px h-6 bg-slate-200 dark:border-slate-700" />

        {/* User Identity Display Profile Component */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-200">
              {displayName}
            </p>
            <p className="text-xs font-medium text-slate-400 capitalize mt-1">
              {displayRole}
            </p>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800">
            {avatarLetter ? avatarLetter : <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}