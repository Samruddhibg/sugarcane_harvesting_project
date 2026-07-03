import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Signup } from './components/Signup';
import { Login } from './components/Login';
import { FarmerDashWrapper } from './components/farmer/FarmerDashWrapper';
import { MachineDashWrapper } from './components/machine/MachineDashWrapper';
import { FactoryDashWrapper } from './components/factory/FactoryDashWrapper';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-green-50 text-gray-100">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home/*" element={
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="auth/signup" element={<Signup />} />
                <Route path="auth/login" element={<Login />} />
                
                <Route path="farmerdash/*" element={<FarmerDashWrapper />} />
                <Route path="machinedash/*" element={<MachineDashWrapper />} />
                <Route path="factorydash/*" element={<FactoryDashWrapper />} />
              </Routes>
            } />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-green-200 bg-white/50 py-4 text-center text-sm text-green-600">
          Resource Allocation Engine v3 &bull; Dynamic SPA Layout
        </footer>
        <ToastContainer theme="dark" />
      </div>
    </BrowserRouter>
  );
}

export default App;