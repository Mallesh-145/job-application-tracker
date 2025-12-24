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
        setJobTitle('')
        setStatus('To Apply')
        setJobUrl('')
        setNotes('')
        setDate('')
        
        onApplicationAdded() 
        onClose()
      } else {
        toast.error("Failed to add application")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error Occured while adding application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Track New Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title *</label>
            <input 
              type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
              >
                <option>To Apply</option>
                <option>Applied</option>
                <option>Interviewing</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Applied</label>
              <input 
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Posting URL</label>
            <input 
              type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
              placeholder="https://linkedin.com/jobs/..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
              placeholder="Referral from..."
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
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