import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { notesApi } from '../../api/notes';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';

function VersionHistory({ noteId, onRevert, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revertLoading, setRevertLoading] = useState(false);
  
  // Fetch version history on component mount
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setLoading(true);
        const fetchedVersions = await notesApi.getNoteVersions(noteId);
        setVersions(fetchedVersions);
        setError(null);
      } catch (err) {
        setError('Failed to load version history');
        // Only log in development
        if (process.env.NODE_ENV !== 'production') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [noteId]);

  // Handle revert to version
  const handleRevert = async (versionId) => {
    try {
      setRevertLoading(true);
      
      // Skip API call if trying to "revert" to current version
      if (versionId === 'current') {
        toast.success('Already on current version');
        setRevertLoading(false);
        return;
      }
      
      const updatedNote = await notesApi.revertToVersion(noteId, versionId);
      toast.success('Note reverted successfully!');
      onRevert(updatedNote);
    } catch (err) {
      toast.error('Failed to revert to version');
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        console.error(err);
      }
    } finally {
      setRevertLoading(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm:ss a');
  };

  // Compare version content
  const compareContent = (index) => {
    if (index === versions.length - 1) return null; // Last version has nothing to compare with
    
    const currentVersion = versions[index];
    const nextVersion = versions[index + 1]; // Versions are in descending order (newest first)
    
    // Skip comparison if either version doesn't have proper content
    if (!currentVersion || !nextVersion) return null;
    
    const titleChanged = currentVersion.title !== nextVersion.title;
    const contentChanged = currentVersion.description !== nextVersion.description;
    
    return {
      titleChanged,
      contentChanged
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Version History</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      {loading ? (
        <div className="py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No version history available</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {versions.map((version, index) => {
            const changes = compareContent(index);
            return (
              <div 
                key={version.id} 
                className={`border rounded-lg p-4 ${version.isCurrent ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <HiOutlineCalendar className="mr-1" />
                      <span>{formatDate(version.createdAt)}</span>
                    </div>
                    <h3 className="font-medium">
                      {version.isCurrent ? 'Current Version' : `Version ${versions.length - index - 1}`}
                    </h3>
                  </div>
                  
                  {!version.isCurrent && (
                    <button
                      onClick={() => handleRevert(version.id)}
                      disabled={revertLoading}
                      className="text-primary-600 hover:text-primary-800 flex items-center text-sm"
                      title="Revert to this version"
                    >
                      <HiOutlineClock className="mr-1" />
                      Revert to this version
                    </button>
                  )}
                </div>
                
                {changes && (
                  <div className="text-sm mt-2 text-gray-600">
                    <p>
                      Changes from previous version: 
                      {changes.titleChanged && changes.contentChanged 
                        ? ' Title and content modified' 
                        : changes.titleChanged 
                          ? ' Title modified' 
                          : changes.contentChanged 
                            ? ' Content modified' 
                            : ' No changes detected'}
                    </p>
                  </div>
                )}
                
                <div className="mt-3 bg-white border border-gray-100 rounded p-2">
                  <div className="font-medium">{version.title}</div>
                  <div className="text-sm mt-1 text-gray-600 line-clamp-2">
                    {version.description.length > 150 
                      ? `${version.description.substring(0, 150)}...` 
                      : version.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VersionHistory; 