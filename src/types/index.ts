// src/types/index.ts

export type UserRole = "admin" | "employee";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  orders?: Order[];
  totalDebt?: number;
}

export type ProductCategory =
  | "electrical_tools"
  | "home_appliances"
  | "lighting"
  | "cables"
  | "kitchen_devices"
  | "other";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice?: number;
  stockQty: number;
  lowStockThreshold: number;
  sku?: string;
  description?: string;
  createdAt: string;
}

export type OrderStatus = "paid" | "partial" | "unpaid" | "overdue";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  qty: number;
  unitPrice: number;
  costPrice?: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  total: number;
  paid: number;
  remaining: number;
  status: OrderStatus;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paidAt: string;
  notes?: string;
}

export type NotificationType =
  | "low_stock"
  | "late_payment"
  | "new_sale"
  | "due_installment";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  pendingPayments: number;
  dailyRevenue: number;
  totalRevenue: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  recentOrders: Order[];
  revenueChart: { date: string; revenue: number }[];
}

export type ExpenseCategory = "rent" | "utilities" | "salaries" | "inventory" | "marketing" | "other";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface EmployeeAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;
}

