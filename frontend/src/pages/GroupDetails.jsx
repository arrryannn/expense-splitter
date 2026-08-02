import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import AddMemberModal from '../components/AddMemberModal';
import CreateGroupModal from '../components/CreateGroupModal';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Users,
  Plus,
  Handshake,
  UserPlus,
  Receipt,
  ArrowLeft,
  Trash2,
  Tag,
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2
} from 'lucide-react';

const GroupDetails = () => {
  const { id } = useParams();
  const { currentGroupData, fetchGroupDetails, loadingDetails, removeGroupMember } = useGroup();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('expenses');
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [settleUpOpen, setSettleUpOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadData = () => {
    fetchGroupDetails(id).catch((err) => {
      console.error(err);
    });
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await API.delete(`/expenses/${expenseId}`);
        loadData();
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this member from group?')) {
      try {
        await removeGroupMember(id, memberId);
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to remove member');
      }
    }
  };

  if (loadingDetails || !currentGroupData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { group, expenses, settlements, netBalances, suggestedSettlements } = currentGroupData;

  const totalGroupSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const myNetBalance = netBalances?.[user._id] || 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onOpenCreateGroup={() => setCreateGroupOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
        <Sidebar onOpenCreateGroup={() => setCreateGroupOpen(true)} />

        <div className="flex-1 space-y-6 min-w-0">
          <Link
            to="/groups"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Groups
          </Link>

          <div className="glass-card rounded-2xl p-6 relative border border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-indigo-600/20">
                  {group.groupName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">{group.groupName}</h1>
                    <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-medium rounded-full">
                      {group.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{group.description || 'No description provided'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setAddExpenseOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
                <button
                  onClick={() => setSettleUpOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Settle Up</span>
                </button>
                <button
                  onClick={() => setAddMemberOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400">Total Group Spending</span>
                  <p className="text-lg font-bold text-white">₹{totalGroupSpent.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    myNetBalance >= 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {myNetBalance >= 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-xs text-slate-400">Your Net Balance</span>
                  <p
                    className={`text-lg font-bold ${
                      myNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {myNetBalance >= 0 ? `+ ₹${myNetBalance.toFixed(2)}` : `- ₹${Math.abs(myNetBalance).toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {actionError && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
              {actionError}
            </div>
          )}

          <div className="border-b border-slate-800 flex items-center gap-6">
            {[
              { id: 'expenses', label: 'Expenses', icon: Receipt, count: expenses?.length || 0 },
              { id: 'balances', label: 'Balances & Debt', icon: Handshake },
              { id: 'members', label: 'Members', icon: Users, count: group.members?.length || 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 flex items-center gap-2 text-sm font-semibold border-b-2 transition ${
                    isActive
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 bg-slate-900 rounded-full text-[10px] text-slate-400">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {expenses && expenses.length > 0 ? (
                expenses.map((exp) => (
                  <div
                    key={exp._id}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
                        {exp.category?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{exp.description}</h4>
                        <p className="text-xs text-slate-400">
                          Paid by <strong className="text-slate-200">{exp.paidBy?.name}</strong> •{' '}
                          <span className="capitalize">{exp.splitType} Split</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-base font-bold text-white">₹{exp.amount.toFixed(2)}</span>
                        <p className="text-[10px] text-slate-500">
                          {new Date(exp.date).toLocaleDateString()}
                        </p>
                      </div>

                      {exp.paidBy?._id === user._id && (
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          title="Delete expense"
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-sm">
                  No expenses added to this group yet. Click "Add Expense" to get started!
                </div>
              )}
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-indigo-400" />
                  <span>Suggested Debt Settlements</span>
                </h3>
                {suggestedSettlements && suggestedSettlements.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedSettlements.map((s, idx) => {
                      const debtor = group.members.find((m) => m._id === s.from);
                      const creditor = group.members.find((m) => m._id === s.to);
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="text-rose-400">{debtor?.name || 'User'}</strong> owes{' '}
                            <strong className="text-emerald-400">{creditor?.name || 'User'}</strong>
                          </div>
                          <span className="font-extrabold text-white text-sm">₹{s.amount.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>All balances are settled up! No outstanding debts.</span>
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-bold text-white">Member Net Balances</h3>
                <div className="space-y-2">
                  {group.members.map((m) => {
                    const bal = netBalances?.[m._id] || 0;
                    return (
                      <div
                        key={m._id}
                        className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs"
                      >
                        <span className="font-medium text-slate-200">{m.name}</span>
                        <span
                          className={`font-bold ${
                            bal > 0 ? 'text-emerald-400' : bal < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {bal > 0 ? `gets back ₹${bal.toFixed(2)}` : bal < 0 ? `owes ₹${Math.abs(bal).toFixed(2)}` : 'settled'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="glass-card rounded-2xl p-5 divide-y divide-slate-800">
              {group.members.map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-indigo-400 text-sm">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>

                  {m._id !== group.createdBy?._id && m._id !== user._id && (
                    <button
                      onClick={() => handleRemoveMember(m._id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        group={group}
        onExpenseAdded={loadData}
      />
      <SettleUpModal
        isOpen={settleUpOpen}
        onClose={() => setSettleUpOpen(false)}
        group={group}
        suggestedSettlements={suggestedSettlements}
        onSettlementRecorded={loadData}
      />
      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        groupId={group._id}
      />
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />
    </div>
  );
};

export default GroupDetails;