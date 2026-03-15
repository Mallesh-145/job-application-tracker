import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import PurgeConfirmModal from '../components/PurgeConfirmModal';
import PurgeSuccessModal from '../components/PurgeSuccessModal';
const API_BASE = import.meta.env.VITE_API_BASE || "https://job-application-tracker-3n97.onrender.com";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, systemActivity: 0 });
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ start: '', end: '' });
  const [isPurging, setIsPurging] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [purgeResult, setPurgeResult] = useState({ count: 0, start: '', end: '' });

  // --- Data Fetching Logic ---
  const fetchAdminData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Parallel fetching for performance
      const [usersRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, { headers }),
        fetch(`${API_BASE}/api/admin/logs`, { headers })
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
    
    const interval = setInterval(fetchAdminData, 60000); 
    return () => clearInterval(interval);
  }, [token]);

  // --- Action Handlers ---
  const handleExportLogs = async () => {
    try {
      toast.loading("Preparing CSV...", { id: 'export' });
      const response = await fetch(`${API_BASE}/api/admin/export-logs`, {
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

    // Feature 1: Export PDF between dates
  const handleExportPDF = async () => {
    if (!range.start || !range.end) return toast.error("Please select a date range first");
    
    try {
      toast.loading("Generating PDF Report...", { id: 'pdf' });
      const response = await fetch(`${API_BASE}/api/admin/logs/pdf?start=${range.start}&end=${range.end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${range.start}_to_${range.end}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("PDF Report downloaded!", { id: 'pdf' });
    } catch (error) {
      toast.error("PDF Export failed.", { id: 'pdf' });
    }
  };

  // Feature 2 & 3: Selective Purge between dates
 // This only triggers the modal
  const triggerPurgeConfirmation = () => {
    if (!range.start || !range.end) return toast.error("Select range to purge");
    setIsConfirmModalOpen(true);
  };

  const executePurge = async () => {
    setIsConfirmModalOpen(false); 
    setIsPurging(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs/purge?start=${range.start}&end=${range.end}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPurgeResult({ count: data.count, start: range.start, end: range.end });
        setIsSuccessModalOpen(true); 
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Purge failed");
    } finally {
      setIsPurging(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
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
    <div className="min-h-screen bg-slate-900 p-8 pt-6 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Stats Overview --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} color="from-blue-500 to-indigo-600" />
          <StatCard title="System Activity" value={stats.systemActivity} color="from-purple-500 to-pink-600" />
          <StatCard title="Platform Status" value="Healthy" color="from-emerald-500 to-teal-600" />
        </div>

        {/* --- Maintenance Control Center --- */}
        <div className="bg-gradient-to-r from-slate-800 to-indigo-950/30 rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">🛠️ Maintenance Control</h2>
              <p className="text-slate-400 text-sm mt-1">Select a range to archive or securely purge system data.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-indigo-400 mb-1">From</label>
                <input 
                  type="date" 
                  value={range.start} 
                  onChange={(e) => setRange({...range, start: e.target.value})}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-indigo-400 mb-1">To</label>
                <input 
                  type="date" 
                  value={range.end} 
                  onChange={(e) => setRange({...range, end: e.target.value})}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>
              
              <div className="flex gap-2 mt-4 md:mt-0">
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                >
                  📄 Export PDF
                </button>
                <button 
                  onClick={triggerPurgeConfirmation}
                  disabled={isPurging}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/50 text-rose-400 hover:text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                >
                  {isPurging ? 'Purging...' : '🗑️ Purge Range'}
                </button>
              </div>
            </div>
          </div>
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
      <PurgeConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executePurge}
        range={range}
      />
      <PurgeSuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)}
        stats={purgeResult} 
      />
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