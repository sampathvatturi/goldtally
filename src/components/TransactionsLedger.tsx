import React, { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Transaction, Purchase, Sale, Seller, Customer } from '../types';
import { format } from 'date-fns';

const TransactionsLedger: React.FC = () => {
  const { data: purchases } = useFirestore<Purchase>('purchases');
  const { data: sales } = useFirestore<Sale>('sales');
  const { data: sellers } = useFirestore<Seller>('sellers');
  const { data: customers } = useFirestore<Customer>('customers');
  
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'sale' | 'payment'>('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // Generate transactions from purchases and sales
  const generateTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];

    // Add purchase transactions
    purchases.forEach(purchase => {
      const seller = sellers.find(s => s.id === purchase.sellerId);
      transactions.push({
        id: `purchase-${purchase.id}`,
        type: 'purchase',
        date: purchase.date,
        amount: purchase.totalCost,
        description: `Purchase from ${purchase.sellerName} - ${purchase.weight}g @ ₹${purchase.ratePerGram}/g`,
        relatedId: purchase.sellerId,
        relatedName: purchase.sellerName,
        createdAt: purchase.createdAt
      });

      // Add payment transaction if amount was paid
      if (purchase.amountPaid > 0) {
        transactions.push({
          id: `payment-seller-${purchase.id}`,
          type: 'payment_to_seller',
          date: purchase.date,
          amount: purchase.amountPaid,
          description: `Payment to ${purchase.sellerName} for purchase`,
          relatedId: purchase.sellerId,
          relatedName: purchase.sellerName,
          createdAt: purchase.createdAt
        });
      }
    });

    // Add sale transactions
    sales.forEach(sale => {
      const customer = customers.find(c => c.id === sale.customerId);
      transactions.push({
        id: `sale-${sale.id}`,
        type: 'sale',
        date: sale.date,
        amount: sale.totalSaleAmount,
        description: `Sale to ${sale.customerName} - ${sale.weight}g @ ₹${sale.ratePerGram}/g`,
        relatedId: sale.customerId,
        relatedName: sale.customerName,
        createdAt: sale.createdAt
      });

      // Add payment transaction if amount was received
      if (sale.amountReceived > 0) {
        transactions.push({
          id: `payment-customer-${sale.id}`,
          type: 'payment_from_customer',
          date: sale.date,
          amount: sale.amountReceived,
          description: `Payment from ${sale.customerName} for sale`,
          relatedId: sale.customerId,
          relatedName: sale.customerName,
          createdAt: sale.createdAt
        });
      }
    });

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const transactions = generateTransactions();

  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'all') {
      if (filterType === 'purchase' && transaction.type !== 'purchase') return false;
      if (filterType === 'sale' && transaction.type !== 'sale') return false;
      if (filterType === 'payment' && !transaction.type.includes('payment')) return false;
    }

    if (dateRange.from && transaction.date < new Date(dateRange.from)) return false;
    if (dateRange.to && transaction.date > new Date(dateRange.to)) return false;

    return true;
  });

  const calculateRunningBalance = () => {
    let balance = 0;
    return filteredTransactions.map(transaction => {
      if (transaction.type === 'sale' || transaction.type === 'payment_from_customer') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      return { ...transaction, balance };
    });
  };

  const transactionsWithBalance = calculateRunningBalance();

  const summary = {
    totalPurchases: transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0),
    totalSales: transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0),
    totalPaymentsToSellers: transactions.filter(t => t.type === 'payment_to_seller').reduce((sum, t) => sum + t.amount, 0),
    totalPaymentsFromCustomers: transactions.filter(t => t.type === 'payment_from_customer').reduce((sum, t) => sum + t.amount, 0),
  };

  const netProfit = summary.totalSales - summary.totalPurchases;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'payment_to_seller':
        return <DollarSign className="w-4 h-4 text-orange-500" />;
      case 'payment_from_customer':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-red-600';
      case 'sale':
        return 'text-green-600';
      case 'payment_to_seller':
        return 'text-orange-600';
      case 'payment_from_customer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Transactions Ledger</h2>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-red-600">₹{summary.totalPurchases.toLocaleString()}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">₹{summary.totalSales.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit/Loss</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netProfit.toLocaleString()}
              </p>
            </div>
            <DollarSign className={`w-8 h-8 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="all">All Transactions</option>
            <option value="purchase">Purchases Only</option>
            <option value="sale">Sales Only</option>
            <option value="payment">Payments Only</option>
          </select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">From:</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">To:</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
          {(dateRange.from || dateRange.to || filterType !== 'all') && (
            <button
              onClick={() => {
                setFilterType('all');
                setDateRange({ from: '', to: '' });
              }}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Running Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionsWithBalance.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(transaction.date, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span className={`text-sm font-medium capitalize ${getTransactionColor(transaction.type)}`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.relatedName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={getTransactionColor(transaction.type)}>
                      {transaction.type === 'purchase' || transaction.type === 'payment_to_seller' ? '-' : '+'}
                      ₹{transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    <span className={transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ₹{transaction.balance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactionsWithBalance.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsLedger;