/**
 * Login Page
 * 
 * Simple login page for testing with different user personas
 */

import React, { useState } from 'react';
import { apiClient } from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.login({ email, password });
      // Reload page to trigger App.tsx useEffect to load user and navigate
      window.location.reload();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Varsity Tutors</h1>
          <p className="text-sm text-gray-600">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="you@example.com"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              placeholder="Enter your password"
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">Quick Test Users</p>
          <div className="space-y-2">
            {testUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => fillTestUser(user.email, user.password)}
                className="w-full text-left px-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
              >
                <span className="font-medium text-gray-900">{user.label}</span>
                <span className="text-gray-500 ml-2">({user.email})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

