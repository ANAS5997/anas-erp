"use client";

import React, { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const { t, isRTL } = useTranslation();
  const { orders, customers, products, notifications, expenses } = useStore();

  // 1. Calculate Stats
  const stats = useMemo(() => {
    // Total Sales count
    const totalSalesCount = orders.length;

    // Total Customers count
    const totalCustomersCount = customers.length;

    // Total Revenue (total paid across all orders)
    const totalRevenue = orders.reduce((acc, o) => acc + o.paid, 0);

    // Total Sales Value (accrual sales volume)
    const totalSalesValue = orders.reduce((acc, o) => acc + o.total, 0);

    // Pending Debts (total remaining across all orders)
    const pendingDebts = orders.reduce((acc, o) => acc + o.remaining, 0);

    // Cost of Goods Sold (COGS)
    const totalCogs = orders.reduce((acc, o) => acc + o.items.reduce((sub, item) => sub + (item.qty * (item.costPrice || 0)), 0), 0);

    // Gross Profit (Total Sales Value - COGS)
    const grossProfit = totalSalesValue - totalCogs;

    // Total Expenses
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    // Net Operating Profit (Gross Profit - Expenses)
    const netProfit = grossProfit - totalExpenses;

    // Daily Revenue (paid amount of orders placed today)
    const todayStr = new Date().toDateString();
    const dailyRevenue = orders
      .filter((o) => new Date(o.createdAt).toDateString() === todayStr)
      .reduce((acc, o) => acc + o.paid, 0);

    // Most Sold Products (accumulate quantities from order items)
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        // Find product name in current inventory, fallback to item name or ID
        const prod = products.find((p) => p.id === item.productId);
        const name = prod?.name || `Product (${item.productId})`;
        
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name, qty: 0, revenue: 0 };
        }
        productSalesMap[item.productId].qty += item.qty;
        productSalesMap[item.productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Low stock warnings
    const lowStockAlerts = products.filter((p) => p.stockQty <= p.lowStockThreshold);

    // Revenue history by date (last 7 days for charts)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    const chartData = last7Days.map((dateStr) => {
      const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const daysRevenue = orders
        .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
        .reduce((acc, o) => acc + o.total, 0); // show total sales value

      const daysCash = orders
        .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
        .reduce((acc, o) => acc + o.paid, 0); // show actual cash collected

      return {
        date: formattedDate,
        sales: daysRevenue,
        collected: daysCash,
      };
    });

    return {
      totalSalesCount,
      totalCustomersCount,
      totalRevenue,
      totalSalesValue,
      pendingDebts,
      totalExpenses,
      grossProfit,
      netProfit,
      dailyRevenue,
      topProducts,
      lowStockAlerts,
      chartData,
    };
  }, [orders, customers, products, expenses]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const statCards = [
    {
      title: t("dash_total_sales"),
      value: stats.totalSalesCount,
      subtitle: `${formatCurrency(stats.totalSalesValue)} volume`,
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      borderColor: "border-t-blue-500",
    },
    {
      title: t("gross_profit"),
      value: formatCurrency(stats.grossProfit),
      subtitle: `${stats.totalSalesValue > 0 ? ((stats.grossProfit / stats.totalSalesValue) * 100).toFixed(0) : 0}% margin`,
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      borderColor: "border-t-emerald-500",
    },
    {
      title: t("dash_expenses"),
      value: formatCurrency(stats.totalExpenses),
      subtitle: "Operating overheads",
      icon: TrendingDown,
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      borderColor: "border-t-rose-500",
    },
    {
      title: t("dash_net_profit"),
      value: formatCurrency(stats.netProfit),
      subtitle: "Accrual net income",
      icon: DollarSign,
      color: stats.netProfit >= 0 ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20",
      borderColor: stats.netProfit >= 0 ? "border-t-cyan-500" : "border-t-rose-500",
    },
    {
      title: t("dash_pending_debts"),
      value: formatCurrency(stats.pendingDebts),
      subtitle: "Unpaid balance",
      icon: AlertTriangle,
      color: stats.pendingDebts > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20",
      borderColor: stats.pendingDebts > 0 ? "border-t-amber-500" : "border-t-slate-400 dark:border-t-slate-700",
    },
    {
      title: t("dash_daily_revenue"),
      value: formatCurrency(stats.dailyRevenue),
      subtitle: "Collected today",
      icon: DollarSign,
      color: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      borderColor: "border-t-violet-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header with stats status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Overview Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Realtime shop intelligence, stock tracker, and debt logs.
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse bg-card border border-border px-4 py-2.5 rounded-2xl text-sm font-semibold">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{formatDate(new Date())}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-6 bg-card border border-t-4 ${card.borderColor} rounded-3xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg shadow-sm flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-semibold text-muted-foreground">{card.title}</span>
                <div className={`p-2.5 rounded-2xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold tracking-tight">{card.value}</span>
                <p className="text-xs text-muted-foreground mt-1.5">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Charts & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="p-6 bg-card border border-border rounded-3xl lg:col-span-2 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t("dash_revenue_over_time")} (Last 7 Days)</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-primary block"></span>
                <span className="text-muted-foreground">Order Value</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500 block"></span>
                <span className="text-muted-foreground">Cash Collected</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "1rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Alert Panel */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{t("dash_stock_alerts")}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {stats.lowStockAlerts.length} Warnings
              </span>
            </div>
            <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
              {stats.lowStockAlerts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  ✅ All product stock levels are healthy!
                </div>
              ) : (
                stats.lowStockAlerts.map((prod) => (
                  <div key={prod.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold truncate max-w-[160px]">{prod.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">SKU: {prod.sku || "N/A"}</p>
                    </div>
                    <div className="text-end">
                      <span className="font-bold text-rose-500">{prod.stockQty} items left</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Alert limit: {prod.lowStockThreshold}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link
            href="/products"
            className="flex items-center justify-center gap-1.5 py-3 w-full border border-border hover:border-primary text-xs font-semibold rounded-2xl hover:text-primary transition-all mt-4"
          >
            <span>Restock Inventory</span>
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
      </div>

      {/* Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t("dash_recent_orders")}</h3>
            <Link href="/sales" className="text-xs text-primary hover:underline font-semibold">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("no_data")}
              </div>
            ) : (
              recentOrders.map((order) => {
                const customer = customers.find((c) => c.id === order.customerId);
                return (
                  <div key={order.id} className="py-4 flex items-center justify-between text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">#{order.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : order.status === "partial"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          }`}
                        >
                          {order.status === "paid"
                            ? t("sale_status_paid")
                            : order.status === "partial"
                            ? t("sale_status_partial")
                            : t("sale_status_unpaid")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {customer?.name || "Walking Customer"} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold">{formatCurrency(order.total)}</p>
                      {order.remaining > 0 && (
                        <p className="text-xs text-rose-500 mt-1">
                          Debt: {formatCurrency(order.remaining)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Sold Products */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{t("dash_top_products")}</h3>
          </div>
          <div className="divide-y divide-border">
            {stats.topProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t("no_data")}
              </div>
            ) : (
              stats.topProducts.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold truncate max-w-[200px]">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.qty} {t("dash_items_sold")}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-bold">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total Revenue</p>
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
