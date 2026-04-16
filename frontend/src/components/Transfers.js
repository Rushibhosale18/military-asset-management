import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Check, X } from 'lucide-react';

function Transfers({ user }) {
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [newTransfer, setNewTransfer] = useState({ assetId: '', fromBase: '', toBase: '', quantity: 1 });

  const fetchData = async () => {
    try {
      const [transfersRes, assetsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transfers`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assets`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setTransfers(transfersRes.data);
      setAssets(assetsRes.data);
      if (assetsRes.data.length > 0) {
        setNewTransfer(prev => ({ ...prev, assetId: assetsRes.data[0].id, fromBase: assetsRes.data[0].base }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssetChange = (e) => {
    const aId = e.target.value;
    const selectedAsset = assets.find(a => a.id.toString() === aId);
    setNewTransfer({ ...newTransfer, assetId: aId, fromBase: selectedAsset?.base || '' });
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transfers`, newTransfer, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting transfer');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transfers/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating transfer status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistics & Transfers</h1>
          <p className="text-gray-400 mt-1">Manage inter-base hardware movements.</p>
        </div>
        {(user.role === 'Admin' || user.role === 'Logistics Officer' || user.role === 'Base Commander') && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Initiate Transfer
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitTransfer} className="glass p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Select Asset</label>
            <select required value={newTransfer.assetId} onChange={handleAssetChange} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500">
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} (Qty: {a.quantity} @ {a.base})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Destination Base</label>
            <select required value={newTransfer.toBase} onChange={e => setNewTransfer({...newTransfer, toBase: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500">
              <option value="">Select Base...</option>
              <option>Alpha Base</option>
              <option>Bravo Outpost</option>
              <option>Charlie Checkpoint</option>
              <option>Delta Command</option>
            </select>
          </div>
          <div>
             <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Transfer Qty</label>
             <input type="number" min="1" required value={newTransfer.quantity} onChange={e => setNewTransfer({...newTransfer, quantity: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium p-2 rounded transition-colors h-[38px]">
            Submit Auth
          </button>
        </form>
      )}

      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-dark-700 bg-dark-800/50">
          <h2 className="font-semibold text-lg">Active & Historical Transports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-dark-900 border-b border-dark-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Tx ID</th>
                <th className="px-6 py-4 font-medium">Asset</th>
                <th className="px-6 py-4 font-medium">Movement Route</th>
                <th className="px-6 py-4 font-medium text-center">Qty</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Retrieving transport logs...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No transport records found.</td></tr>
              ) : transfers.map((tx) => (
                <tr key={tx.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">TX-{tx.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-medium">
                    {tx.assetName}
                    <div className="text-xs font-normal text-gray-500 mt-0.5">Req By: {tx.requesterName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-300">{tx.fromBase}</span>
                        <ArrowRight size={14} className="text-gray-500" />
                        <span className="font-medium text-blue-400">{tx.toBase}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono">{tx.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {tx.status === 'Pending' && (user.role === 'Admin' || user.role === 'Logistics Officer') ? (
                      <>
                        <button onClick={() => handleStatusChange(tx.id, 'Completed')} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors" title="Approve Transfer">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleStatusChange(tx.id, 'Rejected')} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Reject Transfer">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs text-center pr-2">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transfers;
