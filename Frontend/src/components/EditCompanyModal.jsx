import { useState, useEffect } from 'react'

function EditCompanyModal({ isOpen, onClose, company, onCompanyUpdated }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill the form
  useEffect(() => {
    if (company) {
      setName(company.name || '')
      setAddress(company.address || '')
      setWebsiteUrl(company.website_url || '')
    }
  }, [company, isOpen])

  if (!isOpen || !company) return null;

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const updatedCompany = { name, address, website_url: websiteUrl }

    try {
      // NOTICE: Using PUT and the company.id
      const response = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCompany),
      })

      if (response.ok) {
        onCompanyUpdated()
        onClose()
      } else {
        alert("Failed to update company")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error updating company")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Company</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
            <input 
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input 
              type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
            <input 
              type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCompanyModal