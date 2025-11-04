# COPPA Compliance Documentation

## Overview

The Children's Online Privacy Protection Act (COPPA) requires operators of websites and online services to obtain verifiable parental consent before collecting personal information from children under 13. This document outlines our COPPA compliance measures for the XFactor Viral Growth System.

## Compliance Measures

### 1. Age Verification

- **Age Collection**: All users must provide age during registration
- **Age Threshold**: Special handling for users under 13
- **Verification**: Parental consent required for users under 13

### 2. PII Redaction

Our system automatically redacts Personally Identifiable Information (PII) for users under 13:

- **Email Addresses**: Redacted as `[EMAIL]`
- **Phone Numbers**: Redacted as `[PHONE]`
- **Names**: Redacted as `[NAME]`
- **Location Data**: Not collected for users under 13

**Implementation**: `TrustSafetyAgent` automatically applies COPPA-compliant redaction when processing content for users under 13.

### 3. Privacy-Safe Defaults

All features default to privacy-safe settings for users under 13:

- **Activity Feeds**: Fully anonymized
- **Leaderboards**: Anonymous display only
- **Presence Indicators**: Aggregated counts only (no individual identification)
- **Share Cards**: No PII included
- **Challenge Invites**: Anonymous challenges only

### 4. Parental Consent

**Required for:**
- Users under 13 who want to participate in viral loops
- Sharing features (results, challenges, invites)
- Social features (presence, leaderboards, cohorts)

**Consent Methods:**
1. Email verification to parent/guardian
2. Credit card verification ($0 transaction)
3. Signed consent form upload
4. Video call verification

### 5. Data Collection Limits

**Collected (with consent):**
- Age-appropriate progress data
- Learning achievements
- Anonymous participation in challenges

**Not Collected:**
- Full names
- Email addresses (only parent email for consent)
- Phone numbers
- Physical addresses
- Photos or videos of children

### 6. Data Sharing Restrictions

**No Third-Party Sharing:**
- No data shared with advertisers
- No data shared with social media platforms
- No data shared with analytics providers (except aggregated, anonymized)

**Internal Sharing:**
- Only within Varsity Tutors ecosystem
- Only for educational purposes
- Fully anonymized when shared

### 7. Right to Delete

Parents/guardians can:
- Request deletion of child's data at any time
- Review all data collected about their child
- Opt-out of data collection (while maintaining account)

**Implementation**: 
- `TrustSafetyAgent` handles deletion requests
- All data purged within 30 days of request
- Confirmation sent to parent/guardian

### 8. Viral Loop Restrictions

For users under 13:
- **Buddy Challenge**: Only with verified parent-approved friends
- **Results Rally**: Fully anonymized sharing
- **Proud Parent**: Parent must initiate (not automatic)
- **Streak Rescue**: Anonymous invites only

**Implementation**: `OrchestratorAgent` checks age before selecting loops.

### 9. Social Features Restrictions

- **Presence**: Only shows aggregated counts (e.g., "28 peers practicing now")
- **Leaderboards**: Anonymous display only (no usernames)
- **Cohort Rooms**: Only with parent-approved study groups
- **Activity Feed**: Fully anonymized achievements

### 10. Audit Trail

All actions for users under 13 are logged:
- Parental consent status
- Data collection events
- Sharing actions
- Privacy setting changes

**Retention**: 3 years after account closure or age 13, whichever comes first.

## Technical Implementation

### Trust & Safety Agent

The `TrustSafetyAgent` automatically:
- Detects age from user profile
- Applies COPPA redaction to all content
- Blocks non-compliant features
- Logs all compliance-related events

### Code Example

```typescript
// Automatic COPPA redaction
const redactedContent = trustSafetyAgent.redactPII({
  content: userContent,
  age: userAge, // If < 13, aggressive redaction applied
});
```

### Event Tracking

All compliance events are tracked:
- `COPPA_CONSENT_GRANTED`
- `COPPA_CONSENT_REVOKED`
- `COPPA_DATA_DELETED`
- `COPPA_REDACTION_APPLIED`

## Compliance Verification

### Regular Audits
- Quarterly compliance reviews
- Automated checks for COPPA violations
- Manual review of edge cases

### Monitoring
- Real-time alerts for potential violations
- Dashboard tracking of COPPA-protected users
- Guardrail metrics for compliance

## Contact

For compliance questions or concerns:
- **Email**: compliance@varsitytutors.com
- **Phone**: [Compliance hotline]
- **Address**: [Legal department address]

## Last Updated

January 2025

