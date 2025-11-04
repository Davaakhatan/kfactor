# System Patterns: 10x K Factor Architecture

## Architecture Overview

### Agent-Based System with MCP
The system uses Model Context Protocol (MCP) for agent communication. Each agent is a specialized service that makes decisions and provides rationale for auditability.

### Core Architecture Pattern
```
User Action → Event Bus → Loop Orchestrator → Specialized Agents → Action → Viral Loop
                                         ↓
                                   Experimentation Agent
                                         ↓
                                   Analytics Pipeline
```

## Required Agents

### 1. Loop Orchestrator Agent (Required)
**Responsibility**: Chooses which viral loop to trigger based on context
- **Triggers**: After session, badge earned, streak preserved, results page view, etc.
- **Decisions**: 
  - Which loop(s) to trigger
  - Eligibility checks (user persona, history, preferences)
  - Throttling (rate limits, cooldowns)
- **Output**: Selected loop(s) with rationale
- **SLA**: <150ms decision time

### 2. Personalization Agent (Required)
**Responsibility**: Tailors messaging and rewards by persona and context
- **Inputs**: 
  - Persona (student/parent/tutor)
  - Subject area
  - User intent/history
  - Age/grade level
- **Outputs**:
  - Personalized copy
  - Appropriate reward type
  - Channel selection (push/email/SMS/in-app)
- **Rationale**: Logs why specific personalization was chosen

### 3. Incentives & Economy Agent
**Responsibility**: Manages rewards, prevents abuse, ensures unit economics
- **Functions**:
  - Reward allocation (AI Tutor minutes, class passes, gems/XP)
  - Abuse detection (duplicate claims, gaming)
  - Unit economics tracking (cost per reward)
  - Reward redemption tracking
- **Constraints**: 
  - Budget limits per user/cohort
  - Reward caps (daily/weekly)
  - Fraud prevention

### 4. Social Presence Agent
**Responsibility**: Creates "alive" feeling through presence and activity
- **Functions**:
  - Real-time presence tracking ("X peers practicing now")
  - Activity feed generation
  - Leaderboard updates
  - Cohort/club recommendations
  - "Invite a friend" nudges
- **Privacy**: Anonymized presence, COPPA-safe defaults

### 5. Tutor Advocacy Agent
**Responsibility**: Enables tutors to refer and grow their base
- **Functions**:
  - Generate share packs (smart links, thumbnails)
  - One-tap sharing (WhatsApp, SMS)
  - Referral attribution tracking
  - Tutor XP/leaderboard updates
- **Outputs**: 
  - Shareable tutor cards
  - Class sampler links
  - Prep pack shares

### 6. Trust & Safety Agent
**Responsibility**: Fraud detection, compliance, abuse prevention
- **Functions**:
  - COPPA/FERPA-aware redaction
  - Duplicate device/email detection
  - Rate limiting (invites per day)
  - Spam detection
  - Report/undo mechanisms
- **Enforcement**: 
  - Blocks suspicious activity
  - Flags for review
  - Auto-opt-out for abuse patterns

### 7. Experimentation Agent (Required)
**Responsibility**: A/B testing, metrics, and guardrails
- **Functions**:
  - Traffic allocation (control vs. treatment)
  - Event logging (invites, opens, joins, FVM)
  - K-factor calculation
  - Uplift measurement
  - Guardrail monitoring (abuse, opt-outs, support tickets)
- **Outputs**: 
  - Real-time dashboards
  - Cohort analysis
  - Loop performance metrics

## Session Intelligence Pipeline

### Flow
```
Live/Instant Session → Transcription Service → Summary Generation → Agentic Actions
                                                      ↓
                                              Student Actions (≥2)
                                              Tutor Actions (≥2)
                                                      ↓
                                              Viral Loop Triggers
```

### Student Agentic Actions (Ship ≥ 2)
1. **Beat-My-Skill Challenge**
   - From summary's skill gaps → Generate 5-question micro-deck
   - Share link to challenge friend
   - Both get streak shields if friend reaches FVM within 48h

2. **Study Buddy Nudge**
   - If summary shows upcoming exam or stuck concept
   - Create co-practice invite tied to exact deck
   - Presence shows "friend joined"

### Tutor Agentic Actions (Ship ≥ 2)
1. **Parent Progress Reel + Invite**
   - Auto-compose privacy-safe 20-30s reel (key moments & wins)
   - Include referral link for parent to invite another parent
   - Reward: class pass for both

2. **Next-Session Prep Pack Share**
   - AI-generated prep pack for tutor
   - Class sampler link to share with peers/parents
   - Joins credit tutor's referral XP

## Viral Loop Patterns

### Loop Structure
1. **Trigger**: User action (session complete, results page, achievement)
2. **Eligibility**: Orchestrator checks if user can trigger loop
3. **Personalization**: Copy and rewards tailored to user
4. **Invite Generation**: Smart link with deep link to FVM
5. **Tracking**: Attribution, opens, joins monitored
6. **Reward**: Both inviter and invitee receive rewards
7. **Feedback Loop**: Inviter sees friend's progress, gets rewarded

### Selected Loops (Choose 4+)

1. **Buddy Challenge** (Student → Student)
   - Trigger: After practice or results page
   - Action: Share "Beat-my-score" micro-deck
   - Reward: Both get streak shields if friend reaches FVM

2. **Results Rally** (Async → Social)
   - Trigger: Diagnostics/practice results
   - Action: Rank vs. peers + challenge link
   - Reward: Real-time leaderboard updates, cohort visibility

3. **Proud Parent** (Parent → Parent)
   - Trigger: Weekly recap or progress milestone
   - Action: Shareable progress reel + invite link
   - Reward: Class pass for both families

4. **Tutor Spotlight** (Tutor → Family/Peers)
   - Trigger: After 5★ session
   - Action: Tutor card + invite link
   - Reward: Tutor accrues XP/leaderboard perks on conversion

5. **Class Watch-Party** (Student Host → Friends)
   - Trigger: Recorded class available
   - Action: Co-watch with synced notes, invite 1-3 friends
   - Reward: Guests get class sampler + AI notes

6. **Streak Rescue** (Student → Student)
   - Trigger: Streak at risk
   - Action: "Phone-a-friend" co-practice prompt
   - Reward: Both receive streak shields upon completion

7. **Subject Clubs** (Multi-user)
   - Trigger: Join subject club
   - Action: Each member gets unique friend pass
   - Reward: Presence shows "friends joined"

8. **Achievement Spotlight** (Any persona)
   - Trigger: Milestone badge earned
   - Action: Social card (privacy-safe)
   - Reward: Clickthrough gives newcomers try-now micro-task

## Async Results as Viral Surfaces

### Pattern
Results pages (diagnostics, practice tests, flashcards) must:
1. Render privacy-safe share cards (persona variants)
2. Offer "Challenge a friend / Invite a study buddy" CTAs
3. Link to exact skill deck/class/AI practice set
4. Provide deep links landing directly in FVM (5-question skill check)
5. Include cohort/classroom variants for teachers/tutors

### Components
- **Share Card Generator**: Creates persona-appropriate share cards
- **Deep Link Service**: Creates context-aware links to FVM
- **Challenge Deck Generator**: Creates 5-question micro-decks tied to results

## Data Flow Patterns

### Event Pipeline
```
User Action → Event Bus → Stream Processing → Warehouse/Model Store
                                      ↓
                            Real-time Analytics
                            (K-factor, FVM, retention)
```

### Attribution Pattern
- **Smart Links**: Signed short codes with UTM + cross-device continuity
- **Last-Touch**: Primary attribution for join
- **Multi-Touch**: Stored for analysis
- **FVM Tracking**: First correct practice or first AI-Tutor minute

### Privacy Pattern
- **PII Minimization**: Only essential data in event stream
- **Child Data Segregation**: Separate storage/compute for minors
- **COPPA Defaults**: Privacy-safe by default, opt-in for sharing
- **Parental Gating**: Consent required for minors

## Failure Modes

### Graceful Degradation
- If agents are down → Default copy/reward
- If personalization fails → Generic messaging
- If attribution fails → Continue tracking, fix retroactively
- If presence fails → Hide UI, continue core functionality

### Error Handling
- Retry logic for transient failures
- Circuit breakers for agent timeouts
- Fallback to cached responses
- User-facing: "Try again" or "Skip for now"

## Explainability Requirements

Each agent decision must include:
- **Decision**: What was chosen
- **Rationale**: Why it was chosen
- **Features Used**: What data influenced the decision
- **Confidence**: How certain the agent is
- **Logging**: All decisions logged for audit

## Concurrency Patterns

### Capacity
- 5k concurrent learners
- Peak 50 events/sec orchestration
- Horizontal scaling of agents
- Async processing for non-critical paths

### Performance
- <150ms SLA for in-app triggers
- Async processing for analytics
- Caching for frequently accessed data
- Batch processing for heavy computations

