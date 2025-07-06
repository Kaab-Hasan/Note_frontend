import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/validationSchemas';
import FormField from '../components/ui/FormField';
import toast from 'react-hot-toast';

function LoginPage() {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific field error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    
    // Clear API error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form data
      const validatedData = loginSchema.parse(formData);
      
      // Attempt login
      await login(validatedData);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      // Handle validation errors
      if (err.errors) {
        const errors = {};
        err.errors.forEach((error) => {
          errors[error.path[0]] = error.message;
        });
        setFormErrors(errors);
      } else {
        // API error is handled by the auth context
        toast.error(err.response?.data?.error || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-800">Welcome back!</h1>
          <p className="mt-2 text-center text-gray-600">
            Sign in to access your notes
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-center">{error}</div>}
          
          <FormField
            label="Email Address"
            type="email"
            id="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            required
          />
          
          <FormField
            label="Password"
            type="password"
            id="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            required
          />
          
          <div>
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 