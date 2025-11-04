# Product Requirements Document: 10x K Factor Viral Growth System

## Executive Summary

Build a production-ready growth system that transforms Varsity Tutors into a viral, gamified, social learning platform. The system turns every user touchpoint into a shareable, referable moment, achieving a K-factor ≥ 1.20 through closed-loop viral mechanics.

## Problem Statement

Varsity Tutors has rich educational products but lacks systematic viral growth. Current growth relies on traditional marketing, missing opportunities to:
- Turn satisfied users into advocates
- Create social proof through presence/activity
- Leverage moment-of-pride moments
- Make learning feel collaborative

## Solution Overview

A multi-agent system using Model Context Protocol (MCP) that:
1. Identifies viral opportunities from user actions
2. Personalizes invites and rewards by persona
3. Tracks attribution and measures K-factor
4. Creates "alive" social presence
5. Ensures compliance and prevents abuse

## Goals & Success Metrics

### Primary Metrics
- **K-factor**: ≥ 1.20 for at least one loop (14-day cohort)
- **Activation**: +20% lift to first-value moment (FVM)
- **Referral Mix**: Referrals ≥ 30% of new weekly signups
- **Retention**: +10% D7 retention for referred cohorts
- **Tutor Utilization**: +5% via referral conversion to sessions

### Quality Metrics
- **Satisfaction**: ≥ 4.7/5 CSAT on loop prompts & rewards
- **Abuse**: <0.5% fraudulent joins; <1% opt-out from growth comms

## User Personas

### Students
- **Age**: K-12, college, adult learners
- **Needs**: Social connection, competition, help when stuck
- **Behaviors**: Share achievements, compete with friends, maintain streaks
- **Compliance**: COPPA applies to minors

### Parents
- **Needs**: Advocacy tools, social proof, value demonstration
- **Behaviors**: Share child's progress, invite other parents
- **Compliance**: Parental consent required for minors

### Tutors
- **Needs**: Growth tools, recognition, efficiency
- **Behaviors**: Share achievements, invite families, build reputation
- **Incentives**: XP, leaderboard perks, referral credits

## Viral Loops (Choose 4+ to Implement)

### 1. Buddy Challenge (Student → Student)
**Trigger**: After practice session or results page view
**Action**: Share "Beat-my-score" micro-deck (5 questions)
**Reward**: Both get streak shields if friend reaches FVM within 48h
**FVM**: Friend completes 5-question challenge correctly
**K-factor Target**: 1.2+

### 2. Results Rally (Async → Social)
**Trigger**: Diagnostics/practice test results page
**Action**: Show rank vs. peers + generate challenge link
**Reward**: Real-time leaderboard updates, cohort visibility
**FVM**: New user views results and takes first practice question
**K-factor Target**: 1.2+

### 3. Proud Parent (Parent → Parent)
**Trigger**: Weekly recap or progress milestone
**Action**: Auto-generated privacy-safe 20-30s reel + invite link
**Reward**: Class pass for both families
**FVM**: Invited parent's child completes first class or practice
**K-factor Target**: 1.2+

### 4. Tutor Spotlight (Tutor → Family/Peers)
**Trigger**: After 5★ session rating
**Action**: Tutor card + invite link with class sampler
**Reward**: Tutor accrues XP/leaderboard perks when joins convert
**FVM**: New family books first session with tutor
**K-factor Target**: 1.2+

### 5. Class Watch-Party (Student Host → Friends)
**Trigger**: Recorded class available
**Action**: Co-watch with synced notes, invite 1-3 friends
**Reward**: Guests get class sampler + AI notes
**FVM**: Guest completes first practice question or watches 5+ minutes
**K-factor Target**: 1.2+

### 6. Streak Rescue (Student → Student)
**Trigger**: Streak at risk (within 24h of expiration)
**Action**: "Phone-a-friend" co-practice prompt
**Reward**: Both receive streak shields upon completion
**FVM**: Friend completes practice session
**K-factor Target**: 1.2+

### 7. Subject Clubs (Multi-user)
**Trigger**: Join subject club
**Action**: Each member gets unique friend pass
**Reward**: Presence shows "friends joined"
**FVM**: Friend joins club and completes first activity
**K-factor Target**: 1.2+

