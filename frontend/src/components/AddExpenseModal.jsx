import React, { useState, useEffect } from 'react';
import { X, Receipt, CheckSquare, DollarSign, Percent } from 'lucide-react';
import API from '../services/api';

const AddExpenseModal = ({ isOpen, onClose, group, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splitState, setSplitState] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group && group.members) {
      setPaidBy(group.members[0]?._id || '');
      setSplitState(
        group.members.map((m) => ({
          user: m._id,
          name: m.name,
          selected: true,
          amount: '',
          percentage: ''
        }))
      );
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const handleToggleMember = (userId) => {
    setSplitState((prev) =>
      prev.map((item) => (item.user === userId ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSplitValueChange = (userId, field, value) => {
    setSplitState((prev) =>
      prev.map((item) => (item.user === userId ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Please provide a valid description and positive amount');
      return;
    }

    const selectedMembers = splitState.filter((s) => s.selected);
    if (selectedMembers.length === 0) {
      setError('Select at least one member to split the expense with');
      return;
    }

    const parsedAmount = parseFloat(amount);
    let splitAmongPayload = [];

    if (splitType === 'equal') {
      splitAmongPayload = selectedMembers.map((s) => ({ user: s.user }));
    } else if (splitType === 'exact') {
      const sumExact = selectedMembers.reduce((acc, s) => acc + parseFloat(s.amount || 0), 0);
      if (Math.abs(sumExact - parsedAmount) > 0.05) {
        setError(`Sum of amounts ($${sumExact.toFixed(2)}) must equal total expense ($${parsedAmount.toFixed(2)})`);
        return;
      }
      splitAmongPayload = selectedMembers.map((s) => ({
        user: s.user,
        amount: parseFloat(s.amount || 0)
      }));
    } else if (splitType === 'percentage') {
      const sumPct = selectedMembers.reduce((acc, s) => acc + parseFloat(s.percentage || 0), 0);
      if (Math.abs(sumPct - 100) > 0.5) {
        setError(`Sum of percentages (${sumPct}%) must equal 100%`);
        return;
      }
      splitAmongPayload = selectedMembers.map((s) => ({
        user: s.user,
        percentage: parseFloat(s.percentage || 0)
      }));
    }

    try {
      setLoading(true);
      setError('');
      await API.post('/expenses', {
        groupId: group._id,
        description,
        amount: parsedAmount,
        category,
        paidBy,
        splitType,
        splitAmong: splitAmongPayload
      });

      setDescription('');
      setAmount('');
      setCategory('Food');
      onExpenseAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Add New Expense</h2>
            <p className="text-xs text-slate-400">Record a bill for {group.groupName}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                required
                placeholder="Dinner, Grocery, Fuel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Food">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities & Bills</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {group.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Split Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'equal', label: 'Equal Split', icon: CheckSquare },
                { id: 'exact', label: 'Exact Amount', icon: DollarSign },
                { id: 'percentage', label: 'Percentage', icon: Percent }
              ].map((st) => {
                const Icon = st.icon;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSplitType(st.id)}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                      splitType === st.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Split Among Members</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {splitState.map((item) => (
                <div
                  key={item.user}
                  className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleMember(item.user)}
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{item.name}</span>
                  </label>

                  {item.selected && splitType === 'exact' && (
                    <div className="flex items-center gap-1 w-28">
                      <span className="text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={item.amount}
                        onChange={(e) => handleSplitValueChange(item.user, 'amount', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  )}

                  {item.selected && splitType === 'percentage' && (
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        step="1"
                        placeholder="0"
                        value={item.percentage}
                        onChange={(e) => handleSplitValueChange(item.user, 'percentage', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <span className="text-slate-400 text-xs">%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;