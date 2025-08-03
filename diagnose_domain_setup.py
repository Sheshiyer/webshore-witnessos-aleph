#!/usr/bin/env python3
"""
Diagnose Domain Setup
Analyzes the current domain configuration and provides fix recommendations
"""

import requests
import json
import subprocess

def check_dns_records():
    """Check DNS records for both domains"""
    print("🔍 Checking DNS Records")
    print("-" * 40)
    
    domains = ["witnessos.space", "api.witnessos.space"]
    
    for domain in domains:
        print(f"\n📡 DNS for {domain}:")
        try:
            result = subprocess.run(
                ["dig", "+short", domain], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            if result.stdout.strip():
                print(f"   Records: {result.stdout.strip()}")
            else:
                print("   No records found")
        except Exception as e:
            print(f"   Error: {e}")

def analyze_responses():
    """Analyze the HTTP responses to understand the setup"""
    print("\n🔬 Analyzing HTTP Responses")
    print("-" * 40)
    
    # Test frontend
    print("\n🌐 Frontend Analysis (witnessos.space):")
    try:
        response = requests.get("https://witnessos.space", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Server: {response.headers.get('server', 'Unknown')}")
        print(f"   CF-Ray: {response.headers.get('cf-ray', 'Not Cloudflare')}")
        
        if response.status_code == 522:
            print("   🔍 522 = Connection timed out")
            print("   💡 Likely cause: Backend not responding or misconfigured")
            
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test API
    print("\n🔌 API Analysis (api.witnessos.space):")
    try:
        response = requests.get("https://api.witnessos.space/api/health", timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Server: {response.headers.get('server', 'Unknown')}")
        print(f"   CF-Ray: {response.headers.get('cf-ray', 'Not Cloudflare')}")
        
        if response.status_code == 503:
            print("   🔍 503 = Service Unavailable")
            print("   💡 Likely cause: Backend service is down or unhealthy")
            
        # Try to get more info from the response
        try:
            data = response.json()
            if 'services' in data:
                for service in data['services']:
                    print(f"   Service: {service.get('service')} - {service.get('status')}")
        except:
            pass
            
    except Exception as e:
        print(f"   Error: {e}")

def check_pages_deployment():
    """Check if Pages deployment is working on .pages.dev"""
    print("\n📄 Pages Deployment Check")
    print("-" * 40)
    
    pages_urls = [
        "https://6300e9dc.witnessos-frontend.pages.dev",
        "https://63c7fda4.witnessos-frontend.pages.dev"
    ]
    
    for url in pages_urls:
        print(f"\n🔗 Testing {url}:")
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ Pages deployment is working")
                if "witnessos" in response.text.lower():
                    print("   ✅ Contains WitnessOS content")
                break
            else:
                print(f"   ❌ Pages deployment issue: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def provide_recommendations():
    """Provide fix recommendations based on findings"""
    print("\n💡 RECOMMENDATIONS")
    print("=" * 50)
    
    print("\n🔧 Frontend Fix (witnessos.space - 522 error):")
    print("1. Check if custom domain is properly connected to Pages project")
    print("2. Verify DNS records point to correct Cloudflare Pages")
    print("3. Ensure Pages deployment is active and healthy")
    print("4. Check Cloudflare proxy settings (should be proxied)")
    
    print("\n🔧 API Fix (api.witnessos.space - 503 error):")
    print("1. Check Railway backend service status")
    print("2. Verify environment variables are set correctly")
    print("3. Check if Railway service is sleeping (free tier)")
    print("4. Verify API endpoints are properly configured")
    
    print("\n🔧 Authentication Fix:")
    print("1. Check if API key authentication is required")
    print("2. Verify CORS settings allow frontend domain")
    print("3. Check if demo/test endpoints are available")
    
    print("\n🔧 Documentation Fix:")
    print("1. Verify API docs endpoint (/api/docs vs /docs)")
    print("2. Check if FastAPI documentation is enabled")
    print("3. Ensure proper routing for documentation")

def main():
    """Run complete diagnosis"""
    print("🩺 WitnessOS Domain Setup Diagnosis")
    print("=" * 50)
    
    check_dns_records()
    analyze_responses()
    check_pages_deployment()
    provide_recommendations()
    
    print("\n" + "=" * 50)
    print("📋 NEXT STEPS:")
    print("1. Fix Railway backend service (503 error)")
    print("2. Ensure Pages deployment is connected to custom domain")
    print("3. Test authentication and API endpoints")
    print("4. Verify all services are properly configured")
    print("=" * 50)

if __name__ == "__main__":
    main()