### 8. Achievement Spotlight (Any persona)
**Trigger**: Milestone badge earned
**Action**: Social card (privacy-safe by default)
**Reward**: Clickthrough gives newcomers try-now micro-task
**FVM**: New user completes micro-task
**K-factor Target**: 1.2+

## Required Agents

### Loop Orchestrator Agent (Required)
**Purpose**: Choose which viral loop to trigger
**Inputs**: 
- User action (session complete, results page, achievement, etc.)
- User persona and history
- Eligibility rules
- Throttling state
**Outputs**:
- Selected loop(s)
- Rationale for selection
- Eligibility status
**SLA**: <150ms decision time

### Personalization Agent (Required)
**Purpose**: Tailor messaging and rewards by persona
**Inputs**:
- Persona (student/parent/tutor)
- Subject area
- User intent/history
- Age/grade level
**Outputs**:
- Personalized copy
- Appropriate reward type
- Channel selection (push/email/SMS/in-app)
- Rationale
**SLA**: <150ms decision time

### Experimentation Agent (Required)
**Purpose**: A/B testing, metrics, and guardrails
**Inputs**:
- User ID
- Loop ID
- Variant assignment
**Outputs**:
- Traffic allocation (control vs. treatment)
- Event logging
- K-factor calculation
- Uplift measurement
- Guardrail monitoring
**SLA**: Real-time metrics, <1s dashboard updates

### Incentives & Economy Agent
**Purpose**: Manage rewards and prevent abuse
**Functions**:
- Reward allocation (AI Tutor minutes, class passes, gems/XP)
- Abuse detection
- Unit economics tracking
- Budget management
**Outputs**:
- Reward approved/denied
- Reward details
- Rationale

### Social Presence Agent
**Purpose**: Create "alive" feeling
**Functions**:
- Real-time presence tracking
- Activity feed generation
- Leaderboard updates
- Cohort recommendations
**Outputs**:
- Presence indicators ("X peers practicing now")
- Activity feed items
- Leaderboard entries
- Cohort suggestions

### Tutor Advocacy Agent
**Purpose**: Enable tutor referrals
**Functions**:
- Generate share packs (smart links, thumbnails)
- One-tap sharing (WhatsApp, SMS)
- Referral attribution
- Tutor XP tracking
**Outputs**:
- Shareable tutor cards
- Class sampler links
- Prep pack shares

### Trust & Safety Agent
**Purpose**: Fraud detection and compliance
**Functions**:
- COPPA/FERPA-aware redaction
- Duplicate detection
- Rate limiting
- Spam detection
- Report/undo mechanisms
**Outputs**:
- Allow/block decision
- Risk score
- Rationale

## Session Intelligence Pipeline

### Flow
```
Live/Instant Session → Transcription → Summary → Agentic Actions → Viral Loops
```

### Student Agentic Actions (Ship ≥ 2)

#### 1. Beat-My-Skill Challenge
- **Trigger**: Session summary identifies skill gaps
- **Action**: Generate 5-question micro-deck
- **Share**: Deep link to challenge friend
- **Reward**: Both get streak shields if friend reaches FVM within 48h
- **Privacy**: COPPA-safe, parental consent for minors

#### 2. Study Buddy Nudge
- **Trigger**: Summary shows upcoming exam or stuck concept
- **Action**: Create co-practice invite tied to exact deck
- **Presence**: Show "friend joined" indicator
- **Reward**: Both get practice power-ups
- **Privacy**: COPPA-safe, parental consent for minors

### Tutor Agentic Actions (Ship ≥ 2)

#### 1. Parent Progress Reel + Invite
- **Trigger**: Session completion with positive indicators
- **Action**: Auto-compose privacy-safe 20-30s reel (key moments & wins)
- **Share**: Referral link for parent to invite another parent
- **Reward**: Class pass for both families
- **Privacy**: FERPA-compliant, parent consent required

#### 2. Next-Session Prep Pack Share
- **Trigger**: Session summary with next-session prep content
- **Action**: AI-generated prep pack + class sampler link
- **Share**: Tutor shares with peers/parents
- **Reward**: Joins credit tutor's referral XP
- **Attribution**: Tutor dashboard shows referral impact

