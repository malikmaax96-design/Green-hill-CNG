import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SalesDashboard from './pages/SalesDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Fuel, LayoutDashboard, Settings, UserCircle } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const isSales = location.pathname === '/';
  
  return (
    <nav className="glass-panel" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '50%', 
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      padding: '8px',
      zIndex: 1000
    }}>
      <Link 
        to="/" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '12px',
          textDecoration: 'none',
          color: isSales ? '#00d26a' : 'var(--text-muted)',
          background: isSales ? 'rgba(0, 210, 106, 0.1)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        <Fuel size={20} />
        <span style={{ fontWeight: 600 }}>Sales Log</span>
      </Link>
      <Link 
        to="/admin" 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '12px',
          textDecoration: 'none',
          color: !isSales ? '#00d26a' : 'var(--text-muted)',
          background: !isSales ? 'rgba(0, 210, 106, 0.1)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        <LayoutDashboard size={20} />
        <span style={{ fontWeight: 600 }}>Admin</span>
      </Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div style={{ paddingBottom: '100px' }}>
        <Routes>
          <Route path="/" element={<SalesDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
