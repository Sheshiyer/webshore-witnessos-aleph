#!/usr/bin/env python3

from datetime import time as dt_time, date as date_class

# Test the exact parsing that's failing in the API
test_data = {
    "birth_date": "1991-08-13",
    "birth_time": "08:01:00",
    "birth_location": [12.9716, 77.5946],
    "timezone": "UTC"
}

print("Testing time parsing...")

try:
    # Test date parsing
    birth_date = date_class.fromisoformat(test_data["birth_date"])
    print(f"✅ Date parsed successfully: {birth_date}")
    
    # Test time parsing
    birth_time = dt_time.fromisoformat(test_data["birth_time"])
    print(f"✅ Time parsed successfully: {birth_time}")
    
    # Test location
    birth_location = test_data["birth_location"]
    print(f"✅ Location: {birth_location}")
    
    # Test timezone
    timezone = test_data.get("timezone", "UTC")
    print(f"✅ Timezone: {timezone}")
    
    print("\n✅ All parsing successful!")
    
except Exception as e:
    print(f"❌ Parsing failed: {e}")
    import traceback
    traceback.print_exc()