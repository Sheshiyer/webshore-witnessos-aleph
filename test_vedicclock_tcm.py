#!/usr/bin/env python3
"""
Test script for VedicClock-TCM engine
"""

import sys
import os
from datetime import datetime, time, date

# Add the witnessos-engines directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

try:
    from engines.vedicclock_tcm import VedicClockTCMEngine
    from engines.vedicclock_tcm_models import VedicClockTCMInput
    print("✅ Successfully imported VedicClock-TCM engine")
    
    # Test engine initialization
    engine = VedicClockTCMEngine()
    print(f"✅ Engine initialized: {engine.engine_name}")
    
    # Test input creation
    test_input = VedicClockTCMInput(
        birth_date=date(1991, 8, 13),
        birth_time=time(13, 31),
        birth_location=(12.9629, 77.5775),
        timezone="Asia/Kolkata",
        analysis_depth="basic"
    )
    print("✅ Input model created successfully")
    
    # Test calculation
    print("🔄 Testing calculation...")
    result = engine._calculate(test_input)
    print("✅ Calculation completed successfully")
    print(f"📊 Result keys: {list(result.keys())}")
    
    # Test interpretation
    print("🔄 Testing interpretation...")
    interpretation = engine._interpret(result, test_input)
    print("✅ Interpretation completed successfully")
    print(f"📝 Interpretation length: {len(interpretation)} characters")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
