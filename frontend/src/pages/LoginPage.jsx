import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';
import { Wrench, LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'CLIENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? formData : {
        email: formData.email,
        password: formData.password,
      };

      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        dispatch(setCredentials(response.data.data));
        const redirectPath = response.data.data.user.role === 'CLIENT' ? '/home' : '/mechanic';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-bg-dark via-bg-dark to-primary/10">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-4 rounded-full animate-pulse-slow">
            <Wrench className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-text-secondary text-center mb-6">
          {isRegister ? 'Join our roadside assistance platform' : 'Sign in to continue'}
        </p>

        {error && (
          <div className="bg-danger bg-opacity-20 border border-danger text-danger px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email (Gmail)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@gmail.com"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+919876543210"
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-2">I am a</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    formData.role === 'CLIENT'
                      ? 'bg-primary text-white'
                      : 'bg-bg-card text-text-secondary border border-gray-600'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'MECHANIC' })}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    formData.role === 'MECHANIC'
                      ? 'bg-primary text-white'
                      : 'bg-bg-card text-text-secondary border border-gray-600'
                  }`}
                >
                  Mechanic
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isRegister ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-primary hover:underline"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
