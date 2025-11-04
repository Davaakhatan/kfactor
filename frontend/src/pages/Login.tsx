/**
 * Login Page
 * 
 * Simple login page for testing with different user personas
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = '/dashboard'; // Simple navigation for now

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.login({ email, password });
      // Navigate to dashboard (in production, use React Router)
      window.location.href = navigate;
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const testUsers = [
    { email: 'student1@test.com', password: 'password123', label: 'Student 1' },
    { email: 'student2@test.com', password: 'password123', label: 'Student 2' },
    { email: 'parent1@test.com', password: 'password123', label: 'Parent 1' },
    { email: 'tutor1@test.com', password: 'password123', label: 'Tutor 1' },
  ];

  const fillTestUser = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
        <p className="text-sm text-gray-600 mb-6">Test the XFactor Viral Growth System</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">Quick Test Users:</p>
          <div className="space-y-2">
            {testUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => fillTestUser(user.email, user.password)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user.label} ({user.email})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

