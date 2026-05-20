"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Receipt,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  User,
  Shield,
  History,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { SystemGuide } from "./SystemGuide";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, isRTL } = useTranslation();
  const {
    user,
    setUser,
    role,
    theme,
    setTheme,
    setLanguage,
    notifications,
    markAllNotificationsRead,
    storeName,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const menuItems = [
    { name: t("nav_dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("nav_customers"), path: "/customers", icon: Users },
    { name: t("nav_products"), path: "/products", icon: ShoppingBag },
    { name: t("nav_sales"), path: "/sales", icon: Receipt },
    { name: t("nav_debts"), path: "/debts", icon: CircleDollarSign },
    { name: t("nav_expenses"), path: "/expenses", icon: TrendingDown },
    { name: t("nav_reports"), path: "/reports", icon: TrendingUp },
    { name: t("nav_logs"), path: "/logs", icon: History },
    { name: t("nav_settings"), path: "/settings", icon: Settings },
  ];

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
    setMobileMenuOpen(false);
  };

  const unreadNotifs = notifications.filter((n) => !n.read);

  // If user is not logged in, redirect to login page (we can check on mount)
  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex bg-background text-foreground transition-colors duration-200 ${isRTL ? "font-sans rtl" : "font-sans ltr"}`}>
      
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 border-r border-border bg-card fixed top-0 bottom-0 ${isRTL ? "right-0" : "left-0"} z-20`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-2.5 space-x-reverse">
            <div className="h-9 w-9 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center bg-muted shrink-0 shadow-sm">
              <img src="/abo-anas-logo.jpg" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-bold text-lg tracking-tight truncate max-w-[160px]">{storeName}</span>
          </Link>
        </div>

        {/* User Info Card inside Sidebar */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-primary">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <Shield className="h-3 w-3 mr-1 ml-1 text-primary" />
                <span>{role === "admin" ? t("admin_login") : t("employee_login")}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isRTL ? "ml-3" : "mr-3"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all"
          >
            <LogOut className={`h-5 w-5 ${isRTL ? "ml-3" : "mr-3"}`} />
            {t("nav_logout")}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={`flex-1 flex flex-col min-h-screen ${isRTL ? "md:pr-64" : "md:pl-64"}`}>
        
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -mr-2 ml-2 md:hidden text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold md:block hidden">
              {menuItems.find((item) => pathname.startsWith(item.path))?.name || t("nav_dashboard")}
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors flex items-center space-x-1"
              title={language === "en" ? "العربية" : "English"}
            >
              <Globe className="h-5 w-5" />
              <span className="text-xs font-semibold">{language === "en" ? "AR" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className={`absolute mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl py-2 z-30 ${isRTL ? "left-0" : "right-0"} animate-fade-in`}>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <span className="font-semibold text-sm">{t("notif_title")}</span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={() => {
                          markAllNotificationsRead();
                          setNotifDropdownOpen(false);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-border">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        {t("no_data")}
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 text-xs transition-colors hover:bg-muted/50 ${
                            !notif.read ? "bg-primary/5 font-medium" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase mb-1 inline-block ${
                              notif.type === "low_stock" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" :
                              notif.type === "late_payment" ? "bg-destructive/15 text-destructive" :
                              notif.type === "new_sale" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                              "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                            }`}>
                              {notif.type.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-foreground leading-relaxed mt-1">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center space-x-2 space-x-reverse p-1 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt={user.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
              </button>

              {userDropdownOpen && (
                <div className={`absolute mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl py-2 z-30 ${isRTL ? "left-0" : "right-0"} animate-fade-in`}>
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex w-full items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Settings className="h-4 w-4 mr-2 ml-2" />
                    {t("nav_settings")}
                  </Link>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2 ml-2" />
                    {t("nav_logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
        <SystemGuide />
      </div>

      {/* Floating Mobile Bottom Navigation Dock */}
      <div className="fixed bottom-3 left-3 right-3 h-14 bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-lg z-30 flex md:hidden items-center justify-around px-2 transition-all duration-300">
        {[
          { name: t("nav_dashboard"), path: "/dashboard", icon: LayoutDashboard },
          { name: t("nav_products"), path: "/products", icon: ShoppingBag },
          { name: t("nav_sales"), path: "/sales", icon: Receipt },
          { name: t("nav_debts"), path: "/debts", icon: CircleDollarSign },
        ].map((item) => {
          const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all ${
                isActive ? "text-primary scale-105 font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4.5 w-4.5 mb-0.5" />
              <span className="text-[8.5px] tracking-tight truncate max-w-[55px]">
                {item.name}
              </span>
            </Link>
          );
        })}
        {/* More Button (Trigger mobile drawer) */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-muted-foreground hover:text-foreground transition-all"
        >
          <Menu className="h-4.5 w-4.5 mb-0.5" />
          <span className="text-[8.5px] tracking-tight">
            {t("actions")}
          </span>
        </button>
      </div>

      {/* Sidebar - Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          ></div>

          {/* Drawer Content */}
          <aside className={`fixed top-0 bottom-0 w-72 bg-card border-r border-border p-6 flex flex-col z-50 ${isRTL ? "right-0" : "left-0"} animate-fade-in`}>
            <div className="flex items-center justify-between mb-8">
              <Link href="/dashboard" className="flex items-center space-x-2.5 space-x-reverse" onClick={() => setMobileMenuOpen(false)}>
                <div className="h-9 w-9 rounded-full overflow-hidden border border-primary/30 flex items-center justify-center bg-muted shrink-0 shadow-sm">
                  <img src="/abo-anas-logo.jpg" alt="Logo" className="h-full w-full object-cover" />
                </div>
                <span className="font-bold text-lg truncate max-w-[160px]">{storeName}</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User details */}
            <div className="p-4 mb-6 border border-border bg-muted/30 rounded-2xl flex items-center space-x-3 space-x-reverse">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {getInitials(user.name)}
              </div>
              <div>
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{role === "admin" ? t("admin_login") : t("employee_login")}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isRTL ? "ml-3" : "mr-3"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-border pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-all"
              >
                <LogOut className={`h-5 w-5 ${isRTL ? "ml-3" : "mr-3"}`} />
                {t("nav_logout")}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
