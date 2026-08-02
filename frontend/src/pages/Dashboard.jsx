import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import CreateGroupModal from '../components/CreateGroupModal';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Users, Receipt, ChevronRight } from 'lucide-react';
import { useGroup } from '../context/GroupContext';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { groups, fetchGroups } = useGroup();

  const loadData = async () => {
    try {
      setLoading(true);
      await fetchGroups();
      const { data } = await API.get('/expenses/dashboard-summary');
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onOpenCreateGroup={() => setCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
        <Sidebar onOpenCreateGroup={() => setCreateModalOpen(true)} />

        <div className="flex-1 space-y-8 min-w-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Financial Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Overview of your shared balances and activity
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <StatCard
                title="Total Expenses"
                value={`₹${summary?.totalUserExpenses || 0}`}
                icon={IndianRupee}
                colorClass="text-indigo-400 bg-indigo-500/10"
                subtitle="All logged group bills"
              />

              <StatCard
                title="You Owe"
                value={`₹${summary?.youOwe || 0}`}
                icon={ArrowUpRight}
                colorClass="text-rose-400 bg-rose-500/10"
                subtitle="Unsettled debts to members"
              />

              <StatCard
                title="You Are Owed"
                value={`₹${summary?.youAreOwed || 0}`}
                icon={ArrowDownLeft}
                colorClass="text-emerald-400 bg-emerald-500/10"
                subtitle=" balances due to you"
              />
            <StatCard
  title="Active Groups"
  value={summary?.totalGroups || 0}
  icon={Users}
  colorClass="text-violet-400 bg-violet-500/10"
  subtitle="Joined groups"
  isCurrency={false}
/>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  Recent Expenses
                </h2>

                <Link
                  to="/groups"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View All Groups →
                </Link>
              </div>


              <div className="glass-card rounded-2xl p-4 divide-y divide-slate-800/60">

                {summary?.recentExpenses &&
                summary.recentExpenses.length > 0 ? (

                  summary.recentExpenses.map((exp) => (

                    <div
                      key={exp._id}
                      className="py-3 flex items-center justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400">
                          {exp.category?.charAt(0) || 'E'}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            {exp.description}
                          </p>

                          <p className="text-xs text-slate-400">
                            Paid by{" "}
                            <strong className="text-slate-300">
                              {exp.paidBy?.name}
                            </strong>{" "}
                            in{" "}
                            <span className="text-indigo-400">
                              {exp.groupId?.groupName}
                            </span>
                          </p>
                        </div>

                      </div>


                      <div className="text-right">

                        <span className="text-sm font-bold text-white">
                          ₹{exp.amount.toFixed(2)}
                        </span>

                        <p className="text-[10px] text-slate-500">
                          {new Date(exp.date).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                  ))

                ) : (

                  <div className="py-8 text-center text-slate-400 text-sm">
                    No recent expenses logged. Create a group to start splitting bills!
                  </div>

                )}

              </div>

            </div>


            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Your Groups
                </h2>

                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  + New
                </button>

              </div>


              <div className="space-y-3">

                {groups && groups.length > 0 ? (

                  groups.slice(0, 4).map((g) => (

                    <Link
                      key={g._id}
                      to={`/groups/${g._id}`}
                      className="glass-card glass-card-hover rounded-xl p-4 flex items-center justify-between group"
                    >

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300">
                          {g.groupName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {g.groupName}
                          </h3>

                          <p className="text-xs text-slate-400">
                            {g.members?.length || 0} members
                          </p>
                        </div>

                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-500" />

                    </Link>

                  ))

                ) : (

                  <div className="glass-card rounded-xl p-6 text-center text-slate-400 text-xs">
                    You aren't part of any groups yet.
                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </main>

      <CreateGroupModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

    </div>
  );
};

export default Dashboard;