## Async Results as Viral Surfaces

### Requirements
All results pages (diagnostics, practice tests, flashcards) must:

1. **Render Share Cards**
   - Student variant: Achievement-focused, challenge CTA
   - Parent variant: Progress-focused, invite CTA
   - Tutor variant: Insight-focused, class sampler CTA
   - Privacy-safe by default (COPPA/FERPA)

2. **Offer CTAs**
   - "Challenge a friend to beat your score"
   - "Invite a study buddy"
   - Tied to exact skill deck/class/AI practice set

3. **Provide Deep Links**
   - Land new users directly in FVM
   - Example: 5-question skill check
   - Pre-filled context (skill, difficulty, challenge source)

4. **Include Cohort Variants**
   - Classroom/group invite options
   - Teacher/tutor group management
   - Bulk invitation capabilities

## "Alive" Layer Requirements

### Presence Signals
- Real-time count: "28 peers practicing Algebra now"
- Subject-specific presence
- Age-banded presence (for minors)
- Anonymous by default

### Activity Feed
- Recent achievements (privacy-safe)
- Challenges issued/completed
- Streaks maintained
- Friend activity (opt-in)

### Mini-Leaderboards
- Per subject
- Age-banded (fairness)
- Time-windowed (weekly, monthly)
- New user vs. veteran segments

### Cohort Rooms
- Virtual study groups
- Presence indicators
- Shared content
- Group challenges

### Friends Online
- "Friends online now" indicator
- Opt-in only
- COPPA-safe for minors

## Technical Requirements

### Agent Communication
- **Protocol**: Model Context Protocol (MCP)
- **Contracts**: JSON Schema definitions
- **SLA**: <150ms for in-app triggers
- **Explainability**: All decisions include rationale

### Performance
- **Concurrency**: 5k concurrent learners
- **Throughput**: Peak 50 events/sec orchestration
- **Scalability**: Horizontal scaling
- **Reliability**: Graceful degradation if agents fail

### Attribution
- **Smart Links**: Signed short codes with UTM
- **Cross-Device**: User continuity
- **Last-Touch**: Primary attribution for join
- **Multi-Touch**: Stored for analysis

### Data Architecture
- **Event Bus**: Central event stream
- **Stream Processing**: Real-time analytics
- **Warehouse**: Historical data
- **Model Store**: ML models
- **PII Minimization**: Only essential data
- **Child Data Segregation**: Separate storage/compute

### Privacy & Compliance
- **COPPA**: Privacy-safe defaults, parental consent
- **FERPA**: Education data protection
- **Consent Flows**: Clear, explicit consent
- **Parental Gating**: Required for minors
- **Data Minimization**: Only collect necessary data

## Event Schema

### Core Events
- `invites_sent`: User sends invite
- `invite_opened`: Invitee opens link
- `account_created`: New account from invite
- `FVM_reached`: First-value moment achieved
- `reward_claimed`: Reward redeemed
- `loop_triggered`: Viral loop activated

### Attribution Events
- `invite_viewed`: Invite viewed (before open)
- `invite_clicked`: Invite link clicked
- `signup_started`: Registration begun
- `signup_completed`: Registration finished
- `first_session`: First session booked/completed
- `first_practice`: First practice question answered

### Guardrail Events
- `complaint_filed`: User complaint
- `opt_out`: User opts out of growth comms
- `abuse_report`: Abuse detected/reported
- `fraud_detected`: Fraudulent activity
- `support_ticket`: Support request

## Analytics & Experimentation

### K-Factor Calculation
```
K = (invites_sent_per_user × invite_conversion_rate)
```
- **invites_sent_per_user**: Average invites sent per user in cohort
- **invite_conversion_rate**: % of invites that convert to FVM
- **Target**: K ≥ 1.20

### Experiment Design
- **Control**: Baseline experience (no viral loops)
- **Treatment**: Viral loops enabled
- **Allocation**: 50/50 split (or configured)
- **Duration**: 14-day cohort minimum
- **Metrics**: K-factor, FVM, retention, guardrails

