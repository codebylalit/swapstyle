import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ErrorMessage from '../components/ErrorMessage';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || 'Login failed');
        toast.error(error.message);
      } else {
        toast.success('Welcome back!');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-almond">
      <div className="w-full max-w-md bg-vanilla rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-carob mb-2">Sign in to your account</h2>
        <p className="text-matcha mb-6">Or <Link to="/signup" className="text-primary-600 hover:underline">create a new account</Link></p>
        <ErrorMessage message={error} />
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-chai font-medium mb-1">Email address</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-chai focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your email"
              />
              <Mail className="absolute right-3 top-3 h-5 w-5 text-chai" />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-chai font-medium mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-chai focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-3 text-chai">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              <Lock className="absolute left-3 top-3 h-5 w-5 text-chai" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <div className="text-center mt-6 w-full">
          <Link to="/" className="text-sm text-chai hover:text-carob">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 