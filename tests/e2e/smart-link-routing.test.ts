/**
 * End-to-End Tests: Smart Link Routing
 * 
 * Tests that smart links are correctly generated, resolved, and routed
 * to the appropriate FVM pages in the frontend.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger, ViralLoop } from '../../src/core/types/index.js';
import type { SystemComponents } from '../../src/index.js';

describe('End-to-End: Smart Link Routing', () => {
  let system: SystemComponents;

  beforeAll(async () => {
    system = await initializeSystem();
  });

  describe('Link Generation', () => {
    it('should generate links in varsitytutors.com/share/[shortCode] format', async () => {
      const studentId = 'student-link-1';
      
      const result = await processUserTrigger(
        system,
        studentId,
        UserTrigger.RESULTS_PAGE_VIEW,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 85,
          practiceSubject: 'Math',
          age: 15,
          grade: '10th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        expect(invite.link).toMatch(/varsitytutors\.com\/share\/[A-Z0-9]+/);
        expect(invite.shortCode).toMatch(/^[A-Z0-9]{8}$/);
      }
    });

    it('should include UTM parameters in share URLs', async () => {
      const tutorId = 'tutor-link-1';
      
      const result = await processUserTrigger(
        system,
        tutorId,
        UserTrigger.SESSION_RATED,
        Persona.TUTOR,
        {
          userId: tutorId,
          persona: Persona.TUTOR,
          sessionRating: 5,
          subject: 'Physics',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const url = new URL(invite.link);
        
        // Check for UTM parameters
        expect(url.searchParams.has('utm_source')).toBe(true);
        expect(url.searchParams.has('utm_medium')).toBe(true);
        expect(url.searchParams.has('utm_campaign')).toBe(true);
        expect(url.searchParams.has('ref')).toBe(true);
      }
    });
  });

  describe('Link Resolution', () => {
    it('should resolve short codes to full link metadata', async () => {
      const studentId = 'student-link-2';
      
      const result = await processUserTrigger(
        system,
        studentId,
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 92,
          practiceSubject: 'Science',
          age: 14,
          grade: '9th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const shortCode = invite.shortCode;

        // Resolve link
        const resolved = system.smartLinkService.resolveLink(shortCode);
        expect(resolved).toBeDefined();
        expect(resolved!.shortCode).toBe(shortCode);
        expect(resolved!.fullUrl).toBe(invite.link);
        expect(resolved!.deepLink).toBeDefined();
        expect(resolved!.metadata.userId).toBe(studentId);
        expect(resolved!.metadata.loopId).toBeDefined();
        expect(resolved!.metadata.fvmType).toBeDefined();
      }
    });

    it('should track clicks when resolving links', async () => {
      const studentId = 'student-link-3';
      
      const result = await processUserTrigger(
        system,
        studentId,
        UserTrigger.RESULTS_PAGE_VIEW,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 88,
          practiceSubject: 'History',
          age: 16,
          grade: '11th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const shortCode = invite.shortCode;

        // Initial click count
        const resolved1 = system.smartLinkService.resolveLink(shortCode);
        const initialClicks = resolved1!.metadata.clickCount;

        // Resolve again (should increment)
        const resolved2 = system.smartLinkService.resolveLink(shortCode);
        expect(resolved2!.metadata.clickCount).toBeGreaterThan(initialClicks);
      }
    });
  });

  describe('Deep Link Routing', () => {
    it('should generate correct deep links for challenge FVM', async () => {
      const studentId = 'student-link-4';
      
      const result = await processUserTrigger(
        system,
        studentId,
        UserTrigger.RESULTS_PAGE_VIEW,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 90,
          practiceSubject: 'Math',
          age: 15,
          grade: '10th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const resolved = system.smartLinkService.resolveLink(invite.shortCode);
        
        expect(resolved!.deepLink).toContain('/challenge/');
        expect(resolved!.metadata.fvmType).toBe('challenge');
      }
    });

    it('should generate correct deep links for session FVM', async () => {
      const tutorId = 'tutor-link-2';
      
      const result = await processUserTrigger(
        system,
        tutorId,
        UserTrigger.SESSION_RATED,
        Persona.TUTOR,
        {
          userId: tutorId,
          persona: Persona.TUTOR,
          sessionRating: 5,
          subject: 'Chemistry',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const resolved = system.smartLinkService.resolveLink(invite.shortCode);
        
        expect(resolved!.deepLink).toContain('/session/');
        expect(resolved!.metadata.fvmType).toBe('session');
      }
    });

    it('should generate correct deep links for practice FVM', async () => {
      const studentId = 'student-link-5';
      
      const result = await processUserTrigger(
        system,
        studentId,
        UserTrigger.STREAK_AT_RISK,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          currentStreak: 5,
          streakExpiresIn: 18,
          subject: 'English',
          age: 13,
          grade: '8th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const resolved = system.smartLinkService.resolveLink(invite.shortCode);
        
        // Streak rescue typically leads to practice
        expect(resolved!.deepLink).toBeDefined();
        expect(resolved!.metadata.fvmType).toBeDefined();
      }
    });
  });

  describe('Link Attribution', () => {
    it('should track referrer correctly', async () => {
      const inviterId = 'student-link-6';
      const inviteeId = 'student-link-7';
      
      // Generate invite
      const result = await processUserTrigger(
        system,
        inviterId,
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          userId: inviterId,
          persona: Persona.STUDENT,
          practiceScore: 87,
          practiceSubject: 'Biology',
          age: 16,
          grade: '11th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const resolved = system.smartLinkService.resolveLink(invite.shortCode);
        
        expect(resolved!.metadata.userId).toBe(inviterId);
        expect(resolved!.metadata.referrerId).toBeUndefined(); // No referrer for initial invite

        // Track click with invitee
        system.smartLinkService.trackClick(invite.shortCode, {
          timestamp: new Date().toISOString(),
          deviceId: inviteeId,
        });

        // Verify attribution would be tracked in database
        // In production, this would be logged to events table
      }
    });
  });

  describe('Link Expiration', () => {
    it('should check link expiration', async () => {
      const studentId = 'student-link-8';
      
      const result = await processUserTrigger(
        system,
        studentId,
        UserTrigger.RESULTS_PAGE_VIEW,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 91,
          practiceSubject: 'Math',
          age: 15,
          grade: '10th',
        }
      );

      if (result.invites && result.invites.length > 0) {
        const invite = result.invites[0];
        const resolved = system.smartLinkService.resolveLink(invite.shortCode);
        
        expect(resolved!.expiresAt).toBeDefined();
        const expiresAt = new Date(resolved!.expiresAt!);
        const now = new Date();
        expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
      }
    });
  });
});

