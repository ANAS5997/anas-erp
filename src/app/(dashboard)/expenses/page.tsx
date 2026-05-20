"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingDown,
  Plus,
  Search,
  Trash2,
  Calendar as CalendarIcon,
  DollarSign,
  Filter,
  X,
  AlertCircle,
  Tag,
  Receipt,
  FileText
} from "lucide-react";
import type { Expense, ExpenseCategory } from "@/types";

export default function ExpensesPage() {
  const { t, isRTL } = useTranslation();
  const { expenses, addExpense, deleteExpense, role } = useStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "other" as ExpenseCategory,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Calculations
  const metrics = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Current month expenses
    const now = new Date();
    const thisMonthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date);
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    });
    const monthlyTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryTotals: Record<ExpenseCategory, number> = {
      rent: 0,
      utilities: 0,
      salaries: 0,
      inventory: 0,
      marketing: 0,
      other: 0,
    };

    expenses.forEach((e) => {
      if (categoryTotals[e.category] !== undefined) {
        categoryTotals[e.category] += e.amount;
      } else {
        categoryTotals.other += e.amount;
      }
    });

    const categoryArray = Object.entries(categoryTotals).map(([cat, val]) => ({
      category: cat as ExpenseCategory,
      value: val,
      percentage: total > 0 ? (val / total) * 100 : 0,
    })).sort((a, b) => b.value - a.value);

    const highestCategory = categoryArray[0]?.value > 0 ? categoryArray[0].category : "other";

    return {
      total,
      monthlyTotal,
      highestCategory,
      categoryArray,
    };
  }, [expenses]);

  // 2. Filtered list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  // Form Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amt = parseFloat(formData.amount);
    if (!formData.title.trim()) {
      setFormError("Please enter an expense title.");
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid positive number for amount.");
      return;
    }

    addExpense({
      title: formData.title,
      category: formData.category,
      amount: amt,
      date: formData.date,
      notes: formData.notes,
    });

    // Reset Form
    setFormData({
      title: "",
      category: "other",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setIsAddModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const categories: ExpenseCategory[] = ["rent", "utilities", "salaries", "inventory", "marketing", "other"];

  const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    rent: "bg-blue-500",
    utilities: "bg-amber-500",
    salaries: "bg-emerald-500",
    inventory: "bg-indigo-500",
    marketing: "bg-pink-500",
    other: "bg-slate-500",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("expense_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Log overhead operating costs, salaries, rent, and utility bills.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl shadow-md hover:scale-[1.01] text-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{t("expense_add")}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm border-t-4 border-t-rose-500 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">{t("dash_expenses")} (Total)</span>
            <p className="text-3xl font-extrabold tracking-tight mt-2 text-rose-500">
              {formatCurrency(metrics.total)}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">Cumulative lifetime expenses</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm border-t-4 border-t-blue-500 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">Current Month Cost</span>
            <p className="text-3xl font-extrabold tracking-tight mt-2">
              {formatCurrency(metrics.monthlyTotal)}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">Spent this calendar month</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm border-t-4 border-t-amber-500 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase">Top Spending Category</span>
            <p className="text-xl font-bold tracking-tight mt-3.5 capitalize flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_COLORS[metrics.highestCategory as ExpenseCategory]}`}></span>
              {t(`expense_categories.${metrics.highestCategory}` as any)}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">Absorbs the largest financial share</span>
        </div>
      </div>

      {/* Layout Grid: List vs Cost Share chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenses Table list */}
        <div className="p-6 bg-card border border-border rounded-3xl lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="font-bold text-lg">{t("nav_expenses")} Logs</h3>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${isRTL ? "left-3" : "right-3"}`} />
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full sm:w-48 pl-4 pr-10 py-1.5 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:border-primary transition-all`}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5 px-3 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:border-primary text-muted-foreground cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`expense_categories.${cat}` as any)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right hidden md:table">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                  <th className="py-3 px-4">{t("expense_date")}</th>
                  <th className="py-3 px-4">{t("expense_title_label")}</th>
                  <th className="py-3 px-4">{t("expense_category")}</th>
                  <th className="py-3 px-4 text-right rtl:text-left">{t("expense_amount")}</th>
                  <th className="py-3 px-4 text-center">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      {t("no_data")}
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-muted/30 transition-colors text-xs">
                      <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <div>
                          <p>{exp.title}</p>
                          {exp.notes && (
                            <p className="text-[10px] text-muted-foreground font-normal mt-0.5 max-w-[180px] truncate">
                              {exp.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 capitalize">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[exp.category] || "bg-slate-500"}`}></span>
                          {t(`expense_categories.${exp.category}` as any)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-500 text-right rtl:text-left">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {role === "admin" ? (
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer"
                            title={t("btn_delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Admin only</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Expenses Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredExpenses.length === 0 ? (
                <p className="text-center text-muted-foreground italic py-8">
                  {t("no_data")}
                </p>
              ) : (
                filteredExpenses.map((exp) => (
                  <div key={exp.id} className="bg-card border border-border p-4 rounded-3xl space-y-4 shadow-sm relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">{exp.title}</h4>
                        {exp.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{exp.notes}</p>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {formatDate(exp.date)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border/50 text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[exp.category] || "bg-slate-500"}`}></span>
                        <span className="text-muted-foreground font-semibold">
                          {t(`expense_categories.${exp.category}` as any)}
                        </span>
                      </span>
                      <span className="font-extrabold text-rose-500 text-sm">
                        {formatCurrency(exp.amount)}
                      </span>
                    </div>

                    {role === "admin" && (
                      <div className="flex justify-end pt-3 border-t border-border/30">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="px-3.5 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("btn_delete")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Expenses share Visual progress bars */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-500" />
              <span>Cost Allocation Share</span>
            </h3>
            <div className="space-y-4.5 mt-6">
              {metrics.categoryArray.every(cat => cat.value === 0) ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No records to display chart
                </div>
              ) : (
                metrics.categoryArray.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold capitalize">
                        {t(`expense_categories.${cat.category}` as any)}
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {formatCurrency(cat.value)} ({cat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${CATEGORY_COLORS[cat.category]}`}
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-6 text-center text-xs text-muted-foreground">
            Values auto-recalculate based on active logs
          </div>
        </div>
      </div>

      {/* Modal - Add Expense Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/75 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 mx-4 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setFormError(null);
              }}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">{t("expense_add")}</h3>
              <p className="text-xs text-muted-foreground">Create a new debit ledger record.</p>
            </div>

            {formError && (
              <div className="p-3.5 bg-destructive/15 border border-destructive/20 rounded-xl flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider block">
                  {t("expense_title_label")} *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Electric bill, Monthly rent"
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase tracking-wider block">
                    {t("expense_category")}
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-xs cursor-pointer text-foreground"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {t(`expense_categories.${cat}` as any)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase tracking-wider block">
                    {t("expense_amount")} (EGP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    required
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider block">
                  {t("expense_date")} *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-xs text-foreground cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground uppercase tracking-wider block">
                  {t("expense_notes")}
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional details..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError(null);
                  }}
                  className="px-4 py-2.5 border border-border text-muted-foreground hover:bg-muted rounded-xl transition-all cursor-pointer font-bold"
                >
                  {t("btn_cancel")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.01] shadow-md transition-all cursor-pointer"
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
