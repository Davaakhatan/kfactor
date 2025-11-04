/**
 * MCP Agent Client
 * 
 * Handles communication between agents using the MCP protocol
 * with circuit breaker pattern and retry logic for reliability.
 */

import { BaseAgent, AgentRequest, AgentResponse } from './agent-base.js';

export interface AgentClientConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeoutMs?: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class AgentClient {
  private agents: Map<string, BaseAgent> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private config: Required<AgentClientConfig>;

  constructor(config: AgentClientConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: config.retryDelayMs ?? 100,
      timeoutMs: config.timeoutMs ?? 200,
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 5,
      circuitBreakerTimeoutMs: config.circuitBreakerTimeoutMs ?? 60000,
    };
  }

  /**
   * Register an agent with the client
   */
  registerAgent(agent: BaseAgent): void {
    const metadata = agent.getMetadata();
    this.agents.set(metadata.name, agent);
    this.circuitBreakers.set(metadata.name, {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    });
  }

  /**
   * Call an agent with retry logic and circuit breaker
   */
  async callAgent(
    agentName: string,
    request: AgentRequest
  ): Promise<AgentResponse> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      return this.createFallbackResponse(
        request.requestId,
        `Agent ${agentName} not found`
      );
    }

    // Check circuit breaker
    const breaker = this.circuitBreakers.get(agentName)!;
    if (breaker.state === 'open') {
      if (Date.now() - breaker.lastFailureTime > this.config.circuitBreakerTimeoutMs) {
        breaker.state = 'half-open';
      } else {
        return this.createFallbackResponse(
          request.requestId,
          `Circuit breaker open for agent ${agentName}`
        );
      }
    }

    // Try with retries
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await Promise.race([
          agent.process(request),
          this.createTimeoutPromise(request.requestId),
        ]);

        // Success - reset circuit breaker
        if (response.success) {
          breaker.failures = 0;
          breaker.state = 'closed';
          return response;
        }

        // If we got a response but it's not successful, don't retry
        if (!response.success && response.error) {
          lastError = new Error(response.error.message);
          break;
        }
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelayMs * (attempt + 1));
        }
      }
    }

    // All retries failed - update circuit breaker
    breaker.failures++;
    breaker.lastFailureTime = Date.now();
    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = 'open';
    }

    // Return fallback response
    return this.createFallbackResponse(
      request.requestId,
      `Agent ${agentName} failed after ${this.config.maxRetries} retries: ${lastError?.message ?? 'Unknown error'}`
    );
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(requestId: string): Promise<AgentResponse> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }

  /**
   * Create fallback response for graceful degradation
   */
  private createFallbackResponse(
    requestId: string,
    reason: string
  ): AgentResponse {
    return {
      requestId,
      timestamp: new Date().toISOString(),
      success: false,
      rationale: `Fallback response: ${reason}. Using default behavior.`,
      latencyMs: 0,
      error: {
        code: 'AGENT_UNAVAILABLE',
        message: reason,
      },
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get agent health status
   */
  async getAgentHealth(agentName: string): Promise<{
    exists: boolean;
    healthy: boolean;
    circuitBreakerState: string;
  }> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      return {
        exists: false,
        healthy: false,
        circuitBreakerState: 'unknown',
      };
    }

    const breaker = this.circuitBreakers.get(agentName)!;
    const health = await agent.healthCheck();

    return {
      exists: true,
      healthy: health.healthy && breaker.state !== 'open',
      circuitBreakerState: breaker.state,
    };
  }

  /**
   * Get all registered agents
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }
}

