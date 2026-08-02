import React, { useState } from 'react';
import { X, Users, Tag, Plus, Trash2 } from 'lucide-react';
import { useGroup } from '../context/GroupContext';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useGroup();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trip');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const handleEmailChange = (index, value) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
  };

  const handleRemoveEmailField = (index) => {
    const updated = memberEmails.filter((_, i) => i !== index);
    setMemberEmails(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createGroup({
        groupName,
        description,
        category,
        memberEmails: memberEmails.filter((e) => e.trim() !== '')
      });
      setGroupName('');
      setDescription('');
      setCategory('Trip');
      setMemberEmails(['']);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Expense Group</h2>
            <p className="text-xs text-slate-400">Share trip, household, or project bills</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Summer Beach Trip"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="Trip">Trip</option>
                <option value="Home">Home / Apartment</option>
                <option value="Couple">Couple</option>
                <option value="Other">Other</option>
              </select>
              <Tag className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Hotel, food and car rental splits"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Add Members by Email</label>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {memberEmails.map((email, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  {memberEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmailField(idx)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddEmailField}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add another member
            </button>
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
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;