import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreateGroupModal from '../components/CreateGroupModal';
import { useGroup } from '../context/GroupContext';
import { Users, Plus, Tag, Search, ChevronRight } from 'lucide-react';

const Groups = () => {
  const { groups, fetchGroups, loadingGroups } = useGroup();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onOpenCreateGroup={() => setCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
        <Sidebar onOpenCreateGroup={() => setCreateModalOpen(true)} />

        <div className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Expense Groups</h1>
              <p className="text-slate-400 text-sm">Manage shared expenses with roommates & friends</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search groups by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>

          {loadingGroups ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 glass-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((g) => (
                <Link
                  key={g._id}
                  to={`/groups/${g._id}`}
                  className="glass-card glass-card-hover rounded-2xl p-5 block group space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
                        {g.groupName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                          {g.groupName}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">{g.description || 'No description'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {g.category}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-300 font-medium">
                        {g.members?.length || 0} Members
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Group <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Groups Found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Create a new group to start splitting bills and tracking who owes whom.
              </p>
            </div>
          )}
        </div>
      </main>

      <CreateGroupModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
};

export default Groups;