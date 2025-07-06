import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to={isAuthenticated ? "/dashboard" : "/login"} 
          className="btn-primary"
        >
          {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage; 