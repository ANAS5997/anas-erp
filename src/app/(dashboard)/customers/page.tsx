"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  Phone,
  MapPin,
  FileText,
  User,
  Trash2,
  Edit2,
  X,
  CreditCard,
  History,
} from "lucide-react";

export default function CustomersPage() {
  const { t, isRTL } = useTranslation();
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer, role } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  
  // Modal/Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Process customer debt & stats
  const customerListWithStats = useMemo(() => {
    return customers.map((customer) => {
      // Find all orders for this customer
      const customerOrders = orders.filter((o) => o.customerId === customer.id);
      const totalDebt = customerOrders.reduce((acc, o) => acc + o.remaining, 0);
      const purchaseCount = customerOrders.length;
      const totalSpend = customerOrders.reduce((acc, o) => acc + o.total, 0);

      return {
        ...customer,
        totalDebt,
        purchaseCount,
        totalSpend,
        orders: customerOrders,
      };
    });
  }, [customers, orders]);

  // Filter customers by search query
  const filteredCustomers = useMemo(() => {
    return customerListWithStats.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );
  }, [customerListWithStats, searchQuery]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
    setEditId(null);
    setIsEditing(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (cust: any) => {
    setName(cust.name);
    setPhone(cust.phone);
    setAddress(cust.address || "");
    setNotes(cust.notes || "");
    setEditId(cust.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (isEditing && editId) {
      updateCustomer(editId, { name, phone, address, notes });
    } else {
      addCustomer({ name, phone, address, notes });
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(id);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("cust_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage store clients, review purchase histories, and monitor debts.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
        >
          <Plus className="h-5 w-5" />
          <span>{t("cust_add")}</span>
        </button>
      </div>

      {/* Main layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Customer list table/panel */}
        <div className="p-6 bg-card border border-border rounded-3xl lg:col-span-2 space-y-6 shadow-sm">
          {/* Search bar */}
          <div className="relative">
            <Search className={`absolute top-3.5 h-5 w-5 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`} />
            <input
              type="text"
              placeholder={t("cust_search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-muted/50 border border-border rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}`}
            />
          </div>

          {/* List display */}
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {t("no_data")}
              </div>
            ) : (
              filteredCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all hover:bg-muted/40 mb-2 border ${
                    selectedCustomer?.id === cust.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3 space-x-reverse min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-base">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-base truncate">{cust.name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-primary/80" />
                          {cust.phone}
                        </span>
                        {cust.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {cust.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="text-start sm:text-end">
                      {cust.totalDebt > 0 ? (
                        <div>
                          <span className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            Debt: {formatCurrency(cust.totalDebt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          No Debt
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {cust.purchaseCount} orders • {formatCurrency(cust.totalSpend)} spent
                      </p>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(cust)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title={t("btn_edit")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {role === "admin" && (
                        <button
                          onClick={() => handleDelete(cust.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                          title={t("btn_delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Profile detail viewer */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span>Customer Profile Card</span>
          </h3>

          {!selectedCustomer ? (
            <div className="py-20 text-center text-sm text-muted-foreground italic">
              Select a customer from the database list to inspect purchases, debt ledger, and notes.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Summary */}
              <div className="text-center space-y-3">
                <div className="inline-flex h-16 w-16 rounded-full bg-primary/10 items-center justify-center font-bold text-primary text-xl border border-primary/20">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{selectedCustomer.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                </div>
              </div>

              {/* Quick Info Blocks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/40 rounded-2xl border border-border/80">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Outstanding Debt
                  </span>
                  <span className={`text-base font-extrabold mt-1 block ${selectedCustomer.totalDebt > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                    {formatCurrency(selectedCustomer.totalDebt)}
                  </span>
                </div>
                <div className="p-3 bg-muted/40 rounded-2xl border border-border/80">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Total Purchases
                  </span>
                  <span className="text-base font-extrabold text-foreground mt-1 block">
                    {selectedCustomer.purchaseCount} orders
                  </span>
                </div>
              </div>

              {/* Address / Notes details */}
              <div className="space-y-4 text-sm bg-muted/20 p-4 rounded-2xl border border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold block mb-1">
                    {t("cust_address")}
                  </span>
                  <p className="font-medium">{selectedCustomer.address || "No address on file"}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground font-semibold block mb-1">
                    {t("cust_notes")}
                  </span>
                  <p className="font-light italic text-xs leading-relaxed text-muted-foreground">
                    {selectedCustomer.notes || "No custom customer notes added."}
                  </p>
                </div>
              </div>

              {/* Customer purchase ledger timeline */}
              <div className="space-y-3">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                  Purchase History Ledger
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-border">
                  {selectedCustomer.orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">
                      No order invoices registered yet.
                    </p>
                  ) : (
                    selectedCustomer.orders.map((ord: any) => (
                      <div key={ord.id} className="pt-2.5 pb-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">#{ord.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              ord.status === "paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                              ord.status === "partial" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" :
                              "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                            }`}>
                              {ord.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 block">
                            {formatDate(ord.createdAt)}
                          </span>
                        </div>
                        <div className="text-end">
                          <p className="font-bold text-foreground">{formatCurrency(ord.total)}</p>
                          {ord.remaining > 0 && (
                            <p className="text-[10px] text-rose-500 mt-0.5">
                              Unpaid: {formatCurrency(ord.remaining)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Sliding dialog modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl w-full max-w-md mx-4 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg">
                {isEditing ? t("cust_edit") : t("cust_add")}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("cust_name")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah bin Fahd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("cust_phone")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +96650123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("cust_address")}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 52nd Prince Sultan St, Riyadh"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  {t("cust_notes")}
                </label>
                <textarea
                  placeholder="Any details, default payments terms, discounts, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-border text-xs font-bold rounded-xl hover:bg-muted text-muted-foreground transition-all cursor-pointer"
                >
                  {t("btn_cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  {t("btn_save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
