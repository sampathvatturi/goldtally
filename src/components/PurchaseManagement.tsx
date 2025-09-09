import React, { useState } from 'react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Purchase, Seller } from '../types';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';

const PurchaseManagement: React.FC = () => {
  const { data: purchases, add, update, remove } = useFirestore<Purchase>('purchases');
  const { data: sellers } = useFirestore<Seller>('sellers');
  const [showForm, setShowForm] = useState(false);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sellerId: '',
    quantity: '',
    weight: '',
    ratePerGram: '',
    amountPaid: '',
    notes: '',
  });

  const [sellerFormData, setSellerFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  const { add: addSeller } = useFirestore<Seller>('sellers');

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      sellerId: '',
      quantity: '',
      weight: '',
      ratePerGram: '',
      amountPaid: '',
      notes: '',
    });
    setEditingPurchase(null);
    setShowForm(false);
  };

  const resetSellerForm = () => {
    setSellerFormData({ name: '', phone: '', address: '', email: '' });
    setShowSellerForm(false);
  };

  const handleAddSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSeller = await addSeller({
        ...sellerFormData,
        totalPurchased: 0,
        totalPaid: 0,
        totalDue: 0,
      });
      toast.success('Seller added successfully');
      resetSellerForm();
      // Auto-select the new seller
      setFormData({ ...formData, sellerId: newSeller.id });
    } catch (error) {
      toast.error('Failed to add seller');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const seller = sellers.find(s => s.id === formData.sellerId);
      if (!seller) {
        toast.error('Please select a seller');
        return;
      }

      const weight = parseFloat(formData.weight);
      const ratePerGram = parseFloat(formData.ratePerGram);
      const totalCost = weight * ratePerGram;
      const amountPaid = parseFloat(formData.amountPaid) || 0;
      const amountDue = totalCost - amountPaid;

      const purchaseData = {
        date: new Date(formData.date),
        sellerId: formData.sellerId,
        sellerName: seller.name,
        quantity: parseInt(formData.quantity),
        weight,
        ratePerGram,
        totalCost,
        amountPaid,
        amountDue,
        status: amountDue === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending',
        notes: formData.notes,
      };

      if (editingPurchase) {
        await update(editingPurchase.id, purchaseData);
        toast.success('Purchase updated successfully');
      } else {
        await add(purchaseData);
        toast.success('Purchase added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save purchase');
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setFormData({
      date: purchase.date.toISOString().split('T')[0],
      sellerId: purchase.sellerId,
      quantity: purchase.quantity.toString(),
      weight: purchase.weight.toString(),
      ratePerGram: purchase.ratePerGram.toString(),
      amountPaid: purchase.amountPaid.toString(),
      notes: purchase.notes || '',
    });
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        await remove(id);
        toast.success('Purchase deleted successfully');
      } catch (error) {
        toast.error('Failed to delete purchase');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Purchase Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Purchase
        </button>
      </div>

      {/* Purchase Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller *</label>
                <SearchableSelect
                  options={sellers.map(seller => ({
                    id: seller.id,
                    name: seller.name,
                    phone: seller.phone
                  }))}
                  value={formData.sellerId}
                  onChange={(value) => setFormData({ ...formData, sellerId: value })}
                  placeholder="Select Seller"
                  onAddNew={() => setShowSellerForm(true)}
                  addNewLabel="Add New Seller"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (pieces) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Gram (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.ratePerGram}
                  onChange={(e) => setFormData({ ...formData, ratePerGram: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              {formData.weight && formData.ratePerGram && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Total Cost: 
                    <span className="font-medium text-gray-900 ml-1">
                      ₹{(parseFloat(formData.weight) * parseFloat(formData.ratePerGram)).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
                >
                  {editingPurchase ? 'Update' : 'Add'} Purchase
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Seller Form Modal */}
      {showSellerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Seller</h3>
            <form onSubmit={handleAddSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={sellerFormData.name}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={sellerFormData.phone}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  required
                  value={sellerFormData.address}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={sellerFormData.email}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
                >
                  Add Seller
                </button>
                <button
                  type="button"
                  onClick={resetSellerForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchases List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate/g
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{purchase.sellerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {purchase.weight}g
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{purchase.ratePerGram}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{purchase.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    ₹{purchase.amountPaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ₹{purchase.amountDue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      purchase.status === 'paid' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManagement;