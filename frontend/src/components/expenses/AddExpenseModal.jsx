import React, { useState, useEffect, useRef } from 'react';
import { expenseAPI } from '../../services/api';
import { X, Sparkles, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'Food', icon: '🍕' }, { name: 'Transport', icon: '🚗' },
  { name: 'Shopping', icon: '🛍️' }, { name: 'Entertainment', icon: '🎬' },
  { name: 'Health', icon: '💊' }, { name: 'Education', icon: '📚' },
  { name: 'Bills', icon: '⚡' }, { name: 'Housing', icon: '🏠' },
  { name: 'Travel', icon: '✈️' }, { name: 'Salary', icon: '💰' },
  { name: 'Freelance', icon: '💻' }, { name: 'Investment', icon: '📈' },
  { name: 'Other', icon: '📦' }
];

export default function AddExpenseModal({ onClose, onSuccess, editData = null }) {
  const [form, setForm] = useState({
    title: editData?.title || '',
    amount: editData?.amount || '',
    type: editData?.type || 'expense',
    category: editData?.category || '',
    note: editData?.note || '',
    date: editData?.date ? new Date(editData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [aiCategory, setAiCategory] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (form.title.length > 2 && !form.category) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const res = await expenseAPI.detectCategory(form.title);
          setAiCategory(res.data.category);
        } catch { }
        finally { setAiLoading(false); }
      }, 600);
    }
    return () => clearTimeout(debounceRef.current);
  }, [form.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error('Title and amount required');
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        category: form.category || aiCategory || 'Other',
      };
      if (editData) {
        await expenseAPI.update(editData._id, payload);
        toast.success('Transaction updated!');
      } else {
        await expenseAPI.add({ ...payload, category: form.category === '' ? 'auto' : form.category });
        toast.success('Transaction added! 🎉');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-dark-800 border border-white/5 rounded-2xl shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-display font-bold text-white text-lg">{editData ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-dark-700 rounded-xl">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${form.type === t ? t === 'expense' ? 'bg-red-500 text-white shadow' : 'bg-green-500 text-white shadow' : 'text-white/40 hover:text-white'}`}>
                {t === 'expense' ? '- Expense' : '+ Income'}
              </button>
            ))}
          </div>

          {/* Title with AI */}
          <div>
            <label className="label">Title</label>
            <div className="relative">
              <input className="input pr-10" placeholder="e.g. Zomato biryani..." value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {aiLoading ? <Loader size={16} className="text-brand-400 animate-spin" /> : <Sparkles size={16} className="text-brand-400/40" />}
              </div>
            </div>
            {aiCategory && !form.category && (
              <div className="flex items-center gap-2 mt-2">
                <Sparkles size={12} className="text-brand-400" />
                <span className="text-xs text-white/40">AI detected:</span>
                <button type="button" onClick={() => setForm(p => ({ ...p, category: aiCategory }))}
                  className="text-xs px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors">
                  {aiCategory} ✓ Accept
                </button>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (₹)</label>
            <input className="input font-mono" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.name} type="button"
                  onClick={() => setForm(p => ({ ...p, category: p.category === cat.name ? '' : cat.name }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all border ${form.category === cat.name ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'bg-white/3 border-white/5 text-white/50 hover:border-white/10 hover:text-white/70'}`}>
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date + Note */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <label className="label group-hover:text-brand-400 transition-colors">Date</label>
              <input 
                className="input !py-2.5" 
                type="date" 
                value={form.date} 
                min={new Date().toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} 
              />
            </div>
            <div className="group">
              <label className="label group-hover:text-brand-400 transition-colors">Note (optional)</label>
              <input className="input !py-2.5" placeholder="Quick note..." value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editData ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
