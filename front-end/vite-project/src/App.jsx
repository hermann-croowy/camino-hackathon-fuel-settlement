import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer, CreateOrderForm, OrdersList, SupplierOrders, CreateInvoice } from './components';
import { useViewMode } from './context/ViewModeContext';

const AppContent = () => {
  const location = useLocation();
  const { isAirline } = useViewMode();

  const isCreateOrderPage = location.pathname === '/create-order';
  const isCreateInvoicePage = location.pathname.startsWith('/create-invoice');
  const isHomePage = location.pathname === '/';

  // All pages now use the full-height layout
  const isFullHeightPage = isCreateOrderPage || isCreateInvoicePage || isHomePage;

  // Home component based on view mode
  const HomeComponent = isAirline ? OrdersList : SupplierOrders;

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`gradient-bg-welcome ${isFullHeightPage ? 'flex-1 flex flex-col' : ''}`}>
        <Navbar />
        <Routes>
          {/* Home route - shows Orders for Airline, Supplier Orders for Supplier */}
          <Route path="/" element={<HomeComponent />} />
          
          {/* Airline routes - always defined for proper routing */}
          <Route path="/create-order" element={<CreateOrderForm />} />
          
          {/* Supplier routes - always defined for proper routing */}
          <Route path="/create-invoice/:orderId" element={<CreateInvoice />} />
        </Routes>
      </div>
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
