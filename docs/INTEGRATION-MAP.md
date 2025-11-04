# System Integration Map
## Phase Connections & Data Flow

This document maps how all phases connect together and shows the complete data flow through the system.

---

## Phase 1: Foundation → All Phases

### Event Bus
- **Central Hub**: All events flow through `eventBus`
- **Subscribers**: AnalyticsService, monitoring systems
- **Events**: INVITE_SENT, INVITE_OPENED, FVM_REACHED, etc.

### Smart Links
- **Used By**: All loops, ResultsShareService, TutorAdvocacyAgent
- **Purpose**: Attribution, deep linking, FVM tracking

### Agent Client
- **Used By**: LoopExecutor, processUserTrigger
- **Purpose**: Inter-agent communication with circuit breakers

---

## Phase 2: Viral Loops → Phase 3, 5, 6, 8

### Loop Execution Flow
```
User Trigger → TrustSafetyAgent (Phase 6) → OrchestratorAgent → LoopExecutor
                                                                    ↓
                        PersonalizationAgent → Loop.generateInvite()
                                                                    ↓
                        ExperimentationAgent → Event Bus → AnalyticsService (Phase 8)
```

### Loop Registry
- **Registered Loops**: BUDDY_CHALLENGE, RESULTS_RALLY, PROUD_PARENT, STREAK_RESCUE
- **Validation**: processUserTrigger filters out non-existent loops

### Integration Points
- **Session Intelligence (Phase 3)**: Agentic actions trigger loops via loopExecutor
- **Results Sharing (Phase 5)**: ResultsShareService uses loopExecutor
- **Supporting Agents (Phase 6)**: IncentivesAgent for rewards, TrustSafetyAgent for fraud check

---

## Phase 3: Session Intelligence → Phase 2, 4, 6

### Pipeline Flow
```
Live/Instant Session → TranscriptionService → SummaryService → ActionOrchestrator
                                                                        ↓
                                                        Agentic Actions (4 total)
                                                                        ↓
                                                        LoopExecutor → Viral Loops (Phase 2)
                                                                        ↓
                                                        Event Bus → AnalyticsService (Phase 8)
```

### Agentic Actions
1. **Beat-My-Skill Challenge** → BUDDY_CHALLENGE loop
2. **Study Buddy Nudge** → BUDDY_CHALLENGE loop
3. **Parent Progress Reel** → PROUD_PARENT loop
4. **Prep Pack Share** → PROUD_PARENT loop (tutor loop not implemented)

### Integration Points
- **Loops (Phase 2)**: Actions trigger loops via loopExecutor
- **Alive Layer (Phase 4)**: Summary feeds into presence/activity
- **Trust & Safety (Phase 6)**: PII redaction for session data

---

## Phase 4: "Alive" Layer → Phase 2, 5, 7

### Services
- **PresenceService**: Real-time presence tracking
- **ActivityFeedService**: Event-based activity feed
- **LeaderboardService**: Score-based rankings
- **CohortService**: Study group management

### Integration Points
- **Viral Loops (Phase 2)**: Presence indicators shown in invites
- **Results Sharing (Phase 5)**: Leaderboards shown on results pages
- **Frontend (Phase 7)**: All services exposed via UI components

### Data Flow
```
User Actions → Event Bus → ActivityFeedService
                                    ↓
                         Activity Feed Items
                                    ↓
                         Frontend Components (Phase 7)
```

---

## Phase 5: Async Results → Phase 2, 4, 6

### Services
- **ShareCardGenerator**: Persona-specific share cards
- **ChallengeDeckGenerator**: 5-question micro-decks
- **ResultsShareService**: Unified results sharing

### Integration Flow
```
Results Page → ResultsShareService → ShareCardGenerator
                                            ↓
                                    ChallengeDeckGenerator
                                            ↓
                                    LoopExecutor → Viral Loops (Phase 2)
                                            ↓
                                    Smart Links → Attribution
```

### Integration Points
- **Viral Loops (Phase 2)**: Results sharing triggers RESULTS_RALLY or BUDDY_CHALLENGE
- **Alive Layer (Phase 4)**: Leaderboards shown on results pages
- **Trust & Safety (Phase 6)**: PII redaction for share cards

---

## Phase 6: Supporting Agents → Phase 2, 3, 5, 8

### IncentivesAgent
- **Used By**: LoopExecutor (when rewards allocated)
- **Purpose**: Budget management, abuse detection
- **Integration**: Called before reward allocation

### TutorAdvocacyAgent
- **Used By**: Prep Pack Share action, manual tutor sharing
- **Purpose**: Generate share packs, track referrals
- **Integration**: Uses SmartLinkService

### TrustSafetyAgent
- **Used By**: processUserTrigger, all loops, session intelligence
- **Purpose**: Fraud detection, COPPA/FERPA compliance
- **Integration**: 
  - Pre-check in processUserTrigger
  - PII redaction in session intelligence
  - Rate limiting in loops

---

## Phase 7: Frontend → Phase 4, 5, 8

### Components
- **PresenceIndicator**: Uses PresenceService (Phase 4)
- **Leaderboard**: Uses LeaderboardService (Phase 4)
- **ShareCard**: Uses ResultsShareService (Phase 5)
- **AnalyticsDashboard**: Uses AnalyticsService (Phase 8)

