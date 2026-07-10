import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI } from '../services/api';
import { Plus, Search, Trash2, Edit2, Filter } from 'lucide-react';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  Food: '🍕', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
  Health: '💊', Education: '📚', Bills: '⚡', Housing: '🏠',
  Travel: '✈️', Salary: '💰', Freelance: '💻', Investment: '📈', Other: '📦'
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '', month: '', year: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      if (!params.type) delete params.type;
      if (!params.category) delete params.category;
      if (!params.month) delete params.month;
      if (!params.year) delete params.year;
      const res = await expenseAPI.getAll(params);
      setExpenses(res.data.expenses);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await expenseAPI.delete(id);
      toast.success('Deleted');
      fetchExpenses();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = expenses.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Transactions</h1>
          <p className="text-white/40 text-sm">{total} total transactions</p>
        </div>
        <button onClick={() => { setEditData(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input pl-9" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select className="input w-auto" value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
            <option value="">All Months</option>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="input w-auto" value={filters.year} onChange={e => setFilters(p => ({ ...p, year: Number(e.target.value) }))}>
            {[2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List */}
      <div className="glass-card overflow-hidden !p-0">
        <div className="bg-white/3 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Transaction History</h3>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/30 font-bold">
                <span>Description</span>
                <span className="ml-auto">Amount</span>
            </div>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-500/20">
                <Receipt size={32} className="text-brand-400 opacity-50" />
            </div>
            <h3 className="text-white font-bold text-lg">No transactions found</h3>
            <p className="text-white/30 text-sm max-w-xs mx-auto mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(exp => (
              <div key={exp._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-all group">
                <div className="w-12 h-12 flex items-center justify-center bg-dark-700 rounded-2xl text-xl shadow-inner border border-white/5 group-hover:border-brand-500/30 group-hover:scale-110 transition-all duration-300">
                  {CATEGORY_ICONS[exp.category] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-brand-400 transition-colors">{exp.title}</p>
                    {exp.aiDetected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-bold uppercase tracking-tighter">AI</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/40 text-[10px] font-bold uppercase">{exp.category}</span>
                    <span className="text-white/10 text-xs">•</span>
                    <span className="text-white/30 text-xs">{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-bold text-base ${exp.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString('en-IN')}
                  </p>
                  <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <button onClick={() => { setEditData(exp); setShowAdd(true); }} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(exp._id)} className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-400/40 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-30">← Prev</button>
            <span className="text-white/40 text-sm">{page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>

      {showAdd && (
        <AddExpenseModal
          editData={editData}
          onClose={() => { setShowAdd(false); setEditData(null); }}
          onSuccess={() => { setShowAdd(false); setEditData(null); fetchExpenses(); }}
        />
      )}
    </div>
  );
}
