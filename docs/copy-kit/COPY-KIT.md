# Copy Kit - Dynamic Templates by Persona

## Overview

This copy kit provides templates for all viral loops, personalized by persona (student, parent, tutor). All copy is dynamic and can be customized based on context.

---

## Student Persona

### Buddy Challenge Loop

#### Push Notification
```
🎯 Beat My Score Challenge!

I just scored {{score}}% on {{subject}}! Can you beat it?

👉 Take the challenge: {{link}}
```

#### Email
```
Subject: Can you beat my {{subject}} score?

Hey {{friendName}},

I just scored {{score}}%}} on my {{subject}} practice test and I'm challenging you to beat it!

The challenge is {{questionCount}} questions and takes about {{estimatedTime}} minutes. If you beat my score, we both get streak shields! 🛡️

Ready? {{link}}

- {{studentName}}
```

#### In-App
```
🎯 Challenge Your Friend!

You scored {{score}}% on {{subject}}!

Challenge a friend to beat your score:
- {{questionCount}} questions
- ~{{estimatedTime}} minutes
- Both get streak shields if they beat it!

[Challenge Friend Button]
```

#### SMS
```
Beat my {{subject}} score! I got {{score}}%. Challenge: {{link}} 🎯
```

---

### Results Rally Loop

#### Share Card
```
🎉 Amazing Results!

I scored {{score}}% on {{subject}}!
Ranked #{{rank}} of {{totalParticipants}}

{{percentile}}th percentile 🏆

[Challenge a Friend] [Share Results]
```

#### Challenge Invite
```
Check out my {{subject}} results!

Score: {{score}}%
Rank: #{{rank}}
Percentile: {{percentile}}th

Think you can beat it? {{link}}
```

---

### Streak Rescue Loop

#### Push Notification
```
⚠️ Your streak is at risk!

You need to practice today to keep your {{streakCount}}-day streak alive!

Invite a friend to practice together and save your streak: {{link}}

🛡️ Streak shield available if friend joins!
```

#### In-App
```
⚠️ Streak Rescue Needed!

Your {{streakCount}}-day streak is at risk!

Invite a friend to practice together:
- Save your streak
- Both get streak shields
- Make learning fun!

[Invite Study Buddy]
```

---

## Parent Persona

### Proud Parent Loop

#### Email
```
Subject: {{studentName}}'s Amazing Progress!

Hi {{parentName}},

I wanted to share some exciting news about {{studentName}}'s progress!

{{achievementSummary}}

View the full progress reel: {{link}}

Want to help another student succeed? Refer a friend and both families get a class pass! 🎁

- {{tutorName}}
```

#### Share Card
```
🎉 Proud Parent Moment!

{{studentName}} made amazing progress in {{subject}}!

{{keyAchievement}}

View progress: {{link}}

[Share with Friends] [Refer Another Parent]
```

#### WhatsApp/SMS
```
{{studentName}} is doing amazing in {{subject}}! Check out their progress: {{link}} 🎉

Refer a friend and both families get a class pass!
```

---

## Tutor Persona

### Prep Pack Share (via PROUD_PARENT loop)

#### Email
```
Subject: Next Session Prep Pack - {{subject}}

Hi {{parentName}},

I've prepared a prep pack for {{studentName}}'s next session on {{subject}}.

The pack includes:
- {{materialCount}} materials
- Estimated time: {{estimatedTime}} minutes
- Focus areas: {{focusAreas}}

Access the prep pack: {{link}}

Want to try a class? Here's a class sampler: {{classSamplerLink}}

- {{tutorName}}
```

#### Share Card
```
📚 Next Session Prep Pack

{{subject}} prep materials ready!
- {{materialCount}} items
- {{estimatedTime}} min prep time

[View Prep Pack] [Share Class Sampler]
```

---

## Dynamic Variables

### Common Variables
- `{{score}}` - User's score (percentage)
- `{{subject}}` - Subject name (e.g., "Algebra", "Chemistry")
- `{{friendName}}` - Friend's name (if available)
- `{{studentName}}` - Student's name
- `{{parentName}}` - Parent's name
- `{{tutorName}}` - Tutor's name
- `{{link}}` - Smart link URL
- `{{shortCode}}` - Invite short code
- `{{rank}}` - Leaderboard rank
- `{{totalParticipants}}` - Total participants
- `{{percentile}}` - Percentile rank
- `{{questionCount}}` - Number of questions
- `{{estimatedTime}}` - Estimated time in minutes
- `{{streakCount}}` - Current streak count

### Context-Specific Variables
- `{{achievementSummary}}` - Summary of achievements
- `{{keyAchievement}}` - Main achievement highlight
- `{{materialCount}}` - Number of prep materials
- `{{focusAreas}}` - Comma-separated focus areas
- `{{classSamplerLink}}` - Link to class sampler

---

## Tone Guidelines

### Student Copy
- **Tone**: Fun, competitive, encouraging
- **Emojis**: Use sparingly, achievement-focused
- **Length**: Short, scannable
- **CTA**: Action-oriented ("Challenge", "Beat it", "Try it")

### Parent Copy
- **Tone**: Proud, supportive, informative
- **Emojis**: Minimal, professional
- **Length**: Medium, detailed
- **CTA**: Share-focused ("Share", "Refer", "View")

### Tutor Copy
- **Tone**: Professional, helpful, educational
- **Emojis**: None or minimal
- **Length**: Medium to long, detailed
- **CTA**: Action-oriented ("View", "Access", "Share")

---

## Personalization Rules

### Age-Based
- **Under 13**: Simplified language, more emojis, shorter sentences
- **13-17**: Balanced, engaging, clear
- **18+**: Professional, detailed, informative

### Grade-Based
- **Elementary**: Simple words, big numbers, visual cues
- **Middle School**: Balanced, engaging
- **High School**: Detailed, achievement-focused
- **College/Adult**: Professional, comprehensive

### Subject-Based
- **Math/Science**: Achievement-focused, score-based
- **Language Arts**: Progress-focused, milestone-based
- **Test Prep**: Competitive, score-based
- **General**: Balanced, progress-focused

---

## A/B Testing Variants

### Variant A: Achievement-Focused
- Emphasizes scores, ranks, achievements
- Uses competitive language
- "Beat my score", "Top 10%", "Ranked #1"

### Variant B: Progress-Focused
- Emphasizes growth, improvement, milestones
- Uses supportive language
- "Amazing progress", "Keep going", "You're improving"

### Variant C: Social-Focused
- Emphasizes friends, community, togetherness
- Uses collaborative language
- "Practice together", "Join friends", "Study group"

---

## Localization Notes

### English (US) - Default
- All templates provided above
- Metric system for measurements
- US date format (MM/DD/YYYY)

### Future Localizations
- Spanish (ES): Translation needed
- French (FR): Translation needed
- Other languages: TBD

---

## Usage Examples

### Example 1: Buddy Challenge (Student)
```
Input:
- score: 92
- subject: "Algebra"
- questionCount: 5
- estimatedTime: 10
- friendName: "Alex"

Output:
"🎯 Beat My Score Challenge!

I just scored 92% on Algebra! Can you beat it?

👉 Take the challenge: [link]

Hey Alex, I just scored 92% on my Algebra practice test and I'm challenging you to beat it! The challenge is 5 questions and takes about 10 minutes. If you beat my score, we both get streak shields! 🛡️"
```

### Example 2: Proud Parent (Parent)
```
Input:
- studentName: "Emma"
- subject: "Chemistry"
- keyAchievement: "Mastered balancing equations"
- link: "[progress-reel-link]"

Output:
"🎉 Proud Parent Moment!

Emma made amazing progress in Chemistry!

Mastered balancing equations

View progress: [link]"
```

---

## Template Management

### Storage
- Templates stored in database or configuration
- Version-controlled
- A/B testing variants tracked

### Updates
- Templates can be updated without code changes
- Personalization rules configurable
- Localization support ready

### Analytics
- Copy performance tracked
- Conversion rates by variant
- A/B test results analyzed

