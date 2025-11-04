#!/bin/bash
# Comprehensive Feature Testing Script
# Tests all major features of the XFactor viral growth system

set -e

API_URL="http://localhost:3001/api"
BASE_URL="http://localhost:3001"

echo "🧪 XFactor Feature Testing Script"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s "$BASE_URL/api/presence" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on port 3001${NC}"
    echo "Please start the server with: npm run server"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Authentication
echo "🔐 Test 1: Authentication"
echo "-----------------------"
STUDENT_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"student1@test.com","password":"password123"}' \
    | jq -r '.token // "ERROR"')

if [ "$STUDENT_TOKEN" = "ERROR" ] || [ "$STUDENT_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Student login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Student login successful${NC}"

PARENT_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"parent1@test.com","password":"password123"}' \
    | jq -r '.token // "ERROR"')

if [ "$PARENT_TOKEN" = "ERROR" ] || [ "$PARENT_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Parent login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Parent login successful${NC}"

TUTOR_TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"tutor1@test.com","password":"password123"}' \
    | jq -r '.token // "ERROR"')

if [ "$TUTOR_TOKEN" = "ERROR" ] || [ "$TUTOR_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Tutor login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Tutor login successful${NC}"
echo ""

# Test 2: Dashboard Endpoints
echo "📊 Test 2: Dashboard Endpoints"
echo "-----------------------------"
PRESENCE=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/presence")
if echo "$PRESENCE" | jq -e '.count' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Presence endpoint working${NC}"
else
    echo -e "${RED}❌ Presence endpoint failed${NC}"
fi

LEADERBOARD=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/leaderboard?subject=Algebra&period=weekly")
if echo "$LEADERBOARD" | jq -e '.[]' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Leaderboard endpoint working${NC}"
else
    echo -e "${RED}❌ Leaderboard endpoint failed${NC}"
fi

ACTIVITY=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/activity?limit=5")
if echo "$ACTIVITY" | jq -e '.[]' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Activity feed endpoint working${NC}"
else
    echo -e "${RED}❌ Activity feed endpoint failed${NC}"
fi
echo ""

# Test 3: Viral Loop Execution
echo "🔄 Test 3: Viral Loop Execution"
echo "-------------------------------"
LOOP_RESULT=$(curl -s -X POST "$API_URL/viral-loops/trigger" \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "trigger": "results_page_view",
        "context": {
            "subject": "Algebra",
            "practiceScore": 85,
            "skill": "Equations",
            "age": 15,
            "grade": "10th"
        }
    }' | jq -r '.success // false')

if [ "$LOOP_RESULT" = "true" ]; then
    echo -e "${GREEN}✅ Viral loop execution successful${NC}"
    
    # Get the invite details
    INVITE=$(curl -s -X POST "$API_URL/viral-loops/trigger" \
        -H "Authorization: Bearer $STUDENT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "trigger": "results_page_view",
            "context": {
                "subject": "Algebra",
                "practiceScore": 85,
                "skill": "Equations",
                "age": 15,
                "grade": "10th"
            }
        }' | jq -r '.invite.shortCode // "NONE"')
    
    if [ "$INVITE" != "NONE" ]; then
        echo -e "${GREEN}✅ Invite generated with short code: $INVITE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Viral loop execution returned false (may be throttled or not eligible)${NC}"
fi
echo ""

# Test 4: Analytics Endpoints
echo "📈 Test 4: Analytics Endpoints"
echo "-----------------------------"
K_FACTOR=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/analytics/k-factor?cohort=all&days=14")
if echo "$K_FACTOR" | jq -e '.kFactor' > /dev/null 2>&1; then
    K_VALUE=$(echo "$K_FACTOR" | jq -r '.kFactor')
    echo -e "${GREEN}✅ K-factor endpoint working (K = $K_VALUE)${NC}"
else
    echo -e "${RED}❌ K-factor endpoint failed${NC}"
fi

LOOPS=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/analytics/loops?days=14")
if echo "$LOOPS" | jq -e '.[]' > /dev/null 2>&1; then
    LOOP_COUNT=$(echo "$LOOPS" | jq 'length')
    echo -e "${GREEN}✅ Loop performance endpoint working ($LOOP_COUNT loops)${NC}"
else
    echo -e "${RED}❌ Loop performance endpoint failed${NC}"
fi

GUARDRAILS=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/analytics/guardrails?days=7")
if echo "$GUARDRAILS" | jq -e '.healthy' > /dev/null 2>&1; then
    HEALTHY=$(echo "$GUARDRAILS" | jq -r '.healthy')
    echo -e "${GREEN}✅ Guardrails endpoint working (healthy: $HEALTHY)${NC}"
else
    echo -e "${RED}❌ Guardrails endpoint failed${NC}"
fi
echo ""

# Test 5: Rewards Endpoints
echo "🎁 Test 5: Rewards Endpoints"
echo "----------------------------"
REWARDS=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/rewards")
if echo "$REWARDS" | jq -e '.[]' > /dev/null 2>&1; then
    REWARD_COUNT=$(echo "$REWARDS" | jq 'length')
    echo -e "${GREEN}✅ Rewards endpoint working ($REWARD_COUNT rewards)${NC}"
else
    echo -e "${YELLOW}⚠️ No rewards found (this is expected if no rewards have been allocated)${NC}"
fi
echo ""

# Test 6: Session Intelligence
echo "🧠 Test 6: Session Intelligence"
echo "-------------------------------"
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/session-intelligence/process" \
    -H "Authorization: Bearer $TUTOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "sessionId": "test-session-123",
        "metadata": {
            "subject": "Algebra",
            "topic": "Quadratic Equations",
            "sessionType": "scheduled"
        }
    }')

# Check if response is valid JSON
if echo "$SESSION_RESPONSE" | jq -e '.' > /dev/null 2>&1; then
    SESSION_SUCCESS=$(echo "$SESSION_RESPONSE" | jq -r '.success // false')
    if [ "$SESSION_SUCCESS" = "true" ]; then
        ACTIONS=$(echo "$SESSION_RESPONSE" | jq -r '.agenticActionsTriggered // 0')
        LOOPS=$(echo "$SESSION_RESPONSE" | jq -r '.viralLoopsTriggered // 0')
        echo -e "${GREEN}✅ Session intelligence processing successful (Actions: $ACTIONS, Loops: $LOOPS)${NC}"
    else
        ERROR_MSG=$(echo "$SESSION_RESPONSE" | jq -r '.error // "Unknown error"')
        echo -e "${YELLOW}⚠️ Session intelligence returned false: $ERROR_MSG${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Session intelligence response not valid JSON: ${SESSION_RESPONSE:0:100}${NC}"
    echo -e "${YELLOW}   (This may indicate the system needs initialization or transcription service is unavailable)${NC}"
fi
echo ""

# Test 7: Test Results
echo "📝 Test 7: Test Results"
echo "----------------------"
TEST_RESULT=$(curl -s -H "Authorization: Bearer $STUDENT_TOKEN" "$API_URL/test-results/latest")
if echo "$TEST_RESULT" | jq -e '.subject' > /dev/null 2>&1; then
    SUBJECT=$(echo "$TEST_RESULT" | jq -r '.subject')
    SCORE=$(echo "$TEST_RESULT" | jq -r '.score')
    echo -e "${GREEN}✅ Test results endpoint working (Subject: $SUBJECT, Score: $SCORE)${NC}"
else
    echo -e "${YELLOW}⚠️ No test results found (this is expected if no tests have been completed)${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo -e "${GREEN}✅ All critical endpoints tested${NC}"
echo ""
echo "Next steps:"
echo "1. Test viral loops through the frontend UI"
echo "2. Verify rewards are allocated after loop execution"
echo "3. Test complete user journeys end-to-end"
echo "4. Verify smart link resolution works"
echo ""

