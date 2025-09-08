import React from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Purchase, Sale, StockSummary } from '../types';

const Dashboard: React.FC = () => {
  const { data: purchases } = useFirestore<Purchase>('purchases');
  const { data: sales } = useFirestore<Sale>('sales');

  const calculateSummary = (): StockSummary => {
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalSales = sales.reduce((sum, s) => sum + s.totalSaleAmount, 0);
    const totalWeight = purchases.reduce((sum, p) => sum + p.weight, 0);
    const soldWeight = sales.reduce((sum, s) => sum + s.weight, 0);
    const currentStock = totalWeight - soldWeight;
    const avgPurchaseRate = totalWeight > 0 ? totalPurchases / totalWeight : 0;
    const totalValue = currentStock * avgPurchaseRate;

    return {
      totalWeight,
      totalValue,
      totalPurchases,
      totalSales,
      currentStock,
    };
  };

  const summary = calculateSummary();
  const profitLoss = summary.totalSales - summary.totalPurchases;

  const stats = [
    {
      title: 'Current Stock',
      value: `${summary.currentStock.toFixed(2)}g`,
      subValue: `₹${summary.totalValue.toLocaleString()}`,
      icon: Package,
      color: 'blue',
    },
    {
      title: 'Total Purchases',
      value: `₹${summary.totalPurchases.toLocaleString()}`,
      subValue: `${summary.totalWeight.toFixed(2)}g`,
      icon: TrendingDown,
      color: 'red',
    },
    {
      title: 'Total Sales',
      value: `₹${summary.totalSales.toLocaleString()}`,
      subValue: `${sales.reduce((sum, s) => sum + s.weight, 0).toFixed(2)}g`,
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Profit/Loss',
      value: `₹${profitLoss.toLocaleString()}`,
      subValue: profitLoss >= 0 ? 'Profit' : 'Loss',
      icon: DollarSign,
      color: profitLoss >= 0 ? 'green' : 'red',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600 bg-blue-50',
    red: 'bg-red-500 text-red-600 bg-red-50',
    green: 'bg-green-500 text-green-600 bg-green-50',
  };

  return (
    <div className="space-y-6">
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
                  <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
                </div>
                <div className={`p-3 rounded-full ${colors[2]}`}>
                  <Icon className={`w-6 h-6 ${colors[1]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Purchases</h3>
          <div className="space-y-3">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{purchase.sellerName}</p>
                  <p className="text-sm text-gray-500">{purchase.weight}g @ ₹{purchase.ratePerGram}/g</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{purchase.totalCost.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{purchase.date.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{sale.customerName}</p>
                  <p className="text-sm text-gray-500">{sale.weight}g @ ₹{sale.ratePerGram}/g</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{sale.totalSaleAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{sale.date.toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;