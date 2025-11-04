# Feature Testing Guide

## Quick Test Script

Run the comprehensive test script:
```bash
./test-all-features.sh
```

This script tests:
- ✅ Authentication (Student, Parent, Tutor)
- ✅ Dashboard endpoints (Presence, Leaderboard, Activity)
- ✅ Viral loop execution
- ✅ Analytics endpoints (K-factor, Loops, Guardrails)
- ✅ Rewards endpoints
- ✅ Session Intelligence
- ✅ Test Results

## Manual Testing Guide

### 1. Authentication Flow

1. **Start the server:**
   ```bash
   npm run server
   ```

2. **Start the frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Test login:**
   - Go to http://localhost:5173
   - Click "Login as Student"
   - Should redirect to Student Dashboard

### 2. Viral Loop Testing

#### Student → Buddy Challenge
1. Login as student (student1@test.com)
2. Go to Dashboard
3. Click "Challenge Friend" button
4. Verify:
   - Loop executes successfully
   - Invite generated with short code
   - Rewards refresh automatically

#### Student → Results Rally
1. Login as student
2. Go to Test Results page
3. Click "Share Results" or "Challenge Friend"
4. Verify:
   - Loop executes
   - Share card generated
   - Rewards refresh

#### Parent → Proud Parent
1. Login as parent (parent1@test.com)
2. Go to Dashboard
3. Click "Share Progress" button
4. Verify:
   - Progress reel generated
   - Invite created
   - Rewards allocated

#### Tutor → Session Intelligence
1. Login as tutor (tutor1@test.com)
2. Go to Dashboard
3. Click "Process Session" button
4. Verify:
   - Session processed
   - Agentic actions triggered
   - Viral loops triggered (if applicable)

### 3. Analytics Testing

1. Login as any user
2. Navigate to Analytics page
3. Verify:
   - K-factor metrics display
   - Loop performance shows data
   - Guardrails show health status

### 4. Rewards Testing

1. Login as student
2. Execute a viral loop (challenge friend)
3. Go to Dashboard
4. Scroll to Rewards section
5. Verify:
   - New rewards appear (if allocated)
   - Can claim pending rewards
   - Status updates correctly

### 5. Smart Link Testing

1. Execute a viral loop to get a short code
2. Copy the invite link
3. Open in new browser/incognito
4. Verify:
   - Link resolves correctly
   - Redirects to appropriate page
   - Tracking works (check events in database)

## End-to-End User Journeys

### Journey 1: Student Challenge Flow
1. Student completes test → Test Results page
2. Clicks "Challenge Friend" → Buddy Challenge loop
3. Receives invite link with short code
4. Shares link with friend
5. Friend clicks link → Resolves to challenge page
6. Friend joins → Rewards allocated to both
7. Friend completes challenge → FVM reached
8. Both receive rewards

### Journey 2: Parent Sharing Flow
1. Parent views child's progress
2. Clicks "Share Progress" → Proud Parent loop
3. Progress reel generated
4. Shares with another parent
5. Other parent clicks link → Sees progress reel
6. Other parent signs up → Rewards allocated
7. Original parent gets referral credit

### Journey 3: Tutor Session Intelligence
1. Tutor completes session with student
2. Clicks "Process Session" → Session Intelligence
3. System:
   - Transcribes session
   - Generates summary
   - Identifies skill gaps
   - Triggers agentic actions
   - Generates viral loops (if applicable)
4. Tutor sees results and can share

## Database Verification

Check that events are being logged:
```bash
sqlite3 xfactor.db "SELECT event_type, COUNT(*) FROM events GROUP BY event_type;"
```

Check loop executions:
```bash
sqlite3 xfactor.db "SELECT loop_id, COUNT(*) FROM loop_executions GROUP BY loop_id;"
```

Check rewards:
```bash
sqlite3 xfactor.db "SELECT reward_type, status, COUNT(*) FROM rewards GROUP BY reward_type, status;"
```

## Troubleshooting

### Server not starting
- Check if port 3001 is available: `lsof -ti:3001`
- Check for TypeScript errors: `npm run build`

### CORS errors
- Verify server is running
- Check CORS configuration in `server/index.ts`
- Clear browser cache

### Viral loops not executing
- Check server logs for initialization errors
- Verify system components are initialized
- Check database for event logging

### Rewards not showing
- Verify rewards are allocated in database
- Check API response: `curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/rewards`
- Refresh the page

## Performance Testing

### Load Testing
```bash
# Test 100 concurrent requests
for i in {1..100}; do
  curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/presence" &
done
wait
```

### Latency Testing
```bash
# Measure response time
time curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/analytics/k-factor"
```

## Success Criteria

✅ All authentication flows work  
✅ All viral loops execute successfully  
✅ Analytics endpoints return data  
✅ Rewards system displays and claims work  
✅ Session intelligence processes correctly  
✅ Smart links resolve properly  
✅ CORS configured correctly  
✅ No critical errors in console  

