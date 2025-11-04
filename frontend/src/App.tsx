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
    // Check for smart link in URL (e.g., /challenge/45C8E83A or /link/45C8E83A)
    const path = window.location.pathname;
    const smartLinkMatch = path.match(/\/(challenge|link|invite)\/([A-Z0-9]+)/);
    
    if (smartLinkMatch) {
      const shortCode = smartLinkMatch[2];
      const ref = new URLSearchParams(window.location.search).get('ref');
      
      // Resolve smart link
      apiClient.resolveSmartLink(shortCode, ref || undefined)
        .then((linkData) => {
          console.log('Smart link resolved:', linkData);
          
          // Handle different FVM types
          if (linkData.fvmType === 'challenge') {
            // Redirect to challenge page
            setCurrentPage('results');
            // Could set challenge context here
          } else if (linkData.loopId) {
            // Handle loop-specific routing
            // For now, just log and redirect to dashboard
            console.log('Loop ID:', linkData.loopId);
            setCurrentPage('dashboard');
          } else {
            // Default: redirect to dashboard
            setCurrentPage('dashboard');
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
      {/* Simple Navigation - In production, this would be handled by React Router */}
      {currentPage !== 'landing' && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-gray-900">
                  Varsity Tutors
                  {user && (
                    <span className="ml-3 text-sm font-normal text-gray-500">
                      ({user.persona})
                    </span>
                  )}
                </h1>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === 'dashboard'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </button>
                  {user?.persona === 'student' && (
                    <button
                      onClick={() => setCurrentPage('results')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === 'results'
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Test Results
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentPage('analytics')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === 'analytics'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      apiClient.logout();
                      setCurrentPage('login');
                      setUser(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
      {currentPage === 'results' && user && user.persona === 'student' && <TestResults user={user} />}
      {currentPage === 'analytics' && <AnalyticsPage />}
    </>
  );
}

export default App;

