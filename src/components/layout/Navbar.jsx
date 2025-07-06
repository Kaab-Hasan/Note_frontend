import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV !== 'production') {
      console.error('Logout failed', error);
      }
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">Notes App</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-primary-600">
              Profile
            </Link>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3">
            <div className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-primary-600 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setIsMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-primary-600 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        
        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out of your account?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowLogoutConfirm(false);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 