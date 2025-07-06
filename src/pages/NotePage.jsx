import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notesApi } from '../api/notes';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import Spinner from '../components/ui/Spinner';
import NoteLock from '../components/notes/NoteLock';
import VersionHistory from '../components/notes/VersionHistory';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineClock,
  HiLockClosed,
  HiArrowLeft
} from 'react-icons/hi';

function NotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { emitNoteChange } = useSocket();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    isProtected: false,
    password: '',
  });
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch note data on component mount
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const fetchedNote = await notesApi.getNote(id);
        setNote(fetchedNote);
        
        // Initialize edit form with note data
        setEditFormData({
          title: fetchedNote.title,
          description: fetchedNote.description || '',
          isProtected: fetchedNote.isProtected,
          password: '', // Don't populate password for security
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to load note');
        // Only log in development
        if (process.env.NODE_ENV !== 'production') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  // Handle unlocking a protected note
  const handleUnlock = (unlockedNote) => {
    setNote(unlockedNote);
    setEditFormData({
      ...editFormData,
      description: unlockedNote.description,
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle note update submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (editFormData.isProtected && !editFormData.password && !note.isProtected) {
      toast.error('Password is required for protected notes');
      return;
    }
    
    try {
      const updatedNote = await notesApi.updateNote(id, editFormData);
      setNote(updatedNote);
      setIsEditing(false);
      toast.success('Note updated successfully');

      // Emit socket event
      emitNoteChange('update', updatedNote.id, updatedNote.title);
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update note');
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        console.error(err);
      }
    }
  };

  // Handle note deletion
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      // Parse ID as integer to ensure it's a valid format for the API
      const noteId = parseInt(id);
      
      if (isNaN(noteId)) {
        toast.error('Invalid note ID');
        setDeleteLoading(false);
        return;
      }
      
      await notesApi.deleteNote(noteId);
      toast.success('Note deleted successfully');
      
      // Emit socket event
      emitNoteChange('delete', noteId, note?.title || 'Untitled');
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete note');
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
        console.error(err);
      }
      setDeleteLoading(false);
    }
  };

  // Handle note reversion
  const handleRevert = (updatedNote) => {
    setNote(updatedNote);
    setEditFormData({
      title: updatedNote.title,
      description: updatedNote.description,
      isProtected: updatedNote.isProtected,
      password: '',
    });
    setShowVersionHistory(false);
    
    // Emit socket event
    emitNoteChange('revert', updatedNote.id, updatedNote.title);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Check if user is the note owner
  const isOwner = note && user && note.owner && note.owner.id === user.id;

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="py-16">
        <Spinner size="large" />
      </div>
    );
  }

  // Show error message if there was a problem
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button
          className="mt-4 text-primary-600 hover:underline"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Show lock screen if note is protected
  if (note && note.isProtected && note.needsPassword) {
    return <NoteLock noteId={id} onUnlock={handleUnlock} />;
  }

  return (
    <div>
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          <HiArrowLeft className="mr-1" /> Back to Dashboard
        </button>
      </div>
      
      {/* Note details */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Header with actions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {!isEditing && (
              <>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-800">{note.title}</h1>
                  {note.isProtected && (
                    <span className="ml-2 text-amber-600" title="Password protected">
                      <HiLockClosed size={20} />
                    </span>
                  )}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  <p>By {note.owner ? note.owner.name : 'Unknown'}</p>
                  <p>Created: {formatDate(note.createdAt)}</p>
                  <p>Last updated: {formatDate(note.updatedAt)}</p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {!isEditing && isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center text-sm"
              >
                <HiOutlinePencil className="mr-1" /> Edit
              </button>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="btn-secondary flex items-center text-sm"
              >
                <HiOutlineClock className="mr-1" /> History
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger flex items-center text-sm"
              >
                <HiOutlineTrash className="mr-1" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Note content or edit form */}
        {isEditing ? (
          <form onSubmit={handleUpdateSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={editFormData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="form-label">
                Content
              </label>
              <textarea
                id="description"
                name="description"
                value={editFormData.description}
                onChange={handleChange}
                className="form-input min-h-[200px]"
                required
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isProtected"
                name="isProtected"
                checked={editFormData.isProtected}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="isProtected" className="form-label mb-0">
                Password protect this note
              </label>
            </div>
            
            {editFormData.isProtected && (
              <div className="mb-6">
                <label htmlFor="password" className="form-label">
                  {note.isProtected ? 'New Password (leave empty to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={editFormData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="••••••••"
                  required={!note.isProtected && editFormData.isProtected}
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="prose max-w-none">
            {note.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* Version history modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <VersionHistory
            noteId={id}
            onRevert={handleRevert}
            onClose={() => setShowVersionHistory(false)}
          />
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Note</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotePage; 