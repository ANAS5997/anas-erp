"use client";

import React, { useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDate } from "@/lib/utils";
import {
  Settings,
  Shield,
  FileSpreadsheet,
  Globe,
  Database,
  Moon,
  Sun,
  Activity,
  Download,
  Upload,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    storeName,
    storePhone,
    storeAddress,
    updateStoreDetails,
    role,
    setRole,
    theme,
    setTheme,
    language,
    setLanguage,
    activityLogs,
    backupData,
    restoreData,
    updateInvoiceSettings,
    storeSlogan,
    invoiceFooterNotes,
    taxRate,
    receiptFormat,
    currency,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store forms
  const [name, setName] = useState(storeName);
  const [phone, setPhone] = useState(storePhone);
  const [address, setAddress] = useState(storeAddress);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Invoice custom forms
  const [slogan, setSlogan] = useState(storeSlogan);
  const [footerNotes, setFooterNotes] = useState(invoiceFooterNotes);
  const [tax, setTax] = useState(String(taxRate));
  const [format, setFormat] = useState(receiptFormat);
  const [curr, setCurr] = useState(currency);
  const [invoiceSaveSuccess, setInvoiceSaveSuccess] = useState(false);

  const [restoreStatus, setRestoreStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreDetails(name, phone, address);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveInvoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvoiceSettings({
      storeSlogan: slogan,
      invoiceFooterNotes: footerNotes,
      taxRate: parseFloat(tax) || 0,
      receiptFormat: format,
      currency: curr,
    });
    setInvoiceSaveSuccess(true);
    setTimeout(() => setInvoiceSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupStr = backupData();
    const blob = new Blob([backupStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Smart_ERP_Backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const success = restoreData(result);
      if (success) {
        setRestoreStatus("success");
        // Update local form values
        const currentStore = useStore.getState();
        setName(currentStore.storeName);
        setPhone(currentStore.storePhone);
        setAddress(currentStore.storeAddress);
      } else {
        setRestoreStatus("error");
      }
      setTimeout(() => setRestoreStatus("idle"), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">{t("sett_title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust store information, toggle operator roles, manage database snapshots, and audit employee logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Store Info details */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>{t("sett_store_details")}</span>
            </h3>

            <form onSubmit={handleSaveStore} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("sett_store_name")} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("sett_store_phone")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("sett_store_address")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                    ✓ Store Details Updated
                  </span>
                ) : (
                  <span></span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {t("btn_save")}
                </button>
              </div>
            </form>
          </div>

          {/* Invoice custom settings */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Invoice Customization & Receipt Branding</span>
            </h3>

            <form onSubmit={handleSaveInvoiceSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Shop Slogan / Subtitle
                  </label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="e.g. Electrical & Home Appliances Shop"
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Currency Symbol
                  </label>
                  <select
                    value={curr}
                    onChange={(e) => setCurr(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="EGP">EGP (Egyptian Pound)</option>
                    <option value="SAR">SAR (Saudi Riyal)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Receipt print size
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setFormat("thermal")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        format === "thermal" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Thermal 80mm
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat("a4")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        format === "a4" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      Standard A4
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Tax / VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tax}
                    onChange={(e) => setTax(e.target.value)}
                    placeholder="e.g. 14 for 14% VAT"
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Invoice Footer Terms & Warranty Notice
                </label>
                <textarea
                  rows={3}
                  value={footerNotes}
                  onChange={(e) => setFooterNotes(e.target.value)}
                  placeholder="Terms, exchange policy, or warranty notes..."
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3">
                {invoiceSaveSuccess ? (
                  <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                    ✓ Invoice Settings Saved
                  </span>
                ) : (
                  <span></span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {t("btn_save")}
                </button>
              </div>
            </form>
          </div>

          {/* Theme & Language Preferences */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <span>Theme & Language Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Language */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  {t("sett_lang")}
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-xl border border-border">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      language === "en" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("ar")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      language === "ar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  {t("sett_theme")}
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-xl border border-border">
                  <button
                    onClick={() => setTheme("light")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      theme === "light" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      theme === "dark" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backup & Restore system */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <span>{t("sett_backup")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Export Backup File</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("sett_backup_desc")}
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-primary/10 border border-primary/20 text-primary font-bold text-xs rounded-xl hover:bg-primary/20 transition-all cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{t("sett_btn_backup")}</span>
                </button>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                <h4 className="text-sm font-bold">Import Backup File</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("sett_restore_desc")}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-muted border border-border hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{t("sett_btn_restore")}</span>
                </button>

                {/* Status messages */}
                {restoreStatus === "success" && (
                  <p className="text-xs text-emerald-500 font-bold mt-2">
                    ✓ Database Restored Successfully! Page updated.
                  </p>
                )}
                {restoreStatus === "error" && (
                  <p className="text-xs text-rose-500 font-bold mt-2">
                    ❌ Invalid backup file format. Import failed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Role Toggle + Employee Activity Logs */}
        <div className="space-y-8">
          {/* Active Role Card Toggle */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Operator Session Role</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dynamically switch user authentication roles to inspect how the Employee permissions respond:
            </p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 border border-border rounded-xl">
              <button
                onClick={() => setRole("admin")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "admin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setRole("employee")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === "employee" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Employee
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic text-center">
              * Employees are restricted from deleting items/customers.
            </p>
          </div>

          {/* Activity Logs chronological ledger */}
          <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Employee Activity Audit Ledger</span>
            </h3>
            <div className="divide-y divide-border max-h-[360px] overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">No audits logged.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="py-2.5 text-xs text-start">
                    <p className="font-semibold text-foreground leading-snug">{log.action}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                      <span>Operator: {log.userName}</span>
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
