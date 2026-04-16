import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, Activity, Plus } from 'lucide-react';

function Dashboard({ user }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterBase, setFilterBase] = useState('');
  
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Weapon', base: 'Alpha Base', quantity: 1, description: '' });

  const fetchAssets = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assets${filterBase ? `?base=${filterBase}` : ''}`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filterBase]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assets`, newAsset, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowPurchaseForm(false);
      setNewAsset({ name: '', category: 'Weapon', base: 'Alpha Base', quantity: 1, description: '' });
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding asset');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Overview</h1>
          <p className="text-gray-400 mt-1">Real-time asset deployment across all sectors.</p>
        </div>
        {user.role === 'Admin' && (
          <button 
            onClick={() => setShowPurchaseForm(!showPurchaseForm)}
            className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} /> Requisition Asset
          </button>
        )}
      </div>

      {showPurchaseForm && (
        <form onSubmit={handlePurchase} className="glass p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Nomenclature</label>
            <input type="text" required value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Class</label>
            <select value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500">
              <option>Weapon</option>
              <option>Vehicle</option>
              <option>Ammunition</option>
              <option>Medical</option>
              <option>Comms</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Assigned Base</label>
            <select value={newAsset.base} onChange={e => setNewAsset({...newAsset, base: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500">
              <option>Alpha Base</option>
              <option>Bravo Outpost</option>
              <option>Charlie Checkpoint</option>
              <option>Delta Command</option>
            </select>
          </div>
          <div>
             <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Qty</label>
             <input type="number" min="1" required value={newAsset.quantity} onChange={e => setNewAsset({...newAsset, quantity: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500" />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-medium p-2 rounded transition-colors h-[38px]">
            Confirm Requisition
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Assets</h3>
            <div className="p-2 bg-blue-500/10 rounded">
              <Package className="text-blue-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-bold">{assets.reduce((sum, a) => sum + a.quantity, 0)}</p>
        </div>
        <div className="glass p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Active Bases</h3>
            <div className="p-2 bg-emerald-500/10 rounded">
              <MapPin className="text-emerald-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-bold">{new Set(assets.map(a => a.base)).size}</p>
        </div>
        <div className="glass p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">System Status</h3>
            <div className="p-2 bg-rose-500/10 rounded">
              <Activity className="text-rose-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-400">NOMINAL</p>
          <p className="text-xs text-gray-500 mt-1">All secure channels active</p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-dark-700 flex justify-between items-center bg-dark-800/50">
          <h2 className="font-semibold text-lg">Asset Inventory Register</h2>
          <select 
            value={filterBase} 
            onChange={(e) => setFilterBase(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded px-3 py-1.5 text-sm focus:border-primary-500"
          >
            <option value="">All Bases</option>
            <option value="Alpha Base">Alpha Base</option>
            <option value="Bravo Outpost">Bravo Outpost</option>
            <option value="Charlie Checkpoint">Charlie Checkpoint</option>
            <option value="Delta Command">Delta Command</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-dark-900 border-b border-dark-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Hardware ID</th>
                <th className="px-6 py-4 font-medium">Nomenclature</th>
                <th className="px-6 py-4 font-medium">Class</th>
                <th className="px-6 py-4 font-medium">Assigned Base</th>
                <th className="px-6 py-4 font-medium text-right">Available Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Retrieving intelligence...</td></tr>
              ) : assets.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No assets detected in this sector.</td></tr>
              ) : assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">#{asset.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-medium">{asset.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-dark-700 text-gray-300">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{asset.base}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-medium ${asset.quantity < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {asset.quantity}
                    </span>
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

export default Dashboard;
