import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import DeleteConfirmModal from './DeleteConfirmModal'
import toast from 'react-hot-toast' 

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
        headers : { 'Authorization': `Bearer ${token}` }
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

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Only PDF files are allowed.")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${applicationId}/resumes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        toast.success("Resume uploaded successfully!")
        setSelectedFile(null) 
        document.getElementById('fileInput').value = ""
        fetchResumes() 
      } else {
        toast.error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("An error occurred during upload")
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
        toast.success("Resume deleted")
        fetchResumes() 
      } else {
        toast.error("Delete failed")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Connection error")
    } finally {
        setDeleteModal({ show: false, id: null })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">Resumes for: <span className="text-indigo-400">{jobTitle}</span></h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
        </div>

        <form onSubmit={handleUpload} className="mb-8 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
          <label className="block text-sm font-semibold text-indigo-200 mb-3">Upload New Resume (PDF Only)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              id="fileInput"
              type="file" 
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all cursor-pointer"
            />
            <button 
              type="submit" 
              disabled={!selectedFile || isUploading}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all whitespace-nowrap"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xs font-bold text-indigo-300 mb-4 uppercase tracking-widest">Attached Files</h3>
          {resumes.length === 0 ? (
            <div className="text-center py-8 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
              <p className="text-sm text-slate-500 italic">No resumes uploaded yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {resumes.map(resume => (
                <li key={resume.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-indigo-500/50 transition-all group">
                  
                  {/* File Info */}
                  <div className="truncate max-w-[65%] flex items-center gap-3">
                    <span className="text-2xl opacity-70">📄</span>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-slate-100 truncate" title={resume.filename || resume.path}>
                        {(resume.filename || resume.path).split(/[\\/]/).pop().split('_').slice(0, 2).join('_')}...pdf 
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
                        {new Date(resume.upload_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <a 
                      href={`https://job-application-tracker-3n97.onrender.com/api/resumes/${resume.id}/download`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 text-indigo-400 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-all"
                      title="View PDF"
                    >
                      👁️
                    </a>

                    <button 
                      onClick={() => openDeleteConfirm(resume.id)}
                      className="p-2.5 text-rose-400 bg-rose-500/10 rounded-xl hover:bg-rose-500/20 transition-all"
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