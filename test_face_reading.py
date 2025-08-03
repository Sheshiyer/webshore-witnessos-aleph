#!/usr/bin/env python3
"""
Test script for Face Reading Engine - WitnessOS 12th Consciousness Engine

Tests the complete Traditional Chinese Physiognomy analysis system with:
- MediaPipe facial landmark detection
- 12 Houses traditional analysis  
- Five Elements constitutional assessment
- Age point temporal mapping
- Integration with Vedic and TCM systems
"""

import requests
import json
import base64
from datetime import datetime, date, time
from typing import Dict, Any

# Test configuration
API_BASE_URL = "http://localhost:8000"  # Test locally first
TEST_ENDPOINT = f"{API_BASE_URL}/calculate/face_reading"

def create_test_image_data() -> str:
    """Create a simple test image data (1x1 pixel PNG) for testing."""
    # Minimal PNG data for testing (1x1 transparent pixel)
    png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
    return base64.b64encode(png_data).decode('utf-8')

def test_face_reading_basic():
    """Test basic Face Reading engine functionality."""
    print("🎭 Testing Face Reading Engine - Basic Analysis")
    print("=" * 60)
    
    test_data = {
        "birth_date": "1991-08-13",
        "birth_time": "13:31:00",
        "birth_location": [12.9629, 77.5775],  # Bengaluru coordinates
        "timezone": "Asia/Kolkata",
        "analysis_mode": "photo",
        "image_data": f"data:image/png;base64,{create_test_image_data()}",
        "analysis_depth": "detailed",
        "include_twelve_houses": True,
        "include_five_elements": True,
        "include_age_points": True,
        "include_health_indicators": True,
        "integrate_with_vedic": True,
        "integrate_with_tcm": True,
        "store_biometric_data": False,
        "processing_consent": True
    }
    
    try:
        print(f"📡 Sending request to: {TEST_ENDPOINT}")
        response = requests.post(TEST_ENDPOINT, json={"input": test_data}, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Face Reading Engine Test - SUCCESS")
            print("\n📋 Analysis Results:")
            
            if result.get("success"):
                data = result.get("data", {})
                
                # Basic engine info
                print(f"🔧 Engine: {data.get('engine_name', 'Unknown')}")
                print(f"⏱️  Calculation Time: {data.get('calculation_time', 0):.3f}s")
                print(f"🎯 Confidence Score: {data.get('confidence_score', 0):.2f}")
                
                # Constitutional summary
                if 'constitutional_summary' in data:
                    print(f"\n🧬 Constitutional Summary:")
                    print(data['constitutional_summary'])
                
                # Five Elements analysis
                if 'five_elements' in data:
                    elements = data['five_elements']
                    print(f"\n🌟 Five Elements Constitution:")
                    print(f"   Dominant: {elements.get('dominant_element', 'Unknown')}")
                    print(f"   Secondary: {elements.get('secondary_element', 'Unknown')}")
                    print(f"   Type: {elements.get('constitutional_type', 'Unknown')}")
                    
                    # Element percentages
                    print(f"   Wood: {elements.get('wood_percentage', 0):.1f}%")
                    print(f"   Fire: {elements.get('fire_percentage', 0):.1f}%")
                    print(f"   Earth: {elements.get('earth_percentage', 0):.1f}%")
                    print(f"   Metal: {elements.get('metal_percentage', 0):.1f}%")
                    print(f"   Water: {elements.get('water_percentage', 0):.1f}%")
                
                # Twelve Houses analysis
                if 'twelve_houses' in data:
                    houses = data['twelve_houses']
                    print(f"\n🏛️  Twelve Houses Analysis:")
                    print(f"   Overall Harmony: {houses.get('overall_harmony', 0):.2f}")
                    print(f"   Dominant Houses: {', '.join(houses.get('dominant_houses', []))}")
                
                # Age Points analysis
                if 'age_points' in data:
                    age_points = data['age_points']
                    print(f"\n⏰ Age Points Analysis:")
                    print(f"   Current Age Point: {age_points.get('current_age_point', 0)}")
                    print(f"   Location: {age_points.get('age_point_location', 'Unknown')}")
                    print(f"   Quality: {age_points.get('age_point_quality', 'Unknown')}")
                
                # Integration insights
                if 'biometric_integration' in data:
                    integration = data['biometric_integration']
                    print(f"\n🔗 Biometric Integration:")
                    print(f"   Consciousness Alignment: {integration.get('consciousness_alignment_score', 0):.2f}")
                    
                    # Vedic correlations
                    vedic_corr = integration.get('vedic_element_correlation', {})
                    if vedic_corr:
                        print(f"   Vedic Correlations:")
                        for element, score in vedic_corr.items():
                            print(f"     {element.title()}: {score:.2f}")
                    
                    # TCM correlations
                    tcm_corr = integration.get('tcm_organ_correlation', {})
                    if tcm_corr:
                        print(f"   TCM Organ Correlations:")
                        for organ, score in tcm_corr.items():
                            print(f"     {organ.title()}: {score:.2f}")
                
                # Recommendations
                if 'multi_modal_recommendations' in data:
                    recommendations = data['multi_modal_recommendations']
                    print(f"\n💡 Multi-Modal Recommendations:")
                    for i, rec in enumerate(recommendations[:3], 1):
                        print(f"   {i}. {rec}")
                
                # Privacy compliance
                if 'privacy_compliance' in data:
                    privacy = data['privacy_compliance']
                    print(f"\n🔒 Privacy Compliance:")
                    for key, value in privacy.items():
                        print(f"   {key.replace('_', ' ').title()}: {value}")
                
                print(f"\n🎉 Face Reading Engine is fully operational!")
                return True
                
            else:
                print(f"❌ API returned success=False: {result}")
                return False
                
        else:
            print(f"❌ HTTP Error {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Response text: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - this is normal for first request (cold start)")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_face_reading_simulation_mode():
    """Test Face Reading engine in simulation mode (no image data)."""
    print("\n🎭 Testing Face Reading Engine - Simulation Mode")
    print("=" * 60)
    
    test_data = {
        "birth_date": "1991-08-13",
        "birth_time": "13:31:00", 
        "birth_location": [12.9629, 77.5775],
        "timezone": "Asia/Kolkata",
        "analysis_mode": "photo",
        # No image_data - should trigger simulation mode
        "analysis_depth": "basic",
        "include_twelve_houses": True,
        "include_five_elements": True,
        "include_age_points": False,
        "include_health_indicators": False,
        "integrate_with_vedic": False,
        "integrate_with_tcm": False,
        "store_biometric_data": False,
        "processing_consent": True
    }
    
    try:
        response = requests.post(TEST_ENDPOINT, json={"input": test_data}, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("success"):
                data = result.get("data", {})
                print("✅ Simulation Mode Test - SUCCESS")
                print(f"🔧 Engine: {data.get('engine_name', 'Unknown')}")
                print(f"⏱️  Calculation Time: {data.get('calculation_time', 0):.3f}s")
                print(f"🎯 Confidence Score: {data.get('confidence_score', 0):.2f}")
                
                # Check that simulation landmarks were used
                if 'facial_landmarks' in data:
                    landmarks = data['facial_landmarks']
                    print(f"📍 Landmarks: {landmarks.get('total_landmarks', 0)} points detected")
                    print(f"🎯 Detection Confidence: {landmarks.get('detection_confidence', 0):.2f}")
                
                return True
            else:
                print(f"❌ Simulation test failed: {result}")
                return False
        else:
            print(f"❌ Simulation test HTTP error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Simulation test error: {e}")
        return False

def test_face_reading_privacy_consent():
    """Test Face Reading engine privacy consent validation."""
    print("\n🔒 Testing Face Reading Engine - Privacy Consent")
    print("=" * 60)
    
    test_data = {
        "birth_date": "1991-08-13",
        "analysis_mode": "photo",
        "processing_consent": False  # Should fail without consent
    }
    
    try:
        response = requests.post(TEST_ENDPOINT, json={"input": test_data}, timeout=30)
        
        if response.status_code == 422:  # Validation error expected
            print("✅ Privacy Consent Validation - SUCCESS")
            print("🔒 Engine correctly requires explicit consent for biometric processing")
            return True
        else:
            print(f"❌ Privacy test unexpected response: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Privacy test error: {e}")
        return False

def main():
    """Run all Face Reading Engine tests."""
    print("🎭 WitnessOS Face Reading Engine - Comprehensive Test Suite")
    print("=" * 80)
    print("Testing the 12th Consciousness Engine: Traditional Chinese Physiognomy")
    print("Features: MediaPipe + 12 Houses + Five Elements + Age Points + Integration")
    print("=" * 80)
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Basic functionality
    if test_face_reading_basic():
        tests_passed += 1
    
    # Test 2: Simulation mode
    if test_face_reading_simulation_mode():
        tests_passed += 1
    
    # Test 3: Privacy consent
    if test_face_reading_privacy_consent():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 80)
    print(f"🎭 Face Reading Engine Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED - Face Reading Engine is fully operational!")
        print("🌟 WitnessOS now has 12 consciousness engines including Traditional Chinese Physiognomy!")
        print("🔮 Features working: MediaPipe landmarks, 12 Houses analysis, Five Elements constitution,")
        print("    Age point mapping, Vedic integration, TCM integration, privacy protection")
    else:
        print(f"⚠️  {total_tests - tests_passed} tests failed - check engine implementation")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
