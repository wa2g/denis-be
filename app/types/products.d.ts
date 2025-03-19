export interface Product {
  id: number;
  productName: string;
  quantity: number;
  unity: string;
  buyingPrice: string | number;
  sellingPrice: string | number;
  remainingQty?: number;
  totalSalesCash?: number;
  totalSalesLoan?: number;
  totalSoldQtyCash?: number;
  totalSoldQtyLoan?: number;
} 