### Dashboards
- **Real-time**: K-factor, invites, conversions
- **Cohort**: Referred vs. baseline curves
- **Loop Performance**: Funnel drop-offs per loop
- **Guardrails**: Abuse, opt-outs, complaints
- **LTV Deltas**: Lifetime value comparison

## Acceptance Criteria

### Functional Requirements
- ✅ ≥ 4 viral loops functioning end-to-end with MCP agents
- ✅ ≥ 4 agentic actions (≥2 tutor, ≥2 student) triggered from session transcription
- ✅ Measured K for seeded cohort with clear readout (pass/fail vs K ≥ 1.20)
- ✅ Demonstrated presence UI and at least one leaderboard or cohort room
- ✅ Compliance memo approved
- ✅ Results-page sharing active for diagnostics/practice/async tools

### Technical Requirements
- ✅ MCP agent code (or stubs) for required agents
- ✅ Session transcription + summary hooks
- ✅ Signed smart links + attribution service
- ✅ Event spec & dashboards
- ✅ Graceful degradation if agents fail

### Deliverables
- ✅ Thin-slice prototype (web/mobile) with ≥ 4 working loops
- ✅ Live presence UI
- ✅ Copy kit: dynamic templates by persona, localized [en + TBD]
- ✅ Risk & compliance memo (1-pager)
- ✅ Results-page share packs
- ✅ Run-of-show demo: 3-minute journey from trigger → invite → join → FVM

## Risk & Compliance

### Privacy Risks
- **COPPA**: Minors require parental consent
- **FERPA**: Education data protection
- **PII Exposure**: Minimize data collection
- **Mitigation**: Privacy-safe defaults, clear consent, parental gating

### Fraud Risks
- **Duplicate Accounts**: Same user creating multiple accounts
- **Gaming Rewards**: Users gaming the system for rewards
- **Spam Invites**: Users sending mass invites
- **Mitigation**: Trust & Safety agent, rate limiting, abuse detection

### Technical Risks
- **Agent Failures**: Agents down or slow
- **Attribution Errors**: Incorrect tracking
- **Performance**: Latency issues
- **Mitigation**: Graceful degradation, fallbacks, monitoring

### Business Risks
- **Unit Economics**: Rewards cost too high
- **User Experience**: Too intrusive, opt-outs
- **Compliance**: Violations result in fines
- **Mitigation**: Incentives agent tracks costs, user testing, compliance review

## Open Questions / Decisions Needed

1. **Optimal Reward Mix**: AI minutes vs. gem boosts vs. class passes by persona
2. **Leaderboard Fairness**: New users vs. veterans, age bands
3. **Spam Thresholds**: Caps on invites/day, cool-downs, school email handling
4. **K-factor Definition**: Multi-touch attribution (view → sign-up → FVM)
5. **Tutor Incentives**: Reward structure, disclosures, attribution rules
6. **Baseline Metrics**: What's current referral rate to beat?
7. **Localization**: Which languages beyond English?
8. **Technology Stack**: Specific choices for agents, event streaming, data warehouse

## Timeline & Milestones

### Milestone 1: Foundation (Week 1-2)
- Agent architecture setup
- Core agents (Orchestrator, Personalization, Experimentation)
- Event tracking
- Smart links service

### Milestone 2: First Loop (Week 2-3)
- One complete loop end-to-end
- Attribution tracking
- Basic analytics

### Milestone 3: Session Intelligence (Week 3-4)
- Transcription integration
- Summary generation
- Agentic actions (≥4)

### Milestone 4: "Alive" Layer (Week 4-5)
- Presence signals
- Leaderboards
- Activity feed

### Milestone 5: Prototype Complete (Week 5-6)
- ≥4 loops working
- Frontend thin-slice
- Analytics dashboard
- Compliance memo
- Demo ready

## Appendix

### Glossary
- **K-factor**: Viral coefficient = invites per user × conversion rate
- **FVM**: First-value moment (first correct practice or first AI-Tutor minute)
- **MCP**: Model Context Protocol
- **COPPA**: Children's Online Privacy Protection Act
- **FERPA**: Family Educational Rights and Privacy Act
- **PII**: Personally Identifiable Information

### References
- Varsity Tutors product catalog
- COPPA compliance guidelines
- FERPA compliance guidelines
- MCP protocol specification
- Viral growth best practices

