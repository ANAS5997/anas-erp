"use client";

import React, { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  BarChart2,
  PieChart,
  ShoppingBag,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const { t } = useTranslation();
  const { orders, products, customers } = useStore();
  const [reportTimeframe, setReportTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");

  // Calculations for Reports page
  const stats = useMemo(() => {
    const totalOrderSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalCollectedCash = orders.reduce((sum, o) => sum + o.paid, 0);
    const totalDebtOutstanding = orders.reduce((sum, o) => sum + o.remaining, 0);
    const averageOrderValue = orders.length > 0 ? totalOrderSales / orders.length : 0;

    // Category Sales Distribution
    const categoryDistribution: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || "other";
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + item.subtotal;
      });
    });

    const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
      name: t(`prod_categories.${name}` as any) || name,
      value,
    }));

    // Best Selling Items list
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const name = prod?.name || `Product #${item.productId}`;
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.qty;
        productSales[item.productId].revenue += item.subtotal;
      });
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales charts based on selected timeframe
    let chartData: { label: string; sales: number; collected: number }[] = [];

    if (reportTimeframe === "daily") {
      // Last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      }).reverse();

      chartData = days.map((day) => {
        const matchingOrders = orders.filter(
          (o) => new Date(o.createdAt).toDateString() === day.toDateString()
        );
        return {
          label: day.toLocaleDateString(undefined, { weekday: "short" }),
          sales: matchingOrders.reduce((sum, o) => sum + o.total, 0),
          collected: matchingOrders.reduce((sum, o) => sum + o.paid, 0),
        };
      });
    } else if (reportTimeframe === "weekly") {
      // Last 4 weeks
      chartData = Array.from({ length: 4 }, (_, i) => {
        const label = `Week ${4 - i}`;
        const start = new Date();
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(end.getDate() - i * 7);

        const matchingOrders = orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= start && d <= end;
        });

        return {
          label,
          sales: matchingOrders.reduce((sum, o) => sum + o.total, 0),
          collected: matchingOrders.reduce((sum, o) => sum + o.paid, 0),
        };
      }).reverse();
    } else {
      // Last 6 months
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d;
      }).reverse();

      chartData = months.map((month) => {
        const matchingOrders = orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
        });
        return {
          label: month.toLocaleDateString(undefined, { month: "short" }),
          sales: matchingOrders.reduce((sum, o) => sum + o.total, 0),
          collected: matchingOrders.reduce((sum, o) => sum + o.paid, 0),
        };
      });
    }

    return {
      totalOrderSales,
      totalCollectedCash,
      totalDebtOutstanding,
      averageOrderValue,
      categoryData,
      topSellingProducts,
      chartData,
    };
  }, [orders, products, reportTimeframe, t]);

  // Export reports to Excel (JSON download)
  const handleExportJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeframe: reportTimeframe,
      metrics: {
        totalSales: stats.totalOrderSales,
        totalCollectedCash: stats.totalCollectedCash,
        totalDebtOutstanding: stats.totalDebtOutstanding,
        averageOrderValue: stats.averageOrderValue,
      },
      topProducts: stats.topSellingProducts,
      categoryShare: stats.categoryData,
      rawOrders: orders,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Shop_Report_${reportTimeframe}_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];

  return (
    <div className="space-y-8 animate-fade-in print:p-0">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("rep_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze sales, track payment collections, and download analytical spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="flex items-center justify-center gap-2 border border-border bg-card font-bold px-4 py-2.5 rounded-xl hover:bg-muted text-xs transition-all cursor-pointer"
          >
            <span>{t("rep_export_pdf")}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl shadow-md hover:scale-[1.01] text-xs transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{t("rep_export_excel")}</span>
          </button>
        </div>
      </div>

      {/* Reports Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Sales Revenue</span>
          <p className="text-2xl font-extrabold tracking-tight mt-2">{formatCurrency(stats.totalOrderSales)}</p>
          <span className="text-[10px] text-muted-foreground mt-1 block">Invoiced order totals</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Cash Collected</span>
          <p className="text-2xl font-extrabold tracking-tight text-emerald-500 mt-2">
            {formatCurrency(stats.totalCollectedCash)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 block">Liquidity in register</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Total Outstandings</span>
          <p className="text-2xl font-extrabold tracking-tight text-rose-500 mt-2">
            {formatCurrency(stats.totalDebtOutstanding)}
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 block">Pending client debts</span>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase">Average Invoice Value</span>
          <p className="text-2xl font-extrabold tracking-tight mt-2">{formatCurrency(stats.averageOrderValue)}</p>
          <span className="text-[10px] text-muted-foreground mt-1 block">Per customer basket spend</span>
        </div>
      </div>

      {/* Sales Trend chart */}
      <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-lg flex items-center gap-1.5">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Sales Trends & Revenue Flows</span>
          </h3>

          <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border rounded-xl print:hidden">
            {(["daily", "weekly", "monthly"] as const).map((time) => (
              <button
                key={time}
                onClick={() => setReportTimeframe(time)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                  reportTimeframe === time
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "1rem",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Order Value" />
              <Bar dataKey="collected" fill="#10b981" radius={[4, 4, 0, 0]} name="Cash Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Top products and Category Distribution share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best sellers */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
          <h3 className="font-bold text-lg flex items-center gap-1.5">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span>Highest Revenue Earners</span>
          </h3>
          <div className="divide-y divide-border">
            {stats.topSellingProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground italic">
                {t("no_data")}
              </div>
            ) : (
              stats.topSellingProducts.map((prod, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold">{prod.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{prod.qty} items sold</p>
                    </div>
                  </div>
                  <div className="text-end font-extrabold text-base">
                    {formatCurrency(prod.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category distribution */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-1.5">
              <Layers className="h-5 w-5 text-primary" />
              <span>Product Category Revenue Share</span>
            </h3>
            <div className="space-y-4 mt-6">
              {stats.categoryData.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground italic">
                  {t("no_data")}
                </div>
              ) : (
                stats.categoryData.map((cat, idx) => {
                  const percent = stats.totalOrderSales > 0 ? (cat.value / stats.totalOrderSales) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold">{cat.name}</span>
                        <span className="font-bold text-muted-foreground">
                          {formatCurrency(cat.value)} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
