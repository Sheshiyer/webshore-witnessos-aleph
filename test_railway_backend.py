#!/usr/bin/env python3
"""
Railway Backend Testing Script
Tests the deployed WitnessOS consciousness engines on Railway
"""

import requests
import json
import time
from datetime import datetime

RAILWAY_URL = "https://witnessos-engines-production.up.railway.app"

def test_health_check():
    """Test the health endpoint"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(f"{RAILWAY_URL}/health", timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"Service: {data.get('service')}")
            print(f"Engines available: {len(data.get('engines_available', []))}")
            print(f"Swiss Ephemeris: {data.get('swiss_ephemeris')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_admin_user():
    """Test the admin user endpoint"""
    print("\n👤 Testing admin user...")
    try:
        response = requests.get(f"{RAILWAY_URL}/test/admin-user", timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin user test passed")
            print(f"Swiss Ephemeris Sun: {data.get('swiss_ephemeris', {}).get('personality_sun')}")
            print(f"Human Design Type: {data.get('human_design_engine', {}).get('type')}")
            return True
        else:
            print(f"❌ Admin user test failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Admin user test error: {e}")
        return False

def test_numerology_engine():
    """Test the numerology engine"""
    print("\n🔢 Testing numerology engine...")
    try:
        payload = {
            "input": {
                "birth_date": "1991-08-13",
                "full_name": "Test User"
            }
        }
        response = requests.post(
            f"{RAILWAY_URL}/engines/numerology/calculate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Numerology engine working")
            print(f"Success: {data.get('success')}")
            print(f"Engine: {data.get('engine')}")
            print(f"Processing time: {data.get('processing_time')}s")
            return True
        else:
            print(f"❌ Numerology engine failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Numerology engine error: {e}")
        return False

def test_human_design_engine():
    """Test the human design engine"""
    print("\n👤 Testing human design engine...")
    try:
        payload = {
            "input": {
                "birth_date": "1991-08-13",
                "birth_time": "13:31:00",
                "birth_location": [12.9716, 77.5946],
                "timezone": "Asia/Kolkata"
            }
        }
        response = requests.post(
            f"{RAILWAY_URL}/engines/human_design/calculate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Human Design engine working")
            print(f"Success: {data.get('success')}")
            print(f"Engine: {data.get('engine')}")
            print(f"Processing time: {data.get('processing_time')}s")
            return True
        else:
            print(f"❌ Human Design engine failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Human Design engine error: {e}")
        return False

def test_engines_list():
    """Test the engines list endpoint"""
    print("\n📋 Testing engines list...")
    try:
        response = requests.get(f"{RAILWAY_URL}/engines", timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Engines list working")
            print(f"Available engines: {data.get('engines')}")
            print(f"Count: {data.get('count')}")
            return True
        else:
            print(f"❌ Engines list failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Engines list error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 WitnessOS Railway Backend Testing")
    print("=" * 50)
    print(f"Backend URL: {RAILWAY_URL}")
    print(f"Test time: {datetime.now().isoformat()}")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Engines List", test_engines_list),
        ("Admin User Test", test_admin_user),
        ("Numerology Engine", test_numerology_engine),
        ("Human Design Engine", test_human_design_engine),
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results[test_name] = False
        
        # Small delay between tests
        time.sleep(1)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    print("\n📋 Detailed Results:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("🌟 Railway backend is fully operational!")
    elif passed > 0:
        print(f"\n⚠️ Partial success: {passed} tests passed")
        print("🔧 Some components need debugging")
    else:
        print("\n❌ All tests failed")
        print("🚨 Railway backend needs investigation")
    
    print("\n🔗 Next steps:")
    if passed == total:
        print("1. Update frontend to use Railway backend")
        print("2. Test frontend integration")
        print("3. Deploy to production")
    else:
        print("1. Check Railway deployment logs")
        print("2. Verify service is running")
        print("3. Debug failing components")
    
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
