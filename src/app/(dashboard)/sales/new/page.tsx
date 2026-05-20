"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Plus,
  Trash2,
  Calendar,
  User,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Minus,
} from "lucide-react";
import Link from "next/link";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  maxStock: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const { t, isRTL, language } = useTranslation();
  const { customers, products, addOrder, addCustomer } = useStore();

  // Search & Cart states
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout Details
  const [paid, setPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Customer Add Quick Form
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  // Search products list
  const filteredProducts = useMemo(() => {
    if (!productQuery.trim()) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(productQuery.toLowerCase()))
      )
      .slice(0, 5); // Limit search suggestion to 5
  }, [products, productQuery]);

  // Totals calculations
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const parsedPaid = parseFloat(paid) || 0;
    const remaining = Math.max(0, subtotal - parsedPaid);
    const hasDebt = remaining > 0;

    return {
      subtotal,
      remaining,
      hasDebt,
    };
  }, [cart, paid]);

  const addToCart = (prod: any) => {
    if (prod.stockQty <= 0) {
      alert("Product is out of stock!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        if (existing.qty >= prod.stockQty) {
          alert(`Cannot add more. Only ${prod.stockQty} items available in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === prod.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          qty: 1,
          maxStock: prod.stockQty,
        },
      ];
    });
    setProductQuery("");
  };

  const updateCartQty = (productId: string, newQty: number) => {
    const item = cart.find((c) => c.productId === productId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.maxStock) {
      alert(`Only ${item.maxStock} items available in stock.`);
      return;
    }

    setCart((prev) =>
      prev.map((c) => (c.productId === productId ? { ...c, qty: newQty } : c))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const newId = `cust_${Date.now()}`;
    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress || undefined,
      notes: "Quick add from checkout window",
    });

    // Auto-select the newly created customer
    // Since addCustomer does not return the object, we select it from customers list after state updates
    // For local instant React render, we can find the customer we just added. We can match by phone:
    setTimeout(() => {
      const updatedCust = useStore.getState().customers.find((c) => c.phone === newCustPhone);
      if (updatedCust) {
        setSelectedCustomerId(updatedCust.id);
      }
    }, 50);

    setShowAddCustomer(false);
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
  };

  const handleCheckout = () => {
    if (!selectedCustomerId) {
      alert("Please select a customer for this order.");
      return;
    }
    if (cart.length === 0) {
      alert("Your checkout cart is empty. Add products to sell.");
      return;
    }
    if (totals.hasDebt && !dueDate) {
      alert("Please specify a debt Due Date for outstanding balance installments.");
      return;
    }

    const items = cart.map((c) => ({
      productId: c.productId,
      qty: c.qty,
      unitPrice: c.price,
    }));

    const order = addOrder({
      customerId: selectedCustomerId,
      items,
      paid: parseFloat(paid) || 0,
      dueDate: totals.hasDebt ? dueDate : undefined,
      notes: notes.trim() || undefined,
    });

    // Navigate to generated invoice receipt
    router.push(`/invoices/${order.id}`);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/sales"
          className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors text-muted-foreground"
        >
          {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          <span>Back to Invoices</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Point-of-Sale Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Add Items & Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span>1. {t("sale_customer")}</span>
              </h3>
              {!showAddCustomer && (
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  + Add Customer Account
                </button>
              )}
            </div>

            {showAddCustomer ? (
              <form onSubmit={handleQuickAddCustomer} className="p-4 bg-muted/30 rounded-2xl border border-border space-y-3">
                <p className="text-xs font-bold text-foreground">Add New Customer Instantly</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phone Number"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Address (Optional)"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(false)}
                    className="px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted font-semibold"
                  >
                    {t("btn_cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm"
                  >
                    Quick Save
                  </button>
                </div>
              </form>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose Customer from Account list --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Product Search & Catalog List Picker */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm relative">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span>2. Choose Store Products</span>
            </h3>

            <div className="relative">
              <Search className={`absolute top-3.5 h-5 w-5 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`} />
              <input
                type="text"
                placeholder="Search products by SKU or Name to add to checkout tray..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className={`w-full bg-muted/50 border border-border rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}`}
              />
            </div>

            {/* Suggestions dropdown list */}
            {productQuery.trim() !== "" && (
              <div className="absolute left-6 right-6 mt-1 bg-card border border-border rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-border animate-fade-in">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground italic">
                    No product matches this name/SKU.
                  </div>
                ) : (
                  filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => addToCart(prod)}
                      className="p-3 hover:bg-muted/50 transition-colors flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div>
                        <p className="font-bold text-sm text-foreground">{prod.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          SKU: {prod.sku || "N/A"} • Category: {prod.category}
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="font-bold text-sm text-primary">{formatCurrency(prod.price)}</span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Stock: {prod.stockQty} left</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Checkout Tray Table */}
            <div className="space-y-3">
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">
                Selected checkout tray
              </span>

              {/* Desktop Table View */}
              <div className="hidden md:block border border-border rounded-2xl overflow-x-auto bg-muted/10">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border font-semibold text-muted-foreground">
                      <th className="px-4 py-3">{t("prod_name")}</th>
                      <th className="px-4 py-3 text-center">{t("prod_price")}</th>
                      <th className="px-4 py-3 text-center">{t("sale_qty")}</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      <th className="px-4 py-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          Basket is empty. Search products above to add them to checkout tray.
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item.productId} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-semibold">{item.name}</td>
                          <td className="px-4 py-3 text-center font-bold">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-2 border border-border rounded-lg bg-card p-1">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.productId, item.qty - 1)}
                                className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-bold w-4 text-center">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.productId, item.qty + 1)}
                                className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-foreground">
                            {formatCurrency(item.price * item.qty)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="md:hidden space-y-3">
                {cart.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic border border-border rounded-2xl bg-muted/10">
                    Basket is empty. Search products above to add them.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="p-4 bg-muted/10 border border-border rounded-2xl space-y-3 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(item.price)} per unit</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-border/40">
                        <div className="inline-flex items-center gap-2 border border-border rounded-lg bg-card p-1">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.productId, item.qty - 1)}
                            className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold w-4 text-center text-xs">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.productId, item.qty + 1)}
                            className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">Subtotal</span>
                          <span className="font-bold text-sm text-foreground">{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Checkout Summary & Payment ledger logic */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-2">
            ⚡ Checkout Details
          </h3>

          <div className="space-y-4">
            {/* Subtotal Display */}
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">Order Subtotal</span>
              <span className="text-lg font-bold">{formatCurrency(totals.subtotal)}</span>
            </div>

            {/* Input - Cash Paid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">
                {t("sale_paid")} ({language === "ar" ? "ج.م" : "EGP"}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Enter paid amount (e.g. 40)"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Dynamic remaining balance */}
            <div className="p-4 rounded-2xl border border-border/80 space-y-2 bg-muted/20">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Outstanding Debt Balance</span>
                <span className={`font-bold ${totals.hasDebt ? "text-rose-500 text-sm" : "text-emerald-500"}`}>
                  {formatCurrency(totals.remaining)}
                </span>
              </div>

              {/* Debt alert panel */}
              {totals.hasDebt && (
                <div className="mt-3 space-y-3 pt-3 border-t border-border animate-fade-in">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Requires Debt installment details:</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {t("sale_due_date")} *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">
                {t("sale_notes")}
              </label>
              <textarea
                placeholder="Enter customer purchase notes, serial numbers, warranty terms, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-muted/50 border border-border rounded-xl py-2 px-4 text-xs focus:outline-none resize-none"
              />
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-4 bg-primary text-primary-foreground font-extrabold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center text-sm"
            >
              Complete Sale & Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
