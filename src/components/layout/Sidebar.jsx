"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import {
  Library,
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  BookOpen,
  X,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

/* ── Nav link definitions ────────────────────────────────── */
const adminLinks = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Library",
    items: [
      { name: "Book Inventory", href: "/admin/books", icon: Library },
      { name: "Circulation Desk", href: "/admin/circulation", icon: ArrowLeftRight },
    ],
  },
  {
    group: "Members",
    items: [
      { name: "User Management", href: "/admin/users", icon: Users },
    ],
  },
  {
    group: "Analytics",
    items: [
      { name: "Reports & Stats", href: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    group: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const userLinks = [
  {
    group: "Dashboard",
    items: [
      { name: "My Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Library",
    items: [
      { name: "Browse Catalog", href: "/user/books", icon: Library },
      { name: "My Borrowed Items", href: "/user/borrowed", icon: BookOpen },
    ],
  },
  {
    group: "Account",
    items: [
      { name: "Fines Ledger", href: "/user/fines", icon: DollarSign },
      { name: "Profile Settings", href: "/user/profile", icon: Settings },
    ],
  },
];

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHasMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const role = hasMounted ? user?.role || "user" : "user";
  const activeGroups = role === "admin" ? adminLinks : userLinks;

  const performLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      toast.success("Successfully logged out");
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out select-none
          ${isCollapsed ? "w-18" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        {/* ── Brand Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 min-w-0 group"
            aria-label="LuminaLib home"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shrink-0 shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Library className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate">
                  LibOS
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  LuminaLib
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button — only on small screens */}
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ───────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6" aria-label="Main navigation">
          {activeGroups.map((group) => (
            <div key={group.group}>
              {/* Group label (hidden when collapsed) */}
              {!isCollapsed && (
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 px-3 mb-2">
                  {group.group}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  const Icon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      title={isCollapsed ? link.name : undefined}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      {/* Active left accent bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                      )}

                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{link.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User & Logout Footer ─────────────────────────── */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? "Logout" : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
            {!isCollapsed && <span className="font-semibold">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Logout Confirmation — portalled to document.body so it covers the full screen ── */}
      {hasMounted && createPortal(
        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={performLogout}
          title="Confirm Logout"
          message="Are you sure you want to log out of your session? Any unsaved changes will be lost."
          confirmText="Log Out"
          isDanger={true}
        />,
        document.body
      )}
    </>
  );
}
