import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, Building, Users, TrendingUp, CheckCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">
        <div className="space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Building className="w-7 h-7" />
            </div>
            <span className="text-3xl font-bold">Erino</span>
          </div>
          
          {/* Hero Content */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-tight">
              Transform Your Lead Management
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Streamline your sales process with our powerful lead management platform. 
              Track, nurture, and convert leads with professional precision.
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">Comprehensive lead tracking</span>
                <p className="text-blue-100 text-sm">Manage every lead from first contact to conversion</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">Advanced analytics & insights</span>
                <p className="text-blue-100 text-sm">Data-driven decisions for better results</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">Professional workflow automation</span>
                <p className="text-blue-100 text-sm">Streamline processes and boost productivity</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-blue-200 text-sm">
          © 2024 Erino. Enterprise-grade lead management.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Building className="w-9 h-9 text-white" />
              </div>
              <span className="text-4xl font-bold text-gray-900">Erino</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-lg text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <div className="card shadow-xl">
            <div className="card-body p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="form-label text-base">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input pl-12 py-4 text-base ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your email address"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="form-label text-base">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`form-input pl-12 pr-12 py-4 text-base ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base font-semibold"
                >
                  {loading ? (
                    <div className="loading-spinner mr-3"></div>
                  ) : (
                    <Lock className="w-6 h-6 mr-3" />
                  )}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>

          {/* Demo Account Info */}
          <div className="card bg-blue-50 border-blue-200 shadow-lg">
            <div className="card-body p-6">
              <div className="text-center">
                <h4 className="text-base font-semibold text-blue-900 mb-3">Demo Account</h4>
                <p className="text-sm text-blue-700 mb-3">Use these credentials to test the system:</p>
                <div className="bg-white rounded-lg p-4 text-sm font-mono text-blue-800 shadow-sm">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Mail className="w-4 h-4" />
                    <span>test@erino.com</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>test123</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 underline decoration-2 underline-offset-2"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
