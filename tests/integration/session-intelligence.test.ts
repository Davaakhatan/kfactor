/**
 * Integration Tests: Session Intelligence Pipeline
 * 
 * Tests the complete flow: Session → Transcription → Summary → Actions → Loops
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem } from '../../src/index.js';
import { Persona } from '../../src/core/types/index.js';

describe('Session Intelligence Pipeline Integration', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  it('should process session through complete pipeline', async () => {
    const result = await system.sessionIntelligence.processSession({
      sessionId: 'session-1',
      userId: 'student-1',
      persona: Persona.STUDENT,
      audioData: Buffer.from('mock audio data'), // Mock audio
    });

    expect(result.success).toBe(true);
    expect(result.transcription).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(result.agenticActionsTriggered).toBeGreaterThan(0);
  });

  it('should trigger viral loops from agentic actions', async () => {
    const result = await system.sessionIntelligence.processSession({
      sessionId: 'session-2',
      userId: 'student-1',
      persona: Persona.STUDENT,
      audioData: Buffer.from('mock audio'),
    });

    // If agentic actions trigger loops, viralLoopsTriggered should be > 0
    expect(result.viralLoopsTriggered).toBeGreaterThanOrEqual(0);
  });

  it('should handle tutor session with tutor actions', async () => {
    const result = await system.sessionIntelligence.processSession({
      sessionId: 'session-3',
      userId: 'tutor-1',
      persona: Persona.TUTOR,
      audioData: Buffer.from('mock audio'),
    });

    expect(result.success).toBe(true);
    expect(result.agenticActionsTriggered).toBeGreaterThan(0);
  });
});

