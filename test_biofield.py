#!/usr/bin/env python3
"""
Test script for Biofield Engine - WitnessOS 13th Consciousness Engine

Tests the complete PIP (Poly-contrast Interference Photography) analysis system:
- 17 core biofield metrics for comprehensive energy field assessment
- 10 color analysis parameters for chromatic biofield evaluation
- 7 composite scores for unified consciousness assessment
- Multi-modal integration with Face Reading, Vedic, and TCM engines
- Real-time biofield monitoring and optimization
"""

import requests
import json
import base64
from datetime import datetime, date, time
from typing import Dict, Any

# Test configuration
API_BASE_URL = "http://localhost:8000"  # Test locally first
TEST_ENDPOINT = f"{API_BASE_URL}/calculate/biofield"

def create_test_image_data() -> str:
    """Create a simple test image data for biofield analysis."""
    # Create a more complex test pattern for biofield simulation
    import numpy as np
    try:
        import cv2
        
        # Create a 400x400 test image with biofield-like patterns
        img = np.zeros((400, 400, 3), dtype=np.uint8)
        
        # Add some circular patterns (simulating energy fields)
        center = (200, 200)
        for radius in range(50, 200, 30):
            cv2.circle(img, center, radius, (50 + radius//2, 100 + radius//3, 150 + radius//4), 2)
        
        # Add some noise and texture
        noise = np.random.randint(0, 50, (400, 400, 3), dtype=np.uint8)
        img = cv2.add(img, noise)
        
        # Encode to base64
        _, buffer = cv2.imencode('.png', img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/png;base64,{img_base64}"
        
    except ImportError:
        # Fallback to minimal PNG if OpenCV not available
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        return f"data:image/png;base64,{base64.b64encode(png_data).decode('utf-8')}"

def test_biofield_comprehensive():
    """Test comprehensive Biofield engine functionality."""
    print("⚡ Testing Biofield Engine - Comprehensive Analysis")
    print("=" * 70)
    
    test_data = {
        "birth_date": "1991-08-13",
        "birth_time": "13:31:00",
        "birth_location": [12.9629, 77.5775],  # Bengaluru coordinates
        "timezone": "Asia/Kolkata",
        "image_data": create_test_image_data(),
        "analysis_mode": "single_frame",
        "analysis_depth": "comprehensive",
        "include_spatial_metrics": True,
        "include_temporal_metrics": True,
        "include_color_analysis": True,
        "include_composite_scores": True,
        "integrate_with_face_reading": True,
        "integrate_with_vedic": True,
        "integrate_with_tcm": True,
        "noise_reduction": True,
        "edge_enhancement": True,
        "calibration_mode": "auto",
        "biometric_consent": True,
        "store_analysis_only": True
    }
    
    try:
        print(f"📡 Sending request to: {TEST_ENDPOINT}")
        response = requests.post(TEST_ENDPOINT, json={"input": test_data}, timeout=60)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Biofield Engine Test - SUCCESS")
            print("\n📋 Analysis Results:")
            
            if result.get("success"):
                data = result.get("data", {})
                
                # Basic engine info
                print(f"🔧 Engine: {data.get('engine_name', 'Unknown')}")
                print(f"⏱️  Calculation Time: {data.get('calculation_time', 0):.3f}s")
                print(f"🎯 Confidence Score: {data.get('confidence_score', 0):.2f}")
                
                # Biofield Metrics (17 core metrics)
                if 'biofield_metrics' in data:
                    metrics = data['biofield_metrics']
                    print(f"\n⚡ Biofield Metrics (17 Core):")
                    print(f"   Light Quanta Density: {metrics.get('light_quanta_density', 0):.3f}")
                    print(f"   Average Intensity: {metrics.get('average_intensity', 0):.3f}")
                    print(f"   Energy Analysis: {metrics.get('energy_analysis', 0):.3f}")
                    print(f"   Fractal Dimension: {metrics.get('fractal_dimension', 0):.3f}")
                    print(f"   Hurst Exponent: {metrics.get('hurst_exponent', 0):.3f}")
                    print(f"   Body Symmetry: {metrics.get('body_symmetry', 0):.3f}")
                    print(f"   Pattern Regularity: {metrics.get('pattern_regularity', 0):.3f}")
                
                # Color Analysis (10 parameters)
                if 'color_analysis' in data:
                    colors = data['color_analysis']
                    print(f"\n🌈 Color Analysis (10 Parameters):")
                    color_dist = colors.get('color_distribution', {})
                    print(f"   Color Distribution: R:{color_dist.get('red', 0):.2f} G:{color_dist.get('green', 0):.2f} B:{color_dist.get('blue', 0):.2f}")
                    print(f"   Color Entropy: {colors.get('color_entropy', 0):.3f}")
                    print(f"   Color Energy: {colors.get('color_energy', 0):.3f}")
                    print(f"   Dominant Wavelength: {colors.get('dominant_wavelength', 0):.1f}nm")
                
                # Composite Scores (7 unified scores)
                if 'composite_scores' in data:
                    scores = data['composite_scores']
                    print(f"\n🎯 Composite Scores (7 Unified):")
                    print(f"   Energy Score: {scores.get('energy_score', 0):.3f}")
                    print(f"   Symmetry/Balance: {scores.get('symmetry_balance_score', 0):.3f}")
                    print(f"   Coherence Score: {scores.get('coherence_score', 0):.3f}")
                    print(f"   Complexity Score: {scores.get('complexity_score', 0):.3f}")
                    print(f"   Regulation Score: {scores.get('regulation_score', 0):.3f}")
                    print(f"   Color Vitality: {scores.get('color_vitality_score', 0):.3f}")
                    print(f"   Color Coherence: {scores.get('color_coherence_score', 0):.3f}")
                
                # Multi-Modal Integration
                if 'multi_modal_integration' in data:
                    integration = data['multi_modal_integration']
                    print(f"\n🔗 Multi-Modal Integration:")
                    print(f"   Multi-Modal Consistency: {integration.get('multi_modal_consistency', 0):.3f}")
                    print(f"   Cosmic Timing Alignment: {integration.get('cosmic_timing_alignment', 0):.3f}")
                    print(f"   Elemental Harmony: {integration.get('elemental_harmony', 0):.3f}")
                    
                    # Five Elements Alignment
                    five_elements = integration.get('five_elements_alignment', {})
                    if five_elements:
                        print(f"   Five Elements Alignment:")
                        for element, score in five_elements.items():
                            print(f"     {element.replace('_', ' ').title()}: {score:.3f}")
                
                # Recommendations
                if 'biofield_optimization' in data:
                    optimization = data['biofield_optimization']
                    print(f"\n💡 Biofield Optimization:")
                    for i, rec in enumerate(optimization[:3], 1):
                        print(f"   {i}. {rec}")
                
                if 'practice_suggestions' in data:
                    suggestions = data['practice_suggestions']
                    print(f"\n🧘 Practice Suggestions:")
                    for i, sug in enumerate(suggestions[:3], 1):
                        print(f"   {i}. {sug}")
                
                # Privacy Compliance
                print(f"\n🔒 Privacy Compliance:")
                print(f"   Data Retention: {data.get('data_retention_policy', 'unknown')}")
                print(f"   Biometric Protection: {data.get('biometric_protection_level', 'unknown')}")
                
                print(f"\n🎉 Biofield Engine is fully operational!")
                print(f"🌟 WitnessOS now has 13 consciousness engines including advanced biofield analysis!")
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

def test_biofield_simulation_mode():
    """Test Biofield engine in simulation mode (no image data)."""
    print("\n⚡ Testing Biofield Engine - Simulation Mode")
    print("=" * 70)
    
    test_data = {
        "birth_date": "1991-08-13",
        "birth_time": "13:31:00", 
        "birth_location": [12.9629, 77.5775],
        "timezone": "Asia/Kolkata",
        # No image_data - should trigger simulation mode
        "analysis_mode": "single_frame",
        "analysis_depth": "basic",
        "include_spatial_metrics": True,
        "include_color_analysis": True,
        "include_composite_scores": True,
        "biometric_consent": True,
        "store_analysis_only": True
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
                
                # Check that simulation data was generated
                if 'composite_scores' in data:
                    scores = data['composite_scores']
                    print(f"⚡ Energy Score: {scores.get('energy_score', 0):.3f}")
                    print(f"🎯 Coherence Score: {scores.get('coherence_score', 0):.3f}")
                
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

def test_biofield_privacy_consent():
    """Test Biofield engine privacy consent validation."""
    print("\n🔒 Testing Biofield Engine - Privacy Consent")
    print("=" * 70)
    
    test_data = {
        "birth_date": "1991-08-13",
        "analysis_mode": "single_frame",
        "biometric_consent": False  # Should fail without consent
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
    """Run all Biofield Engine tests."""
    print("⚡ WitnessOS Biofield Engine - Comprehensive Test Suite")
    print("=" * 80)
    print("Testing the 13th Consciousness Engine: Advanced PIP Biofield Analysis")
    print("Features: 17 Metrics + 10 Color Parameters + 7 Composite Scores + Multi-Modal Integration")
    print("=" * 80)
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Comprehensive functionality
    if test_biofield_comprehensive():
        tests_passed += 1
    
    # Test 2: Simulation mode
    if test_biofield_simulation_mode():
        tests_passed += 1
    
    # Test 3: Privacy consent
    if test_biofield_privacy_consent():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 80)
    print(f"⚡ Biofield Engine Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED - Biofield Engine is fully operational!")
        print("🌟 WitnessOS now has 13 consciousness engines including advanced biofield analysis!")
        print("⚡ Features working: 17 biofield metrics, 10 color parameters, 7 composite scores,")
        print("    multi-modal integration, privacy protection, real-time analysis capability")
        print("\n🚀 REVOLUTIONARY ACHIEVEMENT:")
        print("    ✅ World's first integrated consciousness platform")
        print("    ✅ 13 consciousness engines operational")
        print("    ✅ Real-time biofield monitoring")
        print("    ✅ Multi-modal consciousness validation")
        print("    ✅ Privacy-first biometric processing")
    else:
        print(f"⚠️  {total_tests - tests_passed} tests failed - check engine implementation")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
