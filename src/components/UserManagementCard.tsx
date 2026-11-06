'use client';

import React, { useState, useEffect } from 'react';

export default function UserManagementCard() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, paypalEmail: paypalEmail || email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User created successfully!');
        setName('');
        setEmail('');
        setPaypalEmail('');
        fetchUsers();
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setMessage(data.error || 'Failed to create user');
      }
    } catch (err: any) {
      setMessage('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Enterprise User Directory</h3>
        <span className="text-xs text-blue-400 font-mono">{users.length} Registered</span>
      </div>

      <form onSubmit={handleCreateUser} className="space-y-3 bg-gray-950 p-4 rounded-lg border border-gray-800">
        <p className="text-xs font-semibold text-gray-300">Add Real Platform User</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Account Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="email"
            placeholder="PayPal Email (Optional)"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="CLIENT">Client (Buyer)</option>
            <option value="CONTRACTOR">Contractor (Seller)</option>
          </select>
        </div>
        <div className="flex justify-between items-center pt-1">
          {message && <span className="text-xs text-emerald-400 font-mono">{message}</span>}
          <button
            type="submit"
            disabled={loading}
            className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : '+ Register User'}
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {users.map((u) => (
          <div key={u.id} className="flex justify-between items-center text-xs bg-gray-950/60 p-2.5 rounded border border-gray-800/80">
            <div>
              <p className="font-medium text-white">{u.name}</p>
              <p className="text-gray-400 text-[11px] font-mono">{u.email} {u.paypalEmail && `| PayPal: ${u.paypalEmail}`}</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${u.role === 'CLIENT' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
              {u.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}