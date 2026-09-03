"use client";

import React, { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

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
    setTimeout(() => setHasMounted(true), 0);
  }, []);

  // Dynamic Role Filtering Selection
  const role = hasMounted ? user?.role || "user" : "user";

  const adminLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Book Inventory", href: "/admin/books", icon: Library },
    {
      name: "Circulation (Issue/Return)",
      href: "/admin/circulation",
      icon: ArrowLeftRight,
    },
    { name: "Fine Controls", href: "/admin/fines", icon: DollarSign },
    { name: "Reports & Stats", href: "/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const userLinks = [
    { name: "My Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Browse Catalog", href: "/user/books", icon: Library },
    { name: "My Borrowed Items", href: "/user/borrowed", icon: ArrowLeftRight },
    { name: "Fine Overviews", href: "/user/fines", icon: DollarSign },
    { name: "Profile Configuration", href: "/user/profile", icon: Settings },
  ];

  const activeLinks = role === "admin" ? adminLinks : userLinks;

  const performLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(logout());
      toast.success("Successfully logged out!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong during logout. Please try again or refresh the page.");
      // Even if API call fails, still logout client-side
      dispatch(logout());
    }
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      {/* Brand Header Identity */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-blue-600 dark:text-blue-400"
        >
          <Library className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
              LibOS
            </span>
          )}
        </Link>

        {/* Toggle Collapse Button (Desktop Only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Mapping */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {activeLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileOpen(false)} // Auto-close drawer on mobile choice
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
              />
              {!isCollapsed && <span className="truncate">{link.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sticky Bottom Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {!isCollapsed && <span>Logout Session</span>}
        </button>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={performLogout}
        title="Confirm Logout"
        message="Are you sure you want to end your current session?"
        confirmText="Log Out"
        isDanger={true}
      />
    </aside>
  );
}
