import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import CompanyCard from '../components/CompanyCard'
import AddCompanyModal from '../components/AddCompanyModal'
import EditCompanyModal from '../components/EditCompanyModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

function Home() {
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null })

  const { token, logout } = useAuth()

  useEffect(() => {
    fetchCompanies()
  }, [token])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://job-application-tracker-3n97.onrender.com/api/companies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        logout()
        return
      }

      if (!response.ok) throw new Error('Failed to connect to server')
      
      const data = await response.json()
      setCompanies(data)
      setIsLoading(false)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  // Filter companies based on search
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCompanyAdded = () => {
    fetchCompanies()
    toast.success("Company added successfully!")
  }

  const confirmDelete = (id, e) => {
    e.stopPropagation() 
    setDeleteModal({ show: true, id })
  }

  const executeDelete = async () => {
    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${deleteModal.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        toast.success("Company deleted successfully!")
        fetchCompanies()
      } else {
        toast.error("Failed to delete company.")
      }
    } catch (error) {
      console.error("Error deleting:", error)
      toast.error("Error deleting company.")
    } finally {
      setDeleteModal({ show: false, id: null})
    }
  }

  const openEditModal = (company, e) => {
    e.stopPropagation()
    setEditingCompany(company)
    setIsEditModalOpen(true)
  }

  const handleCompanyUpdated = () => {
    fetchCompanies()
    // toast.success("Company updated successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto mt-12 px-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              My Applications
            </h1>
            <p className="text-indigo-200 mt-2 text-lg font-medium">Track your journey to your dream job.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 active:scale-95 border border-white/10"
          >
            + Add Company
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/10 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 focus:ring-0 sm:text-sm transition-colors"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
             <div className="text-indigo-400 font-bold animate-pulse text-lg">Loading your dashboard...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-200 px-6 py-4 rounded-xl mb-6">
            <strong>Error:</strong> {error} - Is your Flask server running?
          </div>
        )}

        {/* Content State */}
        {!isLoading && !error && (
          <>
            {filteredCompanies.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 text-center shadow-xl">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {searchQuery ? "No companies found" : "No companies tracked yet"}
                </h3>
                <p className="text-indigo-200 mb-6">
                  {searchQuery ? "Try a different search term." : "Start your journey by adding your first target company."}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-400 font-bold hover:text-blue-300 hover:underline"
                  >
                    Add a Company now &rarr;
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCompanies.map((company) => (
                  <CompanyCard 
                    key={company.id} 
                    company={company} 
                    onDelete={(e) => confirmDelete(company.id, e)}
                    onEdit={(e) => openEditModal(company, e)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <AddCompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCompanyAdded={handleCompanyAdded}
      />

      <EditCompanyModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        company={editingCompany}
        onCompanyUpdated={handleCompanyUpdated}
      />

      <DeleteConfirmModal 
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        onConfirm={executeDelete}
        title="Delete Company?"
        message="This will permanently delete the company and all related applications. This action cannot be undone."
      />
    </div>
  )
}

export default Home