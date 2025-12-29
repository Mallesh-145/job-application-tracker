import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 
import AddApplicationModal from '../components/AddApplicationModal'
import AddContactModal from '../components/AddContactModal'
import ResumeModal from '../components/ResumeModal'
import EditApplicationModal from '../components/EditApplicationModal'
import EditContactModal from '../components/EditContactModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal' 
import toast from 'react-hot-toast' 

function CompanyPage() {
  const { id } = useParams()
  const { token, logout } = useAuth() 
  const [company, setCompany] = useState(null)
  const [applications, setApplications] = useState([]) 
  const [contacts, setContacts] = useState([])          
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isAppModalOpen, setIsAppModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [selectedJobTitle, setSelectedJobTitle] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: null })

  // --- API Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      const authHeaders = { 'Authorization': `Bearer ${token}` }
      try {
        const [companyRes, appsRes, contactsRes] = await Promise.all([
          fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}`, { headers: authHeaders }),
          fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/applications`, { headers: authHeaders }),
          fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/contacts`, { headers: authHeaders })
        ])

        // Handle Session Expiry
        if (companyRes.status === 401) { logout(); return; }
        
        if (!companyRes.ok) throw new Error('Company not found')
        
        const companyData = await companyRes.json()
        const appsData = await appsRes.json()
        const contactsData = await contactsRes.json()
        
        setCompany(companyData)
        setApplications(appsData)
        setContacts(contactsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, token, logout])

  // --- Utility Refreshers ---
  const refreshApplications = async () => {
    const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.status === 401) return logout();
    const data = await res.json()
    setApplications(data)
  }

  const refreshContacts = async () => {
    const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.status === 401) return logout();
    const data = await res.json()
    setContacts(data)
  }

  // --- Handlers ---
  const getDaysSince = (dateString) => {
    if (!dateString) return null;
    const appliedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appliedDate.setHours(0, 0, 0, 0);
    const diffTime = today - appliedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays < 0 ? "Future" : diffDays;
  };

  const handleExecuteDelete = async () => {
    const { id: itemId, type } = deleteModal;
    const url = type === 'application' 
      ? `https://job-application-tracker-3n97.onrender.com/api/applications/${itemId}`
      : `https://job-application-tracker-3n97.onrender.com/api/contacts/${itemId}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success(`${type === 'application' ? "Application" : "Contact"} deleted successfully!`);
        if (type === 'application') refreshApplications();
        else refreshContacts();
      }
    } catch (error) {
      toast.error("Failed to delete item")
    } finally {
      setDeleteModal({ show: false, id: null, type: null });
    }
  }

  const openEditModal = (application) => { setEditingApplication(application); setIsEditModalOpen(true); }
  const openResumeModal = (appId, jobTitle) => { setSelectedAppId(appId); setSelectedJobTitle(jobTitle); setIsResumeModalOpen(true); }
  const openEditContactModal = (contact) => { setEditingContact(contact); setIsEditContactModalOpen(true); }
  const openDeleteModal = (itemId, itemType) => { setDeleteModal({ show: true, id: itemId, type: itemType }); }

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-indigo-400 font-bold animate-pulse">Loading Company Details...</div></div>
  if (error || !company) return <div className="min-h-screen bg-slate-900 p-8 text-center text-rose-400">Error: {error || 'Company not found'}</div>

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"> 
      <main className="max-w-6xl mx-auto px-6">
        <Link to="/" className="text-indigo-300 hover:text-white mb-6 inline-flex items-center gap-2 font-medium transition-colors">
          &larr; Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 mb-10 border border-white/20">
          <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            {company.name}
          </h1>
          <div className="flex flex-col gap-2 text-slate-600">
            {company.address && <span className="flex items-center gap-2">📍 {company.address}</span>}
            {company.website_url && (
              <a href={company.website_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium flex items-center gap-2">
                🌐 Visit Website
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Job Applications</h2>
              <button onClick={() => setIsAppModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-all">
                + Add Application
              </button>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center text-indigo-200">
                  No applications tracked yet.
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-slate-800">{app.job_title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-slate-400">
                            Applied: {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'N/A'}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${getDaysSince(app.application_date) > 14 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-500'}`}>
                            {getDaysSince(app.application_date) === 0 ? 'Today' : `${getDaysSince(app.application_date)}d ago`}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {app.status}
                      </span>
                    </div>
                    {app.notes && <div className="mt-4 bg-slate-50 p-3 rounded-lg text-slate-600 text-sm italic">"{app.notes}"</div>}
                    <div className="mt-5 flex gap-4 pt-4 border-t border-slate-50">
                      <button onClick={() => openResumeModal(app.id, app.job_title)} className="text-sm text-slate-500 hover:text-indigo-600">📂 Resumes</button>
                      <button onClick={() => openEditModal(app)} className="text-sm text-slate-500 hover:text-blue-600">✏️ Edit</button>
                      <button onClick={() => openDeleteModal(app.id, 'application')} className="text-sm text-slate-400 hover:text-rose-600 ml-auto">🗑️ Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contacts Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Contacts</h2>
              <button onClick={() => setIsContactModalOpen(true)} className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/20 transition-all">
                + Add Contact
              </button>
            </div>

            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-6 text-center text-indigo-200 text-sm">No contacts saved.</div>
              ) : (
                contacts.map(contact => (
                  <div key={contact.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 relative group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">{contact.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-800">{contact.name}</p>
                        <p className="text-xs text-indigo-500">{contact.email}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditContactModal(contact)} className="text-slate-400 hover:text-indigo-600">✏️</button>
                      <button onClick={() => openDeleteModal(contact.id, 'contact')} className="text-slate-400 hover:text-rose-500">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddApplicationModal isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} companyId={id} onApplicationAdded={refreshApplications} />
      <AddContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} companyId={id} onContactAdded={refreshContacts} />
      <ResumeModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} applicationId={selectedAppId} jobTitle={selectedJobTitle} />
      <EditApplicationModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} application={editingApplication} onApplicationUpdated={refreshApplications} />
      <EditContactModal isOpen={isEditContactModalOpen} onClose={() => setIsEditContactModalOpen(false)} contact={editingContact} onContactUpdated={refreshContacts} />
      <DeleteConfirmModal isOpen={deleteModal.show} onClose={() => setDeleteModal({ show: false, id: null, type: null })} onConfirm={handleExecuteDelete} title={`Delete ${deleteModal.type}?`} message={`Are you sure you want to remove this ${deleteModal.type}?`} />
    </div>
  )
}

export default CompanyPage