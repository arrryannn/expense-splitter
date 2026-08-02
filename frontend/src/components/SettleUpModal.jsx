import React, { useState, useEffect } from 'react';
import { X, Handshake } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const SettleUpModal = ({ isOpen, onClose, group, suggestedSettlements, onSettlementRecorded }) => {
  const { user } = useAuth();
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group && group.members && user) {
      const otherMembers = group.members.filter((m) => m._id !== user._id);
      if (otherMembers.length > 0) {
        setToUser(otherMembers[0]._id);
      }
    }
  }, [group, user]);

  if (!isOpen || !group) return null;

  const otherMembers = group.members.filter((m) => m._id !== user._id);

  const handleSelectSuggested = (suggestion) => {
    setToUser(suggestion.to);
    setAmount(suggestion.amount.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toUser || !amount || parseFloat(amount) <= 0) {
      setError('Please select recipient and enter a valid settlement amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await API.post('/settlements', {
        groupId: group._id,
        toUser,
        amount: parseFloat(amount)
      });
      setAmount('');
      onSettlementRecorded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  const mySuggestedSettlements = (suggestedSettlements || []).filter(
    (s) => s.from === user._id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-slate-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Settle Up Balances</h2>
            <p className="text-xs text-slate-400">Record a debt repayment to a member</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {mySuggestedSettlements.length > 0 && (
          <div className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Suggested Settlements
            </span>
            {mySuggestedSettlements.map((s, idx) => {
              const recipient = group.members.find((m) => m._id === s.to);
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggested(s)}
                  className="flex items-center justify-between p-2 bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/50 rounded-lg cursor-pointer transition text-xs"
                >
                  <span className="text-slate-200">
                    Pay <strong className="text-white">{recipient?.name || 'User'}</strong>
                  </span>
                  <span className="font-bold text-emerald-400">${s.amount.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Paying To</label>
            <select
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {otherMembers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Record Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleUpModal;