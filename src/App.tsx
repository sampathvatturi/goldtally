import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SellerManagement from './components/SellerManagement';
import CustomerManagement from './components/CustomerManagement';
import PurchaseManagement from './components/PurchaseManagement';
import SalesManagement from './components/SalesManagement';
import BookingManagement from './components/BookingManagement';
import StockManagement from './components/StockManagement';
import TransactionsLedger from './components/TransactionsLedger';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'sellers':
        return <SellerManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'purchases':
        return <PurchaseManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'stock':
        return <StockManagement />;
      case 'transactions':
        return <TransactionsLedger />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;