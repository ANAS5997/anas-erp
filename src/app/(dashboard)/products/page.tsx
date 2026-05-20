"use client";

import React, { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/utils";
import type { ProductCategory, Product } from "@/types";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ShoppingBag,
  Package,
  Layers,
  X,
  TrendingDown,
} from "lucide-react";

export default function ProductsPage() {
  const { t, isRTL } = useTranslation();
  const { products, addProduct, updateProduct, deleteProduct, role } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("electrical_tools");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const categories: { key: ProductCategory | "all"; label: string }[] = [
    { key: "all", label: "All Items" },
    { key: "electrical_tools", label: t("prod_categories.electrical_tools") },
    { key: "home_appliances", label: t("prod_categories.home_appliances") },
    { key: "lighting", label: t("prod_categories.lighting") },
    { key: "cables", label: t("prod_categories.cables") },
    { key: "kitchen_devices", label: t("prod_categories.kitchen_devices") },
    { key: "other", label: t("prod_categories.other") },
  ];

  // Count numbers for categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.sku && prod.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const resetForm = () => {
    setName("");
    setCategory("electrical_tools");
    setPrice("");
    setCostPrice("");
    setStockQty("");
    setLowStockThreshold("5");
    setSku("");
    setDescription("");
    setEditId(null);
    setIsEditing(false);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setName(prod.name);
    setCategory(prod.category);
    setPrice(String(prod.price));
    setCostPrice(prod.costPrice ? String(prod.costPrice) : "");
    setStockQty(String(prod.stockQty));
    setLowStockThreshold(String(prod.lowStockThreshold));
    setSku(prod.sku || "");
    setDescription(prod.description || "");
    setEditId(prod.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !stockQty) return;

    const parsedPrice = parseFloat(price);
    const parsedCost = parseFloat(costPrice) || 0;
    const parsedStock = parseInt(stockQty);
    const parsedMin = parseInt(lowStockThreshold);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) return;

    const itemData = {
      name,
      category,
      price: parsedPrice,
      costPrice: parsedCost,
      stockQty: parsedStock,
      lowStockThreshold: isNaN(parsedMin) ? 5 : parsedMin,
      sku: sku.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (isEditing && editId) {
      updateProduct(editId, itemData);
    } else {
      addProduct(itemData);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this product from inventory?")) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("prod_title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track stock quantities, set low-limit alerts, and edit product specifications.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm"
        >
          <Plus className="h-5 w-5" />
          <span>{t("prod_add")}</span>
        </button>
      </div>

      {/* Category Pills Ribbon */}
      <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-none w-full max-w-[100vw] sm:max-w-full">
        {categories.map((cat) => {
          const count = categoryCounts[cat.key] || 0;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Products Grid & Search */}
      <div className="p-3 sm:p-6 bg-card border border-border rounded-3xl space-y-6 shadow-sm w-full max-w-[100vw] sm:max-w-full overflow-hidden">
        <div className="relative">
          <Search className={`absolute top-3.5 h-5 w-5 text-muted-foreground ${isRTL ? "right-4" : "left-4"}`} />
          <input
            type="text"
            placeholder="Search products by name or SKU/Barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-muted/50 border border-border rounded-2xl py-3 px-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"}`}
          />
        </div>

        {/* Catalog Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-foreground border-collapse hidden md:table">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider font-semibold bg-muted/20">
                <th className="px-6 py-4">{t("prod_name")}</th>
                <th className="px-6 py-4">SKU / Barcode</th>
                <th className="px-6 py-4">{t("prod_category")}</th>
                {role === "admin" && (
                  <>
                    <th className="px-6 py-4">{t("cost_price")}</th>
                    <th className="px-6 py-4">{t("prod_price")}</th>
                    <th className="px-6 py-4">{t("profit_margin")}</th>
                  </>
                )}
                {role !== "admin" && <th className="px-6 py-4">{t("prod_price")}</th>}
                <th className="px-6 py-4 text-center">{t("prod_stock")}</th>
                <th className="px-6 py-4 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 8 : 6} className="px-6 py-12 text-center text-muted-foreground italic">
                    {t("no_data")}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLowStock = prod.stockQty <= prod.lowStockThreshold;
                  
                  const cost = prod.costPrice || 0;
                  const profit = prod.price - cost;
                  const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;
                  const potentialProfit = profit * prod.stockQty;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-base">{prod.name}</p>
                          {prod.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                              {prod.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-muted-foreground">
                        {prod.sku || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium bg-muted border border-border px-2.5 py-1 rounded-full text-muted-foreground">
                          {t(`prod_categories.${prod.category}` as any)}
                        </span>
                      </td>
                      {role === "admin" && (
                        <>
                          <td className="px-6 py-4 font-extrabold text-base text-rose-500">
                            {formatCurrency(cost)}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-base text-emerald-500">
                            {formatCurrency(prod.price)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs">
                              <span className="font-bold text-emerald-500">+{formatCurrency(profit)}</span>
                              <span className="text-[10px] text-muted-foreground block">
                                {markupPercent.toFixed(0)}% markup
                              </span>
                              {prod.stockQty > 0 && (
                                <span className="text-[9px] text-primary font-bold block mt-0.5" title={t("potential_profit") as string}>
                                  Pot: {formatCurrency(potentialProfit)}
                                </span>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                      {role !== "admin" && (
                        <td className="px-6 py-4 font-extrabold text-base">
                          {formatCurrency(prod.price)}
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              prod.stockQty === 0
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : isLowStock
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}
                          >
                            {prod.stockQty} left
                          </span>
                          {isLowStock && (
                            <span className="text-[9px] text-rose-500 font-bold mt-1 flex items-center gap-0.5">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              Low Stock!
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                            title={t("btn_edit")}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {role === "admin" && (
                            <button
                              onClick={() => handleDelete(prod.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                              title={t("btn_delete")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Catalog Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground italic py-8">
                {t("no_data")}
              </p>
            ) : (
              filteredProducts.map((prod) => {
                const isLowStock = prod.stockQty <= prod.lowStockThreshold;
                const cost = prod.costPrice || 0;
                const profit = prod.price - cost;
                const markupPercent = cost > 0 ? (profit / cost) * 100 : 0;
                const potentialProfit = profit * prod.stockQty;

                return (
                  <div key={prod.id} className="bg-card border border-border p-4 rounded-3xl space-y-4 shadow-sm relative">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-base text-foreground truncate">{prod.name}</h4>
                        {prod.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{prod.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-[10px] font-bold bg-muted border border-border px-2 py-0.5 rounded-lg text-muted-foreground break-words max-w-full">
                            {t(`prod_categories.${prod.category}` as any)}
                          </span>
                          {prod.sku && (
                            <span className="text-[10px] font-mono bg-muted border border-border px-2 py-0.5 rounded-lg text-muted-foreground break-all max-w-full">
                              {prod.sku}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-end">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${
                            prod.stockQty === 0
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : isLowStock
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}
                        >
                          {prod.stockQty} {isRTL ? "متبقي" : "left"}
                        </span>
                        {isLowStock && (
                          <p className="text-[9px] text-rose-500 font-bold mt-1">
                            ⚠️ {isRTL ? "منخفض!" : "Low!"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50 text-xs">
                      {role === "admin" ? (
                        <>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("cost_price")}</span>
                            <span className="font-extrabold text-sm text-rose-500">{formatCurrency(cost)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("prod_price")}</span>
                            <span className="font-extrabold text-sm text-emerald-500">{formatCurrency(prod.price)}</span>
                          </div>
                          <div className="col-span-2 bg-muted/30 p-2.5 border border-border/40 rounded-2xl flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-muted-foreground block font-bold">{isRTL ? "هامش الربح" : "Margin"}</span>
                              <span className="font-extrabold text-emerald-500">+{formatCurrency(profit)} ({markupPercent.toFixed(0)}%)</span>
                            </div>
                            {prod.stockQty > 0 && (
                              <div className="text-end">
                                <span className="text-[10px] text-muted-foreground block font-bold">{isRTL ? "أرباح متوقعة" : "Potential"}</span>
                                <span className="font-extrabold text-primary">{formatCurrency(potentialProfit)}</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="col-span-2">
                          <span className="text-[10px] text-muted-foreground block font-bold uppercase">{t("prod_price")}</span>
                          <span className="font-extrabold text-sm text-emerald-500">{formatCurrency(prod.price)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-border/30">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="px-3.5 py-1.5 border border-border hover:bg-muted text-foreground font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{t("btn_edit")}</span>
                      </button>
                      {role === "admin" && (
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="px-3.5 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t("btn_delete")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
      </div>

      {/* Add / Edit Product Sliding Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl w-full max-w-md mx-4 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg">
                {isEditing ? t("prod_edit") : t("prod_add")}
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
                  {t("prod_name")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Philips LED Bulb 12W"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("prod_category")} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary"
                  >
                    {categories
                      .filter((c) => c.key !== "all")
                      .map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    SKU / Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bulb-12W-009"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("prod_price")} (EGP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("cost_price")} (EGP)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Cost"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    {t("prod_stock")} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Stock"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Alert Min Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Limit"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Description
                </label>
                <textarea
                  placeholder="Technical specifications, warranty info, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
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
