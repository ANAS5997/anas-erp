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
  const {
    orders,
    customers,
    products,
    storeName,
    storePhone,
    storeAddress,
    storeSlogan,
    invoiceFooterNotes,
    taxRate,
    receiptFormat,
    currency,
  } = useStore();

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
      messageText += `- ${it.name} x${it.qty} = ${formatCurrency(it.subtotal, currency)}\n`;
    });

    messageText += `\n*Total Order Amount:* ${formatCurrency(invoiceDetails.total, currency)}\n`;
    messageText += `*Amount Paid:* ${formatCurrency(invoiceDetails.paid, currency)}\n`;
    
    if (invoiceDetails.remaining > 0) {
      messageText += `*Outstanding Balance (Debt):* ${formatCurrency(invoiceDetails.remaining, currency)}\n`;
      if (invoiceDetails.dueDate) {
        messageText += `*Payment Due Date:* ${formatDate(invoiceDetails.dueDate)}\n`;
      }
    } else {
      messageText += `*Payment Status:* Fully Paid ✅\n`;
    }
    
    messageText += `\nThank you for shopping with us! If you have questions, call us at ${storePhone}.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  }, [invoiceDetails, storeName, storePhone, currency]);

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

  const isThermal = receiptFormat === "thermal";

  // Calculate tax breakdown
  const taxAmount = taxRate > 0 ? total * (taxRate / 100) : 0;
  const subtotalAmount = total - taxAmount;

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

      {isThermal ? (
        /* Thermal Receipt 80mm Layout */
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-6 max-w-md mx-auto print:border-none print:shadow-none print:bg-white print:text-slate-900 print:p-0 font-mono text-xs">
          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-lg tracking-tight text-foreground print:text-slate-900">{storeName}</h3>
            {storeSlogan && <p className="text-muted-foreground text-[10px] uppercase print:text-slate-600">{storeSlogan}</p>}
            <p className="text-muted-foreground text-[10px] print:text-slate-500">{storeAddress}</p>
            <p className="text-muted-foreground text-[10px] print:text-slate-500">TEL: {storePhone}</p>
          </div>

          <div className="border-t border-dashed border-border my-3 print:border-slate-400"></div>

          <div className="space-y-1">
            <p><span className="font-bold">INVOICE:</span> #{invoiceId}</p>
            <p><span className="font-bold">DATE:</span> {formatDate(createdAt)}</p>
            <p><span className="font-bold">CUSTOMER:</span> {customer?.name || "Walking Customer"}</p>
            {customer?.phone && <p><span className="font-bold">PHONE:</span> {customer.phone}</p>}
            <p><span className="font-bold">STATUS:</span> {status.toUpperCase()}</p>
          </div>

          <div className="border-t border-dashed border-border my-3 print:border-slate-400"></div>

          <div className="space-y-2">
            <div className="flex justify-between font-bold text-muted-foreground print:text-slate-700">
              <span>ITEMS</span>
              <span>TOTAL</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4">
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground print:text-slate-900">{item.name}</p>
                  <p className="text-muted-foreground text-[10px] print:text-slate-500">
                    {item.qty} x {formatCurrency(item.unitPrice, currency)}
                  </p>
                </div>
                <span className="font-bold text-foreground print:text-slate-900 align-top">
                  {formatCurrency(item.subtotal, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border my-3 print:border-slate-400"></div>

          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotalAmount, currency)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground print:text-slate-600">
                <span>VAT ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-border pt-1.5 print:border-slate-400 text-foreground print:text-slate-950">
              <span>GRAND TOTAL</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>CASH PAID</span>
              <span>{formatCurrency(paidAmount, currency)}</span>
            </div>
            {remaining > 0 ? (
              <div className="flex justify-between text-rose-500 font-bold border-t border-dashed border-border pt-1 mt-1 print:border-slate-400 font-mono">
                <span>BALANCE DUE</span>
                <span>{formatCurrency(remaining, currency)}</span>
              </div>
            ) : (
              <p className="text-center font-bold text-emerald-600 bg-emerald-500/10 py-1 rounded-md mt-2 text-[10px] print:border print:border-slate-300 print:text-slate-900 font-mono">
                INVOICE FULLY SETTLED
              </p>
            )}
          </div>

          {dueDate && remaining > 0 && (
            <p className="text-[10px] text-center text-rose-500 font-bold mt-2">
              DUE DATE: {formatDate(dueDate)}
            </p>
          )}

          <div className="border-t border-dashed border-border my-3 print:border-slate-400 font-mono"></div>

          <div className="text-center text-[10px] text-muted-foreground space-y-1 print:text-slate-500 leading-relaxed">
            <p className="italic">{notes || invoiceFooterNotes}</p>
            <p className="font-bold pt-2">*** THANK YOU ***</p>
          </div>
        </div>
      ) : (
        /* Standard A4 layout */
        <div className="p-8 md:p-12 bg-card border border-border rounded-3xl shadow-sm space-y-8 max-w-4xl mx-auto print:border-none print:shadow-none print:bg-white print:text-slate-900 print:p-0">
          
          {/* Invoice Header (Store + Invoice info) */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-border pb-6 print:border-slate-300 font-sans">
            <div className="space-y-2 text-start">
              {/* Store logo wrapper */}
              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl print:bg-slate-900 print:text-white">
                  ⚡
                </div>
                <h3 className="font-extrabold text-2xl tracking-tight text-foreground print:text-slate-950">{storeName}</h3>
              </div>
              {storeSlogan && (
                <p className="text-xs text-primary font-bold uppercase tracking-wide print:text-slate-700">
                  {storeSlogan}
                </p>
              )}
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
            <div className="border border-border rounded-2xl overflow-x-auto print:border-slate-300">
              <table className="w-full text-sm text-left border-collapse min-w-[500px] md:min-w-0">
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
                        {formatCurrency(item.unitPrice, currency)}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-foreground">
                        {item.qty}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-foreground print:text-slate-900">
                        {formatCurrency(item.subtotal, currency)}
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
                {notes || invoiceFooterNotes || "Standard 1-year product replacement warranty applies for factory defects. Please retain this printout."}
              </p>
            </div>

            {/* Totals panel */}
            <div className="w-full sm:w-80 space-y-3 font-sans">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotalAmount, currency)}</span>
              </div>

              {taxRate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">VAT ({taxRate}%)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(taxAmount, currency)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-sm border-b border-border pb-2 print:border-slate-200">
                <span className="text-muted-foreground font-bold">Amount Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(paidAmount, currency)}</span>
              </div>

              {remaining > 0 ? (
                <div className="space-y-2 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 print:border-slate-300">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-rose-500 font-bold">Outstanding Debt</span>
                    <span className="font-extrabold text-base text-rose-500">{formatCurrency(remaining, currency)}</span>
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
            Thank you for choosing {storeName}! {storeSlogan || "Electrical & Home Appliances Shop."}
          </div>
        </div>
      )}
    </div>
  );
}
