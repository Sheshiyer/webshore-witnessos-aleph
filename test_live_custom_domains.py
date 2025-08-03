#!/usr/bin/env python3
"""
Test Live Custom Domains
Tests the active witnessos.space and api.witnessos.space domains
"""

import requests
import json

# Live custom domains
FRONTEND_URL = "https://witnessos.space"
API_URL = "https://api.witnessos.space"

def test_frontend():
    """Test the main witnessos.space frontend"""
    print("🌐 Testing Frontend: https://witnessos.space")
    try:
        response = requests.get(FRONTEND_URL, timeout=15)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Frontend is LIVE and accessible!")
            
            # Check for WitnessOS content
            content = response.text.lower()
            if "witnessos" in content:
                print("   ✅ Contains WitnessOS branding")
            if "consciousness" in content:
                print("   ✅ Contains consciousness content")
            if "engines" in content:
                print("   ✅ Contains engines functionality")
                
            return True
        else:
            print(f"   ❌ Frontend returned {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ❌ Frontend error: {e}")
    
    return False

def test_api_health():
    """Test the API health endpoint"""
    print("\n🏥 Testing API Health: https://api.witnessos.space/api/health")
    try:
        response = requests.get(f"{API_URL}/api/health", timeout=15)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ API is LIVE and healthy!")
            print(f"   Service: {data.get('service', 'Unknown')}")
            print(f"   Engines: {len(data.get('engines_available', []))} available")
            return True
        else:
            print(f"   ❌ API health returned {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ❌ API health error: {e}")
    
    return False

def test_api_docs():
    """Test the API documentation"""
    print("\n📚 Testing API Docs: https://api.witnessos.space/api/docs")
    try:
        response = requests.get(f"{API_URL}/api/docs", timeout=15)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ API Documentation is accessible!")
            if "swagger" in response.text.lower() or "openapi" in response.text.lower():
                print("   ✅ Contains Swagger/OpenAPI documentation")
            return True
        else:
            print(f"   ❌ API docs returned {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ API docs error: {e}")
    
    return False

def test_api_engines():
    """Test the engines list endpoint"""
    print("\n🧠 Testing Engines List: https://api.witnessos.space/api/engines")
    try:
        response = requests.get(f"{API_URL}/api/engines", timeout=15)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            engines = data.get('engines', [])
            print(f"   ✅ Engines endpoint working!")
            print(f"   Available engines: {len(engines)}")
            print(f"   Engines: {', '.join(engines[:5])}{'...' if len(engines) > 5 else ''}")
            return True
        else:
            print(f"   ❌ Engines list returned {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Engines list error: {e}")
    
    return False

def test_engine_calculation():
    """Test a sample engine calculation"""
    print("\n🔢 Testing Engine Calculation: Numerology")
    try:
        payload = {
            "input": {
                "birth_date": "1991-08-13",
                "full_name": "Test User"
            }
        }
        
        response = requests.post(
            f"{API_URL}/api/engines/numerology/calculate",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Engine calculation working!")
            print(f"   Success: {data.get('success', False)}")
            print(f"   Engine: {data.get('engine', 'Unknown')}")
            print(f"   Processing time: {data.get('processing_time', 'Unknown')}s")
            return True
        else:
            print(f"   ❌ Engine calculation returned {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ❌ Engine calculation error: {e}")
    
    return False

def main():
    """Run all tests"""
    print("🚀 WitnessOS Live Custom Domain Testing")
    print("=" * 60)
    print("Testing active custom domains:")
    print(f"Frontend: {FRONTEND_URL}")
    print(f"API: {API_URL}")
    print("=" * 60)
    
    # Run tests
    frontend_ok = test_frontend()
    api_health_ok = test_api_health()
    api_docs_ok = test_api_docs()
    api_engines_ok = test_api_engines()
    api_calc_ok = test_engine_calculation()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 LIVE DOMAIN TEST RESULTS")
    print("=" * 60)
    
    results = {
        "Frontend (witnessos.space)": frontend_ok,
        "API Health": api_health_ok,
        "API Documentation": api_docs_ok,
        "Engines List": api_engines_ok,
        "Engine Calculation": api_calc_ok
    }
    
    working_count = sum(1 for result in results.values() if result)
    total_count = len(results)
    
    for test_name, result in results.items():
        status = "✅ WORKING" if result else "❌ FAILED"
        print(f"{status} {test_name}")
    
    print(f"\n📈 Overall Status: {working_count}/{total_count} services working")
    
    if working_count == total_count:
        print("\n🎉 PERFECT! ALL SERVICES ARE LIVE!")
        print("🌟 WitnessOS is fully operational on custom domains!")
        print(f"\n🔗 Access WitnessOS: {FRONTEND_URL}")
        print(f"📚 API Documentation: {API_URL}/api/docs")
        print(f"🏥 API Health: {API_URL}/api/health")
        
    elif working_count > 0:
        print(f"\n⚠️ Partial functionality: {working_count} services working")
        if frontend_ok:
            print("✅ Frontend is accessible - users can access WitnessOS")
        if api_health_ok:
            print("✅ API is healthy - backend services operational")
            
    else:
        print("\n❌ All services failed - check domain configuration")
    
    print("=" * 60)
    return working_count == total_count

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
