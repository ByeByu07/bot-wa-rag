import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { Button } from '../components/Button';
import { LoginFormData, AuthResponse } from '../types/auth';
import { config } from '../config/env.config';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await axios.post<AuthResponse>(
        `${config.serverApiUrl}/api/auth/login`, 
        formData
      );
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full flex gap-8 items-center">
        {/* Left side - Login Form */}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900">
              BusinessBot AI
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Please sign in to continue.
            </p>
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
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 bg-white" /> : <Eye className="h-5 w-5 bg-white" />}
                </button>
              </div>

              {error && (
                <div className="text-red-500 text-sm py-2 px-4 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth>
                Sign In
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-600">Don't have an account?</span>
              <a 
                href="/register" 
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Sign up now
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>© 2024 BusinessBot AI. All rights reserved.</p>
          </div>
        </div>

        {/* Right side - Product Info */}
        <div className="flex-1 hidden lg:block">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-indigo-900 mb-6">
              Transform Your Business with AI
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">AI-Powered Automation</h3>
                  <p className="text-gray-600">Streamline your operations with intelligent automation that learns and adapts to your business needs.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Data-Driven Insights</h3>
                  <p className="text-gray-600">Make informed decisions with real-time analytics and predictive insights.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">24/7 Availability</h3>
                  <p className="text-gray-600">Your AI assistant works around the clock, ensuring continuous support for your business.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-900 font-medium">
                "BusinessBot AI has revolutionized how we handle customer inquiries, saving us over 30 hours per week."
              </p>
              <p className="text-sm text-indigo-600 mt-2">- John Smith, CEO of TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;