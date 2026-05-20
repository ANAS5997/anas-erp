import React, { useMemo, useState, useEffect } from "react";
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
  ShieldCheck,
  PiggyBank,
  RefreshCw,
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
} from "recharts";

export default function DashboardPage() {
  const { t, isRTL, language } = useTranslation();
  const { orders, customers, products, notifications, expenses, logActivity } = useStore();

  // Local state for Cash Drawer reconciler
  const [openingCashInput, setOpeningCashInput] = useState("1000");
  const [actualCashInput, setActualCashInput] = useState("");
  const [reconciliationLog, setReconciliationLog] = useState<{
    timestamp: string;
    expected: number;
    actual: number;
    diff: number;
  } | null>(null);

  // Sync opening cash from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem("abo_anas_opening_cash");
    if (saved) {
      setOpeningCashInput(saved);
    }
    const savedLog = localStorage.getItem("abo_anas_reconciliation_log");
    if (savedLog) {
      try {
        setReconciliationLog(JSON.parse(savedLog));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Calculate Stats
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

    // Daily Expenses
    const dailyExpenses = expenses
      .filter((e) => new Date(e.createdAt).toDateString() === todayStr)
      .reduce((acc, e) => acc + e.amount, 0);

    // Most Sold Products (accumulate quantities from order items)
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
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
        .reduce((acc, o) => acc + o.total, 0);

      const daysCash = orders
        .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
        .reduce((acc, o) => acc + o.paid, 0);

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
      dailyExpenses,
      topProducts,
      lowStockAlerts,
      chartData,
    };
  }, [orders, customers, products, expenses]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  // Drawer calculations
  const openingCash = parseFloat(openingCashInput) || 0;
  const expectedCashInDrawer = openingCash + stats.dailyRevenue - stats.dailyExpenses;
  const actualCashCounted = actualCashInput !== "" ? parseFloat(actualCashInput) || 0 : null;
  const drawerDifference = actualCashCounted !== null ? actualCashCounted - expectedCashInDrawer : 0;

  const handleSaveOpeningCash = (val: string) => {
    setOpeningCashInput(val);
    localStorage.setItem("abo_anas_opening_cash", val);
  };

  const handleReconcileDrawer = () => {
    if (actualCashCounted === null) return;
    
    const newLog = {
      timestamp: new Date().toLocaleString(),
      expected: expectedCashInDrawer,
      actual: actualCashCounted,
      diff: drawerDifference,
    };
    
    setReconciliationLog(newLog);
    localStorage.setItem("abo_anas_reconciliation_log", JSON.stringify(newLog));
    
    const diffText = drawerDifference === 0 
      ? "Drawer reconciled perfectly" 
      : drawerDifference > 0 
      ? `Drawer reconciled with surplus: +${drawerDifference}` 
      : `Drawer reconciled with shortage: ${drawerDifference}`;
      
    logActivity(`[Vault Reconciliation] ${diffText}. Expected: ${expectedCashInDrawer}, Counted: ${actualCashCounted}`);
    
    alert(language === "ar" 
      ? "تم مطابقة الخزينة وتسجيل الجرد بنجاح!" 
      : "Cash drawer reconciliation logged successfully!"
    );
  };

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
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-16 md:pb-8">
      {/* Welcome header with stats status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === "ar" ? "متجر أبو أنس" : "Abo Anas Store"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {language === "ar" 
              ? "لوحة تحكم ذكية لمتابعة المبيعات، المخزون، والديون والوردية الحالية." 
              : "Realtime shop intelligence, stock tracker, and drawer shift vault."}
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse bg-card border border-border px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold w-fit">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{formatDate(new Date())}</span>
        </div>
      </div>

      {/* Metric Cards Grid - Responsive 2 Columns on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 sm:p-6 bg-card border border-t-4 ${card.borderColor} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md shadow-sm flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground leading-tight">{card.title}</span>
                <div className={`p-1.5 sm:p-2 rounded-xl border ${card.color} shrink-0`}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <div className="mt-2 sm:mt-4">
                <span className="text-lg sm:text-2xl font-extrabold tracking-tight block truncate">{card.value}</span>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 block truncate">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🏦 Abo Anas Cash Drawer / Vault Reconciler */}
      <div className="p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-foreground">
                {language === "ar" ? "خزينة متجر أبو أنس للوردية الحالية" : "Abo Anas Store Cash Vault"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "ar"
                  ? "جرد وتسوية النقدية ومطابقة الرصيد الفعلي مع رصيد النظام."
                  : "Audit physical register cash, compute discrepancies and log verification."}
              </p>
            </div>
          </div>
          {reconciliationLog && (
            <div className="text-[10px] sm:text-xs bg-muted/60 border border-border rounded-xl px-3 py-1.5 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {language === "ar" ? `آخر جرد: ${reconciliationLog.timestamp}` : `Last Audit: ${reconciliationLog.timestamp}`}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Opening Cash Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              {language === "ar" ? "رصيد بداية الوردية (الافتتاحي)" : "Shift Opening Cash"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={openingCashInput}
                onChange={(e) => handleSaveOpeningCash(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Expected Cash in Drawer */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              {language === "ar" ? "الرصيد النقدي المتوقع بالخزينة" : "Expected Drawer Cash"}
            </label>
            <div className="bg-muted/40 border border-border rounded-2xl py-3 px-4 text-xs font-bold text-foreground">
              {formatCurrency(expectedCashInDrawer)}
              <span className="text-[9px] font-normal text-muted-foreground block mt-0.5">
                {language === "ar"
                  ? `(افتتاحي ${openingCash} + مبيعات ${stats.dailyRevenue} - مصروفات ${stats.dailyExpenses})`
                  : `(open ${openingCash} + sales ${stats.dailyRevenue} - expenses ${stats.dailyExpenses})`}
              </span>
            </div>
          </div>

          {/* Actual Cash Counted */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              {language === "ar" ? "الرصيد الفعلي بعد الجرد اليدوي *" : "Actual Cash Counted *"}
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder={language === "ar" ? "أدخل المبلغ الفعلي بالصندوق" : "Type physical cash amount"}
                value={actualCashInput}
                onChange={(e) => setActualCashInput(e.target.value)}
                className="w-full bg-muted/40 border border-border rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Discrepancy Difference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground block">
              {language === "ar" ? "الفارق (عجز / زيادة)" : "Discrepancy / Status"}
            </label>
            <div className={`border rounded-2xl py-3 px-4 text-xs font-bold flex items-center justify-between ${
              actualCashCounted === null
                ? "bg-muted/40 border-border text-muted-foreground"
                : drawerDifference === 0
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : drawerDifference > 0
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}>
              <span>
                {actualCashCounted === null 
                  ? (language === "ar" ? "بانتظار الجرد اليدوي" : "Awaiting Manual Count")
                  : formatCurrency(drawerDifference)}
              </span>
              {actualCashCounted !== null && (
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-card">
                  {drawerDifference === 0 
                    ? (language === "ar" ? "مطابق" : "Matched")
                    : drawerDifference > 0 
                    ? (language === "ar" ? "زيادة" : "Surplus")
                    : (language === "ar" ? "عجز" : "Shortage")}
                </span>
              )}
            </div>
          </div>
        </div>

        {actualCashCounted !== null && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleReconcileDrawer}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-xs cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>
                {language === "ar" ? "تسجيل مطابقة الخزينة وحفظ التقرير" : "Reconcile Drawer & Save"}
              </span>
            </button>
          </div>
        )}
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
