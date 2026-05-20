"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  Eye,
  Calendar,
  Filter,
  User,
  ShoppingBag,
  CreditCard,
  ExternalLink,
  Receipt,
  FileDown,
} from "lucide-react";
import Link from "next/link";

export default function SalesPage() {
  const { t, isRTL } = useTranslation();
  const { orders, customers } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "paid" | "partial" | "unpaid">("all");

  // Process list with customer links
  const orderList = useMemo(() => {
    return orders.map((order) => {
      const customer = customers.find((c) => c.id === order.customerId);
      return {
        ...order,
        customerName: customer?.name || "Walking Customer",
        customerPhone: customer?.phone || "",
      };
    });
  }, [orders, customers]);

  // Filter list
  const filteredOrders = useMemo(() => {
    return orderList.filter((ord) => {
      const matchesSearch =
        ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerPhone.includes(searchQuery);

      const matchesStatus = selectedStatus === "all" || ord.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orderList, searchQuery, selectedStatus]);

  const statuses = [
    { key: "all", label: "All Sales" },
    { key: "paid", label: t("sale_status_paid") },
    { key: "partial", label: t("sale_status_partial") },
    { key: "unpaid", label: t("sale_status_unpaid") },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("sale_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Browse invoices, view items purchased, and track checkout histories.
          </p>
        </div>
        <Link
          href="/sales/new"
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
        >
          <Plus className="h-5 w-5" />
          <span>{t("sale_new")}</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
        {/* Controls: Search and Status filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="relative flex-1">
            <Search className={`absolute top-3.5 h-5 w-5 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`} />
            <input
              type="text"
              placeholder="Search invoices by ID, customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-muted/50 border border-border rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}`}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {statuses.map((stat) => (
              <button
                key={stat.key}
                onClick={() => setSelectedStatus(stat.key as any)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border shrink-0 transition-all cursor-pointer ${
                  selectedStatus === stat.key
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Grid/Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold bg-muted/20">
                <th className="px-6 py-4">{t("sale_invoice_num")}</th>
                <th className="px-6 py-4">{t("cust_name")}</th>
                <th className="px-6 py-4">{t("sale_date")}</th>
                <th className="px-6 py-4 text-center">{t("status")}</th>
                <th className="px-6 py-4 text-right">Invoice Total</th>
                <th className="px-6 py-4 text-right">Cash Paid</th>
                <th className="px-6 py-4 text-right">{t("sale_remaining")}</th>
                <th className="px-6 py-4 text-end">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">
                    {t("no_data")}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">
                      #{ord.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-sm">{ord.customerName}</p>
                        {ord.customerPhone && (
                          <p className="text-xs text-muted-foreground mt-0.5">{ord.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                          ord.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : ord.status === "partial"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        }`}
                      >
                        {ord.status === "paid"
                          ? t("sale_status_paid")
                          : ord.status === "partial"
                          ? t("sale_status_partial")
                          : t("sale_status_unpaid")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-base">
                      {formatCurrency(ord.total)}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-500 font-bold">
                      {formatCurrency(ord.paid)}
                    </td>
                    <td className="px-6 py-4 text-right text-rose-500 font-bold">
                      {ord.remaining > 0 ? formatCurrency(ord.remaining) : "—"}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/invoices/${ord.id}`}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
                          title="View Printable Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                          <span>Receipt</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Invoice Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground italic py-8">
                {t("no_data")}
              </p>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord.id} className="bg-card border border-border p-4 rounded-3xl space-y-4 shadow-sm relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-foreground">#{ord.id}</span>
                      <p className="font-bold text-sm text-foreground mt-1">{ord.customerName}</p>
                      {ord.customerPhone && (
                        <p className="text-xs text-muted-foreground">{ord.customerPhone}</p>
                      )}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        ord.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : ord.status === "partial"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}
                    >
                      {ord.status === "paid"
                        ? t("sale_status_paid")
                        : ord.status === "partial"
                        ? t("sale_status_partial")
                        : t("sale_status_unpaid")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">{t("sale_date")}</span>
                      <span className="text-muted-foreground font-semibold">{formatDate(ord.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">Total</span>
                      <span className="font-extrabold text-foreground">{formatCurrency(ord.total)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">Paid</span>
                      <span className="font-extrabold text-emerald-500">{formatCurrency(ord.paid)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">Remaining</span>
                      <span className="font-extrabold text-rose-500">{ord.remaining > 0 ? formatCurrency(ord.remaining) : "—"}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-border/30">
                    <Link
                      href={`/invoices/${ord.id}`}
                      className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer hover:bg-primary/15 transition-all"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>{t("view_invoice")}</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
