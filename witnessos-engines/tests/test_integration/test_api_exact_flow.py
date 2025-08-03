#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'witnessos-engines'))

from datetime import date as date_class, time as dt_time
from engines.human_design_models import HumanDesignInput
from engines.human_design import HumanDesignScanner

def test_exact_api_flow():
    """Test the exact flow that the API is using"""
    
    # This is the exact data being sent to the API
    request_input = {
        "birth_date": "1991-08-13",
        "birth_time": "08:01:00",
        "birth_location": [12.9716, 77.5946],
        "timezone": "UTC"
    }
    
    print("Testing exact API flow...")
    print(f"Input data: {request_input}")
    
    try:
        # Step 1: Parse the input exactly like the API does
        print("\n1. Parsing input data...")
        
        birth_date = date_class.fromisoformat(request_input["birth_date"])
        print(f"   ✅ Birth date: {birth_date}")
        
        birth_time = dt_time.fromisoformat(request_input["birth_time"])
        print(f"   ✅ Birth time: {birth_time}")
        
        birth_location = request_input["birth_location"]
        print(f"   ✅ Birth location: {birth_location}")
        
        timezone = request_input.get("timezone", "UTC")
        print(f"   ✅ Timezone: {timezone}")
        
        # Step 2: Create HumanDesignInput object exactly like the API does
        print("\n2. Creating HumanDesignInput object...")
        
        input_obj = HumanDesignInput(
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            timezone=timezone
        )
        print(f"   ✅ HumanDesignInput created: {input_obj}")
        
        # Step 3: Initialize engine and calculate
        print("\n3. Initializing Human Design engine...")
        engine = HumanDesignScanner()
        print("   ✅ Engine initialized")
        
        print("\n4. Running calculation...")
        result = engine.calculate(input_obj)
        print(f"   ✅ Calculation successful!")
        print(f"   Type: {result.chart.type_info.type_name}")
        print(f"   Strategy: {result.chart.type_info.strategy}")
        print(f"   Authority: {result.chart.type_info.authority}")
        print(f"   Profile: {result.chart.profile.profile_name}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        import traceback
        print(f"\n   Full traceback:")
        traceback.print_exc()
        
        return False

if __name__ == "__main__":
    success = test_exact_api_flow()
    print(f"\n{'✅ SUCCESS' if success else '❌ FAILED'}")