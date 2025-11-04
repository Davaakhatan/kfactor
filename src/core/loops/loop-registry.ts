/**
 * Loop Registry
 * 
 * Central registry for all viral loops with factory pattern.
 */

import { BaseLoop } from './loop-base.js';
import { ViralLoop } from '../types/index.js';
import { SmartLinkService } from '../../services/smart-links/smart-link-service.js';
import { BuddyChallengeLoop } from '../../loops/buddy-challenge-loop.js';
import { ResultsRallyLoop } from '../../loops/results-rally-loop.js';
import { ProudParentLoop } from '../../loops/proud-parent-loop.js';
import { StreakRescueLoop } from '../../loops/streak-rescue-loop.js';
import { TutorSpotlightLoop } from '../../loops/tutor-spotlight-loop.js';

export class LoopRegistry {
  private loops: Map<ViralLoop, BaseLoop> = new Map();
  private smartLinkService: SmartLinkService;

  constructor(smartLinkService: SmartLinkService) {
    this.smartLinkService = smartLinkService;
    this.registerDefaultLoops();
  }

  /**
   * Register a loop
   */
  register(loop: BaseLoop): void {
    this.loops.set(loop.loopId, loop);
  }

  /**
   * Get a loop by ID
   */
  get(loopId: ViralLoop): BaseLoop | null {
    return this.loops.get(loopId) || null;
  }

  /**
   * Get all registered loops
   */
  getAll(): BaseLoop[] {
    return Array.from(this.loops.values());
  }

  /**
   * Get loops by supported persona
   */
  getByPersona(persona: string): BaseLoop[] {
    return this.getAll().filter((loop) =>
      loop.supportedPersonas.includes(persona as any)
    );
  }

  /**
   * Check if a loop is registered
   */
  has(loopId: ViralLoop): boolean {
    return this.loops.has(loopId);
  }

  /**
   * Register default loops
   */
  private registerDefaultLoops(): void {
    // Register implemented loops
    this.register(new BuddyChallengeLoop(this.smartLinkService));
    this.register(new ResultsRallyLoop(this.smartLinkService));
    this.register(new ProudParentLoop(this.smartLinkService));
    this.register(new StreakRescueLoop(this.smartLinkService));
    this.register(new TutorSpotlightLoop(this.smartLinkService));
  }

  /**
   * Get loop statistics
   */
  getStats(): {
    totalLoops: number;
    loopsByPersona: Record<string, number>;
    loops: Array<{ id: string; name: string; personas: string[] }>;
  } {
    const allLoops = this.getAll();
    const loopsByPersona: Record<string, number> = {};

    allLoops.forEach((loop) => {
      loop.supportedPersonas.forEach((persona) => {
        loopsByPersona[persona] = (loopsByPersona[persona] || 0) + 1;
      });
    });

    return {
      totalLoops: allLoops.length,
      loopsByPersona,
      loops: allLoops.map((loop) => ({
        id: loop.loopId,
        name: loop.name,
        personas: loop.supportedPersonas,
      })),
    };
  }
}

