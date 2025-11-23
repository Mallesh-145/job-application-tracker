import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

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
          'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        onApplicationUpdated() 
        onClose()
      } else {
        alert("Failed to update application")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error updating application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Application</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input 
              type="text" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
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
            <label className="block text-sm font-medium text-gray-700">Job URL</label>
            <input 
              type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              value={notes} onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 border p-2"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {isSubmitting ? 'Update' : 'Update Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditApplicationModal