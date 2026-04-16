import React, { useState } from 'react';
import axios from 'axios';
import { Shield } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { username, password });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="glass p-8 w-full max-w-md animate-fade-in border-primary-500/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="text-primary-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-100">Military Asset Command</h2>
          <p className="text-gray-400 mt-2 text-sm text-center">Enter credentials to access the secure network</p>
        </div>

        {error && <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-3 mb-6 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Operator ID</label>
            <input 
              type="text" 
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin, commander, logistics"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Passkey</label>
            <input 
              type="password" 
              className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary-500 hover:bg-primary-400 text-white font-medium py-2.5 rounded-lg transition-colors mt-4"
          >
            Authenticate
          </button>
        </form>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Demo accounts: admin (admin123), commander (commander123), logistics (logistics123)</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
