/**
 * Base Agent Class for MCP Protocol
 * 
 * All agents inherit from this base class and implement the MCP protocol
 * for standardized communication with decision rationale.
 */

import { v4 as uuidv4 } from 'uuid';

export interface AgentRequest {
  agentId: string;
  requestId: string;
  timestamp: string;
  userId: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  requestId: string;
  timestamp: string;
  success: boolean;
  rationale: string;
  featuresUsed?: string[];
  confidence?: number;
  latencyMs: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface AgentConfig {
  name: string;
  version: string;
  maxLatencyMs: number;
  enableCaching?: boolean;
  fallbackEnabled?: boolean;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected startTime: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Process a request and return a response with rationale
   */
  abstract process(request: AgentRequest): Promise<AgentResponse>;

  /**
   * Validate request structure
   */
  protected validateRequest(request: AgentRequest): boolean {
    return !!(
      request.agentId &&
      request.requestId &&
      request.timestamp &&
      request.userId
    );
  }

  /**
   * Create a standardized response
   */
  protected createResponse(
    requestId: string,
    success: boolean,
    rationale: string,
    options: {
      featuresUsed?: string[];
      confidence?: number;
      error?: { code: string; message: string };
      data?: unknown;
    } = {}
  ): AgentResponse {
    const latencyMs = Date.now() - this.startTime;

    // Check SLA compliance
    if (latencyMs > this.config.maxLatencyMs) {
      console.warn(
        `Agent ${this.config.name} exceeded SLA: ${latencyMs}ms > ${this.config.maxLatencyMs}ms`
      );
    }

    return {
      requestId,
      timestamp: new Date().toISOString(),
      success,
      rationale,
      featuresUsed: options.featuresUsed,
      confidence: options.confidence,
      latencyMs,
      error: options.error,
    };
  }

  /**
   * Create error response with rationale
   */
  protected createErrorResponse(
    requestId: string,
    error: { code: string; message: string },
    rationale: string
  ): AgentResponse {
    return this.createResponse(requestId, false, rationale, { error });
  }

  /**
   * Start timing for latency tracking
   */
  protected startTiming(): void {
    this.startTime = Date.now();
  }

  /**
   * Generate a new request ID
   */
  protected generateRequestId(): string {
    return uuidv4();
  }

  /**
   * Health check for monitoring
   */
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      // Basic health check - can be overridden by subclasses
      const latencyMs = Date.now() - start;
      return { healthy: true, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - start;
      return { healthy: false, latencyMs };
    }
  }

  /**
   * Get agent metadata
   */
  getMetadata(): AgentConfig {
    return { ...this.config };
  }
}

