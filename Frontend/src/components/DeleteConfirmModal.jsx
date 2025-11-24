function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100">
        
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 mb-4">
          <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-indigo-200 mb-6">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal