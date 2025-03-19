export interface Customer {
  id: number;
  name: string;
  contact: string;
  address: string;
  email: string;
  creditLimit: string;
  currentBalance: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
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
  createdById: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  total: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  saleId: number;
  amount: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  paymentDate: string;
  reference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanTerms {
  id: number;
  saleId: number;
  totalAmount: string;
  interestRate: number;
  installmentAmount: string;
  frequency: 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  createdAt: string;
  updatedAt: string;
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