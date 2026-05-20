// src/store/useStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppUser,
  Customer,
  Product,
  Order,
  Payment,
  Notification,
  ProductCategory,
  OrderStatus,
  Expense,
} from "@/types";
import { calcRemaining, getDebtStatus } from "@/lib/utils";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

interface AppState {
  // Authentication
  user: AppUser | null;
  role: "admin" | "employee";
  
  // Theme & Locale
  theme: "dark" | "light";
  language: "en" | "ar";
  
  // Database State
  customers: Customer[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  expenses: Expense[];
  
  // Settings / Store details
  storeName: string;
  storePhone: string;
  storeAddress: string;
  
  // Auth Actions
  setUser: (user: AppUser | null) => void;
  setRole: (role: "admin" | "employee") => void;
  setTheme: (theme: "dark" | "light") => void;
  setLanguage: (lang: "en" | "ar") => void;
  updateStoreDetails: (name: string, phone: string, address: string) => void;
  
  // Customer Actions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Product Actions
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Order & Payment Actions
  addOrder: (order: {
    customerId: string;
    items: { productId: string; qty: number; unitPrice: number }[];
    paid: number;
    dueDate?: string;
    notes?: string;
  }) => Order;
  recordPayment: (orderId: string, amount: number, notes?: string) => void;
  
  // Notification Actions
  addNotification: (type: Notification["type"], message: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Logger
  logActivity: (action: string) => void;
  clearActivityLogs: () => void;
  backupData: () => string;
  restoreData: (backupJson: string) => boolean;

  // Expense Actions
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  deleteExpense: (id: string) => void;
}

// Initial Sample Data for Products
const sampleProducts: Product[] = [
  {
    id: "prod_1",
    name: "Tornado Electric Fan 16 Inch",
    category: "home_appliances",
    price: 100,
    costPrice: 70,
    stockQty: 8,
    lowStockThreshold: 5,
    sku: "E-FAN-1601",
    description: "High speed electric fan with remote control",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_2",
    name: "LED Ceiling Panel 24W Warm",
    category: "lighting",
    price: 15,
    costPrice: 10,
    stockQty: 45,
    lowStockThreshold: 10,
    sku: "L-LED-24W-W",
    description: "Energy efficient recessed light",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_3",
    name: "Philips Electric Kettle 1.7L",
    category: "kitchen_devices",
    price: 45,
    costPrice: 30,
    stockQty: 3,
    lowStockThreshold: 5, // Triggers warning!
    sku: "K-KET-17",
    description: "Stainless steel rapid boil water kettle",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_4",
    name: "Copper Cable 2.5mm Roll (100m)",
    category: "cables",
    price: 85,
    costPrice: 60,
    stockQty: 12,
    lowStockThreshold: 5,
    sku: "C-CAB-2.5",
    description: "Heavy duty electrical wiring cable",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prod_5",
    name: "Digital Multimeter Tester",
    category: "electrical_tools",
    price: 30,
    costPrice: 20,
    stockQty: 15,
    lowStockThreshold: 3,
    sku: "T-MUL-DGT",
    description: "Volt/Amp/Ohm electronic tester device",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initial Sample Data for Customers
const sampleCustomers: Customer[] = [
  {
    id: "cust_1",
    name: "Ahmed Mansour",
    phone: "01012345678",
    address: "24 El-Tahrir St, Cairo",
    notes: "Regular client, usually pays installments on Saturdays",
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cust_2",
    name: "Sarah Al-Harbi",
    phone: "0509876543",
    address: "Olaya District, Riyadh",
    notes: "Contractor for home lighting projects",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cust_3",
    name: "Youssef Ibrahim",
    phone: "0790112233",
    address: "West Amman, Jordan",
    notes: "Prefers communication via WhatsApp",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initial Orders (Sales)
const sampleOrders: Order[] = [
  {
    id: "INV-1001",
    customerId: "cust_1",
    total: 100,
    paid: 40,
    remaining: 60,
    status: "partial",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Bought Tornado Fan. Paid $40, remaining $60 due next week.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_1",
        orderId: "INV-1001",
        productId: "prod_1",
        qty: 1,
        unitPrice: 100,
        subtotal: 100,
      },
    ],
  },
  {
    id: "INV-1002",
    customerId: "cust_2",
    total: 315,
    paid: 315,
    remaining: 0,
    status: "paid",
    notes: "Purchased LED Ceiling Panels & Cables. Fully paid.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_2",
        orderId: "INV-1002",
        productId: "prod_2",
        qty: 10,
        unitPrice: 15,
        subtotal: 150,
      },
      {
        id: "item_3",
        orderId: "INV-1002",
        productId: "prod_4",
        qty: 1,
        unitPrice: 85,
        subtotal: 85,
      },
      {
        id: "item_4",
        orderId: "INV-1002",
        productId: "prod_1",
        qty: 8,
        unitPrice: 10, // Wait, unitPrice was adjusted
        subtotal: 80,
      },
    ],
  },
  {
    id: "INV-1003",
    customerId: "cust_3",
    total: 90,
    paid: 0,
    remaining: 90,
    status: "unpaid",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Overdue!
    notes: "Bought 2 kettles. No payment yet.",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: "item_5",
        orderId: "INV-1003",
        productId: "prod_3",
        qty: 2,
        unitPrice: 45,
        subtotal: 90,
      },
    ],
  },
];

