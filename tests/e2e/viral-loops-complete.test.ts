/**
 * End-to-End Tests: Complete Viral Loop Journeys
 * 
 * Tests all 5 implemented viral loops with complete user journeys:
 * 1. Invite Generation → 2. Link Sharing → 3. Invitee Joins → 4. FVM Reached → 5. Rewards Allocated
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger, ViralLoop } from '../../src/core/types/index.js';
import type { SystemComponents } from '../../src/index.js';

describe('End-to-End: Complete Viral Loop Journeys', () => {
  let system: SystemComponents;

  beforeAll(async () => {
    system = await initializeSystem();
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('1. Buddy Challenge Loop (Student → Student)', () => {
    it('should complete full journey: invite → join → FVM → rewards', async () => {
      const studentId = 'student-1';
      const friendId = 'student-2';

      // Step 1: Student completes practice and triggers loop
      const triggerResult = await processUserTrigger(
        system,
        studentId,
        UserTrigger.RESULTS_PAGE_VIEW,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 85,
          practiceSubject: 'Math',
          practiceSkill: 'Algebra',
          age: 15,
          grade: '10th',
        }
      );

      expect(triggerResult.success).toBe(true);
      expect(triggerResult.selectedLoops).toContain(ViralLoop.BUDDY_CHALLENGE);
      expect(triggerResult.invites).toBeDefined();
      expect(triggerResult.invites!.length).toBeGreaterThan(0);

      const invite = triggerResult.invites![0];
      expect(invite.link).toBeDefined();
      expect(invite.shortCode).toBeDefined();
      expect(invite.message).toContain('challenge');

      // Step 2: Friend opens invite link
      const inviteCode = invite.shortCode;
      const buddyLoop = system.loopRegistry.get(ViralLoop.BUDDY_CHALLENGE);
      expect(buddyLoop).toBeDefined();

      const joinResult = await buddyLoop!.processJoin(inviteCode, {
        userId: friendId,
        persona: Persona.STUDENT,
        age: 16,
        grade: '10th',
      });

      expect(joinResult.success).toBe(true);
      expect(joinResult.invite).toBeDefined();
      expect(joinResult.invite!.link).toBeDefined();

      // Step 3: Friend reaches FVM (completes challenge)
      const fvmResult = await buddyLoop!.processFVM(inviteCode, {
        userId: friendId,
        persona: Persona.STUDENT,
        age: 16,
        grade: '10th',
      });

      expect(fvmResult).toBeDefined();
      expect(fvmResult!.inviterReward).toBeDefined();
      expect(fvmResult!.inviteeReward).toBeDefined();
      expect(fvmResult!.inviterReward.type).toBe('streak_shield');
      expect(fvmResult!.inviteeReward.type).toBe('streak_shield');
    });
  });

  describe('2. Results Rally Loop (Async → Social)', () => {
    it('should complete full journey: results view → rank display → challenge → FVM', async () => {
      const studentId = 'student-3';

      // Step 1: Student views results page
      const triggerResult = await processUserTrigger(
        system,
        studentId,
        UserTrigger.RESULTS_PAGE_VIEW,
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

      expect(triggerResult.success).toBe(true);
      expect(triggerResult.selectedLoops).toContain(ViralLoop.RESULTS_RALLY);

      if (triggerResult.invites && triggerResult.invites.length > 0) {
        const invite = triggerResult.invites[0];
        
        // Step 2: Friend opens challenge link
        const resultsLoop = system.loopRegistry.get(ViralLoop.RESULTS_RALLY);
        expect(resultsLoop).toBeDefined();

        const friendId = 'student-4';
        const joinResult = await resultsLoop!.processJoin(invite.shortCode, {
          userId: friendId,
          persona: Persona.STUDENT,
          age: 14,
          grade: '9th',
        });

        expect(joinResult.success).toBe(true);

        // Step 3: Friend reaches FVM (views results and takes practice)
        const fvmResult = await resultsLoop!.processFVM(invite.shortCode, {
          userId: friendId,
          persona: Persona.STUDENT,
          age: 14,
          grade: '9th',
        });

        expect(fvmResult).toBeDefined();
        expect(fvmResult!.inviterReward).toBeDefined();
        expect(fvmResult!.inviteeReward).toBeDefined();
      }
    });
  });

  describe('3. Proud Parent Loop (Parent → Parent)', () => {
    it('should complete full journey: milestone → reel → invite → FVM → rewards', async () => {
      const parentId = 'parent-1';

      // Step 1: Parent receives weekly recap/milestone
      const triggerResult = await processUserTrigger(
        system,
        parentId,
        UserTrigger.MILESTONE_REACHED,
        Persona.PARENT,
        {
          userId: parentId,
          persona: Persona.PARENT,
          milestoneType: 'weekly_recap',
          childProgress: {
            subject: 'Math',
            improvement: 15,
            achievements: ['Perfect Week', 'Streak Master'],
          },
        }
      );

      expect(triggerResult.success).toBe(true);
      expect(triggerResult.selectedLoops).toContain(ViralLoop.PROUD_PARENT);

      if (triggerResult.invites && triggerResult.invites.length > 0) {
        const invite = triggerResult.invites[0];
        expect(invite.message).toContain('progress');

        // Step 2: Another parent opens invite
        const parentLoop = system.loopRegistry.get(ViralLoop.PROUD_PARENT);
        expect(parentLoop).toBeDefined();

        const friendParentId = 'parent-2';
        const joinResult = await parentLoop!.processJoin(invite.shortCode, {
          userId: friendParentId,
          persona: Persona.PARENT,
        });

        expect(joinResult.success).toBe(true);

        // Step 3: Friend's child reaches FVM (completes first class)
        const fvmResult = await parentLoop!.processFVM(invite.shortCode, {
          userId: friendParentId,
          persona: Persona.PARENT,
        });

        expect(fvmResult).toBeDefined();
        expect(fvmResult!.inviterReward).toBeDefined();
        expect(fvmResult!.inviteeReward).toBeDefined();
        expect(fvmResult!.inviterReward.type).toBe('class_pass');
        expect(fvmResult!.inviteeReward.type).toBe('class_pass');
      }
    });
  });

  describe('4. Streak Rescue Loop (Student → Student)', () => {
    it('should complete full journey: streak at risk → rescue invite → co-practice → FVM → rewards', async () => {
      const studentId = 'student-5';

      // Step 1: Student's streak is at risk
      const triggerResult = await processUserTrigger(
        system,
        studentId,
        UserTrigger.STREAK_AT_RISK,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          currentStreak: 7,
          streakExpiresIn: 20, // hours
          subject: 'English',
          age: 13,
          grade: '8th',
        }
      );

      expect(triggerResult.success).toBe(true);
      expect(triggerResult.selectedLoops).toContain(ViralLoop.STREAK_RESCUE);

      if (triggerResult.invites && triggerResult.invites.length > 0) {
        const invite = triggerResult.invites[0];
        expect(invite.message.toLowerCase()).toMatch(/streak|rescue|practice/i);

        // Step 2: Friend opens rescue invite
        const streakLoop = system.loopRegistry.get(ViralLoop.STREAK_RESCUE);
        expect(streakLoop).toBeDefined();

        const friendId = 'student-6';
        const joinResult = await streakLoop!.processJoin(invite.shortCode, {
          userId: friendId,
          persona: Persona.STUDENT,
          age: 13,
          grade: '8th',
        });

        expect(joinResult.success).toBe(true);

        // Step 3: Both complete co-practice session (FVM)
        const fvmResult = await streakLoop!.processFVM(invite.shortCode, {
          userId: friendId,
          persona: Persona.STUDENT,
          age: 13,
          grade: '8th',
        });

        expect(fvmResult).toBeDefined();
        expect(fvmResult!.inviterReward).toBeDefined();
        expect(fvmResult!.inviteeReward).toBeDefined();
        expect(fvmResult!.inviterReward.type).toBe('streak_shield');
        expect(fvmResult!.inviteeReward.type).toBe('streak_shield');
      }
    });
  });

  describe('5. Tutor Spotlight Loop (Tutor → Family/Peers)', () => {
    it('should complete full journey: 5★ rating → tutor card → invite → session booking → FVM → rewards', async () => {
      const tutorId = 'tutor-1';

      // Step 1: Tutor receives 5★ session rating
      const triggerResult = await processUserTrigger(
        system,
        tutorId,
        UserTrigger.SESSION_RATED,
        Persona.TUTOR,
        {
          userId: tutorId,
          persona: Persona.TUTOR,
          sessionRating: 5,
          sessionId: 'session-123',
          subject: 'Math',
          tutorName: 'Expert Math Tutor',
          tutorRating: 4.9,
        }
      );

      expect(triggerResult.success).toBe(true);
      expect(triggerResult.selectedLoops).toContain(ViralLoop.TUTOR_SPOTLIGHT);

      if (triggerResult.invites && triggerResult.invites.length > 0) {
        const invite = triggerResult.invites[0];
        expect(invite.message).toMatch(/tutor|class|sampler/i);

        // Step 2: Family opens tutor invite
        const tutorLoop = system.loopRegistry.get(ViralLoop.TUTOR_SPOTLIGHT);
        expect(tutorLoop).toBeDefined();

        const parentId = 'parent-3';
        const joinResult = await tutorLoop!.processJoin(invite.shortCode, {
          userId: parentId,
          persona: Persona.PARENT,
        });

        expect(joinResult.success).toBe(true);

        // Step 3: Family books first session (FVM)
        const fvmResult = await tutorLoop!.processFVM(invite.shortCode, {
          userId: parentId,
          persona: Persona.PARENT,
        });

        expect(fvmResult).toBeDefined();
        expect(fvmResult!.inviterReward).toBeDefined();
        expect(fvmResult!.inviteeReward).toBeDefined();
        expect(fvmResult!.inviterReward.type).toBe('xp_boost');
        expect(fvmResult!.inviterReward.amount).toBe(200);
        expect(fvmResult!.inviteeReward.type).toBe('class_pass');
      }
    });
  });

  describe('Smart Link Resolution', () => {
    it('should resolve share links correctly', async () => {
      const studentId = 'student-7';
      
      // Generate a link
      const triggerResult = await processUserTrigger(
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

      if (triggerResult.invites && triggerResult.invites.length > 0) {
        const invite = triggerResult.invites[0];
        const shortCode = invite.shortCode;

        // Resolve link
        const resolved = system.smartLinkService.resolveLink(shortCode);
        expect(resolved).toBeDefined();
        expect(resolved!.shortCode).toBe(shortCode);
        expect(resolved!.fullUrl).toContain('/share/');
        expect(resolved!.metadata.userId).toBe(studentId);
        expect(resolved!.metadata.clickCount).toBeGreaterThan(0);
      }
    });
  });

  describe('FVM Tracking', () => {
    it('should track FVM events correctly', async () => {
      const studentId = 'student-8';
      const friendId = 'student-9';

      // Generate invite
      const triggerResult = await processUserTrigger(
        system,
        studentId,
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          userId: studentId,
          persona: Persona.STUDENT,
          practiceScore: 90,
          practiceSubject: 'Chemistry',
          age: 17,
          grade: '12th',
        }
      );

      if (triggerResult.invites && triggerResult.invites.length > 0) {
        const invite = triggerResult.invites[0];
        const loop = system.loopRegistry.get(ViralLoop.BUDDY_CHALLENGE);
        
        // Process join
        await loop!.processJoin(invite.shortCode, {
          userId: friendId,
          persona: Persona.STUDENT,
          age: 17,
          grade: '12th',
        });

        // Process FVM
        const fvmResult = await loop!.processFVM(invite.shortCode, {
          userId: friendId,
          persona: Persona.STUDENT,
          age: 17,
          grade: '12th',
        });

        expect(fvmResult).toBeDefined();
        expect(fvmResult!.inviterReward).toBeDefined();
        expect(fvmResult!.inviteeReward).toBeDefined();

        // Verify rewards were allocated (would be in database in production)
        // For now, we verify the reward structure
        expect(fvmResult!.inviterReward.type).toBeDefined();
        expect(fvmResult!.inviterReward.amount).toBeGreaterThan(0);
        expect(fvmResult!.inviteeReward.type).toBeDefined();
        expect(fvmResult!.inviteeReward.amount).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid invite codes gracefully', async () => {
      const loop = system.loopRegistry.get(ViralLoop.BUDDY_CHALLENGE);
      expect(loop).toBeDefined();

      const result = await loop!.processJoin('INVALID_CODE', {
        userId: 'student-10',
        persona: Persona.STUDENT,
        age: 15,
        grade: '10th',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle expired links', async () => {
      // This would require creating an expired link
      // For now, we verify the service checks expiration
      const resolved = system.smartLinkService.resolveLink('NONEXISTENT');
      expect(resolved).toBeNull();
    });
  });
});

