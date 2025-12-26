import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function AddApplicationModal({ isOpen, onClose, companyId, onApplicationAdded }) {
  const { token } = useAuth()
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('To Apply')
  const [jobUrl, setJobUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newApplication = {
      company_id: companyId, 
      job_title: jobTitle,
      status: status,
      job_url: jobUrl,
      notes: notes,
      application_date: date || null 
    }

    try {
      const response = await fetch('https://job-application-tracker-3n97.onrender.com/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(newApplication),
      })

      if (response.ok) {
        toast.success("New Application Added")
        setJobTitle(''); setStatus('To Apply'); setJobUrl(''); setNotes(''); setDate('')
        onApplicationAdded() 
        onClose()
      } else {
        toast.error("Failed to add application")
      }
    } catch (error) {
      toast.error("Error Occurred while adding application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Track New Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Job Title *</label>
            <input 
              type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-2">Status</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer"
              >
                <option value="To Apply" className="bg-slate-800 text-white">To Apply</option>
                <option value="Applied" className="bg-slate-800 text-white">Applied</option>
                <option value="Interviewing" className="bg-slate-800 text-white">Interviewing</option>
                <option value="Offer" className="bg-slate-800 text-white">Offer</option>
                <option value="Rejected" className="bg-slate-800 text-white">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-2">Date Applied</label>
              <input 
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Job Posting URL</label>
            <input 
              type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="https://linkedin.com/jobs/..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Notes</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="Referral from..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-900/50 shadow-lg shadow-indigo-500/20 font-semibold transition-all">
              {isSubmitting ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddApplicationModal