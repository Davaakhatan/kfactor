/**
 * Smart Link Service
 * 
 * Generates signed short codes with UTM tracking and attribution.
 * Handles deep links that land users directly in first-value moments (FVM).
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { ViralLoop, Persona } from '../../core/types/index.js';

export interface SmartLinkConfig {
  baseUrl: string;
  userId: string;
  referrerId?: string;
  loopId: ViralLoop;
  persona: Persona;
  fvmType: 'practice' | 'ai_tutor' | 'session' | 'challenge';
  context?: {
    subject?: string;
    skill?: string;
    difficulty?: string;
    challengeId?: string;
  };
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export interface SmartLink {
  shortCode: string;
  fullUrl: string;
  deepLink: string;
  expiresAt?: string;
  metadata: {
    userId: string;
    referrerId?: string;
    loopId: ViralLoop;
    persona: Persona;
    fvmType: string;
    createdAt: string;
    clickCount: number;
  };
}

export class SmartLinkService {
  private links: Map<string, SmartLink> = new Map();
  private readonly SHORT_CODE_LENGTH = 8;
  private readonly DEFAULT_EXPIRY_DAYS = 30;

  /**
   * Generate a smart link with attribution
   */
  generateLink(config: SmartLinkConfig): SmartLink {
    const linkId = uuidv4();
    const shortCode = this.generateShortCode(linkId);
    const signature = this.signLink(linkId, config.userId, config.loopId);

    // Build deep link URL
    const deepLink = this.buildDeepLink(config, linkId, signature);

    // Build full URL with UTM parameters
    const fullUrl = this.buildFullUrl(config, deepLink);

    const link: SmartLink = {
      shortCode,
      fullUrl,
      deepLink,
      expiresAt: new Date(
        Date.now() + this.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ).toISOString(),
      metadata: {
        userId: config.userId,
        referrerId: config.referrerId,
        loopId: config.loopId,
        persona: config.persona,
        fvmType: config.fvmType,
        createdAt: new Date().toISOString(),
        clickCount: 0,
      },
    };

    // Store link (in production, this would be in a database)
    this.links.set(shortCode, link);

    return link;
  }

  /**
   * Resolve a short code to link metadata
   */
  resolveLink(shortCode: string): SmartLink | null {
    const link = this.links.get(shortCode);
    if (!link) {
      return null;
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      this.links.delete(shortCode);
      return null;
    }

    // Increment click count
    link.metadata.clickCount++;

    return link;
  }

  /**
   * Track link click
   */
  trackClick(shortCode: string, clickMetadata: {
    timestamp: string;
    userAgent?: string;
    ipAddress?: string;
    deviceId?: string;
  }): boolean {
    const link = this.resolveLink(shortCode);
    if (!link) {
      return false;
    }

    // In production, this would log to analytics
    console.log(`[SmartLink] Click tracked:`, {
      shortCode,
      userId: link.metadata.userId,
      referrerId: link.metadata.referrerId,
      loopId: link.metadata.loopId,
      ...clickMetadata,
    });

    return true;
  }

  /**
   * Generate short code from UUID
   */
  private generateShortCode(uuid: string): string {
    const hash = createHash('sha256').update(uuid).digest('hex');
    return hash.substring(0, this.SHORT_CODE_LENGTH).toUpperCase();
  }

  /**
   * Sign link for security
   */
  private signLink(
    linkId: string,
    userId: string,
    loopId: ViralLoop
  ): string {
    // In production, use a secret key
    const secret = process.env.SMART_LINK_SECRET || 'default-secret';
    const payload = `${linkId}:${userId}:${loopId}`;
    return createHash('sha256')
      .update(payload + secret)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Build deep link URL
   */
  private buildDeepLink(
    config: SmartLinkConfig,
    linkId: string,
    signature: string
  ): string {
    const params = new URLSearchParams({
      linkId,
      sig: signature,
      loop: config.loopId,
      persona: config.persona,
      fvm: config.fvmType,
    });

    if (config.context?.subject) {
      params.append('subject', config.context.subject);
    }
    if (config.context?.skill) {
      params.append('skill', config.context.skill);
    }
    if (config.context?.difficulty) {
      params.append('difficulty', config.context.difficulty);
    }
    if (config.context?.challengeId) {
      params.append('challenge', config.context.challengeId);
    }

    // Build FVM-specific deep link
    const fvmPath = this.getFVMPath(config.fvmType, config.context);
    return `${config.baseUrl}${fvmPath}?${params.toString()}`;
  }

  /**
   * Build full URL with UTM parameters
   */
  private buildFullUrl(config: SmartLinkConfig, deepLink: string): string {
    const url = new URL(deepLink);
    const utm = config.utmParams ?? {};

    // Add UTM parameters
    if (utm.source) url.searchParams.set('utm_source', utm.source);
    if (utm.medium) url.searchParams.set('utm_medium', utm.medium || 'referral');
    if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign || config.loopId);
    if (utm.term) url.searchParams.set('utm_term', utm.term);
    if (utm.content) url.searchParams.set('utm_content', utm.content);

    // Add attribution parameters
    url.searchParams.set('ref', config.userId);
    if (config.referrerId) {
      url.searchParams.set('referrer', config.referrerId);
    }

    return url.toString();
  }

  /**
   * Get FVM path based on type
   */
  private getFVMPath(
    fvmType: SmartLinkConfig['fvmType'],
    context?: SmartLinkConfig['context']
  ): string {
    switch (fvmType) {
      case 'practice':
        return '/practice/start';
      case 'ai_tutor':
        return '/ai-tutor/start';
      case 'session':
        return '/session/book';
      case 'challenge':
        return context?.challengeId
          ? `/challenge/${context.challengeId}`
          : '/challenge/start';
      default:
        return '/';
    }
  }

  /**
   * Get link statistics
   */
  getLinkStats(shortCode: string): {
    clicks: number;
    createdAt: string;
    expiresAt?: string;
  } | null {
    const link = this.links.get(shortCode);
    if (!link) {
      return null;
    }

    return {
      clicks: link.metadata.clickCount,
      createdAt: link.metadata.createdAt,
      expiresAt: link.expiresAt,
    };
  }

  /**
   * Get all links for a user
   */
  getUserLinks(userId: string): SmartLink[] {
    return Array.from(this.links.values()).filter(
      (link) => link.metadata.userId === userId
    );
  }
}

