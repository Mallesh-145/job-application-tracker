import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import CompanyCard from '../components/CompanyCard'
import AddCompanyModal from '../components/AddCompanyModal'
import EditCompanyModal from '../components/EditCompanyModal' // <-- 1. New Import

function Home() {
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) // <-- 2. New State
  const [editingCompany, setEditingCompany] = useState(null)    // <-- 2. New State

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('https://job-application-tracker-3n97.onrender.com/api/companies')
      if (!response.ok) throw new Error('Failed to connect to server')
      const data = await response.json()
      setCompanies(data)
      setIsLoading(false)
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const handleCompanyAdded = () => {
    fetchCompanies()
  }

  // --- 3. New Helper Functions (Delete & Edit) ---
  const handleDeleteCompany = async (id, e) => {
    e.stopPropagation() // Stop the click from opening the details page
    if (!window.confirm("Delete this company? All applications and data will be lost.")) return

    try {
      await fetch(`https://job-application-tracker-3n97.onrender.com/api/companies/${id}`, { method: 'DELETE' })
      fetchCompanies() // Refresh the list
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const openEditModal = (company, e) => {
    e.stopPropagation() // Stop the click from opening the details page
    setEditingCompany(company)
    setIsEditModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto mt-12 px-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
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
            {companies.length === 0 ? (
              // Modern Empty State
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 text-center shadow-xl">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-white mb-2">No companies tracked yet</h3>
                <p className="text-indigo-200 mb-6">Start your journey by adding your first target company.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-400 font-bold hover:text-blue-300 hover:underline"
                >
                  Add a Company now &rarr;
                </button>
              </div>
            ) : (
              // 4. THE UPDATED GRID LAYOUT
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {companies.map((company) => (
                  <CompanyCard 
                    key={company.id} 
                    company={company} 
                    onDelete={(e) => handleDeleteCompany(company.id, e)}
                    onEdit={(e) => openEditModal(company, e)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Company Modal */}
      <AddCompanyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCompanyAdded={handleCompanyAdded}
      />

      {/* 5. The New Edit Company Modal */}
      <EditCompanyModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        company={editingCompany}
        onCompanyUpdated={fetchCompanies}
      />
    </div>
  )
}

export default Home