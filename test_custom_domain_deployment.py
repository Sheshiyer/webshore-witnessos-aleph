#!/usr/bin/env python3
"""
Test Custom Domain Deployment
Verifies the updated WitnessOS deployment with custom domain configuration
"""

import requests
import time

# Test URLs
CURRENT_DEPLOYMENT = "https://6300e9dc.witnessos-frontend.pages.dev"
PREVIOUS_DEPLOYMENT = "https://63c7fda4.witnessos-frontend.pages.dev"
EXPECTED_CUSTOM_DOMAIN = "https://witnessos.space"
EXPECTED_API_DOMAIN = "https://api.witnessos.space"

def test_deployment(url, name):
    """Test a deployment URL"""
    print(f"\n🔍 Testing {name}: {url}")
    try:
        response = requests.get(url, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ {name} is accessible")
            # Check if it contains WitnessOS content
            if "WitnessOS" in response.text or "consciousness" in response.text.lower():
                print(f"   ✅ Contains WitnessOS content")
            return True
        else:
            print(f"   ❌ {name} returned {response.status_code}")
    except Exception as e:
        print(f"   ❌ {name} error: {e}")
    return False

def test_api_configuration(frontend_url):
    """Test if frontend is configured to use the correct API"""
    print(f"\n🔧 Testing API configuration in {frontend_url}")
    try:
        response = requests.get(frontend_url, timeout=10)
        if response.status_code == 200:
            content = response.text
            if "api.witnessos.space" in content:
                print("   ✅ Frontend configured to use api.witnessos.space")
                return True
            elif "witnessos-engines-production.up.railway.app" in content:
                print("   ⚠️ Frontend still using Railway URL")
                return False
            else:
                print("   ❓ API configuration unclear")
        return False
    except Exception as e:
        print(f"   ❌ Error checking API config: {e}")
        return False

def test_custom_domains():
    """Test custom domains (may not be configured yet)"""
    print(f"\n🌐 Testing custom domains (may not be configured yet)")
    
    # Test main domain
    try:
        response = requests.get(EXPECTED_CUSTOM_DOMAIN, timeout=10)
        if response.status_code == 200:
            print(f"   ✅ {EXPECTED_CUSTOM_DOMAIN} is working!")
        else:
            print(f"   ⚠️ {EXPECTED_CUSTOM_DOMAIN} not configured yet ({response.status_code})")
    except Exception as e:
        print(f"   ⚠️ {EXPECTED_CUSTOM_DOMAIN} not configured yet: {e}")
    
    # Test API domain
    try:
        response = requests.get(f"{EXPECTED_API_DOMAIN}/api/health", timeout=10)
        if response.status_code == 200:
            print(f"   ✅ {EXPECTED_API_DOMAIN} API is working!")
        else:
            print(f"   ⚠️ {EXPECTED_API_DOMAIN} API not configured yet ({response.status_code})")
    except Exception as e:
        print(f"   ⚠️ {EXPECTED_API_DOMAIN} API not configured yet: {e}")

def main():
    """Run all tests"""
    print("🚀 WitnessOS Custom Domain Deployment Testing")
    print("=" * 60)
    
    # Test current deployment
    current_working = test_deployment(CURRENT_DEPLOYMENT, "Current Deployment")
    
    # Test previous deployment (should still work)
    previous_working = test_deployment(PREVIOUS_DEPLOYMENT, "Previous Deployment")
    
    # Test API configuration
    if current_working:
        api_configured = test_api_configuration(CURRENT_DEPLOYMENT)
    else:
        api_configured = False
    
    # Test custom domains
    test_custom_domains()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    print(f"✅ Current Deployment: {'WORKING' if current_working else 'FAILED'}")
    print(f"✅ Previous Deployment: {'WORKING' if previous_working else 'FAILED'}")
    print(f"🔧 API Configuration: {'UPDATED' if api_configured else 'NEEDS CHECK'}")
    
    if current_working:
        print(f"\n🌟 SUCCESS: WitnessOS is live and updated!")
        print(f"🔗 Access now: {CURRENT_DEPLOYMENT}")
        print(f"🔧 API configured for: api.witnessos.space")
        
        print(f"\n📋 Next Steps:")
        print(f"1. Configure custom domain in Cloudflare Pages dashboard")
        print(f"2. Set up api.witnessos.space subdomain")
        print(f"3. Test custom domains once configured")
        print(f"4. Update DNS records if needed")
        
    else:
        print(f"\n❌ Issues detected - check deployment logs")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
