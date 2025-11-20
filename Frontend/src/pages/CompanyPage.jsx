import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AddApplicationModal from '../components/AddApplicationModal'
import AddContactModal from '../components/AddContactModal'
import ResumeModal from '../components/ResumeModal'
import EditApplicationModal from '../components/EditApplicationModal'
import EditContactModal from '../components/EditContactModal'

function CompanyPage() {
  const { id } = useParams()
  
  // --- State Management ---
  const [company, setCompany] = useState(null)
  const [applications, setApplications] = useState([]) 
  const [contacts, setContacts] = useState([])         
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal States
  const [isAppModalOpen, setIsAppModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [selectedJobTitle, setSelectedJobTitle] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  // --- Fetch All Data on Load ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, appsRes, contactsRes] = await Promise.all([
          fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}`),
          fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/applications`),
          fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/contacts`)
        ])

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
  }, [id])

  // --- Helper Functions ---

  const refreshApplications = async () => {
    const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/applications`)
    const data = await res.json()
    setApplications(data)
  }

  const refreshContacts = async () => {
    const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}/contacts`)
    const data = await res.json()
    setContacts(data)
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

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }
    try {
      const response = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${applicationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        refreshApplications()
      } else {
        alert("Failed to delete application")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error deleting application")
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Delete this contact?")) return;

    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/contacts/${contactId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        refreshContacts() 
      } else {
        alert("Failed to delete contact")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (isLoading) return <div className="min-h-screen bg-slate-900 p-8 text-center flex items-center justify-center"><div className="text-indigo-400 font-bold animate-pulse">Loading Details...</div></div>
  if (error) return <div className="min-h-screen bg-slate-900 p-8 text-center text-rose-400">Error: {error}</div>

  return (
    <div className="min-h-screen pb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar />
      
      <main className="max-w-6xl mx-auto mt-10 px-6">
        {/* Back Button */}
        <Link to="/" className="text-indigo-300 hover:text-white mb-6 inline-flex items-center gap-2 font-medium transition-colors">
          &larr; Back to Dashboard
        </Link>

        {/* Modern Glass Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
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

        {/* Two Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Job Applications Section --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white tracking-tight">Job Applications</h2>
              <button 
                onClick={() => setIsAppModalOpen(true)} 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                + Add Application
              </button>
            </div>

            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center text-indigo-200 italic">
                  No applications tracked yet. Time to apply! 🚀
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {app.job_title}
                        </h3>
                        
                        {app.job_url && (
                          <a 
                             href={app.job_url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-indigo-500 text-xs font-medium hover:underline block mt-1"
                          >
                             🔗 View Job Posting
                          </a>
                        )}
                        
                        <p className="text-sm text-gray-400 mt-2 font-medium">
                          Applied: {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      {/* Modern Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${app.status === 'Applied' ? 'bg-amber-100 text-amber-700' : 
                          app.status === 'Interviewing' ? 'bg-violet-100 text-violet-700' : 
                          app.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                          'bg-gray-100 text-gray-600'}`}>
                        {app.status}
                      </span>
                    </div>

                    {app.notes && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-600 text-sm italic">
                        "{app.notes}"
                      </div>
                    )}
                    
                    <div className="mt-5 flex gap-3 pt-4 border-t border-gray-50">
                      <button 
                          onClick={() => openResumeModal(app.id, app.job_title)}
                          className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors"
                      >
                          📂 Resumes
                      </button>
                      <div className="h-4 w-px bg-gray-200 self-center"></div>
                      <button 
                          onClick={() => openEditModal(app)}
                          className="text-sm text-gray-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                      >
                          ✏️ Edit
                      </button>
                      <button 
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-sm text-gray-400 hover:text-rose-600 font-medium flex items-center gap-1 ml-auto transition-colors"
                      >
                          🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- Contacts Section --- */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white tracking-tight">Contacts</h2>
              
              {/* NEW GRADIENT BUTTON FOR CONTACTS */}
              <button 
                onClick={() => setIsContactModalOpen(true)} 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                + Add Contact
              </button>
            </div>

            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center text-indigo-200 italic">
                  No contacts saved.
                </div>
              ) : (
                contacts.map(contact => (
                  <div key={contact.id} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative">
                    <div className="flex items-center gap-4">
                      {/* Fake Avatar based on name */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                        {contact.name.charAt(0)}
                      </div>
                      
                      <div>
                          <p className="font-bold text-gray-800">{contact.name}</p>
                          {contact.email && <p className="text-sm text-indigo-500 font-medium">{contact.email}</p>}
                          {contact.phone && <p className="text-sm text-gray-400">{contact.phone}</p>}
                      </div>
                    </div>
      
                    {/* Hover Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => openEditContactModal(contact)}
                          className="text-gray-400 hover:text-indigo-600 p-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                          title="Delete"
                        >
                          ✕
                        </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
   
      {/* Modals */}
      <AddApplicationModal 
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        companyId={id}
        onApplicationAdded={refreshApplications}
      />
      <AddContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        companyId={id}
        onContactAdded={refreshContacts}
      />
      <ResumeModal 
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        applicationId={selectedAppId}
        jobTitle={selectedJobTitle}
      />
      <EditApplicationModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        application={editingApplication}
        onApplicationUpdated={refreshApplications}
      />
      <EditContactModal 
        isOpen={isEditContactModalOpen}
        onClose={() => setIsEditContactModalOpen(false)}
        contact={editingContact}
        onContactUpdated={refreshContacts}
      />
    </div>
  )
}

export default CompanyPage