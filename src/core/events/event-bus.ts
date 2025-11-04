/**
 * Event Bus
 * 
 * Central event stream for all viral growth events.
 * Handles event publishing, subscription, and routing.
 */

import { ViralEvent, EventType } from '../types/index.js';

export type EventHandler = (event: ViralEvent) => Promise<void> | void;

export class EventBus {
  private subscribers: Map<EventType, Set<EventHandler>> = new Map();
  private eventHistory: ViralEvent[] = [];
  private maxHistorySize: number = 10000;

  /**
   * Publish an event to all subscribers
   */
  async publish(event: ViralEvent): Promise<void> {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    const handlers = this.subscribers.get(event.eventType);
    if (handlers) {
      const promises = Array.from(handlers).map((handler) => {
        try {
          return Promise.resolve(handler(event));
        } catch (error) {
          console.error(`Error in event handler for ${event.eventType}:`, error);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }

    // Also notify all-event subscribers
    const allHandlers = this.subscribers.get('*' as EventType);
    if (allHandlers) {
      const promises = Array.from(allHandlers).map((handler) => {
        try {
          return Promise.resolve(handler(event));
        } catch (error) {
          console.error(`Error in all-event handler:`, error);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe(eventType: EventType | '*', handler: EventHandler): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Get event history
   */
  getHistory(
    eventType?: EventType,
    limit?: number
  ): ViralEvent[] {
    let events = this.eventHistory;
    if (eventType) {
      events = events.filter((e) => e.eventType === eventType);
    }
    if (limit) {
      events = events.slice(-limit);
    }
    return events;
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(eventType?: EventType): number {
    if (eventType) {
      return this.subscribers.get(eventType)?.size ?? 0;
    }
    return Array.from(this.subscribers.values()).reduce(
      (sum, handlers) => sum + handlers.size,
      0
    );
  }
}

// Singleton instance
export const eventBus = new EventBus();

