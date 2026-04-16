import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, CornerUpLeft } from 'lucide-react';

function Assignments({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ assetId: '', assignedTo: '', purpose: '', quantity: 1, base: '' });

  const fetchData = async () => {
    try {
      const [assignmentsRes, assetsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assignments`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assets`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setAssignments(assignmentsRes.data);
      setAssets(assetsRes.data);
      if (assetsRes.data.length > 0) {
        setNewAssignment(prev => ({ ...prev, assetId: assetsRes.data[0].id, base: assetsRes.data[0].base }));
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
    setNewAssignment({ ...newAssignment, assetId: aId, base: selectedAsset?.base || '' });
  };

  const submitAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assignments`, newAssignment, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating assignment');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assignments/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating assignments status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operator Deployments</h1>
          <p className="text-gray-400 mt-1">Assign hardware to specific personnel and track expenditures.</p>
        </div>
        {(user.role === 'Admin' || user.role === 'Base Commander') && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Assign Hardware
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitAssignment} className="glass p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Select Asset (Base)</label>
            <select required value={newAssignment.assetId} onChange={handleAssetChange} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500">
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} (Qty: {a.quantity} @ {a.base})</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Operator ID</label>
            <input type="text" placeholder="e.g. OP-814" required value={newAssignment.assignedTo} onChange={e => setNewAssignment({...newAssignment, assignedTo: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500" />
          </div>
          <div className="lg:col-span-1">
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Mission/Purpose</label>
            <input type="text" required value={newAssignment.purpose} onChange={e => setNewAssignment({...newAssignment, purpose: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500" />
          </div>
          <div>
             <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1">Qty</label>
             <input type="number" min="1" required value={newAssignment.quantity} onChange={e => setNewAssignment({...newAssignment, quantity: e.target.value})} className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm focus:border-primary-500" />
          </div>
          <button type="submit" className="w-full bg-accent-600 hover:bg-accent-500 text-white font-medium p-2 rounded transition-colors h-[38px]">
            Deploy
          </button>
        </form>
      )}

      <div className="glass overflow-hidden">
        <div className="p-4 border-b border-dark-700 bg-dark-800/50">
          <h2 className="font-semibold text-lg">Active Personnel Deployments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-dark-900 border-b border-dark-700 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Dep ID</th>
                <th className="px-6 py-4 font-medium">Operator</th>
                <th className="px-6 py-4 font-medium">Hardware (Qty)</th>
                <th className="px-6 py-4 font-medium">Mission Objective</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Retrieving operational data...</td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No active deployments.</td></tr>
              ) : assignments.map((ast) => (
                <tr key={ast.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">DP-{ast.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    {ast.assignedTo}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-200">{ast.assetName}</span>
                    <span className="text-xs text-gray-500 ml-2 font-mono">x{ast.quantity}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{ast.purpose}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        ast.status === 'Assigned' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' :
                        ast.status === 'Returned' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {ast.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {ast.status === 'Assigned' && (user.role === 'Admin' || user.role === 'Base Commander') ? (
                      <>
                        <button onClick={() => updateStatus(ast.id, 'Returned')} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors" title="Mark as Returned">
                          <CornerUpLeft size={16} />
                        </button>
                        <button onClick={() => updateStatus(ast.id, 'Expended')} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors" title="Mark as Expended">
                          <Activity size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs pr-[18px]">N/A</span>
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

export default Assignments;
