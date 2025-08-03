#!/usr/bin/env python3

import requests
import json

def test_debug_endpoint():
    """Test the debug endpoint to see where Human Design calculation fails"""
    
    base_url = "https://webshore-witnessos-aleph-production.up.railway.app"
    
    test_data = {
        "input": {
            "birth_date": "1991-08-13",
            "birth_time": "08:01:00",
            "birth_location": [12.9716, 77.5946],
            "timezone": "UTC"
        }
    }
    
    print("Testing debug endpoint...")
    print(f"URL: {base_url}/debug/human-design-flow")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{base_url}/debug/human-design-flow",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nResponse:")
            print(json.dumps(result, indent=2))
            
            if result.get('success'):
                print("\n✅ Debug flow completed successfully!")
                debug_info = result.get('debug_info', {})
                print(f"Final step: {debug_info.get('step')}")
                
                if 'result' in result:
                    res = result['result']
                    print(f"Type: {res.get('type')}")
                    print(f"Strategy: {res.get('strategy')}")
                    print(f"Authority: {res.get('authority')}")
                    print(f"Profile: {res.get('profile')}")
            else:
                print("\n❌ Debug flow failed!")
                debug_info = result.get('debug_info', {})
                print(f"Failed at step: {debug_info.get('step')}")
                print(f"Error: {debug_info.get('error')}")
                print(f"Error type: {debug_info.get('error_type')}")
                
                if debug_info.get('traceback'):
                    print(f"\nTraceback:")
                    print(debug_info['traceback'])
        else:
            print(f"HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_debug_endpoint()