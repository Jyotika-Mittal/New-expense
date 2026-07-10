import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Receipt, TrendingUp, Target, User,
  LogOut, Menu, X, Zap, ChevronRight, Plus
} from 'lucide-react';
import AddExpenseModal from '../expenses/AddExpenseModal';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/insights', icon: TrendingUp, label: 'Insights' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight">Spendly</h1>
            <p className="text-white/30 text-xs">Smart Finance</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
        <button onClick={() => setShowAdd(true)} className="w-full btn-primary flex items-center justify-center gap-2 py-3 mb-6 shadow-xl shadow-brand-500/10 bg-gradient-to-r from-brand-600 to-brand-500">
          <Receipt size={18} />
          <span>Quick Transaction</span>
        </button>
        <p className="text-white/20 text-xs uppercase tracking-widest font-medium px-4 mb-3">Menu</p>
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-green-400 flex items-center justify-center text-white font-bold text-sm shadow">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/30 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-dark-800 border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-800 border-r border-white/5 flex flex-col animate-slide-in-right">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3.5 bg-dark-800 border-b border-white/5 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">Spendly</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {showAdd && (
        <AddExpenseModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            // Refresh logic if needed, but usually redirect or toast is enough
            window.location.reload(); // Simple way to refresh data on all pages
          }}
        />
      )}
    </div>
  );
}
