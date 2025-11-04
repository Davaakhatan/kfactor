# Technical Context: 10x K Factor System

## Technology Stack

### Core Technologies
- **Model Context Protocol (MCP)**: Agent communication protocol
- **JSON Schema**: Contract definitions for agent interfaces
- **Event Streaming**: Real-time event processing
- **Data Warehouse**: Analytics and model storage
- **Smart Links**: Signed short codes with attribution

### Infrastructure Requirements

#### Performance
- **Decision SLA**: <150ms for in-app triggers
- **Concurrency**: 5k concurrent learners
- **Throughput**: Peak 50 events/sec orchestration
- **Scalability**: Horizontal scaling for agents

#### Reliability
- **Graceful Degradation**: Fallback to defaults if agents fail
- **Retry Logic**: Transient failure handling
- **Circuit Breakers**: Prevent cascading failures
- **Monitoring**: Real-time health checks

### Architecture Components

#### Agent Communication
- **Protocol**: Model Context Protocol (MCP) servers
- **Contracts**: JSON-schema definitions
- **Format**: Structured requests/responses with rationale
- **Audit**: All decisions logged with context

#### Event Processing
- **Event Bus**: Central event stream
- **Stream Processing**: Real-time analytics
- **Warehouse**: Historical data storage
- **Model Store**: ML model storage and versioning

#### Attribution System
- **Smart Links**: Signed short codes
- **UTM Tracking**: Campaign parameter tracking
- **Cross-Device**: User continuity across devices
- **Multi-Touch**: Attribution tracking for analysis

### Data Architecture

#### Event Schema
- **Invites**: `invites_sent`, `invite_opened`, `account_created`, `FVM_reached`
- **Attribution**: Last-touch and multi-touch
- **Guardrails**: Complaint rate, opt-outs, latency, support tickets
- **Cohort**: Referred vs. baseline metrics

#### Privacy & Compliance
- **PII Minimization**: Only essential data in stream
- **Child Data Segregation**: Separate storage/compute
- **COPPA Compliance**: Privacy-safe defaults
- **FERPA Compliance**: Education data protection
- **Consent Management**: Clear consent flows

### Development Setup

#### Project Structure
```
xfactor/
├── agents/              # MCP agent implementations
│   ├── orchestrator/
│   ├── personalization/
│   ├── incentives/
│   ├── presence/
│   ├── tutor-advocacy/
│   ├── trust-safety/
│   └── experimentation/
├── services/            # Core services
│   ├── transcription/
│   ├── summary/
│   ├── attribution/
│   ├── smart-links/
│   └── share-cards/
├── frontend/            # Web/mobile UI
│   ├── presence/
│   ├── leaderboards/
│   ├── share-surfaces/
│   └── cohort-rooms/
├── analytics/           # Event tracking & dashboards
│   ├── events/
│   ├── k-factor/
│   └── dashboards/
├── compliance/          # Risk & compliance docs
└── tests/              # Test suites
```

#### Agent Development
- **Language**: TBD (Python/TypeScript/Go)
- **Framework**: MCP SDK
- **Testing**: Unit tests, integration tests, E2E tests
- **Documentation**: Agent contracts, decision logic

### Integration Points

#### Varsity Tutors Systems
- **Session Service**: Live/instant session data
- **Results Service**: Diagnostics, practice tests, flashcards
- **User Service**: User profiles, personas, preferences
- **Reward Service**: Credits, gems, AI minutes
- **Content Service**: Decks, classes, practice sets

#### External Services
- **Transcription**: Speech-to-text service
- **Summary**: LLM summarization service
- **Share**: Social media APIs (WhatsApp, SMS)
- **Analytics**: Event tracking platform
- **Storage**: Data warehouse, blob storage

### Deployment Considerations

#### Environment
- **Development**: Local agent development
- **Staging**: Full integration testing
- **Production**: Scaled, monitored deployment

#### Monitoring
- **Agent Health**: Response times, error rates
- **Event Processing**: Latency, throughput
- **User Metrics**: K-factor, FVM, retention
- **Guardrails**: Abuse, opt-outs, complaints

### Technical Constraints

#### Performance
- <150ms decision SLA for in-app triggers
- Async processing for non-critical paths
- Caching for frequently accessed data

#### Privacy
- COPPA/FERPA safe defaults
- Data minimization principles
- Clear consent flows
- Parental gating for minors

#### Reliability
- Graceful degradation
- Fallback mechanisms
- Error handling
- Retry logic

### Security Considerations

#### Data Protection
- Encryption at rest and in transit
- Access controls for agents
- Audit logging for decisions
- PII minimization

#### Fraud Prevention
- Duplicate detection
- Rate limiting
- Abuse detection
- Trust & Safety agent monitoring

### Analytics Infrastructure

#### Event Tracking
- Event bus → Stream processing → Warehouse
- Real-time dashboards
- Cohort analysis
- Loop performance metrics

#### Metrics Calculation
- **K-factor**: invites_sent × conversion_rate
- **FVM**: First correct practice or first AI-Tutor minute
- **Retention**: D1, D7, D28 cohorts
- **Attribution**: Last-touch and multi-touch

### Development Tools

#### Testing
- Unit tests for agents
- Integration tests for flows
- E2E tests for viral loops
- Load testing for concurrency

#### Debugging
- Agent decision logs
- Event stream inspection
- Attribution debugging
- Performance profiling

### Documentation Requirements

#### Technical Docs
- Agent contracts (JSON Schema)
- API documentation
- Event schema definitions
- Architecture diagrams

#### Operational Docs
- Deployment procedures
- Monitoring setup
- Incident response
- Compliance procedures

