import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Building2, Lock, AlertCircle } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { Button } from '../components/Button';
import { RegisterFormData } from '../types/auth';
import { config } from '../config/env.config';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    businessName: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post(`${config.serverApiUrl}/api/auth/register`, {
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName
      });
      navigate('/login');
    } catch (err) {
      console.log(err);
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl w-full flex gap-8 items-center">
        {/* Left side - Register Form */}
        <div className="flex-1 lg:w-1/2">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Get started with BusinessBot AI</p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" className="w-5 h-5" />
              <span className="text-gray-700">Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="businessName"
                  required
                  placeholder="Business Name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm py-2 px-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth>
                Create Account
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-600">Already have an account?</span>
              <a 
                href="/login" 
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Sign in
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>© 2024 BusinessBot AI. All rights reserved.</p>
          </div>
        </div>

        {/* Right side - Product Info */}
        <div className="hidden lg:flex flex-1 lg:w-1/2">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-indigo-900 mb-6">
              Start Your AI Journey Today
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Easy Setup</h3>
                  <p className="text-gray-600">Get started in minutes with our intuitive onboarding process.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Enterprise Security</h3>
                  <p className="text-gray-600">Your data is protected with industry-leading security measures.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Scale with Confidence</h3>
                  <p className="text-gray-600">Our platform grows with your business, from startup to enterprise.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg">
              <div className="font-semibold text-lg text-indigo-900 mb-2">
                Free Trial Includes:
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Full Access for 14 Days
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  No Credit Card Required
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  24/7 Support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 