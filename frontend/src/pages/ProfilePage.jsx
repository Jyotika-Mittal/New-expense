import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Wallet, Bell, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'INR',
    monthlyBudget: user?.monthlyBudget || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ ...form, monthlyBudget: parseFloat(form.monthlyBudget) || 0 });
      updateUser(res.data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Profile & Settings</h1>
        <p className="text-white/40 text-sm">Manage your account preferences</p>
      </div>

      {/* Avatar section */}
      <div className="glass-card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-green-400 flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg shadow-brand-500/20">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-display font-bold text-white text-lg">{user?.name}</h2>
          <p className="text-white/40 text-sm">{user?.email}</p>
          <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium">
            <Shield size={11} /> Free Account
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="glass-card space-y-5">
        <h3 className="font-display font-semibold text-white flex items-center gap-2">
          <User size={18} className="text-brand-400" /> Personal Info
        </h3>

        <div>
          <label className="label">Display Name</label>
          <input
            className="input"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
          <p className="text-white/20 text-xs mt-1">Email cannot be changed</p>
        </div>

        <div className="border-t border-white/5 pt-5">
          <h3 className="font-display font-semibold text-white flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-brand-400" /> Finance Settings
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select
                className="input"
                value={form.currency}
                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
              >
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
                <option value="GBP">£ GBP — British Pound</option>
                <option value="AED">د.إ AED — UAE Dirham</option>
              </select>
            </div>
            <div>
              <label className="label">Monthly Budget (₹)</label>
              <input
                className="input font-mono"
                type="number"
                min="0"
                placeholder="e.g. 30000"
                value={form.monthlyBudget}
                onChange={e => setForm(p => ({ ...p, monthlyBudget: e.target.value }))}
              />
            </div>
          </div>

          {form.monthlyBudget > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-brand-400" />
                <p className="text-brand-300/70 text-xs">
                  You'll get alerts when spending reaches 85% and 100% of ₹{Number(form.monthlyBudget).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={16} />
            }
            Save Changes
          </button>
        </div>
      </form>

      {/* App Info */}
      <div className="glass-card space-y-3">
        <h3 className="font-display font-semibold text-white text-sm">About Spendly</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Version', value: '1.0.0 MVP' },
            { label: 'AI Engine', value: 'Smart Keyword AI' },
            { label: 'Data Storage', value: 'MongoDB Atlas' },
            { label: 'Reports', value: 'Monthly via Cron' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 col-span-1">
              <span className="text-white/30">{label}</span>
              <span className="text-white/60 font-mono text-xs">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
