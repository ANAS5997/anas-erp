// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol = "$"): string {
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

export function getDebtStatus(remaining: number, dueDate?: string | null) {
  if (remaining <= 0) return "paid";
  if (dueDate && new Date(dueDate) < new Date()) return "overdue";
  if (remaining > 0) return "partial";
  return "unpaid";
}

export type DebtStatus = "paid" | "partial" | "unpaid" | "overdue";
