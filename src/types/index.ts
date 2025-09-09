export interface Seller {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  totalPurchased: number;
  totalPaid: number;
  totalDue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  totalBooked: number;
  totalPurchased: number;
  totalReceived: number;
  totalPending: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  date: Date;
  sellerId: string;
  sellerName: string;
  quantity: number;
  weight: number;
  ratePerGram: number;
  totalCost: number;
  amountPaid: number;
  amountDue: number;
  status: 'pending' | 'partial' | 'paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  date: Date;
  customerId: string;
  customerName: string;
  weight: number;
  ratePerGram: number;
  totalSaleAmount: number;
  amountReceived: number;
  amountPending: number;
  status: 'pending' | 'partial' | 'paid';
  linkedPurchaseId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  date: Date;
  customerId: string;
  customerName: string;
  weight: number;
  estimatedRate: number;
  estimatedAmount: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  fulfilledSaleId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockSummary {
  totalWeight: number;
  totalValue: number;
  totalPurchases: number;
  totalSales: number;
  currentStock: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'payment_to_seller' | 'payment_from_customer';
  date: Date;
  amount: number;
  description: string;
  relatedId: string;
  relatedName: string;
  balance?: number;
  createdAt: Date;
}