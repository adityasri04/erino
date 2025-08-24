import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, Building, Users, TrendingUp, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Debug: Monitor form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
    console.log('Form data state:', {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`=== FIELD CHANGE ===`);
    console.log(`Field ${name} changed to:`, value);
    console.log(`Field ${name} type:`, typeof value);
    console.log(`Field ${name} length:`, value?.length);
    console.log(`Previous form data:`, formData);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log(`New form data after update:`, newData);
      return newData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      console.log(`Clearing error for field: ${name}`);
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      console.log(`Clearing general error`);
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const checkFormState = () => {
    console.log('=== MANUAL FORM STATE CHECK ===');
    console.log('Current form data:', formData);
    console.log('Form data type:', typeof formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', Object.values(formData));
    console.log('Form data entries:', Object.entries(formData));
    console.log('Individual field details:', {
      first_name: { value: formData.first_name, type: typeof formData.first_name, length: formData.first_name?.length, trimmed: formData.first_name?.trim() },
      last_name: { value: formData.last_name, type: typeof formData.last_name, length: formData.last_name?.length, trimmed: formData.last_name?.trim() },
      email: { value: formData.email, type: typeof formData.email, length: formData.email?.length, trimmed: formData.email?.trim() },
      password: { value: formData.password, type: typeof formData.password, length: formData.password?.length, trimmed: formData.password?.trim() },
      confirmPassword: { value: formData.confirmPassword, type: typeof formData.confirmPassword, length: formData.confirmPassword?.length, trimmed: formData.confirmPassword?.trim() }
    });
    console.log('Current errors:', errors);
    console.log('Error count:', Object.keys(errors).length);
    
    // Test validation manually
    console.log('=== MANUAL VALIDATION TEST ===');
    validateForm();
  };

  const testFormData = () => {
    console.log('=== TESTING FORM DATA UPDATE ===');
    const testData = {
      first_name: 'TestFirstName',
      last_name: 'TestLastName',
      email: 'test@example.com',
      password: 'testpassword123',
      confirmPassword: 'testpassword123'
    };
    console.log('Setting test data:', testData);
    setFormData(testData);
    console.log('Test data set, check form state in a moment...');
    
    // Test if the state update worked
    setTimeout(() => {
      console.log('=== TEST DATA VERIFICATION ===');
      console.log('Form data after timeout:', formData);
      console.log('Expected vs actual:');
      console.log('Expected first_name: TestFirstName, Actual:', formData.first_name);
      console.log('Expected last_name: TestLastName, Actual:', formData.last_name);
      console.log('Expected email: test@example.com, Actual:', formData.email);
      console.log('Expected password: testpassword123, Actual:', formData.password);
      console.log('Expected confirmPassword: testpassword123, Actual:', formData.confirmPassword);
      
      // Test validation with the new data
      console.log('=== TESTING VALIDATION WITH NEW DATA ===');
      validateForm();
    }, 100);
  };

  const inspectCurrentState = () => {
    console.log('=== INSPECTING CURRENT STATE ===');
    console.log('Current formData state:', formData);
    console.log('Current errors state:', errors);
    console.log('Form data reference:', formData === formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', Object.values(formData));
    
    // Check if the state is actually reactive
    setTimeout(() => {
      console.log('=== STATE AFTER TIMEOUT ===');
      console.log('Form data after timeout:', formData);
    }, 100);
  };

  const testSubmission = () => {
    console.log('=== TESTING FORM SUBMISSION ===');
    console.log('Current form data before submission:', formData);
    
    // Manually trigger the submission logic
    const testData = {
      first_name: 'TestFirstName',
      last_name: 'TestLastName',
      email: 'test@example.com',
      password: 'testpassword123',
      confirmPassword: 'testpassword123'
    };
    
    console.log('Setting test data and simulating submission...');
    setFormData(testData);
    
    // Wait for state update then test submission
    setTimeout(() => {
      console.log('Form data after update:', formData);
      console.log('Testing validation...');
      const isValid = validateForm();
      console.log('Validation result:', isValid);
      
      if (isValid) {
        console.log('Validation passed, would submit to backend');
        console.log('Data that would be sent:', { ...testData, confirmPassword: undefined });
      } else {
        console.log('Validation failed, errors:', errors);
      }
    }, 100);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Debug logging
    console.log('=== VALIDATION START ===');
    console.log('Raw form data:', formData);
    console.log('Form data type:', typeof formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Individual field values:', {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
    console.log('Field types:', {
      first_name: typeof formData.first_name,
      last_name: typeof formData.last_name,
      email: typeof formData.email,
      password: typeof formData.password,
      confirmPassword: typeof formData.confirmPassword
    });

    // Check first name
    if (!formData.first_name || typeof formData.first_name !== 'string' || !formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      console.log('First name validation failed:', { value: formData.first_name, type: typeof formData.first_name });
    } else {
      console.log('First name validation passed:', formData.first_name);
    }

    // Check last name
    if (!formData.last_name || typeof formData.last_name !== 'string' || !formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      console.log('Last name validation failed:', { value: formData.last_name, type: typeof formData.last_name });
    } else {
      console.log('Last name validation passed:', formData.last_name);
    }

    // Check email
    if (!formData.email || typeof formData.email !== 'string' || !formData.email.trim()) {
      newErrors.email = 'Email is required';
      console.log('Email validation failed:', { value: formData.email, type: typeof formData.email });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      console.log('Email format validation failed:', formData.email);
    } else {
      console.log('Email validation passed:', formData.email);
    }

    // Check password
    if (!formData.password || typeof formData.password !== 'string' || !formData.password.trim()) {
      newErrors.password = 'Password is required';
      console.log('Password validation failed:', { value: formData.password, type: typeof formData.password });
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      console.log('Password length validation failed:', formData.password.length);
    } else {
      console.log('Password validation passed:', formData.password);
    }

    // Check confirm password
    if (!formData.confirmPassword || typeof formData.confirmPassword !== 'string' || !formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      console.log('Confirm password validation failed:', { value: formData.confirmPassword, type: typeof formData.confirmPassword });
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      console.log('Password match validation failed:', { password: formData.password, confirmPassword: formData.confirmPassword });
    } else {
      console.log('Confirm password validation passed:', formData.confirmPassword);
    }

    console.log('=== VALIDATION RESULTS ===');
    console.log('Validation errors:', newErrors);
    console.log('Validation passed:', Object.keys(newErrors).length === 0);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION START ===');
    console.log('Form submitted with data:', formData);
    console.log('Form data keys:', Object.keys(formData));
    console.log('Form data values:', Object.values(formData));
    console.log('Form data entries:', Object.entries(formData));
    
    // Immediate validation check before calling validateForm
    console.log('=== IMMEDIATE VALIDATION CHECK ===');
    console.log('first_name:', { value: formData.first_name, type: typeof formData.first_name, length: formData.first_name?.length, isEmpty: !formData.first_name || !formData.first_name.trim() });
    console.log('last_name:', { value: formData.last_name, type: typeof formData.last_name, length: formData.last_name?.length, isEmpty: !formData.last_name || !formData.last_name.trim() });
    console.log('email:', { value: formData.email, type: typeof formData.email, length: formData.email?.length, isEmpty: !formData.email || !formData.email.trim() });
    console.log('password:', { value: formData.password, type: typeof formData.password, length: formData.password?.length, isEmpty: !formData.password || !formData.password.trim() });
    console.log('confirmPassword:', { value: formData.confirmPassword, type: typeof formData.confirmPassword, length: formData.confirmPassword?.length, isEmpty: !formData.confirmPassword || !formData.confirmPassword.trim() });
    
    if (!validateForm()) {
      console.log('Form validation failed, not submitting');
      console.log('Current errors:', errors);
      return;
    }

    console.log('Form validation passed, submitting to backend...');
    setLoading(true);
    
    try {
      const { password, confirmPassword, ...userData } = formData;
      console.log('=== BACKEND SUBMISSION ===');
      console.log('Original form data:', formData);
      console.log('Extracted user data (excluding confirmPassword):', userData);
      console.log('Data being sent to backend:', userData);
      console.log('Data type:', typeof userData);
      console.log('Data stringified:', JSON.stringify(userData));
      
      const result = await register(userData);
      console.log('Registration result:', result);
      
      if (result.success) {
        // Registration successful, user is automatically logged in
        console.log('Registration successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        // Handle registration error
        console.log('Registration failed:', result.error);
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
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
              Join the Future of Lead Management
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Start your journey with our enterprise-grade platform. 
              Build, scale, and optimize your sales process with confidence.
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">Unlimited lead storage</span>
                <p className="text-blue-100 text-sm">Scale your business without limits</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">Real-time analytics dashboard</span>
                <p className="text-blue-100 text-sm">Monitor performance in real-time</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">Enterprise security & compliance</span>
                <p className="text-blue-100 text-sm">Bank-grade security for your data</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-blue-200 text-sm">
          © 2024 Erino. Professional lead management platform.
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            <h2 className="text-4xl font-bold text-gray-900">Create your account</h2>
            <p className="text-lg text-gray-600">Join thousands of professionals using Erino</p>
            
            {/* Debug Info - Remove in production */}
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              <div>Form State: {[formData.first_name, formData.last_name, formData.email, formData.password].filter(v => v && v.trim()).length}/4 fields filled</div>
              <div>Errors: {Object.keys(errors).length} active</div>
              <div>Password Match: {formData.password === formData.confirmPassword ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="card shadow-xl">
            <div className="card-body p-8">
              {/* Clear Errors Button - Remove in production */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active errors: {Object.keys(errors).length}</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={clearAllErrors}
                      className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Clear All Errors
                    </button>
                    <button
                      type="button"
                      onClick={checkFormState}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Check Form State
                    </button>
                    <button
                      type="button"
                      onClick={testFormData}
                      className="text-xs px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Test Form Data
                    </button>
                    <button
                      type="button"
                      onClick={inspectCurrentState}
                      className="text-xs px-3 py-1 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      Inspect State
                    </button>
                    <button
                      type="button"
                      onClick={testSubmission}
                      className="text-xs px-3 py-1 bg-yellow-100 text-yellow-600 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      Test Submission
                    </button>
                  </div>
                </div>
              )}

              {/* General Error Display */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-red-800">{errors.general}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="form-label text-base">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`form-input pl-12 py-4 text-base ${errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter first name"
                        autoComplete="given-name"
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="last_name" className="form-label text-base">
                      Last Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`form-input pl-12 py-4 text-base ${errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Enter last name"
                        autoComplete="family-name"
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="form-label text-base">
                    Email Address *
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

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="form-label text-base">
                      Password *
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
                        placeholder="Create password"
                        autoComplete="new-password"
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

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="form-label text-base">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`form-input pl-12 pr-12 py-4 text-base ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
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
                    <User className="w-6 h-6 mr-3" />
                  )}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 underline decoration-2 underline-offset-2"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
