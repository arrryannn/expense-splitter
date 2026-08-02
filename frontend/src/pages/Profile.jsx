import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CreateGroupModal from '../components/CreateGroupModal';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setLoading(true);
      await updateUserProfile({
        name,
        email,
        ...(password && { password })
      });
      setMessage('Profile updated successfully!');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onOpenCreateGroup={() => setCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
        <Sidebar onOpenCreateGroup={() => setCreateModalOpen(true)} />

        <div className="flex-1 space-y-6 min-w-0 max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-400 text-sm">Update your profile information and credentials</p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-indigo-500/40">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.name}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            {message && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password (leave blank to keep current)</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <CreateGroupModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
};

export default Profile;