### Integration Points
- **Alive Layer (Phase 4)**: All alive services exposed via UI
- **Results Sharing (Phase 5)**: Share surfaces on results pages
- **Analytics (Phase 8)**: Dashboard components

---

## Phase 8: Analytics → All Phases

### AnalyticsService
- **Subscribes To**: Event Bus (all events)
- **Calculates**: K-factor, loop metrics, guardrails, cohort analysis
- **Used By**: Frontend dashboards (Phase 7)

### Integration Points
- **Event Bus (Phase 1)**: All events flow to analytics
- **Viral Loops (Phase 2)**: Loop performance tracked
- **Session Intelligence (Phase 3)**: Action success tracked
- **Supporting Agents (Phase 6)**: Fraud/compliance metrics
- **Frontend (Phase 7)**: Dashboards visualize analytics

---

## Phase 9: Compliance → All Phases

### TrustSafetyAgent Integration
- **processUserTrigger**: Pre-check before loop execution
- **Session Intelligence**: PII redaction for transcripts
- **Results Sharing**: Privacy-safe share cards
- **Viral Loops**: Age-based restrictions

### Documentation
- **COPPA Compliance**: Applied to all user-facing features
- **FERPA Compliance**: Applied to educational records
- **Risk Memo**: Documents all integration points

---

## Complete Data Flow

### User Trigger → Viral Loop Execution
```
1. User Action (trigger)
   ↓
2. TrustSafetyAgent.check_fraud() [Phase 6]
   ↓
3. OrchestratorAgent.selectLoops() [Phase 2]
   ↓
4. LoopRegistry.validate() [Phase 2]
   ↓
5. LoopExecutor.execute() [Phase 2]
   ├─→ PersonalizationAgent [Phase 2]
   ├─→ Loop.generateInvite() [Phase 2]
   ├─→ ExperimentationAgent.log() [Phase 2]
   └─→ EventBus.publish() [Phase 1]
   ↓
6. AnalyticsService.process() [Phase 8]
   ↓
7. Dashboard Updates [Phase 7]
```

### Session Intelligence → Viral Loop
```
1. Session Complete
   ↓
2. TranscriptionService.transcribe() [Phase 3]
   ↓
3. SummaryService.generate() [Phase 3]
   ↓
4. ActionOrchestrator.processSummary() [Phase 3]
   ├─→ BeatMySkillChallengeAction
   ├─→ StudyBuddyNudgeAction
   ├─→ ParentProgressReelAction
   └─→ PrepPackShareAction
   ↓
5. LoopExecutor.execute() [Phase 2]
   ↓
6. Viral Loop Executed
```

### Results Sharing → Viral Loop
```
1. Results Page View
   ↓
2. ResultsShareService.generateShare() [Phase 5]
   ├─→ ShareCardGenerator.generate() [Phase 5]
   ├─→ ChallengeDeckGenerator.generate() [Phase 5]
   └─→ LoopExecutor.execute() [Phase 2]
   ↓
3. RESULTS_RALLY or BUDDY_CHALLENGE loop
   ↓
4. Smart Link Generated [Phase 1]
   ↓
5. Event Bus → Analytics [Phase 8]
```

---

## Integration Fixes Applied

### 1. OrchestratorAgent Loop Mapping ✅
- **Issue**: Mapped to non-existent loops (ACHIEVEMENT_SPOTLIGHT, TUTOR_SPOTLIGHT, etc.)
- **Fix**: Updated to only use implemented loops (BUDDY_CHALLENGE, RESULTS_RALLY, PROUD_PARENT, STREAK_RESCUE)

### 2. Agentic Actions Loop References ✅
- **Issue**: PrepPackShareAction referenced TUTOR_SPOTLIGHT (not implemented)
- **Fix**: Changed to PROUD_PARENT loop

### 3. TrustSafetyAgent Integration ✅
- **Issue**: No fraud check before loop execution
- **Fix**: Added TrustSafetyAgent.check_fraud() in processUserTrigger

### 4. Event Bus Publishing ✅
- **Issue**: Events not always published to central event bus
- **Fix**: Added event publishing in processUserTrigger for all loop results

### 5. Loop Registry Validation ✅
- **Issue**: Could attempt to execute non-existent loops
- **Fix**: Added validation filter in processUserTrigger

### 6. Results Share Service Integration ✅
- **Status**: Already properly integrated with loopExecutor
- **Verification**: Uses RESULTS_RALLY and BUDDY_CHALLENGE loops correctly

---

## Verification Checklist

- ✅ All phases connect to Event Bus
- ✅ All loops validated against registry
- ✅ TrustSafetyAgent checks before execution
- ✅ Events published for analytics
- ✅ Session intelligence triggers loops
- ✅ Results sharing triggers loops
- ✅ Frontend components use backend services
- ✅ Analytics receives all events
- ✅ Compliance integrated throughout

---

## System Health

**Status**: ✅ **ALL INTEGRATIONS VERIFIED**

All phases are properly connected with:
- Correct data flow
- Event bus integration
- Agent communication
- Service dependencies
- Frontend-backend connection

