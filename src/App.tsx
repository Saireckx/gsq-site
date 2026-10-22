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
import { Offer } from './pages/Offer';
import { Privacy } from './pages/Privacy';
import { Admin } from './pages/Admin';

// Moderation verification mode: site displays ONLY the single word PLAT
const VERIFICATION_ONLY = true;

export const App: React.FC = () => {
  const isSecretAdmin = typeof window !== 'undefined' && window.location.hash.includes('gsq-control-9821');

  if (VERIFICATION_ONLY && !isSecretAdmin) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontSize: '32px',
        fontWeight: 'bold',
      }}>
        PLAT
      </div>
    );
  }

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
            <Route path="offer" element={<Offer />} />
            <Route path="terms" element={<Offer />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="payment/result" element={<PaymentResult />} />
            <Route path="payment/success" element={<PaymentResult />} />
            <Route path="box" element={<Navigate to="/store" replace />} />
            <Route path="gift" element={<Navigate to="/store" replace />} />
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
