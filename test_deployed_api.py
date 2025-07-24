#!/usr/bin/env python3
"""
Test script to validate the deployed Human Design API on Railway
"""

import requests
import json
import sys

def test_human_design_api():
    """Test the deployed Human Design API"""
    
    base_url = "https://webshore-witnessos-aleph-production.up.railway.app"
    
    # Test health endpoint first
    print("Testing health endpoint...")
    try:
        health_response = requests.get(f"{base_url}/health", timeout=10)
        print(f"Health Status: {health_response.status_code}")
        print(f"Health Response: {health_response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
        return False
    
    # Test admin user endpoint
    print("\nTesting admin user endpoint...")
    try:
        admin_response = requests.get(f"{base_url}/test/admin-user", timeout=10)
        print(f"Admin Test Status: {admin_response.status_code}")
        admin_data = admin_response.json()
        print(f"Admin Response: {json.dumps(admin_data, indent=2)}")
    except Exception as e:
        print(f"Admin test failed: {e}")
    
    # Test Human Design calculation
    print("\nTesting Human Design calculation...")
    
    test_data = {
        "input": {
            "birth_date": "1991-08-13",
            "birth_time": "08:01:00",
            "birth_location": [12.9716, 77.5946],
            "timezone": "UTC"
        }
    }
    
    try:
        response = requests.post(
            f"{base_url}/engines/human-design/calculate",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success', False)}")
            
            if result.get('success'):
                print("\n=== HUMAN DESIGN CALCULATION SUCCESS ===")
                data = result.get('data', {})
                
                # Check for key fields
                if 'chart' in data:
                    chart = data['chart']
                    print(f"Type: {chart.get('type_info', {}).get('type_name', 'Unknown')}")
                    print(f"Profile: {chart.get('profile', {}).get('profile_name', 'Unknown')}")
                    
                    # Check incarnation cross
                    cross = chart.get('incarnation_cross', {})
                    if cross:
                        print(f"Incarnation Cross: {cross.get('name', 'Unknown')}")
                        gates = cross.get('gates', {})
                        print(f"Conscious Sun: Gate {gates.get('conscious_sun', 'Unknown')}")
                        print(f"Conscious Earth: Gate {gates.get('conscious_earth', 'Unknown')}")
                        print(f"Unconscious Sun: Gate {gates.get('unconscious_sun', 'Unknown')}")
                        print(f"Unconscious Earth: Gate {gates.get('unconscious_earth', 'Unknown')}")
                
                print(f"\nFull Response: {json.dumps(result, indent=2)}")
            else:
                print(f"Calculation failed: {result.get('error', 'Unknown error')}")
                print(f"Full Response: {json.dumps(result, indent=2)}")
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("Request timed out")
        return False
    except Exception as e:
        print(f"Request failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_human_design_api()
    sys.exit(0 if success else 1)