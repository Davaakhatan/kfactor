# kfactor

# 10x K Factor — Viral, Gamified, Supercharged Varsity Tutors

A production-ready growth system that transforms Varsity Tutors into a viral, gamified, social learning platform. The system turns every user touchpoint into a shareable, referable moment, achieving a K-factor ≥ 1.20 through closed-loop viral mechanics.

## Project Overview

This system implements a multi-agent architecture using Model Context Protocol (MCP) to:
- Identify viral opportunities from user actions
- Personalize invites and rewards by persona
- Track attribution and measure K-factor
- Create "alive" social presence
- Ensure compliance and prevent abuse

## Key Features

- **≥4 Viral Loops**: Closed-loop mechanics that drive measurable growth
- **Session Intelligence**: Transcription → Summary → Agentic Actions → Viral Loops
- **"Alive" Layer**: Presence signals, activity feeds, leaderboards, cohort rooms
- **Async Results Sharing**: Diagnostics, practice tests, flashcards as viral surfaces
- **Multi-Agent System**: Specialized agents for orchestration, personalization, experimentation, and more

## Success Metrics

### Primary Metrics
- **K-factor**: ≥ 1.20 for at least one loop (14-day cohort)
- **Activation**: +20% lift to first-value moment (FVM)
- **Referral Mix**: Referrals ≥ 30% of new weekly signups
- **Retention**: +10% D7 retention for referred cohorts
- **Tutor Utilization**: +5% via referral conversion to sessions

### Quality Metrics
- **Satisfaction**: ≥ 4.7/5 CSAT on loop prompts & rewards
- **Abuse**: <0.5% fraudulent joins; <1% opt-out from growth comms

## Project Structure

```
xfactor/
├── memory-bank/          # Project documentation
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
├── .cursor/rules/        # Project patterns and conventions
│   ├── architecture.mdc
│   └── development.mdc
├── PRD.md                # Product Requirements Document
├── TASKS.md              # Detailed task breakdown
└── README.md             # This file
```

## Documentation

- **[PRD.md](./PRD.md)**: Complete Product Requirements Document
- **[TASKS.md](./TASKS.md)**: Detailed task breakdown by phase
- **[memory-bank/](./memory-bank/)**: Project memory bank with all context

## Required Agents

1. **Loop Orchestrator Agent** (Required): Chooses which viral loop to trigger
2. **Personalization Agent** (Required): Tailors messaging and rewards by persona
3. **Experimentation Agent** (Required): Handles A/B testing and metrics
4. **Incentives & Economy Agent**: Manages rewards and prevents abuse
5. **Social Presence Agent**: Creates "alive" feeling
6. **Tutor Advocacy Agent**: Enables tutor referrals
7. **Trust & Safety Agent**: Fraud detection and compliance

## Viral Loops (Choose 4+)

1. **Buddy Challenge** (Student → Student)
2. **Results Rally** (Async → Social)
3. **Proud Parent** (Parent → Parent)
4. **Tutor Spotlight** (Tutor → Family/Peers)
5. **Class Watch-Party** (Student Host → Friends)
6. **Streak Rescue** (Student → Student)
7. **Subject Clubs** (Multi-user)
8. **Achievement Spotlight** (Any persona)

## Technical Requirements

- **Protocol**: Model Context Protocol (MCP) for agent communication
- **Contracts**: JSON Schema definitions
- **SLA**: <150ms for in-app triggers
- **Concurrency**: 5k concurrent learners
- **Throughput**: Peak 50 events/sec orchestration
- **Compliance**: COPPA/FERPA safe defaults

## Getting Started

1. Read the [PRD.md](./PRD.md) for complete requirements
2. Review [TASKS.md](./TASKS.md) for implementation plan
3. Check [memory-bank/](./memory-bank/) for project context
4. Review [.cursor/rules/](./.cursor/rules/) for architecture patterns

## Development Phases

1. **Foundation**: Agent architecture, core agents, event tracking
2. **Viral Loops**: Implement 4+ chosen loops
3. **Session Intelligence**: Transcription → Summary → Agentic actions
4. **"Alive" Layer**: Presence, leaderboards, activity feeds
5. **Async Results**: Share surfaces for diagnostics/practice
6. **Supporting Agents**: Incentives, presence, tutor advocacy, trust & safety
7. **Frontend**: Thin-slice prototype
8. **Analytics**: Event tracking, K-factor, dashboards
9. **Compliance**: COPPA/FERPA, fraud prevention
10. **Documentation & Demo**: Copy kit, technical docs, run-of-show

## Compliance

- **COPPA**: Privacy-safe defaults, parental consent for minors
- **FERPA**: Education data protection
- **Privacy**: Data minimization, child data segregation
- **Consent**: Clear consent flows, opt-out mechanisms

## Acceptance Criteria

- ✅ ≥ 4 viral loops functioning end-to-end with MCP agents
- ✅ ≥ 4 agentic actions (≥2 tutor, ≥2 student) triggered from session transcription
- ✅ Measured K for seeded cohort with clear readout (pass/fail vs K ≥ 1.20)
- ✅ Demonstrated presence UI and at least one leaderboard or cohort room
- ✅ Compliance memo approved
- ✅ Results-page sharing active for diagnostics/practice/async tools

## License

This is a bootcamp project for Peak6/XFactor.

