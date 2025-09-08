import React, { useState } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Seller, Purchase } from '../types';
import toast from 'react-hot-toast';

const SellerManagement: React.FC = () => {
  const { data: sellers, add, update, remove } = useFirestore<Seller>('sellers');
  const { data: purchases } = useFirestore<Purchase>('purchases');
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '', email: '' });
    setEditingSeller(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeller) {
        await update(editingSeller.id, formData);
        toast.success('Seller updated successfully');
      } else {
        await add({
          ...formData,
          totalPurchased: 0,
          totalPaid: 0,
          totalDue: 0,
        });
        toast.success('Seller added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save seller');
    }
  };

  const handleEdit = (seller: Seller) => {
    setFormData({
      name: seller.name,
      phone: seller.phone,
      address: seller.address,
      email: seller.email || '',
    });
    setEditingSeller(seller);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        await remove(id);
        toast.success('Seller deleted successfully');
      } catch (error) {
        toast.error('Failed to delete seller');
      }
    }
  };

  const getSellerPurchases = (sellerId: string) => {
    return purchases.filter(p => p.sellerId === sellerId);
  };

  const calculateSellerTotals = (sellerId: string) => {
    const sellerPurchases = getSellerPurchases(sellerId);
    const totalPurchased = sellerPurchases.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaid = sellerPurchases.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDue = totalPurchased - totalPaid;
    return { totalPurchased, totalPaid, totalDue };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Seller Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Seller
        </button>
      </div>

      {/* Seller Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSeller ? 'Edit Seller' : 'Add New Seller'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
                >
                  {editingSeller ? 'Update' : 'Add'} Seller
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

      {/* Sellers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => {
          const totals = calculateSellerTotals(seller.id);
          return (
            <div key={seller.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{seller.name}</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {seller.phone}
                    </div>
                    {seller.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {seller.email}
                      </div>
                    )}
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                      {seller.address}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(seller)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(seller.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Purchased:</span>
                  <span className="font-medium">₹{totals.totalPurchased.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">₹{totals.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className={`font-medium ${totals.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{totals.totalDue.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSeller(seller)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                View Transactions
              </button>
            </div>
          );
        })}
      </div>

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedSeller.name} - Transaction History</h3>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {getSellerPurchases(selectedSeller.id).map((purchase) => (
                <div key={purchase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{purchase.date.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight & Rate</p>
                      <p className="font-medium">{purchase.weight}g @ ₹{purchase.ratePerGram}/g</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Cost</p>
                      <p className="font-medium">₹{purchase.totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Paid</p>
                      <p className="font-medium text-green-600">₹{purchase.amountPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className={`font-medium ${purchase.amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{purchase.amountDue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        purchase.status === 'paid' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                  {purchase.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">Notes: {purchase.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerManagement;