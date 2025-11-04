# Consent Flow Documentation
## XFactor Viral Growth System

This document describes the consent flows for COPPA and FERPA compliance.

---

## COPPA Consent Flow (Users Under 13)

### Step 1: Age Detection
```
User Registration → Age < 13? → COPPA Flow Activated
```

### Step 2: Parental Notification
- Email sent to parent/guardian
- Explains viral features
- Links to consent portal
- Privacy policy link included

### Step 3: Consent Methods

**Option A: Email Verification**
1. Parent clicks email link
2. Verifies email address
3. Reviews privacy policy
4. Grants/denies consent
5. Confirmation sent

**Option B: Credit Card Verification**
1. Parent enters credit card ($0 transaction)
2. Verifies identity
3. Reviews privacy policy
4. Grants/denies consent
5. Confirmation sent

**Option C: Signed Consent Form**
1. Parent downloads consent form
2. Signs and uploads
3. Identity verification
4. Consent recorded
5. Confirmation sent

**Option D: Video Call Verification**
1. Parent schedules video call
2. Identity verification
3. Consent discussion
4. Consent recorded
5. Confirmation sent

### Step 4: Consent Management
- Consent stored with expiration date
- Parent can revoke at any time
- Consent dashboard available
- Automatic expiration reminders

---

## FERPA Consent Flow (Educational Records)

### Step 1: Record Identification
```
Session Data → Educational Record? → FERPA Protection Applied
```

### Step 2: Sharing Request
- User/parent requests sharing
- System identifies FERPA-protected data
- Consent required for disclosure

### Step 3: Consent Process

**For Internal Sharing:**
- School officials with legitimate educational interest
- No consent required (FERPA exception)

**For External Sharing:**
- Written consent required
- Clear description of what will be shared
- Purpose of sharing explained
- Recipient identified

### Step 4: Consent Recording
- Consent stored with timestamp
- Purpose and recipient logged
- Revocable at any time
- Audit trail maintained

---

## Viral Loop Consent Flows

### Buddy Challenge (Under 13)
1. User attempts to create challenge
2. System checks age (< 13)
3. Parent consent required
4. Parent approves/denies
5. If approved: Challenge created (parent-approved friends only)

### Results Rally (Under 13)
1. User attempts to share results
2. System checks age (< 13)
3. Anonymous sharing only (no consent needed)
4. If non-anonymous: Parent consent required

### Proud Parent
1. Parent initiates sharing
2. System checks consent status
3. If no consent: Consent flow activated
4. If consent: Privacy-safe reel generated

### Streak Rescue (Under 13)
1. User attempts to invite friend
2. System checks age (< 13)
3. Anonymous invite only (no consent needed)
4. If non-anonymous: Parent consent required

---

## Social Features Consent Flows

### Presence Indicators
- No consent required (aggregated only)
- Automatically privacy-safe

### Leaderboards
- No consent required (anonymous)
- Automatically privacy-safe

### Activity Feed
- No consent required (anonymized)
- Automatically privacy-safe

### Cohort Rooms
- Parent consent required for users under 13
- Parent approval for joining cohorts
- Consent dashboard for management

---

## Consent Dashboard

### Parent View
- Current consent status
- Consent expiration dates
- Revoke consent options
- Privacy settings management
- Data viewing/downloading
- Deletion requests

### User View (13+)
- Current consent status
- Privacy settings
- Sharing preferences
- Opt-out options

---

## Consent Revocation

### Process
1. User/parent requests revocation
2. System confirms revocation
3. Affected features disabled
4. Data sharing stopped
5. Confirmation sent

### Effects
- Viral loop participation disabled (if consent revoked)
- Social features disabled (if consent revoked)
- Data sharing stopped immediately
- Account remains active (core features)

---

## Implementation

### Technical Components

**Consent Service:**
- Stores consent status
- Tracks expiration dates
- Manages revocation
- Provides consent checks

**Consent Gates:**
- Check consent before feature access
- Enforce age-based restrictions
- Apply privacy-safe defaults

**Audit Logging:**
- All consent events logged
- Consent changes tracked
- Compliance reporting

---

## Compliance Verification

### Regular Checks
- Quarterly consent audits
- Expiration date monitoring
- Revocation tracking
- Compliance reporting

### Monitoring
- Consent rate tracking
- Revocation rate tracking
- Compliance dashboard
- Automated alerts

---

## Contact

For consent questions:
- **Email**: consent@varsitytutors.com
- **Phone**: [Consent hotline]
- **Dashboard**: [Consent management portal]

---

## Last Updated

January 2025

