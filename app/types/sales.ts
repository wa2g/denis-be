export interface Customer {
  id: string;
  name: string;
  village: string;
  chickenType: string;
  orderedChicken: number;
  farmerStatus: boolean;
  contact?: string;
  email?: string;
  address?: string;
  creditLimit?: string;
  currentBalance?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  sales?: Sale[];
  chickenTrackings?: ChickenTracking[];
  chickOrderTracking?: {
    farmVisits: FarmVisit[] | null;
    currentBatch: {
      startDate: string;
      currentCount: number;
      initialCount: number;
      bandaCondition: 'GOOD' | 'FAIR' | 'POOR';
      lastInspectionDate: string;
    };
    healthStatus: {
      deadCount: number;
      sickCount: number;
      soldCount: number;
      averageAge: number;
      averageWeight: number;
    };
  };
  visits?: FarmVisit[];
  chickenOrders?: ChickenOrder[];
  ward?: string;
  sex?: 'MALE' | 'FEMALE';
  center?: 'KAHAMA' | 'SHINYANGA' | 'MAGANZO';
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChickenTracking {
  id: string;
  customerId: string;
  totalOrdered: number;
  totalReceived: number;
  lastDeliveryDate: string | null;
  pendingDeliveries:[];
  currentBatch: {
    startDate: string;
    currentCount: number;
    initialCount: number;
    bandaCondition: 'GOOD' | 'FAIR' | 'POOR';
    lastInspectionDate: string;
  };
  healthStatus: {
    deadCount: number;
    sickCount: number;
    soldCount: number;
    averageAge: number;
    averageWeight: number;
  };
  chickOrderTracking: {
    totalOrdered: number;
    totalReceived: number;
    lastDeliveryDate: string;
    pendingDeliveries: Array<{
      orderDate: string;
      quantity: number;
      expectedDeliveryDate: string;
    }>;
  };
  farmVisits: FarmVisit[] | null;
  createdAt: string;
  updatedAt: string;
  status?: 'ACTIVE' | 'COMPLETED';
  batchNumber?: number;
}

export interface FarmVisit {
  date: string;
  purpose: string;
  findings: string;
  recommendations: string;
}

export interface Sale {
  id: string;
  customerName: string;
  customer: {
    id: string;
    name: string;
    village: string;
    chickenType: string;
    orderedChicken: number;
    farmerStatus: boolean;
  };
  paymentType: 'CASH' | 'LOAN';
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: number;
  }[];
  totalAmount: string;
  amountPaid: string;
  remainingAmount: string;
  paymentDueDate: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ChickenOrder {
  id: string;
  customerId: string;
  orderDate: string;
  chickenPaid: number;
  chickenLoan: number;
  totalChicken: number;
  typeOfChicken: 'SASSO' | 'BROILER';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  amountPaid: number;
  receivingStatus: 'RECEIVED' | 'PENDING';
  ward: string;
  village: string;
  phone: string;
  round: number;
  center: 'KAHAMA' | 'SHINYANGA' | 'MAGANZO';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export type SaleStatus = 'Paid' | 'Pending' | 'Overdue';

export interface SaleFormData {
  customerName: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: SaleStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface SaleError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface SaleStats {
  totalSales: number;
  averageOrderValue: number;
  totalCustomers: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export interface SalesSummary {
  totalSales: string;
  cashSales: string;
  loanSales: string;
  pendingPayments: string;
  overduePayments: string;
  totalCustomers: number;
  activeLoans: number;
} 