// Initial payments
const samplePayments: Payment[] = [
  {
    id: "pay_1",
    orderId: "INV-1001",
    amount: 40,
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Downpayment on purchase date",
  },
];

// Initial notifications
const sampleNotifications: Notification[] = [
  {
    id: "notif_1",
    type: "low_stock",
    message: "Product 'Philips Electric Kettle 1.7L' has reached critical low stock (3 left).",
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_2",
    type: "late_payment",
    message: "Customer Youssef Ibrahim has an overdue payment of 90.00 EGP.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initial Sample Data for Expenses
const sampleExpenses: Expense[] = [
  {
    id: "exp_1",
    title: "Monthly Shop Rent",
    category: "rent",
    amount: 150,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Paid to landlord for May",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "exp_2",
    title: "Electricity Bill",
    category: "utilities",
    amount: 35,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Main shop meter",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "exp_3",
    title: "Store assistant weekly wage",
    category: "salaries",
    amount: 50,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Paid to Khaled Salem",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      role: "admin",
      theme: "dark",
      language: "en",
      
      storeName: "Smart Electric & Home",
      storePhone: "+201012345678",
      storeAddress: "15 El-Horreya Rd, Alexandria, Egypt",
      
      customers: sampleCustomers,
      products: sampleProducts,
      orders: sampleOrders,
      payments: samplePayments,
      notifications: sampleNotifications,
      expenses: sampleExpenses,
      activityLogs: [
        {
          id: "log_init",
          userId: "system",
          userName: "System",
          action: "Smart ERP Database Scaffold initialized.",
          timestamp: new Date().toISOString(),
        },
      ],

      setUser: (user) => {
        set({ user });
        if (user) {
          get().logActivity(`User logged in: ${user.name}`);
        }
      },
      setRole: (role) => {
        set({ role });
        get().logActivity(`Role updated to: ${role}`);
      },
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      
      updateStoreDetails: (storeName, storePhone, storeAddress) => {
        set({ storeName, storePhone, storeAddress });
        get().logActivity(`Store settings updated.`);
      },

      // Customers
      addCustomer: (custData) => {
        const newCust: Customer = {
          ...custData,
          id: `cust_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          customers: [newCust, ...state.customers],
        }));
        get().logActivity(`Added customer: ${newCust.name}`);
      },
      updateCustomer: (id, updatedData) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...updatedData } : c)),
        }));
        const name = get().customers.find((c) => c.id === id)?.name || id;
        get().logActivity(`Updated customer details: ${name}`);
      },
      deleteCustomer: (id) => {
        const name = get().customers.find((c) => c.id === id)?.name || id;
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
        get().logActivity(`Deleted customer: ${name}`);
      },

      // Products
      addProduct: (prodData) => {
        const newProd: Product = {
          ...prodData,
          costPrice: prodData.costPrice ?? 0,
          id: `prod_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          products: [newProd, ...state.products],
        }));
        get().logActivity(`Added product: ${newProd.name}`);
        // Trigger low stock check on add
        if (newProd.stockQty <= newProd.lowStockThreshold) {
          get().addNotification(
            "low_stock",
            `Product '${newProd.name}' is added with low stock (${newProd.stockQty} remaining).`
          );
        }
      },
      updateProduct: (id, updatedData) => {
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id === id) {
              const nextObj = { ...p, ...updatedData };
              // Verify stock trigger
              if (
                nextObj.stockQty <= nextObj.lowStockThreshold &&
                p.stockQty > p.lowStockThreshold
              ) {
                // Trigger warning
                setTimeout(() => {
                  get().addNotification(
                    "low_stock",
                    `Product '${nextObj.name}' has reached low stock (${nextObj.stockQty} left).`
                  );
                }, 50);
              }
              return nextObj;
            }
            return p;
          }),
        }));
        const name = get().products.find((p) => p.id === id)?.name || id;
        get().logActivity(`Updated product inventory: ${name}`);
      },
      deleteProduct: (id) => {
        const name = get().products.find((p) => p.id === id)?.name || id;
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        get().logActivity(`Deleted product: ${name}`);
      },

      // Orders
      addOrder: (orderData) => {
        const invId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
        let total = 0;
        
        const items = orderData.items.map((it, idx) => {
          const subtotal = it.qty * it.unitPrice;
          total += subtotal;
          
          // Deduct inventory stock
          const originalProd = get().products.find((p) => p.id === it.productId);
          if (originalProd) {
            get().updateProduct(it.productId, {
              stockQty: Math.max(0, originalProd.stockQty - it.qty),
            });
          }

          return {
            id: `item_${Date.now()}_${idx}`,
            orderId: invId,
            productId: it.productId,
            qty: it.qty,
            unitPrice: it.unitPrice,
            costPrice: originalProd?.costPrice ?? 0,
            subtotal,
          };
        });

        const remaining = calcRemaining(total, orderData.paid);
        const status = getDebtStatus(remaining, orderData.dueDate, orderData.paid);

        const newOrder: Order = {
          id: invId,
          customerId: orderData.customerId,
          items,
          total,
          paid: orderData.paid,
          remaining,
          status,
          dueDate: orderData.dueDate,
          notes: orderData.notes,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        // Record initial payment record if amount paid > 0
        if (orderData.paid > 0) {
          const newPay: Payment = {
            id: `pay_${Date.now()}`,
            orderId: invId,
            amount: orderData.paid,
            paidAt: new Date().toISOString(),
            notes: "Downpayment at checkout",
          };
          set((state) => ({
            payments: [newPay, ...state.payments],
          }));
        }

        const customerName = get().customers.find((c) => c.id === orderData.customerId)?.name || "Walking Customer";
        
        get().logActivity(`Created Order ${invId} for ${customerName}. Total: ${total} EGP, Paid: ${orderData.paid} EGP`);
        
        // Notifications
        get().addNotification(
          "new_sale",
          `Sale registered: Invoice #${invId} for ${customerName} - Total: ${total.toFixed(2)} EGP.`
        );

        if (status === "unpaid" || status === "partial") {
          if (orderData.dueDate) {
            get().addNotification(
              "due_installment",
              `Outstanding debt of ${remaining.toFixed(2)} EGP recorded for ${customerName}. Due: ${orderData.dueDate}.`
            );
          }
        }

        return newOrder;
      },

      // Record payments
      recordPayment: (orderId, amount, notes) => {
        set((state) => {
          const order = state.orders.find((o) => o.id === orderId);
          if (!order) return {};

          const nextPaid = order.paid + amount;
          const nextRemaining = calcRemaining(order.total, nextPaid);
          const nextStatus = getDebtStatus(nextRemaining, order.dueDate, nextPaid);

          const updatedOrders = state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  paid: nextPaid,
                  remaining: nextRemaining,
                  status: nextStatus,
                }
              : o
          );

          const newPay: Payment = {
            id: `pay_${Date.now()}`,
            orderId,
            amount,
            paidAt: new Date().toISOString(),
            notes: notes || "Installment Payment",
          };

          return {
            orders: updatedOrders,
            payments: [newPay, ...state.payments],
          };
        });

        const order = get().orders.find((o) => o.id === orderId);
        const customerName = get().customers.find((c) => c.id === order?.customerId)?.name || "Customer";
        get().logActivity(`Recorded payment of ${amount} EGP for invoice ${orderId} (${customerName})`);
      },

      // Expenses Actions
      addExpense: (expData) => {
        const newExp: Expense = {
          ...expData,
          id: `exp_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          expenses: [newExp, ...state.expenses],
        }));
        get().logActivity(`Added expense: ${newExp.title} - ${newExp.amount} EGP`);
      },
      deleteExpense: (id) => {
        const title = get().expenses.find((e) => e.id === id)?.title || id;
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
        get().logActivity(`Deleted expense: ${title}`);
      },

      // Notifications
      addNotification: (type, message) => {
        const notif: Notification = {
          id: `notif_${Date.now()}`,
          type,
          message,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [notif, ...state.notifications],
        }));
      },
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },
      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      // Logger
      logActivity: (action) => {
        const log: ActivityLog = {
          id: `log_${Date.now()}`,
          userId: get().user?.id || "system",
          userName: get().user?.name || "System",
          action,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activityLogs: [log, ...state.activityLogs.slice(0, 199)], // Cap at 200 logs
        }));
      },
      clearActivityLogs: () => {
        set({ activityLogs: [] });
      },

      // Backup & Restore
      backupData: () => {
        const state = get();
        const dataToBackup = {
          customers: state.customers,
          products: state.products,
          orders: state.orders,
          payments: state.payments,
          notifications: state.notifications,
          expenses: state.expenses,
          activityLogs: state.activityLogs,
          storeName: state.storeName,
          storePhone: state.storePhone,
          storeAddress: state.storeAddress,
        };
        return JSON.stringify(dataToBackup);
      },
      restoreData: (backupJson) => {
        try {
          const parsed = JSON.parse(backupJson);
          if (
            parsed.customers &&
            parsed.products &&
            parsed.orders &&
            parsed.payments &&
            parsed.notifications
          ) {
            set({
              customers: parsed.customers,
              products: parsed.products,
              orders: parsed.orders,
              payments: parsed.payments,
              notifications: parsed.notifications,
              expenses: parsed.expenses || [],
              activityLogs: parsed.activityLogs || [],
              storeName: parsed.storeName || get().storeName,
              storePhone: parsed.storePhone || get().storePhone,
              storeAddress: parsed.storeAddress || get().storeAddress,
            });
            get().logActivity("Database restored from backup file.");
            return true;
          }
          return false;
        } catch (e) {
          console.error("Failed to parse backup JSON", e);
          return false;
        }
      },
    }),
    {
      name: "erp-store-db",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        storeName: state.storeName,
        storePhone: state.storePhone,
        storeAddress: state.storeAddress,
        customers: state.customers,
        products: state.products,
        orders: state.orders,
        payments: state.payments,
        notifications: state.notifications,
        expenses: state.expenses,
        activityLogs: state.activityLogs,
        user: state.user,
        role: state.role,
      }),
    }
  )
);
export type { ActivityLog };
