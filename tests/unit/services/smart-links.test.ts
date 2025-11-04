/**
 * Unit Tests: Smart Links Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SmartLinkService } from '../../../src/services/smart-links/smart-link-service.js';
import { Persona, ViralLoop } from '../../../src/core/types/index.js';

describe('SmartLinkService', () => {
  let service: SmartLinkService;

  beforeEach(() => {
    service = new SmartLinkService();
  });

  describe('link generation', () => {
    it('should generate a valid smart link', () => {
      const link = service.generateLink({
        baseUrl: 'https://varsitytutors.com',
        userId: 'user-1',
        loopId: ViralLoop.BUDDY_CHALLENGE,
        persona: Persona.STUDENT,
        fvmType: 'practice',
        context: {
          subject: 'Algebra',
        },
        utmParams: {
          source: 'test',
          medium: 'test',
          campaign: 'test',
        },
      });

      expect(link).toBeDefined();
      expect(link.shortCode).toBeDefined();
      expect(link.fullUrl).toContain('varsitytutors.com');
      expect(link.fullUrl).toContain(link.shortCode);
    });

    it('should include UTM parameters', () => {
      const link = service.generateLink({
        baseUrl: 'https://varsitytutors.com',
        userId: 'user-1',
        loopId: ViralLoop.BUDDY_CHALLENGE,
        persona: Persona.STUDENT,
        fvmType: 'practice',
        utmParams: {
          source: 'test-source',
          medium: 'test-medium',
          campaign: 'test-campaign',
        },
      });

      expect(link.fullUrl).toContain('utm_source=test-source');
      expect(link.fullUrl).toContain('utm_medium=test-medium');
      expect(link.fullUrl).toContain('utm_campaign=test-campaign');
    });
  });

  describe('link resolution', () => {
    it('should resolve a generated link', () => {
      const generated = service.generateLink({
        baseUrl: 'https://varsitytutors.com',
        userId: 'user-1',
        loopId: ViralLoop.BUDDY_CHALLENGE,
        persona: Persona.STUDENT,
        fvmType: 'practice',
      });

      const resolved = service.resolveLink(generated.shortCode);

      expect(resolved).toBeDefined();
      expect(resolved?.userId).toBe('user-1');
      expect(resolved?.loopId).toBe(ViralLoop.BUDDY_CHALLENGE);
    });

    it('should return null for invalid short code', () => {
      const resolved = service.resolveLink('invalid-code');
      expect(resolved).toBeNull();
    });
  });
});

