import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, ClipboardList, LogOut, Shield } from 'lucide-react';

function Layout({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/transfers', label: 'Transfers', icon: <ArrowRightLeft size={20} /> },
    { path: '/assignments', label: 'Deployments', icon: <ClipboardList size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col md:flex-row font-sans text-gray-100">
      <aside className="w-full md:w-64 bg-dark-800 border-r border-dark-700 flex flex-col pt-6 md:min-h-screen shrink-0">
        <div className="px-6 flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Shield className="text-primary-500 w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">KristalBall</h1>
            <p className="text-xs text-primary-400 font-medium tracking-wider uppercase">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col gap-1 mb-4">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active Operator</span>
            <span className="font-medium">{user.username}</span>
            <span className="text-xs inline-block bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded border border-primary-500/20 self-start mt-1">
              {user.role}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors w-full px-4 py-2"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
