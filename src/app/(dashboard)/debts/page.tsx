"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CircleDollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Plus,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function DebtsPage() {
  const { t, isRTL } = useTranslation();
  const { orders, customers, recordPayment, payments } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "overdue" | "pending">("all");
  
  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Process debt list from active orders
  const debtList = useMemo(() => {
    // Only grab orders with remaining > 0
    return orders
      .filter((order) => order.remaining > 0)
      .map((order) => {
        const customer = customers.find((c) => c.id === order.customerId);
        const isOverdue = order.dueDate ? new Date(order.dueDate) < new Date() : false;

        return {
          ...order,
          customerName: customer?.name || "Walking Customer",
          customerPhone: customer?.phone || "",
          isOverdue,
        };
      });
  }, [orders, customers]);

  // Total summary calculations
  const totalDebtSummary = useMemo(() => {
    const totalRemaining = debtList.reduce((sum, o) => sum + o.remaining, 0);
    const overdueCount = debtList.filter((o) => o.isOverdue).length;
    const totalOverdue = debtList.filter((o) => o.isOverdue).reduce((sum, o) => sum + o.remaining, 0);
    const pendingCount = debtList.filter((o) => !o.isOverdue).length;

    return {
      totalRemaining,
      overdueCount,
      totalOverdue,
      pendingCount,
    };
  }, [debtList]);

  // Filter & Search
  const filteredDebts = useMemo(() => {
    return debtList.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerPhone.includes(searchQuery);

      const matchesFilter =
        selectedFilter === "all" ||
        (selectedFilter === "overdue" && item.isOverdue) ||
        (selectedFilter === "pending" && !item.isOverdue);

      return matchesSearch && matchesFilter;
    });
  }, [debtList, searchQuery, selectedFilter]);

  const handleOpenPaymentModal = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setActiveOrderId(orderId);
    setPaymentAmount(String(order.remaining)); // Default to paying full balance
    setPaymentNotes("Installment payment");
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderId || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const order = orders.find((o) => o.id === activeOrderId);
    if (order && amount > order.remaining) {
      alert(`Payment amount ($${amount}) exceeds remaining debt balance ($${order.remaining}).`);
      return;
    }

    recordPayment(activeOrderId, amount, paymentNotes);
    setPaymentModalOpen(false);
    setActiveOrderId(null);
  };

  // WhatsApp Reminder message creator
  const getWhatsAppReminderUrl = (debt: any) => {
    const cleanPhone = debt.customerPhone.replace(/[^0-9]/g, "");
    
    let text = `⚠️ Friendly Reminder from *${useStore.getState().storeName}*:\n\n`;
    text += `Dear ${debt.customerName},\n`;
    text += `This is a reminder regarding your outstanding installment payment of *${formatCurrency(debt.remaining)}* for Invoice *#${debt.id}*.\n`;
    if (debt.dueDate) {
      text += `*Payment Due Date:* ${formatDate(debt.dueDate)}\n`;
    }
    if (debt.isOverdue) {
      text += `🚨 *Status:* Overdue. Please settle this balance as soon as possible.\n`;
    }
    text += `\nThank you for your cooperation! Contact us at ${useStore.getState().storePhone} for support.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">{t("debt_title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review outstanding customer balances, track installment dues, and mark off partial collections.
        </p>
      </div>

      {/* Stats row cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">Total Outstandings</span>
            <div className="p-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-rose-500">
              {formatCurrency(totalDebtSummary.totalRemaining)}
            </span>
            <p className="text-xs text-muted-foreground mt-1.5">Across {debtList.length} invoices</p>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">Overdue Balance</span>
            <div className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
              {formatCurrency(totalDebtSummary.totalOverdue)}
            </span>
            <p className="text-xs text-muted-foreground mt-1.5">{totalDebtSummary.overdueCount} invoices past due limit</p>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase">Pending Installments</span>
            <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold tracking-tight text-amber-500">
              {formatCurrency(totalDebtSummary.totalRemaining - totalDebtSummary.totalOverdue)}
            </span>
            <p className="text-xs text-muted-foreground mt-1.5">{totalDebtSummary.pendingCount} invoices in active term</p>
          </div>
        </div>
      </div>

      {/* Main Ledger panel */}
      <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className={`absolute top-3.5 h-5 w-5 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`} />
            <input
              type="text"
              placeholder="Search debt balances by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-muted/50 border border-border rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                selectedFilter === "all" ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              All Debts
            </button>
            <button
              onClick={() => setSelectedFilter("overdue")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                selectedFilter === "overdue" ? "bg-red-500 border-red-500 text-white" : "bg-card border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {t("debt_overdue")}
            </button>
            <button
              onClick={() => setSelectedFilter("pending")}
              className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                selectedFilter === "pending" ? "bg-amber-500 border-amber-500 text-white" : "bg-card border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {t("debt_pending")}
            </button>
          </div>
        </div>

        {/* Debt list table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold bg-muted/20">
                <th className="px-6 py-4">{t("cust_name")}</th>
                <th className="px-6 py-4">{t("sale_invoice_num")}</th>
                <th className="px-6 py-4">{t("debt_due_date")}</th>
                <th className="px-6 py-4 text-center">Installment Status</th>
                <th className="px-6 py-4 text-right">Invoice Total</th>
                <th className="px-6 py-4 text-right">{t("debt_amount")}</th>
                <th className="px-6 py-4 text-end">Remind / Settle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground italic">
                    {t("no_data")}
                  </td>
                </tr>
              ) : (
                filteredDebts.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm">{item.customerName}</p>
                        <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {item.customerPhone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold">
                      <Link href={`/invoices/${item.id}`} className="text-primary hover:underline font-bold">
                        #{item.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className={item.isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}>
                          {item.dueDate ? formatDate(item.dueDate) : "No Limit"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                          item.isOverdue
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {item.isOverdue ? t("debt_overdue") : t("debt_pending")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground font-semibold">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-rose-500 text-base">
                      {formatCurrency(item.remaining)}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* WhatsApp debt reminder button */}
                        {item.customerPhone && (
                          <a
                            href={getWhatsAppReminderUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-600 hover:bg-emerald-500/10 rounded-xl transition-all"
                            title={t("debt_remind_whatsapp")}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        )}

                        <button
                          onClick={() => handleOpenPaymentModal(item.id)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
                        >
                          {t("btn_record_payment")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment installment Modal Popup */}
      {paymentModalOpen && activeOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl w-full max-w-sm mx-4 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg flex items-center gap-1.5">
                <CircleDollarSign className="h-5 w-5 text-primary" />
                <span>Record Installment Payment</span>
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">
                  Invoice ID: <span className="font-mono text-foreground">#{activeOrderId}</span>
                </p>
                <p className="text-xs text-muted-foreground font-semibold">
                  Remaining Debt Balance:{" "}
                  <span className="font-bold text-rose-500">
                    {formatCurrency(orders.find((o) => o.id === activeOrderId)?.remaining || 0)}
                  </span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Amount Paid ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Enter payment amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Payment notes
                </label>
                <input
                  type="text"
                  placeholder="Installment payment details..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2.5 border border-border text-xs font-bold rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
                >
                  {t("btn_cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Confirm Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
