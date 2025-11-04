/**
 * API Client for XFactor Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`, token ? 'with auth' : 'no auth');

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error: any) {
      // Network error (server not running, CORS blocked, etc.)
      console.error(`[API] Network error:`, error);
      throw new Error(`Network error: ${error.message || 'Unable to connect to server. Make sure the API server is running on port 3001.'}`);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      console.error(`[API] Error ${response.status}:`, error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(credentials: LoginCredentials) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Dashboard
  async getPresence(subject?: string) {
    const params = subject ? `?subject=${subject}` : '';
    return this.request(`/presence${params}`);
  }

  async getLeaderboard(subject = 'Algebra', period = 'weekly') {
    return this.request(`/leaderboard?subject=${subject}&period=${period}`);
  }

  async getActivityFeed(limit = 10) {
    return this.request(`/activity?limit=${limit}`);
  }

  // Test Results
  async getTestResults(limit = 5) {
    return this.request(`/test-results?limit=${limit}`);
  }

  async getLatestTestResult() {
    return this.request('/test-results/latest');
  }

  // Viral Loops
  async triggerViralLoop(trigger: string, context: any) {
    return this.request('/viral-loops/trigger', {
      method: 'POST',
      body: JSON.stringify({ trigger, context }),
    });
  }

  async createInvite(recipientEmail: string, loopExecutionId: string, channel: string) {
    return this.request('/invites', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail, loopExecutionId, channel }),
    });
  }

  // Cohorts
  async getCohorts() {
    return this.request('/cohorts');
  }

  // Analytics
  async getKFactorMetrics(cohort = 'all', days = 14) {
    return this.request(`/analytics/k-factor?cohort=${cohort}&days=${days}`);
  }

  async getLoopPerformance(days = 14) {
    return this.request(`/analytics/loops?days=${days}`);
  }

  async getGuardrailMetrics(days = 7) {
    return this.request(`/analytics/guardrails?days=${days}`);
  }

  // Rewards
  async getRewards() {
    return this.request('/rewards');
  }

  async claimReward(rewardId: string) {
    return this.request(`/rewards/${rewardId}/claim`, {
      method: 'POST',
    });
  }

  // Session Intelligence
  async processSession(sessionId: string, tutorId?: string, metadata?: any) {
    return this.request('/session-intelligence/process', {
      method: 'POST',
      body: JSON.stringify({ sessionId, tutorId, metadata }),
    });
  }

  // Smart Links
  async resolveSmartLink(shortCode: string, ref?: string) {
    const params = new URLSearchParams();
    if (ref) params.append('ref', ref);
    return this.request(`/smart-links/${shortCode}${params.toString() ? '?' + params.toString() : ''}`);
  }
}

export const apiClient = new ApiClient();

