import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DeleteConfirmModal from './DeleteConfirmModal'

function ResumeModal({ isOpen, onClose, applicationId, jobTitle }) {
  const { token } = useAuth()
  const [resumes, setResumes] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchResumes()
    }
  }, [isOpen, applicationId])

  const fetchResumes = async () => {
    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${applicationId}/resumes`, {
        headers : {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setResumes(data)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
    }
  }
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    if (!selectedFile.name.toLowerCase().endswith('.pdf')) {
      alert("Only PDF files are allowed. Please convert your document to PDF and try again.")
      return
    }

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${applicationId}/resumes`, {
        method: 'POST',
        headers: { 
        'Authorization': `Bearer ${token}` 
      },
        body: formData,
      })

      if (res.ok) {
        setSelectedFile(null) 
        document.getElementById('fileInput').value = ""
        fetchResumes() 
      } else {
        alert("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const openDeleteConfirm = (resumeId) => {
    setDeleteModal({ show: true, id: resumeId })
  }

  const executeDelete = async () => {
    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/resumes/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        fetchResumes() 
      }
    } catch (error) {
      console.error("Delete error:", error)
    } finally {
        setDeleteModal({ show: false, id: null })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Resumes for: {jobTitle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>

        {/* Upload Section */}
        <form onSubmit={handleUpload} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload New Resume (PDF Only)</label>
          <div className="flex gap-3">
            <input 
              id="fileInput"
              type="file" 
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors cursor-pointer"
            />
            <button 
              type="submit" 
              disabled={!selectedFile || isUploading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? '...' : 'Upload'}
            </button>
          </div>
        </form>

        {/* List Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Attached Files</h3>
          {resumes.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">No resumes uploaded yet.</p>
          ) : (
            <ul className="space-y-3">
              {resumes.map(resume => (
                <li key={resume.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors">
                  
                  {/* File Info */}
                  <div className="truncate max-w-[50%] flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate" title={resume.filename || resume.path}>
                       {(resume.filename || resume.path).split(/[\\/]/).pop().split('_').slice(0, 2).join('_')}...pdf 
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(resume.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* VIEW BUTTON */}
                    <a 
                      href={`https://job-application-tracker-3n97.onrender.com/api/resumes/${resume.id}/download`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                      title="View PDF"
                    >
                      👁️
                    </a>

                    {/* DELETE BUTTON */}
                    <button 
                      onClick={() => openDeleteConfirm(resume.id)}
                      className="p-2 text-rose-600 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
                      title="Delete File"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DeleteConfirmModal 
            isOpen={deleteModal.show}
            onClose={() => setDeleteModal({ show: false, id: null })}
            onConfirm={executeDelete}
            title="Delete Resume?"
            message="Are you sure you want to delete this resume? This cannot be undone."
        />
      </div>
    </div>
  )
}

export default ResumeModal