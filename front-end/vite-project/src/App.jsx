import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Welcome, Footer, Services, Transactions, CreateOrderForm, OrdersList, SupplierOrders } from './components';

const AppContent = () => {
  const location = useLocation();
  const isCreateOrderPage = location.pathname === '/create-order';
  const isOrdersPage = location.pathname === '/orders';
  const isSupplierPage = location.pathname === '/supplier';

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`gradient-bg-welcome ${isCreateOrderPage || isOrdersPage || isSupplierPage ? 'flex-1 flex flex-col min-h-screen' : ''}`}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create-order" element={<CreateOrderForm />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/supplier" element={<SupplierOrders />} />
        </Routes>
      </div>
      <Routes>
        <Route path="/" element={
          <>
            <Services />
            <Transactions />
          </>
        } />
      </Routes>
      <Footer />
    </div>
  );
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
