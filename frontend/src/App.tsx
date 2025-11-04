/**
 * XFactor Viral Growth System - Frontend App
 * 
 * This is the production-ready frontend that integrates viral growth features
 * into Varsity Tutors' learning platform.
 * 
 * Key Pages:
 * 1. StudentDashboard - Main hub with presence, leaderboards, activity feed
 * 2. TestResults - Results page with viral sharing (Challenge Friend, Share Results)
 * 3. Landing - Public landing page (optional, for new users)
 * 
 * This system adds viral loops to existing Varsity Tutors pages:
 * - Results pages become shareable surfaces
 * - Dashboards show social presence and activity
 * - Practice sessions include challenge options
 */

import React, { useState, useEffect } from 'react';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { TutorDashboard } from './pages/TutorDashboard';
import { TestResults } from './pages/TestResults';
import { AnalyticsPage } from './pages/Analytics';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { apiClient } from './services/api';
import './index.css';

type Page = 'login' | 'landing' | 'dashboard' | 'results' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for smart link in URL (e.g., /share/45C8E83A, /challenge/45C8E83A, /link/45C8E83A, /invite/45C8E83A)
    // Supports Varsity Tutors format: varsitytutors.com/share/[shortCode]
    const path = window.location.pathname;
    const smartLinkMatch = path.match(/\/(share|challenge|link|invite)\/([A-Z0-9]+)/);
    
    if (smartLinkMatch) {
      const shortCode = smartLinkMatch[2];
      const ref = new URLSearchParams(window.location.search).get('ref');
      const utmSource = new URLSearchParams(window.location.search).get('utm_source');
      
      // Resolve smart link via API
      apiClient.resolveSmartLink(shortCode, ref || undefined)
        .then((linkData) => {
          if (import.meta.env.DEV) {
            console.log('Smart link resolved:', linkData);
          }
          
          // Track link open event (already tracked in backend, but log for frontend)
          if (linkData.success) {
            // Handle different FVM types
            if (linkData.fvmType === 'challenge') {
              // Redirect to challenge/test results page
              setCurrentPage('results');
              // Could set challenge context here
            } else if (linkData.fvmType === 'practice') {
              // Redirect to practice page
              setCurrentPage('dashboard');
              // In production, would navigate to practice interface
            } else if (linkData.fvmType === 'session') {
              // Redirect to session booking
              setCurrentPage('dashboard');
              // In production, would navigate to session booking
            } else if (linkData.loopId) {
              // Handle loop-specific routing
              console.log('Loop ID:', linkData.loopId);
              setCurrentPage('dashboard');
            } else {
              // Default: redirect to dashboard
              setCurrentPage('dashboard');
            }
          } else {
            console.error('Failed to resolve link:', linkData.error);
            setCurrentPage('login');
          }
        })
        .catch((error) => {
          console.error('Error resolving smart link:', error);
          // Fallback to login
          setCurrentPage('login');
        });
    } else {
      // Normal flow: Check if user is logged in
      const token = apiClient.getToken();
      if (token) {
        apiClient.getCurrentUser()
          .then((userData) => {
            setUser(userData);
            setCurrentPage('dashboard');
          })
          .catch(() => {
            apiClient.logout();
            setCurrentPage('login');
          });
      }
    }
  }, []);

  // Render appropriate dashboard based on persona
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.persona) {
      case 'student':
        return <StudentDashboard user={user} />;
      case 'parent':
        return <ParentDashboard user={user} />;
      case 'tutor':
        return <TutorDashboard user={user} />;
      default:
        return <StudentDashboard user={user} />;
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      {currentPage !== 'landing' && currentPage !== 'login' && user && (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-6">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Varsity Tutors
                </h1>
                {user && (
                  <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                    {user.persona}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    currentPage === 'dashboard'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </button>
                {user?.persona === 'student' && (
                  <button
                    onClick={() => setCurrentPage('results')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      currentPage === 'results'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Test Results
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage('analytics')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    currentPage === 'analytics'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Analytics
                </button>
                <div className="ml-4 pl-4 border-l border-gray-200">
                  <button
                    onClick={() => {
                      apiClient.logout();
                      setCurrentPage('login');
                      setUser(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Page Content */}
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'landing' && <LandingPage />}
      {currentPage === 'dashboard' && user && renderDashboard()}
      {currentPage === 'results' && user && user.persona === 'student' && <TestResults user={user} onNavigate={setCurrentPage} />}
      {currentPage === 'analytics' && <AnalyticsPage />}
    </>
  );
}

export default App;

