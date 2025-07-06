import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { HiLockClosed } from 'react-icons/hi';

function NoteCard({ note }) {
  // Format dates for better display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <Link to={`/notes/${note.id}`}>
          <h2 className="text-xl font-semibold text-gray-800 hover:text-primary-600 transition-colors">
            {note.title}
          </h2>
        </Link>
        {note.isProtected && (
          <span className="text-amber-600" title="Password protected">
            <HiLockClosed size={18} />
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Author:</span> {note.owner ? note.owner.name : 'Unknown'}
        </p>
        <p>
          <span className="font-medium">Created:</span> {formatDate(note.createdAt)}
        </p>
        <p>
          <span className="font-medium">Last updated:</span> {formatDate(note.updatedAt)}
        </p>
      </div>

      <div className="mt-4">
        <Link
          to={`/notes/${note.id}`}
          className="text-primary-600 hover:underline text-sm"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

export default NoteCard; 