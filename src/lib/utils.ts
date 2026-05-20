// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol?: string): string {
  let lang = "en";
  if (typeof window !== "undefined") {
    try {
      const persisted = localStorage.getItem("erp-store-db");
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed.state && parsed.state.language) {
          lang = parsed.state.language;
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  const formattedAmount = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (symbol) {
    return `${symbol}${formattedAmount}`;
  }

  return lang === "ar" ? `${formattedAmount} ج.م` : `${formattedAmount} EGP`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calcRemaining(total: number, paid: number): number {
  return Math.max(0, total - paid);
}

export function getDebtStatus(remaining: number, dueDate?: string | null, paid?: number): "paid" | "partial" | "unpaid" | "overdue" {
  if (remaining <= 0) return "paid";
  if (dueDate && new Date(dueDate) < new Date()) return "overdue";
  if (paid !== undefined && paid <= 0) return "unpaid";
  return "partial";
}

export type DebtStatus = "paid" | "partial" | "unpaid" | "overdue";
