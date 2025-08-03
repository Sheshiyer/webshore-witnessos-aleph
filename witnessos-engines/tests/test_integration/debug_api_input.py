#!/usr/bin/env python3
"""
Debug script to test the exact input format that's failing on Railway
"""

import json
from datetime import date, time
from human_design_models import HumanDesignInput

def test_input_parsing():
    """Test the exact input that's being sent to the API"""
    
    # This is the exact input we're sending to the API
    api_input = {
        "birth_date": "1991-08-13",
        "birth_time": "08:01:00", 
        "birth_location": [12.9716, 77.5946],
        "timezone": "Asia/Kolkata"
    }
    
    print("Testing API input parsing...")
    print(f"Input: {json.dumps(api_input, indent=2)}")
    
    try:
        # Try to create the HumanDesignInput object exactly like the API does
        input_obj = HumanDesignInput(
            birth_date=date.fromisoformat(api_input["birth_date"]),
            birth_time=time.fromisoformat(api_input["birth_time"]),
            birth_location=api_input["birth_location"],
            timezone=api_input.get("timezone", "UTC")
        )
        
        print("✅ Input parsing successful!")
        print(f"Parsed object: {input_obj}")
        
        # Now try to import and run the Human Design engine
        from human_design_scanner import HumanDesignScanner
        
        print("\nTesting Human Design calculation...")
        engine = HumanDesignScanner()
        result = engine.calculate(input_obj)
        
        print("✅ Calculation successful!")
        print(f"Result type: {type(result)}")
        print(f"Engine name: {result.engine_name}")
        print(f"Confidence: {result.confidence_score}")
        
        if hasattr(result, 'chart') and result.chart:
            print(f"Chart type: {result.chart.type_info.type_name}")
            print(f"Profile: {result.chart.profile.profile_name}")
            print(f"Strategy: {result.chart.type_info.strategy}")
            print(f"Authority: {result.chart.type_info.authority}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    test_input_parsing()