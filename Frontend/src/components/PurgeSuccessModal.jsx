const PurgeSuccessModal = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl shadow-emerald-500/10 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-emerald-400">✓</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Cleanup Successful!</h2>
        <p className="text-slate-400 text-sm mb-6">
          System optimized. The selected range has been purged from the master logs.
        </p>

        <div className="bg-white/5 rounded-2xl p-4 mb-8 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Records Purged</span>
            <span className="text-emerald-400 font-mono font-bold">{stats.count}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
            <span className="text-slate-500 font-medium">Timeframe</span>
            <span className="text-white font-medium text-[10px]">{stats.start} to {stats.end}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
};

export default PurgeSuccessModal;