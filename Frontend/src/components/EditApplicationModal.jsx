import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast' 

function EditApplicationModal({ isOpen, onClose, application, onApplicationUpdated }) {
  const { token } = useAuth()
  const [jobTitle, setJobTitle] = useState('')
  const [status, setStatus] = useState('To Apply')
  const [jobUrl, setJobUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (application) {
      setJobTitle(application.job_title || '')
      setStatus(application.status || 'To Apply')
      setJobUrl(application.job_url || '')
      setNotes(application.notes || '')
      if (application.application_date) {
        const formattedDate = new Date(application.application_date).toISOString().split('T')[0]
        setDate(formattedDate)
      } else {
        setDate('')
      }
    }
  }, [application, isOpen])

  if (!isOpen || !application) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const updatedData = {
      job_title: jobTitle,
      status: status,
      job_url: jobUrl,
      notes: notes,
      application_date: date || null
    }

    try {
      const response = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${application.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        toast.success("Application updated!") 
        onApplicationUpdated() 
        onClose()
      } else {
        toast.error("Failed to update application")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Connection error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Job Title</label>
            <input 
              type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-2">Status</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all cursor-pointer"
              >
                <option className="bg-slate-900">To Apply</option>
                <option className="bg-slate-900">Applied</option>
                <option className="bg-slate-900">Interviewing</option>
                <option className="bg-slate-900">Offer</option>
                <option className="bg-slate-900">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-200 mb-2">Date Applied</label>
              <input 
                type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Job URL</label>
            <input 
              type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Notes</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 font-semibold transition-all"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditApplicationModal