#!/usr/bin/env python3
"""
Test alternative Railway URLs to find the correct endpoint
"""

import requests
import time

# Possible Railway URL patterns
POSSIBLE_URLS = [
    "https://witnessos-engines-production.up.railway.app",
    "https://witnessos-engines.up.railway.app", 
    "https://witnessos-engines-production-up.railway.app",
    "https://witnessos-engines.railway.app",
    "https://witnessos-engines-production.railway.app"
]

def test_url(url):
    """Test a specific URL for health endpoint"""
    try:
        print(f"🔍 Testing: {url}")
        response = requests.get(f"{url}/health", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ SUCCESS! Service: {data.get('service')}")
            print(f"   Engines: {len(data.get('engines_available', []))}")
            return url
        else:
            print(f"   ❌ Failed: {response.text[:100]}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    return None

def main():
    print("🚀 Testing Alternative Railway URLs")
    print("=" * 50)
    
    working_url = None
    for url in POSSIBLE_URLS:
        result = test_url(url)
        if result:
            working_url = result
            break
        time.sleep(1)
    
    print("\n" + "=" * 50)
    if working_url:
        print(f"🎉 FOUND WORKING URL: {working_url}")
        print("✅ Railway backend is accessible!")
        print(f"\n🔧 Update .env.local with:")
        print(f"NEXT_PUBLIC_API_URL={working_url}")
    else:
        print("❌ No working URLs found")
        print("🔧 Railway service needs manual configuration")
    print("=" * 50)

if __name__ == "__main__":
    main()
