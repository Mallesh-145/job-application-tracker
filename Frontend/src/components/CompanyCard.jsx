import { useNavigate } from 'react-router-dom'

function CompanyCard({ company, onDelete, onEdit }) {
  const navigate = useNavigate()
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;

  const handleCardClick = () => {
    navigate(`/company/${company.id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
    >
  
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
        <button 
          onClick={onEdit}
          className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
          title="Edit Company"
        >
          ✏️
        </button>
        <button 
          onClick={onDelete}
          className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
          title="Delete Company"
        >
          🗑️
        </button>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors pr-16">
            {company.name}
          </h3>
          
          {company.address && (
            <a 
              href={mapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} 
              className="text-gray-500 text-xs mt-1 hover:text-indigo-500 flex items-center gap-1 transition-colors z-10 relative"
            >
              📍 {company.address}
            </a>
          )}
        </div>
      </div>
      
      {company.website_url && (
        <a 
          href={company.website_url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} 
          className="text-indigo-500 text-sm font-medium hover:text-indigo-700 flex items-center gap-1 mb-6 w-fit z-10 relative"
        >
          🌐 Visit Website →
        </a>
      )}

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
          View Details
        </span>
        <span className="text-gray-300 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1 duration-300">
          →
        </span>
      </div>
    </div>
  );
}

export default CompanyCard;