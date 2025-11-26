import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Welcome, Footer, Services, Transactions, CreateOrderForm, OrdersList } from './components';

const AppContent = () => {
  const location = useLocation();
  const isCreateOrderPage = location.pathname === '/create-order';
  const isOrdersPage = location.pathname === '/orders';

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`gradient-bg-welcome ${isCreateOrderPage || isOrdersPage ? 'flex-1 flex flex-col min-h-screen' : ''}`}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create-order" element={<CreateOrderForm />} />
          <Route path="/orders" element={<OrdersList />} />
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
