import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function EditCompanyModal({ isOpen, onClose, company, onCompanyUpdated }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (company) {
      setName(company.name || '')
      setAddress(company.address || '')
      setWebsiteUrl(company.website_url || '')
    }
  }, [company, isOpen])

  if (!isOpen || !company) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${company.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, address, website_url: websiteUrl }),
      })

      if (res.ok) {
        toast.success("Company updated!")
        onCompanyUpdated()
        onClose()
      } else {
        toast.error("Update failed")
      }
    } catch (error) {
      toast.error("Connection error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Company</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Company Name *</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Address</label>
            <input 
              type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Website URL</label>
            <input 
              type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 font-medium transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-900/50 shadow-lg shadow-indigo-500/20 font-semibold transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCompanyModal