import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' 
import Navbar from '../components/Navbar'
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
        if (companyRes.status === 401) { logout(); return; }
        if (!companyRes.ok) throw new Error('Company not found')
        const companyData = await companyRes.json()
        const appsData = await appsRes.json()
        const contactsData = await contactsRes.json()
        setCompany(companyData)
        setApplications(appsData)
        setContacts(contactsData)
        setIsLoading(false)
      } catch (err) {
        setError(err.message)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, token])

  const refreshApplications = async () => {
    const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setApplications(data)
  }

  const refreshContacts = async () => {
    const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setContacts(data)
  }

  const getDaysSince = (dateString) => {
    if (!dateString) return null;
    const appliedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appliedDate.setHours(0, 0, 0, 0);
    const diffTime = today - appliedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays < 0) return "Future"
    return diffDays;
  };

  const openDeleteModal = (itemId, itemType) => {
    setDeleteModal({ show: true, id: itemId, type: itemType });
  }

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
        const itemLabel = type === 'application' ? "Application" : "Contact";
        toast.success(`${itemLabel} deleted successfully!`);
      }
      
      if (type === 'application') refreshApplications();
      else refreshContacts();
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete item")
    } finally {
      setDeleteModal({ show: false, id: null, type: null });
    }
  }

  const openEditModal = (application) => {
    setEditingApplication(application)
    setIsEditModalOpen(true)
  }

  const openResumeModal = (appId, jobTitle) => {
    setSelectedAppId(appId)
    setSelectedJobTitle(jobTitle)
    setIsResumeModalOpen(true)
  }

  const openEditContactModal = (contact) => {
    setEditingContact(contact)
    setIsEditContactModalOpen(true)
  }

  if (isLoading) return <div className="min-h-screen bg-slate-900 p-8 text-center flex items-center justify-center"><div className="text-indigo-400 font-bold animate-pulse">Loading Details...</div></div>
  if (error) return <div className="min-h-screen bg-slate-900 p-8 text-center text-rose-400">Error: {error}</div>

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"> 
      <main className="max-w-6xl mx-auto mt-10 px-6">
        <Link to="/" className="text-indigo-300 hover:text-white mb-6 inline-flex items-center gap-2 font-medium transition-colors">
          &larr; Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight mb-3 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                {company.name}
              </h1>
              <div className="flex flex-col gap-2 text-gray-600 mt-2">
                {company.address && <span className="flex items-center gap-2">📍 {company.address}</span>}
                {company.website_url && (
                  <a href={company.website_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium flex items-center gap-2">
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">Job Applications</h2>
              <button onClick={() => setIsAppModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">
                + Add Application
              </button>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center text-indigo-200 italic">
                  No applications tracked yet. Time to apply! 🚀
                </div>
              ) : (
                applications.map(app => {
                  const daysSince = getDaysSince(app.application_date);
                  
                  return (
                    <div key={app.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">{app.job_title}</h3>
                          {app.job_url && (
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 text-xs font-medium hover:underline block mt-1">🔗 View Job Posting</a>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-sm text-gray-400 font-medium">
                                Applied: {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'N/A'}
                            </p>
                            {daysSince !== null && daysSince !== "Future" && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter
                                ${daysSince > 14 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-500'}`}>
                                {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                                </span>
                            )}
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${app.status === 'Applied' ? 'bg-amber-100 text-amber-700' : 
                            app.status === 'Interviewing' ? 'bg-violet-100 text-violet-700' : 
                            app.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                            app.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'To Apply' ? 'bg-sky-100 text-sky-700' :
                            app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                          {app.status}
                        </span>
                      </div>
                      {app.notes && <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600 text-sm italic">"{app.notes}"</div>}
                      <div className="mt-5 flex gap-3 pt-4 border-t border-gray-50">
                        <button onClick={() => openResumeModal(app.id, app.job_title)} className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">📂 Resumes</button>
                        <div className="h-4 w-px bg-gray-200 self-center"></div>
                        <button onClick={() => openEditModal(app)} className="text-sm text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors">✏️ Edit</button>
                        <button onClick={() => openDeleteModal(app.id, 'application')} className="text-sm text-gray-400 hover:text-rose-600 font-medium flex items-center gap-1 ml-auto transition-colors">🗑️ Delete</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Contacts Column */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white tracking-tight">Contacts</h2>
              <button onClick={() => setIsContactModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300">+ Add Contact</button>
            </div>

            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center text-indigo-200 italic">No contacts saved.</div>
              ) : (
                contacts.map(contact => (
                  <div key={contact.id} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">{contact.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-gray-800">{contact.name}</p>
                        {contact.email && <p className="text-sm text-indigo-500 font-medium">{contact.email}</p>}
                        {contact.phone && <p className="text-sm text-gray-400">{contact.phone}</p>}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openEditContactModal(contact)} className="text-gray-400 hover:text-indigo-600 p-1">✏️</button>
                      <button onClick={() => openDeleteModal(contact.id, 'contact')} className="text-gray-400 hover:text-rose-500 p-1">✕</button>
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
      
      <DeleteConfirmModal 
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null, type: null })}
        onConfirm={handleExecuteDelete}
        title={deleteModal.type === 'application' ? "Delete Application?" : "Delete Contact?"}
        message={deleteModal.type === 'application' 
          ? "This will permanently remove this job application from the company records."
          : "Are you sure you want to remove this contact person?"}
      />
    </div>
  )
}

export default CompanyPage