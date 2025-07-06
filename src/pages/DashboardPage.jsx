import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notesApi } from '../api/notes';
import NoteCard from '../components/notes/NoteCard';
import Spinner from '../components/ui/Spinner';
import { HiPlus } from 'react-icons/hi';
import toast from 'react-hot-toast';

function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load notes on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const fetchedNotes = await notesApi.getNotes();
        setNotes(fetchedNotes);
        setError(null);
      } catch (err) {
        setError('Failed to load notes');
        toast.error('Failed to load notes');
        // Only log in development
        if (process.env.NODE_ENV !== 'production') {
        console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Notes</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-1"
        >
          <HiPlus /> Create Note
        </button>
      </div>

      {loading ? (
        <div className="py-12">
          <Spinner size="large" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No notes available.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create your first note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateNoteModal 
          onClose={() => setShowCreateModal(false)} 
          onNoteCreated={(newNote) => {
            setNotes([newNote, ...notes]);
            toast.success('Note created successfully!');
          }}
        />
      )}
    </div>
  );
}

// Note creation modal component
function CreateNoteModal({ onClose, onNoteCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isProtected: false,
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newNote = await notesApi.createNote(formData);
      onNoteCreated(newNote);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create note');
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
      console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Note</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="form-label">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="form-label">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input h-32 resize-none"
              required
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="isProtected"
              name="isProtected"
              checked={formData.isProtected}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="isProtected" className="form-label mb-0">
              Password protect this note
            </label>
          </div>

          {formData.isProtected && (
            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required={formData.isProtected}
                placeholder="••••••••"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DashboardPage; 