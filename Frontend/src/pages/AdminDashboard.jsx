import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, systemActivity: 0 });
  const [loading, setLoading] = useState(true);

  // --- Data Fetching Logic ---
  const fetchAdminData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Parallel fetching for performance
      const [usersRes, logsRes] = await Promise.all([
        fetch('https://job-application-tracker-3n97.onrender.com/api/admin/users', { headers }),
        fetch('https://job-application-tracker-3n97.onrender.com/api/admin/logs', { headers })
      ]);

      if (!usersRes.ok || !logsRes.ok) throw new Error("Server error");

      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      setUsers(usersData);
      setLogs(logsData);
      setStats({ 
        totalUsers: usersData.length, 
        systemActivity: logsData.length 
      });
    } catch (err) {
      console.error("Fetch error:", err);
      // Only show toast if it's the first load to avoid spamming during polling
      if (loading) toast.error("Failed to load mission control data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    
    // 🔄 AUTO-POLLING: Refresh data every 60 seconds for "Live" feel
    const interval = setInterval(fetchAdminData, 60000); 
    return () => clearInterval(interval);
  }, [token]);

  // --- Action Handlers ---
  const handleExportLogs = async () => {
    try {
      toast.loading("Preparing CSV...", { id: 'export' });
      const response = await fetch('https://job-application-tracker-3n97.onrender.com/api/admin/export-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Logs exported successfully!", { id: 'export' });
    } catch (error) {
      toast.error("Export failed. Check backend logs.", { id: 'export' });
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
        fetchAdminData(); 
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-400 font-mono animate-pulse">Initializing Mission Control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 pt-24 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Stats Overview --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} color="from-blue-500 to-indigo-600" />
          <StatCard title="System Activity" value={stats.systemActivity} color="from-purple-500 to-pink-600" />
          <StatCard title="Platform Status" value="Healthy" color="from-emerald-500 to-teal-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- User Management Table --- */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              👤 User Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm">
                    <th className="pb-4">Username</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="text-sm hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium">{u.username}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {u.status || 'unknown'}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{u.is_admin ? '🛡️ Admin' : 'User'}</td>
                      <td className="py-4">
                        {!u.is_admin && (
                          <button 
                            onClick={() => toggleUserStatus(u.id, u.status)}
                            className={`font-semibold transition-colors ${u.status === 'active' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                          >
                            {u.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Live Audit Feed --- */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📜 System Audit Log
              </h2>
              <button 
                onClick={handleExportLogs} 
                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/50 rounded-lg text-indigo-400 text-xs font-semibold transition-all flex items-center gap-2"
              >
                📥 Export CSV
              </button>
            </div>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-center text-slate-500 py-10">No recent activity detected.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-800/50 border border-white/5 text-xs">
                    <div className="flex justify-between text-indigo-400 mb-1">
                      <span className="font-bold">@{log.username || 'System'}</span>
                      <span className="opacity-60">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-300">
                      <span className="font-semibold text-white uppercase tracking-tighter mr-2">
                        {log.action}:
                      </span> 
                      {log.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl transform transition-transform hover:scale-[1.02]`}>
    <p className="text-white/70 text-sm font-medium">{title}</p>
    <p className="text-3xl font-bold text-white mt-1">{value}</p>
  </div>
);

export default AdminDashboard;