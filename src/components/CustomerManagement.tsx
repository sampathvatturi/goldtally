import React, { useState } from 'react';
import { Plus, Edit, Trash2, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { Customer, Sale, Booking } from '../types';
import toast from 'react-hot-toast';

const CustomerManagement: React.FC = () => {
  const { data: customers, add, update, remove } = useFirestore<Customer>('customers');
  const { data: sales } = useFirestore<Sale>('sales');
  const { data: bookings } = useFirestore<Booking>('bookings');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '', email: '' });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await update(editingCustomer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await add({
          ...formData,
          totalBooked: 0,
          totalPurchased: 0,
          totalReceived: 0,
          totalPending: 0,
        });
        toast.success('Customer added successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email || '',
    });
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await remove(id);
        toast.success('Customer deleted successfully');
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter(s => s.customerId === customerId);
  };

  const getCustomerBookings = (customerId: string) => {
    return bookings.filter(b => b.customerId === customerId);
  };

  const calculateCustomerTotals = (customerId: string) => {
    const customerSales = getCustomerSales(customerId);
    const customerBookings = getCustomerBookings(customerId);
    
    const totalPurchased = customerSales.reduce((sum, s) => sum + s.totalSaleAmount, 0);
    const totalReceived = customerSales.reduce((sum, s) => sum + s.amountReceived, 0);
    const totalPending = totalPurchased - totalReceived;
    const totalBooked = customerBookings.reduce((sum, b) => sum + b.estimatedAmount, 0);
    
    return { totalBooked, totalPurchased, totalReceived, totalPending };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
                  {editingCustomer ? 'Update' : 'Add'} Customer
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

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const totals = calculateCustomerTotals(customer.id);
          return (
            <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {customer.email}
                      </div>
                    )}
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                      {customer.address}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Booked:</span>
                  <span className="font-medium">₹{totals.totalBooked.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Purchased:</span>
                  <span className="font-medium">₹{totals.totalPurchased.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Received:</span>
                  <span className="font-medium text-green-600">₹{totals.totalReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Pending:</span>
                  <span className={`font-medium ${totals.totalPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{totals.totalPending.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(customer)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                View Transactions
              </button>
            </div>
          );
        })}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedCustomer.name} - Transaction History</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Sales */}
              <div>
                <h4 className="text-lg font-medium mb-3">Sales</h4>
                <div className="space-y-4">
                  {getCustomerSales(selectedCustomer.id).map((sale) => (
                    <div key={sale.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{sale.date.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Weight & Rate</p>
                          <p className="font-medium">{sale.weight}g @ ₹{sale.ratePerGram}/g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-medium">₹{sale.totalSaleAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount Received</p>
                          <p className="font-medium text-green-600">₹{sale.amountReceived.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount Pending</p>
                          <p className={`font-medium ${sale.amountPending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{sale.amountPending.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                            sale.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {sale.status}
                          </span>
                        </div>
                      </div>
                      {sale.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Notes: {sale.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bookings */}
              <div>
                <h4 className="text-lg font-medium mb-3">Bookings</h4>
                <div className="space-y-4">
                  {getCustomerBookings(selectedCustomer.id).map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">{booking.date.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Weight & Rate</p>
                          <p className="font-medium">{booking.weight}g @ ₹{booking.estimatedRate}/g</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Amount</p>
                          <p className="font-medium">₹{booking.estimatedAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">Notes: {booking.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;