# Project Brief: 10x K Factor — Viral, Gamified, Supercharged Varsity Tutors

## Project Overview
Design and implement a production-ready growth system that makes learning feel fun, social, and "alive," and that 10×'s viral growth by turning every touchpoint into a shareable, referable moment—across students, parents, and tutors.

## Core Challenge
Varsity Tutors has rich products (1:1 scheduled tutoring, instant on-demand tutoring, AI tutoring, live classes, diagnostics, practice, flashcards, etc.). The system must transform these touchpoints into viral growth mechanisms while maintaining educational value and compliance.

## Primary Objectives

### 1. Viral Loop Mechanics
- Ship ≥ 4 closed-loop viral mechanics that measurably increase K-factor
- K-factor formula: K = invites per user × invite conversion rate
- Target: K ≥ 1.20 for at least one loop over a 14-day cohort

### 2. Platform "Alive" Experience
- Presence signals showing active learning
- Activity feed of peer engagement
- Mini-leaderboards by subject
- Cohort rooms showing "others are learning with you"

### 3. Async Results as Viral Surfaces
- Convert diagnostics, practice tests, flashcards results pages into shareable surfaces
- Share cards with deep links
- Cohort challenges tied to specific content

### 4. Session Intelligence Pipeline
- Transcribe all live and instant sessions
- Generate summaries that power agentic actions
- Seed viral behaviors from session insights
- Ship ≥ 4 agentic actions (≥2 student, ≥2 tutor)

### 5. Measurable Impact
- Controlled experiment with clear analytics
- Primary metric: K-factor ≥ 1.20
- Activation: +20% lift to first-value moment (FVM)
- Referral mix: Referrals ≥ 30% of new weekly signups
- Retention: +10% D7 retention for referred cohorts

## Success Criteria

### Primary Metrics
- **K-factor**: ≥ 1.20 for at least one loop (14-day cohort)
- **Activation**: +20% lift to FVM (first correct practice or first AI-Tutor minute)
- **Referral Mix**: Referrals ≥ 30% of new weekly signups
- **Retention**: +10% D7 retention for referred cohorts
- **Tutor Utilization**: +5% via referral conversion to sessions

### Quality Metrics
- **Satisfaction**: ≥ 4.7/5 CSAT on loop prompts & rewards
- **Abuse**: <0.5% fraudulent joins; <1% opt-out from growth comms

## Compliance Requirements
- COPPA/FERPA safe defaults
- Clear consent flows for minors
- Parental gating where required
- Privacy-safe sharing by default
- Data segregation for child data

## Technical Constraints
- Model Context Protocol (MCP) between agents
- JSON-schema contracts
- <150ms decision SLA for in-app triggers
- 5k concurrent learners capacity
- Peak 50 events/sec orchestration
- Graceful degradation if agents are down

## Project Scope
This is a bootcamp project requiring:
- Thin-slice prototype (web/mobile)
- MCP agent code (or stubs)
- Session transcription + summary hooks
- Smart links + attribution service
- Event spec & dashboards
- Copy kit (dynamic templates)
- Risk & compliance memo
- Results-page share packs
- Run-of-show demo (3-minute journey)

## Timeline
Bootcamp project with deliverables including working prototype, agent code, analytics, and compliance documentation.

