import { useState } from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { notesApi } from '../../api/notes';

function NoteLock({ noteId, onUnlock }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter the password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const unlockedNote = await notesApi.unlockNote(noteId, password);
      onUnlock(unlockedNote);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto text-center">
      <div className="flex justify-center mb-4">
        <HiLockClosed className="text-amber-600" size={48} />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        This note is password protected
      </h3>
      
      <p className="text-gray-600 mb-4">
        Enter the password to view the content
      </p>
      
      <form onSubmit={handleUnlock} className="mt-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="form-input"
            required
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Unlocking...' : 'Unlock Note'}
        </button>
      </form>
    </div>
  );
}

export default NoteLock; 