# Task Breakdown: 10x K Factor Viral Growth System

## Phase 1: Foundation & Architecture (Critical Path)

### 1.1 Agent Architecture Setup
- [ ] Set up MCP protocol infrastructure
- [ ] Define JSON Schema contracts for agent interfaces
- [ ] Create agent communication framework
- [ ] Implement agent health monitoring
- [ ] Set up graceful degradation fallbacks

### 1.2 Core Agents (Required)
- [ ] **Loop Orchestrator Agent**
  - [ ] Eligibility checking logic
  - [ ] Loop selection algorithm
  - [ ] Throttling/rate limiting
  - [ ] Decision rationale logging
  - [ ] <150ms SLA implementation
  
- [ ] **Personalization Agent**
  - [ ] Persona detection (student/parent/tutor)
  - [ ] Copy generation by persona
  - [ ] Reward type selection
  - [ ] Channel selection (push/email/SMS/in-app)
  - [ ] Personalization rationale logging
  
- [ ] **Experimentation Agent**
  - [ ] Traffic allocation (control/treatment)
  - [ ] Event logging infrastructure
  - [ ] K-factor calculation
  - [ ] Uplift measurement
  - [ ] Guardrail monitoring
  - [ ] Real-time dashboard updates

### 1.3 Supporting Infrastructure
- [ ] Event bus setup
- [ ] Stream processing pipeline
- [ ] Data warehouse integration
- [ ] Model store setup
- [ ] Event schema definition and versioning

### 1.4 Attribution & Smart Links
- [ ] Smart link service (signed short codes)
- [ ] UTM tracking implementation
- [ ] Cross-device continuity
- [ ] Last-touch attribution
- [ ] Multi-touch attribution storage
- [ ] Link analytics tracking

## Phase 2: Viral Loops Implementation (Choose 4+)

### 2.1 Buddy Challenge (Student → Student)
- [ ] Trigger detection (practice completion, results page)
- [ ] Micro-deck generation (5 questions)
- [ ] Share card generation
- [ ] Deep link to challenge
- [ ] Streak shield reward logic
- [ ] FVM tracking (friend completes challenge)
- [ ] End-to-end flow testing

### 2.2 Results Rally (Async → Social)
- [ ] Results page integration (diagnostics, practice tests)
- [ ] Peer ranking calculation
- [ ] Challenge link generation
- [ ] Real-time leaderboard updates
- [ ] Cohort visibility
- [ ] FVM tracking (new user views results + first practice)
- [ ] End-to-end flow testing

### 2.3 Proud Parent (Parent → Parent)
- [ ] Weekly recap generation
- [ ] Progress reel creation (20-30s, privacy-safe)
- [ ] Share card (parent variant)
- [ ] Invite link generation
- [ ] Class pass reward allocation
- [ ] FVM tracking (invited parent's child completes first class)
- [ ] End-to-end flow testing

### 2.4 Tutor Spotlight (Tutor → Family/Peers)
- [ ] 5★ session trigger detection
- [ ] Tutor card generation
- [ ] Class sampler link creation
- [ ] Share pack generation (WhatsApp, SMS)
- [ ] Tutor XP/leaderboard tracking
- [ ] Referral attribution
- [ ] FVM tracking (new family books first session)
- [ ] End-to-end flow testing

### 2.5 Class Watch-Party (Student Host → Friends)
- [ ] Recorded class availability detection
- [ ] Co-watch invitation system
- [ ] Synced notes feature
- [ ] Friend invitation (1-3 friends)
- [ ] Class sampler + AI notes for guests
- [ ] FVM tracking (guest watches 5+ minutes or completes practice)
- [ ] End-to-end flow testing

### 2.6 Streak Rescue (Student → Student)
- [ ] Streak risk detection (within 24h of expiration)
- [ ] "Phone-a-friend" prompt
- [ ] Co-practice invitation
- [ ] Streak shield reward (both users)
- [ ] FVM tracking (friend completes practice)
- [ ] End-to-end flow testing

### 2.7 Subject Clubs (Multi-user)
- [ ] Subject club creation/joining
- [ ] Unique friend pass generation per member
- [ ] Presence tracking ("friends joined")
- [ ] Group invitation system
- [ ] FVM tracking (friend joins club + first activity)
- [ ] End-to-end flow testing

### 2.8 Achievement Spotlight (Any persona)
- [ ] Milestone badge detection
- [ ] Social card generation (privacy-safe)
- [ ] Share card creation
- [ ] Try-now micro-task generation
- [ ] FVM tracking (new user completes micro-task)
- [ ] End-to-end flow testing

## Phase 3: Session Intelligence Pipeline

### 3.1 Transcription Integration
- [ ] Integrate transcription service (live/instant sessions)
- [ ] Real-time transcription handling
- [ ] Transcription storage
- [ ] Error handling and retries

### 3.2 Summary Generation
- [ ] LLM summarization service integration
- [ ] Summary generation from transcriptions
- [ ] Skill gap identification
- [ ] Next-session prep content extraction
- [ ] Summary storage and retrieval

### 3.3 Student Agentic Actions (≥2)

#### 3.3.1 Beat-My-Skill Challenge
- [ ] Skill gap detection from summary
- [ ] 5-question micro-deck generation
- [ ] Challenge share link creation
- [ ] Streak shield reward (both users, 48h window)
- [ ] FVM tracking
- [ ] COPPA compliance (parental consent)

#### 3.3.2 Study Buddy Nudge
- [ ] Upcoming exam detection
- [ ] Stuck concept identification
- [ ] Co-practice invite generation
- [ ] Exact deck linking
- [ ] Presence indicator ("friend joined")
- [ ] Practice power-up rewards
- [ ] COPPA compliance (parental consent)

### 3.4 Tutor Agentic Actions (≥2)

#### 3.4.1 Parent Progress Reel + Invite
- [ ] Session completion with positive indicators
- [ ] Privacy-safe reel generation (20-30s)
- [ ] Key moments & wins extraction
- [ ] Referral link generation
- [ ] Class pass reward (both families)
- [ ] FERPA compliance

#### 3.4.2 Next-Session Prep Pack Share
- [ ] Next-session prep content from summary
- [ ] AI-generated prep pack
- [ ] Class sampler link
- [ ] Share pack for tutor
- [ ] Referral XP tracking
- [ ] Attribution dashboard

## Phase 4: "Alive" Layer

### 4.1 Presence Tracking
- [ ] Real-time presence service
- [ ] Subject-specific presence counts
- [ ] Age-banded presence (for minors)
- [ ] Anonymous presence by default
- [ ] Presence UI components

### 4.2 Activity Feed
- [ ] Feed generation service
- [ ] Achievement aggregation (privacy-safe)
- [ ] Challenge tracking
- [ ] Streak updates
- [ ] Friend activity (opt-in)
- [ ] Activity feed UI

### 4.3 Mini-Leaderboards
- [ ] Leaderboard calculation (per subject)
- [ ] Age-banding logic
- [ ] Time-windowed rankings (weekly, monthly)
- [ ] New user vs. veteran segmentation
- [ ] Leaderboard UI

### 4.4 Cohort Rooms
- [ ] Virtual study group creation
- [ ] Presence indicators in rooms
- [ ] Shared content management
- [ ] Group challenges
- [ ] Cohort room UI

### 4.5 Friends Online
- [ ] Friend connection system
- [ ] Online status tracking
- [ ] "Friends online now" indicator
- [ ] Opt-in mechanism
- [ ] COPPA-safe implementation

## Phase 5: Async Results as Viral Surfaces

### 5.1 Share Card Generator
- [ ] Student variant (achievement-focused)
- [ ] Parent variant (progress-focused)
- [ ] Tutor variant (insight-focused)
- [ ] Privacy-safe defaults
- [ ] COPPA/FERPA compliance

### 5.2 Deep Link Service
- [ ] FVM landing page creation
- [ ] Context pre-filling (skill, difficulty, challenge source)
- [ ] 5-question skill check generation
- [ ] Deep link tracking

### 5.3 Challenge Deck Generator
- [ ] 5-question micro-deck creation
- [ ] Skill-based deck generation
- [ ] Difficulty matching
- [ ] Deck sharing and tracking

### 5.4 Results Page Integration
- [ ] Diagnostics results page integration
- [ ] Practice test results integration
- [ ] Flashcards results integration
- [ ] Share card rendering
- [ ] CTA placement ("Challenge a friend", "Invite study buddy")
- [ ] Cohort/classroom variants

## Phase 6: Supporting Agents

### 6.1 Incentives & Economy Agent
- [ ] Reward allocation logic
- [ ] Reward types: AI minutes, class passes, gems/XP
- [ ] Abuse detection
- [ ] Unit economics tracking
- [ ] Budget management
- [ ] Reward redemption tracking

### 6.2 Social Presence Agent
- [ ] Presence signal generation
- [ ] Activity feed generation
- [ ] Leaderboard updates
- [ ] Cohort/club recommendations
- [ ] "Invite a friend" nudges

### 6.3 Tutor Advocacy Agent
- [ ] Share pack generation (smart links, thumbnails)
- [ ] One-tap sharing (WhatsApp, SMS)
- [ ] Referral attribution tracking
- [ ] Tutor XP/leaderboard updates
- [ ] Tutor dashboard

### 6.4 Trust & Safety Agent
- [ ] COPPA/FERPA-aware redaction
- [ ] Duplicate device/email detection
- [ ] Rate limiting (invites per day)
- [ ] Spam detection
- [ ] Report/undo mechanisms
- [ ] Fraud detection

## Phase 7: Frontend (Thin-Slice Prototype)

### 7.1 Core UI Components
- [ ] Presence UI components
- [ ] Leaderboard UI
- [ ] Share card UI
- [ ] Challenge invitation UI
- [ ] Cohort room UI
- [ ] Activity feed UI

### 7.2 Results Page Surfaces
- [ ] Diagnostics share surface
- [ ] Practice test share surface
- [ ] Flashcards share surface
- [ ] Share card rendering
- [ ] CTA buttons

### 7.3 Mobile Responsiveness
- [ ] Mobile-optimized share flows
- [ ] Native share integration
- [ ] Deep link handling
- [ ] Push notification UI

## Phase 8: Analytics & Experimentation

### 8.1 Event Tracking
- [ ] Core event implementation (invites_sent, invite_opened, etc.)
- [ ] Attribution event tracking
- [ ] Guardrail event tracking
- [ ] Event schema validation
- [ ] Event logging to warehouse

### 8.2 K-Factor Calculation
- [ ] Invites per user calculation
- [ ] Conversion rate calculation
- [ ] K-factor formula implementation
- [ ] Real-time K-factor updates
- [ ] Cohort-based K-factor

### 8.3 FVM Tracking
- [ ] First correct practice detection
- [ ] First AI-Tutor minute detection
- [ ] FVM attribution
- [ ] FVM analytics

### 8.4 Retention Analysis
- [ ] D1 retention calculation
- [ ] D7 retention calculation
- [ ] D28 retention calculation
- [ ] Referred vs. baseline comparison
- [ ] Cohort retention curves

### 8.5 Attribution Tracking
- [ ] Last-touch attribution
- [ ] Multi-touch attribution storage
- [ ] Cross-device attribution
- [ ] Attribution reporting

### 8.6 Dashboards
- [ ] Real-time K-factor dashboard
- [ ] Invites/conversions dashboard
- [ ] Cohort curves dashboard
- [ ] Loop performance dashboard
- [ ] Guardrail monitoring dashboard
- [ ] LTV deltas dashboard

### 8.7 Guardrail Monitoring
- [ ] Complaint rate tracking
- [ ] Opt-out rate monitoring
- [ ] Fraud detection alerts
- [ ] Support ticket tracking
- [ ] Abuse report monitoring

## Phase 9: Compliance & Safety

### 9.1 COPPA Compliance
- [ ] Privacy-safe defaults
- [ ] Parental consent flows
- [ ] Age verification
- [ ] Data minimization
- [ ] Child data segregation

### 9.2 FERPA Compliance
- [ ] Education data protection
- [ ] Access controls
- [ ] Data retention policies
- [ ] Audit logging

### 9.3 Consent Management
- [ ] Clear consent flows
- [ ] Opt-in mechanisms
- [ ] Opt-out mechanisms
- [ ] Consent tracking
- [ ] Consent UI

### 9.4 Fraud Prevention
- [ ] Duplicate account detection
- [ ] Gaming detection
- [ ] Spam detection
- [ ] Rate limiting
- [ ] Abuse reporting

### 9.5 Risk & Compliance Memo
- [ ] Data flow documentation
- [ ] Consent flow documentation
- [ ] Gating mechanisms documentation
- [ ] Compliance checklist
- [ ] Risk assessment
- [ ] 1-pager memo creation

## Phase 10: Documentation & Demo

### 10.1 Copy Kit
- [ ] Dynamic templates by persona
- [ ] Student copy variants
- [ ] Parent copy variants
- [ ] Tutor copy variants
- [ ] Localization support (en + TBD)
- [ ] Template versioning

### 10.2 Technical Documentation
- [ ] Agent contract documentation
- [ ] API documentation
- [ ] Event schema documentation
- [ ] Architecture diagrams
- [ ] Deployment procedures

### 10.3 Run-of-Show Demo
- [ ] 3-minute journey script
- [ ] Trigger → invite → join → FVM flow
- [ ] Demo environment setup
- [ ] Demo data preparation
- [ ] Demo recording

### 10.4 User Documentation
- [ ] User guides for viral features
- [ ] Privacy policy updates
- [ ] Consent flow explanations
- [ ] Help documentation

## Testing & Quality Assurance

### Test Coverage
- [ ] Unit tests for all agents (≥80% coverage)
- [ ] Integration tests for viral loops
- [ ] E2E tests for complete journeys
- [ ] Load testing (5k concurrent, 50 events/sec)
- [ ] Compliance testing (COPPA/FERPA)
- [ ] Privacy testing
- [ ] Security testing

### Performance Testing
- [ ] <150ms SLA validation
- [ ] Concurrency testing
- [ ] Throughput testing
- [ ] Latency monitoring
- [ ] Scalability testing

### Compliance Testing
- [ ] COPPA compliance validation
- [ ] FERPA compliance validation
- [ ] Consent flow testing
- [ ] Privacy-safe defaults verification
- [ ] Data segregation testing

## Deployment & Operations

### Deployment
- [ ] Development environment setup
- [ ] Staging environment setup
- [ ] Production environment setup
- [ ] CI/CD pipeline
- [ ] Deployment procedures

### Monitoring
- [ ] Agent health monitoring
- [ ] Event processing monitoring
- [ ] User metrics monitoring
- [ ] Guardrail monitoring
- [ ] Alerting setup

### Rollout Plan
- [ ] Feature flags for viral loops
- [ ] Gradual rollout plan
- [ ] Rollback procedures
- [ ] Monitoring during rollout

## Success Validation

### Metrics Validation
- [ ] K-factor ≥ 1.20 verification
- [ ] +20% FVM lift verification
- [ ] Referrals ≥ 30% of signups verification
- [ ] +10% D7 retention verification
- [ ] +5% tutor utilization verification
- [ ] ≥ 4.7/5 CSAT verification
- [ ] <0.5% fraud rate verification
- [ ] <1% opt-out rate verification

### Acceptance Criteria Validation
- [ ] ≥ 4 viral loops functioning end-to-end
- [ ] ≥ 4 agentic actions (≥2 tutor, ≥2 student)
- [ ] Measured K with clear readout
- [ ] Presence UI demonstrated
- [ ] Leaderboard demonstrated
- [ ] Compliance memo approved
- [ ] Results-page sharing active

