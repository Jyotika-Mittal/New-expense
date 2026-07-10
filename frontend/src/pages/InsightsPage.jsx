import React, { useState, useEffect } from 'react';
import { insightsAPI } from '../services/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import AlertBanner from '../components/dashboard/AlertBanner';
import { TrendingUp, TrendingDown, Percent, Wallet } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#eab308', '#6366f1', '#14b8a6', '#22c55e', '#84cc16', '#a855f7', '#94a3b8'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p className="text-white/60">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      <p className="text-brand-400">{payload[0].payload.pct}%</p>
    </div>
  );
};

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    insightsAPI.getMonthly({ month, year })
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const pieData = data ? Object.entries(data.categoryBreakdown || {})
    .map(([name, value]) => ({ name, value, pct: Math.round((value / (data.totalExpense || 1)) * 100) }))
    .sort((a, b) => b.value - a.value) : [];

  const dailyChartData = data ? Object.entries(data.dailyData || {})
    .map(([day, vals]) => ({ day: `${day}`, income: vals.income, expense: vals.expense }))
    .sort((a, b) => parseInt(a.day) - parseInt(b.day)) : [];

  if (loading) return (
    <div className="space-y-5">
      <div className="h-8 bg-white/5 rounded-xl w-48 animate-pulse" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      <div className="grid lg:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Insights</h1>
          <p className="text-white/40 text-sm">Your money story 📊</p>
        </div>
        <div className="flex gap-2">
          <select className="input w-auto" value={month} onChange={e => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select className="input w-auto" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts */}
      {data?.alerts?.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => <AlertBanner key={i} alert={alert} />)}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Wallet, label: 'Total Balance', value: data?.lifetime?.balance, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: TrendingUp, label: 'Total Income', value: data?.totalIncome, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: TrendingDown, label: 'Total Expenses', value: data?.totalExpense, color: 'text-red-400', bg: 'bg-red-500/10' },
          { icon: Percent, label: 'Savings Rate', value: null, pct: data?.savings, color: 'text-brand-400', bg: 'bg-brand-500/10' },
        ].map(({ icon: Icon, label, value, pct, color, bg }) => (
          <div key={label} className="glass-card flex flex-col gap-3 p-6">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/20`}>
              <Icon size={24} className={color} />
            </div>
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
              <p className={`text-2xl font-display font-bold ${color} tracking-tight`}>
                {pct !== undefined ? `${pct}%` : `₹${Number(value || 0).toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pie Chart */}
        <div className="glass-card">
          <h3 className="font-display font-semibold text-white mb-4">Spending by Category</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/20 text-sm">No expense data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {pieData.slice(0, 6).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-white/50 text-xs truncate">{item.name}</span>
                    <span className="text-white/70 text-xs font-mono ml-auto">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="glass-card">
          <h3 className="font-display font-semibold text-white mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.monthlyTrend || []} barSize={14} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{v}</span>} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Spending Chart */}
      {dailyChartData.length > 0 && (
        <div className="glass-card">
          <h3 className="font-display font-semibold text-white mb-4">Daily Spending — {months[month - 1]} {year}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className="glass-card">
        <h3 className="font-display font-semibold text-white mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {pieData.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-4">No expense data for this period</p>
          ) : pieData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-white/60 text-sm w-28 flex-shrink-0">{item.name}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              </div>
              <span className="text-white/40 text-xs w-8 text-right">{item.pct}%</span>
              <span className="text-white font-mono text-sm w-24 text-right">₹{item.value.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
