import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorMessage from '../components/ErrorMessage';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      if (error) {
        setError(error.message || 'Sign up failed');
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! Welcome to WearShare!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred: ' + (err.message || err));
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-almond">
        <div className="loading-spinner h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-almond py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/" className="btn-ghost flex items-center gap-3 text-lg">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Sign Up Card */}
        <div className="card text-center p-10">
          <div className="mb-8">
            <h2 className="text-4xl text-carob font-bold mb-3">Join WearShare</h2>
            <p className="text-matcha text-lg">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>

          <ErrorMessage message={error} />
          
          <form className="w-full space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-chai font-semibold mb-2 text-left text-base">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-14 text-base"
                  placeholder="Enter your full name"
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-chai font-semibold mb-2 text-left text-base">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-14 text-base"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-400" />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-chai font-semibold mb-2 text-left text-base">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-14 pr-14 text-base"
                  placeholder="Create a password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-400" />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(v => !v)} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-chai hover:text-primary-600"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
              <p className="text-sm text-chai mt-2 text-left">
                Must be at least 6 characters long
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-chai font-semibold mb-2 text-left text-base">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-14 pr-14 text-base"
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-400" />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(v => !v)} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-chai hover:text-primary-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="loading-spinner h-6 w-6 mx-auto"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-primary-200">
            <p className="text-base text-chai">
              By creating an account, you agree to our{' '}
              <Link to="/" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 