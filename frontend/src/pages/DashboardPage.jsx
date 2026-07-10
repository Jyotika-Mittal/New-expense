import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { insightsAPI, expenseAPI, goalAPI } from '../services/api';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Plus, Sparkles, Target, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import AlertBanner from '../components/dashboard/AlertBanner';
import { Link } from 'react-router-dom';

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ec4899', '#8b5cf6', '#eab308'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'green', loading }) => (
  <div className="glass-card">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'green' ? 'bg-green-500/10 text-green-400' : color === 'red' ? 'bg-red-500/10 text-red-400' : color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
        <Icon size={20} />
      </div>
    </div>
    {loading ? (
      <div className="space-y-2"><div className="h-7 bg-white/5 rounded-lg w-3/4 animate-pulse" /><div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" /></div>
    ) : (
      <>
        <p className="text-2xl font-display font-bold text-white animate-number-roll">₹{Number(value || 0).toLocaleString('en-IN')}</p>
        <p className="text-white/40 text-xs mt-1">{sub}</p>
        <p className="text-white/60 text-sm font-medium mt-0.5">{label}</p>
      </>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-white/50 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const now = new Date();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insRes, expRes, goalsRes] = await Promise.all([
        insightsAPI.getMonthly({ month: now.getMonth() + 1, year: now.getFullYear() }),
        expenseAPI.getAll({ limit: 5 }),
        goalAPI.getAll()
      ]);
      setInsights(insRes.data.data);
      setRecentExpenses(expRes.data.expenses);
      setGoals(goalsRes.data.goals.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const categoryColors = {
    Food: '#f97316', Transport: '#3b82f6', Shopping: '#ec4899',
    Entertainment: '#8b5cf6', Health: '#10b981', Education: '#06b6d4',
    Bills: '#eab308', Housing: '#6366f1', Travel: '#14b8a6',
    Salary: '#22c55e', Freelance: '#84cc16', Investment: '#a855f7', Other: '#94a3b8'
  };

  const categoryIcons = {
    Food: '🍕', Transport: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Health: '💊', Education: '📚', Bills: '⚡', Housing: '🏠',
    Travel: '✈️', Salary: '💰', Freelance: '💻', Investment: '📈', Other: '📦'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Hey {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Alerts */}
      {insights?.alerts?.length > 0 && (
        <div className="space-y-2">
          {insights.alerts.map((alert, i) => <AlertBanner key={i} alert={alert} />)}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total Balance" value={insights?.lifetime?.balance} sub="Lifetime account" color="indigo" loading={loading} />
        <StatCard icon={TrendingUp} label="Income" value={insights?.totalIncome} sub="This month" color="green" loading={loading} />
        <StatCard icon={TrendingDown} label="Expenses" value={insights?.totalExpense} sub="This month" color="red" loading={loading} />
        <StatCard icon={Sparkles} label="Savings Rate" value={null} sub={`${insights?.savings || 0}% this month`} color="amber" loading={loading} />
      </div>

      {!loading && insights?.transactionCount === 0 && (
        <div className="glass-card bg-brand-500/5 border-brand-500/20 py-10 text-center">
          <p className="text-4xl mb-4">✨</p>
          <h3 className="text-white font-bold text-lg">No transactions yet for {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
          <p className="text-white/40 text-sm mt-1 max-w-xs mx-auto">Start adding your daily expenses to see smart insights and AI-powered categorization!</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-6 text-sm">Add Your First Transaction</button>
        </div>
      )}

      {/* Chart + Top Categories */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-3 glass-card">
          <h3 className="font-display font-semibold text-white mb-4">Monthly Overview</h3>
          {loading ? (
            <div className="h-48 bg-white/3 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={insights?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-2 glass-card">
          <h3 className="font-display font-semibold text-white mb-4">Top Categories</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/3 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(insights?.categoryBreakdown || {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, amt]) => {
                  const total = insights?.totalExpense || 1;
                  const pct = Math.round((amt / total) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-lg w-7">{categoryIcons[cat] || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-white/70 text-xs">{cat}</span>
                          <span className="text-white text-xs font-mono">₹{amt.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: categoryColors[cat] || '#94a3b8' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              {Object.keys(insights?.categoryBreakdown || {}).length === 0 && (
                <p className="text-white/30 text-sm text-center py-4">No expenses this month</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Savings Goals */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white">Saving Goals</h3>
          <Link to="/goals" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/3 rounded-xl animate-pulse" />)}
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-6 bg-white/2 rounded-2xl border border-dashed border-white/5">
            <p className="text-white/20 text-sm">No goals set yet. Start saving for your dreams!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goals.map(goal => {
              const pct = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);
              return (
                <div key={goal._id} className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-brand-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{goal.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{goal.title}</p>
                      <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">₹{goal.savedAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-white">Recent Transactions</h3>
          <a href="/expenses" className="text-brand-400 text-sm hover:text-brand-300 transition-colors">View all →</a>
        </div>
        <div className="space-y-2">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/3 rounded-xl animate-pulse" />)
          ) : recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/20 text-4xl mb-2">📊</p>
              <p className="text-white/30 text-sm">No transactions yet. Add your first one!</p>
            </div>
          ) : recentExpenses.map(exp => (
            <div key={exp._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
              <span className="text-xl w-9 h-9 flex items-center justify-center bg-white/5 rounded-lg">{categoryIcons[exp.category] || '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{exp.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs">{exp.category}</span>
                  {exp.aiDetected && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">AI</span>}
                </div>
              </div>
              <span className={`font-mono font-semibold text-sm ${exp.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {exp.type === 'income' ? '+' : '-'}₹{exp.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchData(); }} />}
    </div>
  );
}
