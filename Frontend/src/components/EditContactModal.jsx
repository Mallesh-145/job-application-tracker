import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function EditContactModal({ isOpen, onClose, contact, onContactUpdated }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (contact) {
      setName(contact.name || '')
      setEmail(contact.email || '')
      setPhone(contact.phone || '')
    }
  }, [contact, isOpen])

  if (!isOpen || !contact) return null;

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const updatedContact = { name, email, phone }

    try {
      const response = await fetch(`https://job-application-tracker-3n97.onrender.com/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedContact),
      })

      if (response.ok) {
        toast.success("Contact Updated!")
        onContactUpdated()
        onClose()
      } else {
        toast.error("Failed to update contact")
      }
    } catch (error) {
      toast.error("Connection Error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Contact</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Full Name *</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Email Address</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2">Phone Number</label>
            <input 
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-300 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-900/50 shadow-lg shadow-indigo-500/20 font-semibold transition-all">
              {isSubmitting ? 'Updating...' : 'Update Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditContactModal