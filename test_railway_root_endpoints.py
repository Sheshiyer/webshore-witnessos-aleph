#!/usr/bin/env python3
"""
Test Railway root endpoints to see what's actually responding
"""

import requests

URLS_TO_TEST = [
    "https://witnessos-engines-production-up.railway.app",
    "https://witnessos-engines.railway.app", 
    "https://witnessos-engines-production.railway.app"
]

ENDPOINTS_TO_TEST = [
    "/",
    "/health",
    "/engines",
    "/docs"
]

def test_endpoint(url, endpoint):
    """Test a specific endpoint"""
    try:
        full_url = f"{url}{endpoint}"
        print(f"🔍 Testing: {full_url}")
        response = requests.get(full_url, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'unknown')}")
        
        if response.status_code == 200:
            content = response.text[:200]
            print(f"   Content preview: {content}")
            
            # Try to parse as JSON
            try:
                data = response.json()
                print(f"   ✅ JSON Response: {data}")
                return True
            except:
                print(f"   📄 Text Response (first 200 chars): {content}")
                return True
        else:
            print(f"   ❌ Failed: {response.text[:100]}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    return False

def main():
    print("🚀 Testing Railway Root Endpoints")
    print("=" * 60)
    
    working_combinations = []
    
    for url in URLS_TO_TEST:
        print(f"\n🌐 Testing URL: {url}")
        print("-" * 40)
        
        for endpoint in ENDPOINTS_TO_TEST:
            if test_endpoint(url, endpoint):
                working_combinations.append(f"{url}{endpoint}")
    
    print("\n" + "=" * 60)
    print("📊 RESULTS SUMMARY")
    print("=" * 60)
    
    if working_combinations:
        print("✅ Working endpoints found:")
        for combo in working_combinations:
            print(f"   {combo}")
        
        # Test the first working URL with a real engine call
        base_url = working_combinations[0].split('/')[0] + '//' + working_combinations[0].split('/')[2]
        print(f"\n🧪 Testing engine calculation on: {base_url}")
        test_engine_call(base_url)
    else:
        print("❌ No working endpoints found")
        print("🔧 Railway service configuration issue confirmed")

def test_engine_call(base_url):
    """Test an actual engine calculation"""
    try:
        payload = {
            "input": {
                "birth_date": "1991-08-13",
                "full_name": "Test User"
            }
        }
        response = requests.post(
            f"{base_url}/engines/numerology/calculate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Engine test status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Engine working! Success: {data.get('success')}")
            print(f"🎯 RAILWAY BACKEND IS FULLY OPERATIONAL!")
            print(f"\n🔧 Update .env.local with:")
            print(f"NEXT_PUBLIC_API_URL={base_url}")
        else:
            print(f"❌ Engine test failed: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Engine test error: {e}")

if __name__ == "__main__":
    main()
