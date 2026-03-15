const PurgeConfirmModal = ({ isOpen, onClose, onConfirm, range }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-rose-500">⚠️</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">Delete Audit Logs?</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You are about to permanently delete all system logs from 
          <span className="text-white font-mono px-2"> {range.start} </span> to 
          <span className="text-white font-mono px-2"> {range.end} </span>.
          <br /><br />
          This action <span className="text-rose-400 font-bold uppercase">cannot be undone</span>.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20"
          >
            Yes, Purge
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurgeConfirmModal;