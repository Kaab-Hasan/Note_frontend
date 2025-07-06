import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import FormField from '../components/ui/FormField';
import toast from 'react-hot-toast';
import { profileSchema, passwordChangeSchema } from '../utils/validationSchemas';

function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    
    // Clear specific field error when user types
    if (profileErrors[name]) {
      setProfileErrors({ ...profileErrors, [name]: '' });
    }
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    
    // Clear specific field error when user types
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: '' });
    }
  };
  
  // Update profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    
    try {
      // Validate form data
      const validatedData = profileSchema.parse(profileData);
      
      // Only send data that has changed
      const updates = {};
      if (validatedData.name !== user.name) updates.name = validatedData.name;
      if (validatedData.email !== user.email) updates.email = validatedData.email;
      
      if (Object.keys(updates).length === 0) {
        toast.success('No changes to save');
        setIsEditingProfile(false);
        setProfileLoading(false);
        return;
      }
      
      // Update profile
      await updateProfile(updates);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      // Handle validation errors
      if (err.errors) {
        const errors = {};
        err.errors.forEach((error) => {
          errors[error.path[0]] = error.message;
        });
        setProfileErrors(errors);
      } else {
        toast.error(err.response?.data?.error || 'Profile update failed');
      }
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Change password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    
    try {
      // Check if passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordErrors({
          confirmPassword: 'Passwords do not match'
        });
        setPasswordLoading(false);
        return;
      }
      
      // Validate form data
      const validatedData = passwordChangeSchema.parse({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      // Change password
      await changePassword(validatedData);
      setIsChangingPassword(false);
      
      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password changed successfully');
    } catch (err) {
      // Handle validation errors
      if (err.errors) {
        const errors = {};
        err.errors.forEach((error) => {
          errors[error.path[0]] = error.message;
        });
        setPasswordErrors(errors);
      } else {
        toast.error(err.response?.data?.error || 'Password change failed');
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Profile</h1>
      
      {/* Profile Card */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex justify-between">
          <span>Profile Information</span>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-primary-600 text-base hover:underline"
            >
              Edit
            </button>
          )}
        </h2>
        
        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit}>
            <FormField
              label="Full Name"
              id="name"
              value={profileData.name}
              onChange={handleProfileChange}
              error={profileErrors.name}
              required
            />
            
            <FormField
              label="Email Address"
              type="email"
              id="email"
              value={profileData.email}
              onChange={handleProfileChange}
              error={profileErrors.email}
              required
            />
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setProfileData({
                    name: user.name,
                    email: user.email,
                  });
                }}
                className="btn-secondary"
                disabled={profileLoading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-lg">{user.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Email Address</p>
              <p className="text-lg">{user.email}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Password Card */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex justify-between">
          <span>Password</span>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="text-primary-600 text-base hover:underline"
            >
              Change
            </button>
          )}
        </h2>
        
        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit}>
            <FormField
              label="Current Password"
              type="password"
              id="oldPassword"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.oldPassword}
              required
            />
            
            <FormField
              label="New Password"
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
            />
            
            <FormField
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              required
            />
            
            <div className="text-sm text-gray-600 mb-4">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside">
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="btn-secondary"
                disabled={passwordLoading}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            •••••••••••••
          </p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage; 