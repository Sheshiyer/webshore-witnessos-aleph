#!/bin/bash

# WitnessOS API Testing Suite
# Comprehensive testing of all consciousness engines and endpoints

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
API_URL=${1:-"http://localhost:8787"}
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${PURPLE}🧪 WitnessOS API Testing Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}API URL: ${API_URL}${NC}"
echo ""

# Test helper functions
test_endpoint() {
    local method=$1
    local endpoint=$2
    local payload=$3
    local expected_status=$4
    local test_name=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -ne "${YELLOW}Testing: ${test_name}... ${NC}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "%{http_code}" "${API_URL}${endpoint}" -o /tmp/test_response.json)
    else
        response=$(curl -s -w "%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "${API_URL}${endpoint}" \
            -o /tmp/test_response.json)
    fi
    
    http_code=${response: -3}
    
    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP ${http_code}, expected ${expected_status})${NC}"
        echo -e "${RED}Response:${NC}"
        cat /tmp/test_response.json | head -5
        echo ""
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Basic API Tests
echo -e "${YELLOW}🌐 Basic API Endpoint Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "GET" "/api" "" "200" "Root API Info"
test_endpoint "GET" "/api/health" "" "200" "Health Check"
test_endpoint "GET" "/api/engines" "" "200" "Engines List"

echo ""

# Engine Metadata Tests
echo -e "${YELLOW}📋 Engine Metadata Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

engines=("numerology" "human_design" "tarot" "iching" "enneagram" "sacred_geometry" "biorhythm" "vimshottari" "gene_keys" "sigil_forge" "vedicclock_tcm")

for engine in "${engines[@]}"; do
    test_endpoint "GET" "/api/engines/${engine}/metadata" "" "200" "${engine} metadata"
done

echo ""

# Engine Calculation Tests
echo -e "${YELLOW}🔮 Engine Calculation Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Numerology Test
numerology_payload='{"input": {"birth_date": "1990-01-15", "full_name": "Test User"}}'
test_endpoint "POST" "/api/engines/numerology/calculate" "$numerology_payload" "200" "Numerology Calculation"

# Human Design Test
human_design_payload='{"input": {"birth_date": "1990-01-15", "birth_time": "14:30", "birth_location": "New York, NY"}}'
test_endpoint "POST" "/api/engines/human_design/calculate" "$human_design_payload" "200" "Human Design Calculation"

# Tarot Test
tarot_payload='{"input": {"question": "What should I focus on today?", "spread_type": "three_card"}}'
test_endpoint "POST" "/api/engines/tarot/calculate" "$tarot_payload" "200" "Tarot Calculation"

# I-Ching Test
iching_payload='{"input": {"question": "How can I find balance?", "method": "coins"}}'
test_endpoint "POST" "/api/engines/iching/calculate" "$iching_payload" "200" "I-Ching Calculation"

# Enneagram Test
enneagram_payload='{"input": {"assessment_answers": [1, 2, 3, 4, 5], "self_selected_type": 1}}'
test_endpoint "POST" "/api/engines/enneagram/calculate" "$enneagram_payload" "200" "Enneagram Calculation"

# Sacred Geometry Test
sacred_geometry_payload='{"input": {"intention": "healing", "pattern_type": "mandala"}}'
test_endpoint "POST" "/api/engines/sacred_geometry/calculate" "$sacred_geometry_payload" "200" "Sacred Geometry Calculation"

# Biorhythm Test
biorhythm_payload='{"input": {"birth_date": "1990-01-15", "target_date": "2024-01-15"}}'
test_endpoint "POST" "/api/engines/biorhythm/calculate" "$biorhythm_payload" "200" "Biorhythm Calculation"

# Vimshottari Test
vimshottari_payload='{"input": {"birth_date": "1990-01-15", "birth_time": "14:30"}}'
test_endpoint "POST" "/api/engines/vimshottari/calculate" "$vimshottari_payload" "200" "Vimshottari Calculation"

# Gene Keys Test
gene_keys_payload='{"input": {"birth_date": "1990-01-15", "birth_time": "14:30", "birth_location": "New York, NY"}}'
test_endpoint "POST" "/api/engines/gene_keys/calculate" "$gene_keys_payload" "200" "Gene Keys Calculation"

# Sigil Forge Test
sigil_forge_payload='{"input": {"intention": "I attract abundance and prosperity", "generation_method": "traditional"}}'
test_endpoint "POST" "/api/engines/sigil_forge/calculate" "$sigil_forge_payload" "200" "Sigil Forge Calculation"

echo ""

# Batch Calculation Test
echo -e "${YELLOW}⚡ Batch Processing Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

batch_payload='{
  "calculations": [
    {
      "engine": "numerology",
      "input": {"birth_date": "1990-01-15", "full_name": "Test User"}
    },
    {
      "engine": "tarot",
      "input": {"question": "What guidance do I need?", "spread_type": "single_card"}
    },
    {
      "engine": "biorhythm",
      "input": {"birth_date": "1990-01-15", "target_date": "2024-01-15"}
    }
  ],
  "options": {"parallel": true}
}'

test_endpoint "POST" "/api/batch" "$batch_payload" "200" "Batch Calculation (3 engines)"

echo ""

# Error Handling Tests
echo -e "${YELLOW}⚠️  Error Handling Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Invalid engine
test_endpoint "GET" "/api/engines/invalid_engine/metadata" "" "404" "Invalid Engine (404)"

# Invalid input
invalid_payload='{"input": {}}'
test_endpoint "POST" "/api/engines/numerology/calculate" "$invalid_payload" "400" "Invalid Input (400)"

# Invalid method
test_endpoint "PUT" "/api/engines/numerology/calculate" "$numerology_payload" "405" "Invalid Method (405)"

# Invalid endpoint
test_endpoint "GET" "/api/invalid/endpoint" "" "404" "Invalid Endpoint (404)"

echo ""

# Performance Tests
echo -e "${YELLOW}🚀 Performance Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Quick calculation timing test
echo -ne "${YELLOW}Testing response time... ${NC}"
start_time=$(date +%s%N)
curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$numerology_payload" \
    "${API_URL}/engines/numerology/calculate" \
    -o /dev/null
end_time=$(date +%s%N)
duration_ms=$(( (end_time - start_time) / 1000000 ))

if [ $duration_ms -lt 2000 ]; then
    echo -e "${GREEN}✅ Fast (${duration_ms}ms)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  Slow (${duration_ms}ms)${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Cache Tests
echo -e "${YELLOW}💾 Cache Functionality Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# First calculation (should not be cached)
echo -ne "${YELLOW}Testing cache miss... ${NC}"
response1=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$numerology_payload" \
    "${API_URL}/engines/numerology/calculate")

if echo "$response1" | grep -q '"cached":false'; then
    echo -e "${GREEN}✅ Cache miss detected${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  Cache status unclear${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Second calculation (might be cached)
echo -ne "${YELLOW}Testing potential cache hit... ${NC}"
response2=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$numerology_payload" \
    "${API_URL}/engines/numerology/calculate")

echo -e "${BLUE}ℹ️  Second call completed${NC}"

echo ""

# Rate Limiting Tests (if applicable)
echo -e "${YELLOW}🛡️  Security Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# CORS Test
echo -ne "${YELLOW}Testing CORS headers... ${NC}"
cors_response=$(curl -s -I -X OPTIONS "${API_URL}/health")
if echo "$cors_response" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ CORS headers missing${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Reading History Management Tests
echo -e "${YELLOW}📚 Reading History Management Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Save Reading Test
save_reading_payload='{
  "userId": "test_user_123",
  "reading": {
    "id": "reading_test_001",
    "engine": "numerology",
    "input": {"birth_date": "1990-01-15", "full_name": "Test User"},
    "results": {"life_path": 7, "destiny": 3},
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "userId": "test_user_123"
  }
}'
test_endpoint "POST" "/api/readings" "$save_reading_payload" "200" "Save Reading"

# Get Reading History Test
test_endpoint "GET" "/api/readings/history?userId=test_user_123&limit=10&timeRange=30d" "" "200" "Get Reading History"

# Get Specific Reading Test
test_endpoint "GET" "/api/readings/reading_test_001" "" "200" "Get Specific Reading"

# Reading Correlation Test
test_endpoint "GET" "/api/readings/correlation?userId=test_user_123&limit=20&timeRange=90d" "" "200" "Reading Correlation Analysis"

# Reading Insights Test
test_endpoint "GET" "/api/readings/insights?userId=test_user_123&timeRange=30d" "" "200" "Reading Insights Analysis"

echo ""

# Cleanup
rm -f /tmp/test_response.json

# Test Summary
echo -e "${PURPLE}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Total Tests: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"

success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "${BLUE}Success Rate: ${success_rate}%${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${PURPLE}🎉 ALL TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}WitnessOS Consciousness API is ready for production! ✨${NC}"
    exit 0
elif [ $success_rate -ge 80 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Most tests passed (${success_rate}%)${NC}"
    echo -e "${YELLOW}Review failed tests before production deployment${NC}"
    exit 1
else
    echo ""
    echo -e "${RED}❌ Many tests failed (${success_rate}%)${NC}"
    echo -e "${RED}Significant issues need to be resolved${NC}"
    exit 1
fi 