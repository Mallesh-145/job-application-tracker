import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function AddContactModal({ isOpen, onClose, companyId, onContactAdded }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const newContact = {
      company_id: companyId,
      name,
      email,
      phone
    }

    try {
      const response = await fetch('https://job-application-tracker-3n97.onrender.com/api/contacts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newContact),
      })

      if (response.ok) {
        toast.success("New Contact Added")
        setName(''); setEmail(''); setPhone('')
        onContactAdded() 
        onClose()
      } else {
        toast.error("Failed to add contact")
      }
    } catch (error) {
      toast.error("Error occurred while adding contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Contact</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Full Name *</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="e.g. Jane Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Email Address</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="jane@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Phone Number</label>
            <input 
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-900/50 shadow-lg shadow-indigo-500/20 font-semibold transition-all">
              {isSubmitting ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddContactModal