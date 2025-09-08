import React from 'react';
import { Package, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Purchase, Sale } from '../types';

const StockManagement: React.FC = () => {
  const { data: purchases } = useFirestore<Purchase>('purchases');
  const { data: sales } = useFirestore<Sale>('sales');

  const calculateStockSummary = () => {
    const totalPurchasedWeight = purchases.reduce((sum, p) => sum + p.weight, 0);
    const totalSoldWeight = sales.reduce((sum, s) => sum + s.weight, 0);
    const currentStockWeight = totalPurchasedWeight - totalSoldWeight;
    
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalSaleAmount = sales.reduce((sum, s) => sum + s.totalSaleAmount, 0);
    
    const avgPurchaseRate = totalPurchasedWeight > 0 ? totalPurchaseCost / totalPurchasedWeight : 0;
    const currentStockValue = currentStockWeight * avgPurchaseRate;
    
    return {
      totalPurchasedWeight,
      totalSoldWeight,
      currentStockWeight,
      totalPurchaseCost,
      totalSaleAmount,
      currentStockValue,
      avgPurchaseRate,
      profitLoss: totalSaleAmount - totalPurchaseCost,
    };
  };

  const summary = calculateStockSummary();

  const getStockByPurchase = () => {
    return purchases.map(purchase => {
      const soldFromThisPurchase = sales
        .filter(sale => sale.linkedPurchaseId === purchase.id)
        .reduce((sum, sale) => sum + sale.weight, 0);
      
      const remainingWeight = purchase.weight - soldFromThisPurchase;
      const remainingValue = remainingWeight * purchase.ratePerGram;
      
      return {
        ...purchase,
        soldWeight: soldFromThisPurchase,
        remainingWeight,
        remainingValue,
      };
    }).filter(item => item.remainingWeight > 0);
  };

  const stockItems = getStockByPurchase();

  const stats = [
    {
      title: 'Current Stock Weight',
      value: `${summary.currentStockWeight.toFixed(2)}g`,
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Current Stock Value',
      value: `₹${summary.currentStockValue.toLocaleString()}`,
      icon: BarChart3,
      color: 'green',
    },
    {
      title: 'Total Purchased',
      value: `${summary.totalPurchasedWeight.toFixed(2)}g`,
      subValue: `₹${summary.totalPurchaseCost.toLocaleString()}`,
      icon: TrendingDown,
      color: 'red',
    },
    {
      title: 'Total Sold',
      value: `${summary.totalSoldWeight.toFixed(2)}g`,
      subValue: `₹${summary.totalSaleAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color as keyof typeof colorClasses].split(' ');
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.subValue && (
                    <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${colors[2]}`}>
                  <Icon className={`w-6 h-6 ${colors[1]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profit/Loss Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit/Loss Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Purchase Cost</p>
            <p className="text-2xl font-bold text-red-600">₹{summary.totalPurchaseCost.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Sale Amount</p>
            <p className="text-2xl font-bold text-green-600">₹{summary.totalSaleAmount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Net Profit/Loss</p>
            <p className={`text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{summary.profitLoss.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Current Stock Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Stock Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Rate/g
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.sellerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.weight}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {item.soldWeight}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {item.remainingWeight.toFixed(2)}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{item.ratePerGram}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{item.remainingValue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stockItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stock items available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;