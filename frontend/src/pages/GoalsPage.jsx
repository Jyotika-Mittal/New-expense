import React, { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import { Plus, Target, Trash2, PlusCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏋️', '🌴', '💰', '🎯', '🛡️'];
const GOAL_COLORS = ['#22c55e', '#6366f1', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#eab308', '#14b8a6'];

function GoalModal({ onClose, onSuccess, editGoal }) {
  const [form, setForm] = useState({
    title: editGoal?.title || '',
    targetAmount: editGoal?.targetAmount || '',
    deadline: editGoal?.deadline ? new Date(editGoal.deadline).toISOString().split('T')[0] : '',
    icon: editGoal?.icon || '🎯',
    color: editGoal?.color || '#22c55e',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.targetAmount) return toast.error('Title and target amount required');
    setLoading(true);
    try {
      if (editGoal) await goalAPI.update(editGoal._id, { ...form, targetAmount: parseFloat(form.targetAmount) });
      else await goalAPI.create({ ...form, targetAmount: parseFloat(form.targetAmount) });
      toast.success(editGoal ? 'Goal updated!' : 'Goal created! 🎯');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md bg-dark-800 border border-white/5 rounded-2xl shadow-2xl animate-bounce-in">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="font-display font-bold text-white">{editGoal ? 'Edit Goal' : 'New Saving Goal'}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === ic ? 'bg-white/15 ring-2 ring-brand-500' : 'bg-white/5 hover:bg-white/10'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-dark-800 ring-white' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Goal Title</label>
            <input className="input" placeholder="e.g. New Laptop, Goa Trip..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Amount (₹)</label>
              <input className="input font-mono" type="number" placeholder="50000" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Deadline (optional)</label>
              <input className="input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? '...' : editGoal ? 'Update' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddSavingsModal({ goal, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter valid amount');
    setLoading(true);
    try {
      await goalAPI.addSavings(goal._id, parseFloat(amount));
      toast.success(`₹${amount} added to ${goal.title}! 💰`);
      onSuccess();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm bg-dark-800 border border-white/5 rounded-2xl shadow-2xl animate-bounce-in p-6">
        <h3 className="font-display font-bold text-white mb-4">Add Savings to "{goal.title}"</h3>
        <p className="text-white/40 text-sm mb-4">Remaining: ₹{(goal.targetAmount - goal.savedAmount).toLocaleString('en-IN')}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input font-mono text-lg" type="number" placeholder="₹ Amount" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">Add 💰</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [savingsGoal, setSavingsGoal] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    try { const res = await goalAPI.getAll(); setGoals(res.data.goals); }
    catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await goalAPI.delete(id); toast.success('Goal deleted'); fetchGoals(); }
    catch { toast.error('Delete failed'); }
  };

  const totalTargeted = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Saving Goals</h1>
          <p className="text-white/40 text-sm">₹{totalSaved.toLocaleString('en-IN')} saved of ₹{totalTargeted.toLocaleString('en-IN')}</p>
        </div>
        <button onClick={() => { setEditGoal(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Overall progress */}
      {goals.length > 0 && (
        <div className="glass-card">
          <div className="flex justify-between mb-2">
            <span className="text-white/50 text-sm">Overall Progress</span>
            <span className="text-white text-sm font-mono">{totalTargeted > 0 ? Math.round((totalSaved / totalTargeted) * 100) : 0}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-green-400 rounded-full transition-all duration-700 glow-green"
              style={{ width: `${totalTargeted > 0 ? Math.min((totalSaved / totalTargeted) * 100, 100) : 0}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card text-center py-16">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-white font-display font-semibold text-lg mb-2">No goals yet!</p>
          <p className="text-white/30 text-sm mb-6">Create your first saving goal to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Create First Goal</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
            const remaining = goal.targetAmount - goal.savedAmount;
            const completed = goal.status === 'completed' || pct >= 100;
            return (
              <div key={goal._id} className="glass-card relative overflow-hidden group">
                {completed && (
                  <div className="absolute inset-0 bg-brand-500/5 border-2 border-brand-500/20 rounded-2xl pointer-events-none" />
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow" style={{ backgroundColor: `${goal.color}20` }}>
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{goal.title}</h3>
                      {goal.deadline && <p className="text-white/30 text-xs">Due: {new Date(goal.deadline).toLocaleDateString('en-IN')}</p>}
                    </div>
                  </div>
                  {completed && <CheckCircle size={18} className="text-brand-400 flex-shrink-0" />}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Saved</span>
                    <span className="font-mono font-bold" style={{ color: goal.color }}>₹{goal.savedAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
                  </div>
                  <div className="flex justify-between text-xs text-white/30">
                    <span>{pct}% complete</span>
                    <span>₹{goal.targetAmount.toLocaleString('en-IN')} goal</span>
                  </div>
                </div>

                {!completed && (
                  <p className="text-white/30 text-xs mb-3">₹{remaining.toLocaleString('en-IN')} remaining</p>
                )}

                <div className="flex gap-2">
                  {!completed && (
                    <button onClick={() => setSavingsGoal(goal)} className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5">
                      <PlusCircle size={14} /> Add Savings
                    </button>
                  )}
                  <button onClick={() => { setEditGoal(goal); setShowModal(true); }} className="btn-secondary text-xs py-2 px-3">Edit</button>
                  <button onClick={() => handleDelete(goal._id)} className="btn-danger text-xs py-2 px-3">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GoalModal
          editGoal={editGoal}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          onSuccess={() => { setShowModal(false); setEditGoal(null); fetchGoals(); }}
        />
      )}
      {savingsGoal && (
        <AddSavingsModal
          goal={savingsGoal}
          onClose={() => setSavingsGoal(null)}
          onSuccess={() => { setSavingsGoal(null); fetchGoals(); }}
        />
      )}
    </div>
  );
}
