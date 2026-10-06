import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-neutral-100 selection:bg-white selection:text-black">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isMapPage && <Footer />}
    </div>
  );
};
