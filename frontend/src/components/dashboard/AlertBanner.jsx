import React, { useState } from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const icons = { danger: AlertCircle, warning: AlertTriangle, info: Info };
const styles = {
  danger: 'bg-red-500/10 border-red-500/20 text-red-300',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
};

export default function AlertBanner({ alert }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const Icon = icons[alert.type] || Info;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-slide-up ${styles[alert.type]}`}>
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1">{alert.message}</span>
      <button onClick={() => setDismissed(true)} className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
