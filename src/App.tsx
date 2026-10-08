import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Rules } from './pages/Rules';
import { Store } from './pages/Store';
import { Map } from './pages/Map';
import { PaymentResult } from './pages/PaymentResult';
import { Admin } from './pages/Admin';

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Main Website Pages */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="rules" element={<Rules />} />
            <Route path="store" element={<Store />} />
            <Route path="map" element={<Map />} />
            <Route path="payment/result" element={<PaymentResult />} />
            <Route path="payment/success" element={<PaymentResult />} />
          </Route>

          {/* Secret Admin Panel Route */}
          <Route path="/gsq-control-9821" element={<Admin />} />

          {/* Block /admin by redirecting to home */}
          <Route path="/admin" element={<Navigate to="/" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
