"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Printer,
  Share2,
  Calendar,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import Link from "next/link";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { orders, customers, products, storeName, storePhone, storeAddress } = useStore();

  const invoiceId = params.id as string;

  // Retrieve invoice details
  const invoiceDetails = useMemo(() => {
    const order = orders.find((o) => o.id === invoiceId);
    if (!order) return null;

    const customer = customers.find((c) => c.id === order.customerId);

    const items = order.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        ...item,
        name: prod?.name || `Product (${item.productId})`,
      };
    });

    return {
      ...order,
      customer,
      items,
    };
  }, [invoiceId, orders, customers, products]);

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp reminder message content builder
  const whatsappUrl = useMemo(() => {
    if (!invoiceDetails || !invoiceDetails.customer) return "";

    const cleanPhone = invoiceDetails.customer.phone.replace(/[^0-9]/g, "");
    
    // Construct text message
    let messageText = `⚡ Hello ${invoiceDetails.customer.name},\n`;
    messageText += `Here is your purchase invoice receipt from *${storeName}*:\n\n`;
    messageText += `*Invoice ID:* #${invoiceDetails.id}\n`;
    messageText += `*Date:* ${formatDate(invoiceDetails.createdAt)}\n\n`;
    messageText += `*Items purchased:*\n`;
    
    invoiceDetails.items.forEach((it) => {
      messageText += `- ${it.name} x${it.qty} = ${formatCurrency(it.subtotal)}\n`;
    });

    messageText += `\n*Total Order Amount:* ${formatCurrency(invoiceDetails.total)}\n`;
    messageText += `*Amount Paid:* ${formatCurrency(invoiceDetails.paid)}\n`;
    
    if (invoiceDetails.remaining > 0) {
      messageText += `*Outstanding Balance (Debt):* ${formatCurrency(invoiceDetails.remaining)}\n`;
      if (invoiceDetails.dueDate) {
        messageText += `*Payment Due Date:* ${formatDate(invoiceDetails.dueDate)}\n`;
      }
    } else {
      messageText += `*Payment Status:* Fully Paid ✅\n`;
    }
    
    messageText += `\nThank you for shopping with us! If you have questions, call us at ${storePhone}.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  }, [invoiceDetails, storeName, storePhone]);

  if (!invoiceDetails) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto animate-bounce" />
        <h3 className="text-xl font-bold">Invoice Not Found</h3>
        <p className="text-muted-foreground text-sm">The invoice ID #{invoiceId} could not be located in database.</p>
        <Link href="/sales" className="text-primary hover:underline font-semibold block text-sm">
          Return to Invoice ledger
        </Link>
      </div>
    );
  }

  const { customer, items, total, paid: paidAmount, remaining, status, dueDate, createdAt, notes } = invoiceDetails;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Action Controls - Hidden on print view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/sales"
          className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors text-muted-foreground"
        >
          {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          <span>Back to Invoices</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* WhatsApp share */}
          {customer?.phone && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs"
            >
              <Share2 className="h-4 w-4" />
              <span>{t("btn_share_whatsapp")}</span>
            </a>
          )}
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer text-xs"
          >
            <Printer className="h-4 w-4" />
            <span>{t("btn_print")}</span>
          </button>
        </div>
      </div>

      {/* Invoice Main Page Layout */}
      <div className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:bg-white print:text-slate-900 print:p-0">
        
        {/* Invoice Header (Store + Invoice info) */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-border pb-6 print:border-slate-300">
          <div className="space-y-2 text-start">
            {/* Store logo wrapper */}
            <div className="flex items-center space-x-2 space-x-reverse mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl print:bg-slate-900 print:text-white">
                ⚡
              </div>
              <h3 className="font-extrabold text-2xl tracking-tight">{storeName}</h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 print:text-slate-600">
              <p className="flex items-center gap-1.5 justify-start">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{storeAddress}</span>
              </p>
              <p className="flex items-center gap-1.5 justify-start">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{storePhone}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 text-start sm:text-end">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
              Purchase Invoice
            </span>
            <h4 className="font-mono font-extrabold text-2xl text-foreground print:text-slate-900">
              #{invoiceId}
            </h4>
            <div className="text-xs text-muted-foreground space-y-1 print:text-slate-600">
              <p className="flex items-center justify-start sm:justify-end gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Date: {formatDate(createdAt)}</span>
              </p>
              <p className="flex items-center justify-start sm:justify-end gap-1.5">
                <span className="font-bold">Status:</span>
                <span className={status === "paid" ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
                  {status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl border border-border/80 print:bg-slate-100 print:border-slate-200">
          <div className="space-y-1.5 text-start">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
              Bill To Customer
            </span>
            <p className="font-bold text-base text-foreground print:text-slate-950">
              {customer?.name || "Walking Customer"}
            </p>
            {customer?.phone && (
              <p className="text-xs text-muted-foreground print:text-slate-600">{customer.phone}</p>
            )}
          </div>
          
          <div className="space-y-1.5 text-start sm:text-end">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
              Shipping / Installment Address
            </span>
            <p className="text-xs text-muted-foreground print:text-slate-600 leading-relaxed">
              {customer?.address || "No address details registered."}
            </p>
          </div>
        </div>

        {/* Invoice items bought table */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Order Items Summary
          </h4>
          <div className="border border-border rounded-2xl overflow-hidden print:border-slate-300">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border font-bold text-muted-foreground text-xs uppercase print:bg-slate-100 print:border-slate-300">
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5 text-center">Unit Price</th>
                  <th className="px-6 py-3.5 text-center">Qty</th>
                  <th className="px-6 py-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-slate-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 print:hover:bg-transparent">
                    <td className="px-6 py-4 font-semibold text-foreground print:text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground print:text-slate-600">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-foreground">
                      {item.qty}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground print:text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-border pt-6 print:border-slate-300">
          {/* Notes and warranty */}
          <div className="flex-1 max-w-md space-y-2 text-start">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
              Additional Notes & Warranties
            </span>
            <p className="text-xs text-muted-foreground italic leading-relaxed print:text-slate-600">
              {notes || "Standard 1-year product replacement warranty applies for factory defects. Please retain this printout."}
            </p>
          </div>

          {/* Totals panel */}
          <div className="w-full sm:w-80 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-b border-border pb-2 print:border-slate-200">
              <span className="text-muted-foreground font-bold">Amount Paid</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(paidAmount)}</span>
            </div>

            {remaining > 0 ? (
              <div className="space-y-2 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 print:border-slate-300">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-rose-500 font-bold">Outstanding Debt</span>
                  <span className="font-extrabold text-base text-rose-500">{formatCurrency(remaining)}</span>
                </div>
                {dueDate && (
                  <div className="text-[10px] text-muted-foreground flex justify-between items-center mt-1 pt-1 border-t border-rose-500/10 print:text-slate-600">
                    <span>Installment Due:</span>
                    <span className="font-bold">{formatDate(dueDate)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl justify-center print:border print:border-slate-300 print:text-slate-900">
                <CheckCircle className="h-4 w-4" />
                <span>Invoice Fully Settled</span>
              </div>
            )}
          </div>
        </div>

        {/* Printable Footer receipt notice */}
        <div className="hidden print:block text-center text-[10px] text-slate-500 mt-12 border-t border-slate-200 pt-6">
          Thank you for choosing {storeName}! Electrical & Home Appliances Shop.
        </div>
      </div>
    </div>
  );
}
