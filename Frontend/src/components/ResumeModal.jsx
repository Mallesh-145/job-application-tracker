import { useState, useEffect } from 'react'

function ResumeModal({ isOpen, onClose, applicationId, jobTitle }) {
  const [resumes, setResumes] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // 1. Fetch existing resumes when the modal opens
  useEffect(() => {
    if (isOpen && applicationId) {
      fetchResumes()
    }
  }, [isOpen, applicationId])

  const fetchResumes = async () => {
    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${applicationId}/resumes`)
      if (res.ok) {
        const data = await res.json()
        setResumes(data)
      }
    } catch (error) {
      console.error("Error fetching resumes:", error)
    }
  }

  // 2. Handle File Upload
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    
    // Create a FormData object (Required for sending files!)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/applications/${applicationId}/resumes`, {
        method: 'POST',
        // Note: No Content-Type header here. fetch adds it automatically for FormData
        body: formData,
      })

      if (res.ok) {
        setSelectedFile(null) // Clear input
        // Reset the file input manually
        document.getElementById('fileInput').value = ""
        fetchResumes() // Refresh list
      } else {
        alert("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  // 3. Handle Delete
  const handleDelete = async (resumeId) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const res = await fetch(`https://job-application-tracker-3n97.onrender.com/api/resumes/${resumeId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchResumes() // Refresh list
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Resumes for: {jobTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Upload Section */}
        <form onSubmit={handleUpload} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Resume (PDF/Doc)</label>
          <div className="flex gap-2">
            <input 
              id="fileInput"
              type="file" 
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button 
              type="submit" 
              disabled={!selectedFile || isUploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isUploading ? '...' : 'Upload'}
            </button>
          </div>
        </form>

        {/* List Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Attached Files</h3>
          {resumes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No resumes uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {resumes.map(resume => (
                <li key={resume.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                  <div className="truncate max-w-[70%]">
                    {/* We only show the filename part of the path for cleanliness */}
                    <p className="text-sm text-gray-800 truncate">
                      📄 {resume.path.split(/[\\/]/).pop()} 
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(resume.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(resume.id)}
                    className="text-red-500 text-xs hover:underline hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeModal