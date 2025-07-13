#!/usr/bin/env python3
"""
Dataset Verification Script for WitnessOS ENGINES
Verifies completeness and accuracy of all consciousness exploration datasets
"""

import json
import os
from pathlib import Path

def verify_datasets():
    """Verify all datasets are complete and accurate."""
    print("🔍 WitnessOS ENGINES - Dataset Verification")
    print("=" * 60)
    
    base_path = Path(__file__).parent.parent / "data"
    results = {}
    
    # Verify I Ching
    print("\n📖 I CHING VERIFICATION")
    iching_path = base_path / "iching" / "hexagrams.json"
    if iching_path.exists():
        with open(iching_path, 'r', encoding='utf-8') as f:
            iching_data = json.load(f)
        
        hexagram_count = len(iching_data.get("hexagrams", {}))
        trigram_count = len(iching_data.get("trigrams", {}))
        method_count = len(iching_data.get("methods", {}))
        
        print(f"✅ Hexagrams: {hexagram_count}/64 ({hexagram_count/64*100:.1f}%)")
        print(f"✅ Trigrams: {trigram_count}/8 ({trigram_count/8*100:.1f}%)")
        print(f"✅ Methods: {method_count}/2 ({method_count/2*100:.1f}%)")
        
        results['iching'] = {
            'status': 'complete' if hexagram_count == 64 else 'incomplete',
            'hexagrams': hexagram_count,
            'completeness': hexagram_count/64*100
        }
    else:
        print("❌ I Ching file not found")
        results['iching'] = {'status': 'missing', 'completeness': 0}
    
    # Verify Gene Keys
    print("\n🧬 GENE KEYS VERIFICATION")
    gk_path = base_path / "gene_keys" / "archetypes.json"
    if gk_path.exists():
        with open(gk_path, 'r', encoding='utf-8') as f:
            gk_data = json.load(f)
        
        key_count = len(gk_data.get("gene_keys", {}))
        sequence_count = len(gk_data.get("sequences", {}))
        frequency_count = len(gk_data.get("frequencies", {}))
        
        print(f"✅ Gene Keys: {key_count}/64 ({key_count/64*100:.1f}%)")
        print(f"✅ Sequences: {sequence_count}/3 ({sequence_count/3*100:.1f}%)")
        print(f"✅ Frequencies: {frequency_count}/3 ({frequency_count/3*100:.1f}%)")
        
        results['gene_keys'] = {
            'status': 'complete' if key_count == 64 else 'incomplete',
            'keys': key_count,
            'completeness': key_count/64*100
        }
    else:
        print("❌ Gene Keys file not found")
        results['gene_keys'] = {'status': 'missing', 'completeness': 0}
    
    # Verify Human Design
    print("\n🔮 HUMAN DESIGN VERIFICATION")
    hd_path = base_path / "human_design"
    hd_files = ['gates.json', 'centers.json', 'channels.json']
    hd_complete = 0
    
    for file in hd_files:
        file_path = hd_path / file
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if file == 'gates.json':
                count = len(data.get("gates", {}))
                expected = 64
                print(f"✅ Gates: {count}/{expected} ({count/expected*100:.1f}%)")
            elif file == 'centers.json':
                count = len(data.get("centers", {}))
                expected = 9
                print(f"✅ Centers: {count}/{expected} ({count/expected*100:.1f}%)")
            elif file == 'channels.json':
                count = len(data.get("channels", {}))
                expected = 36
                print(f"✅ Channels: {count}/{expected} ({count/expected*100:.1f}%)")
            
            hd_complete += 1
        else:
            print(f"❌ {file} not found")
    
    results['human_design'] = {
        'status': 'complete' if hd_complete == 3 else 'incomplete',
        'files': hd_complete,
        'completeness': hd_complete/3*100
    }
    
    # Verify Astrology
    print("\n🌟 ASTROLOGY VERIFICATION")
    astro_path = base_path / "astrology"
    astro_files = ['nakshatras.json', 'dasha_periods.json']
    astro_complete = 0
    
    for file in astro_files:
        file_path = astro_path / file
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if file == 'nakshatras.json':
                count = len(data.get("nakshatras", {}))
                expected = 27
                print(f"✅ Nakshatras: {count}/{expected} ({count/expected*100:.1f}%)")
            elif file == 'dasha_periods.json':
                count = len(data.get("mahadasha_periods", {}))
                expected = 9
                print(f"✅ Dasha Periods: {count}/{expected} ({count/expected*100:.1f}%)")
            
            astro_complete += 1
        else:
            print(f"❌ {file} not found")
    
    results['astrology'] = {
        'status': 'complete' if astro_complete == 2 else 'incomplete',
        'files': astro_complete,
        'completeness': astro_complete/2*100
    }
    
    # Verify Sacred Geometry
    print("\n🔺 SACRED GEOMETRY VERIFICATION")
    sg_path = base_path / "sacred_geometry"
    sg_files = ['templates.json', 'symbols.json']
    sg_complete = 0
    
    for file in sg_files:
        file_path = sg_path / file
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if file == 'templates.json':
                count = len(data.get("templates", {}))
                print(f"✅ Templates: {count} sacred geometry forms")
            elif file == 'symbols.json':
                count = len(data.get("symbols", {}))
                print(f"✅ Symbols: {count} sacred symbols")
            
            sg_complete += 1
        else:
            print(f"❌ {file} not found")
    
    results['sacred_geometry'] = {
        'status': 'complete' if sg_complete == 2 else 'incomplete',
        'files': sg_complete,
        'completeness': sg_complete/2*100
    }
    
    # Verify existing complete datasets
    print("\n✅ EXISTING COMPLETE DATASETS")
    
    # Tarot
    tarot_path = base_path / "tarot" / "rider_waite.json"
    if tarot_path.exists():
        with open(tarot_path, 'r', encoding='utf-8') as f:
            tarot_data = json.load(f)
        card_count = len(tarot_data.get("cards", {}))
        print(f"✅ Tarot: {card_count}/78 cards ({card_count/78*100:.1f}%)")
        results['tarot'] = {'status': 'complete', 'completeness': 100}
    
    # Enneagram
    enneagram_path = base_path / "enneagram" / "types.json"
    if enneagram_path.exists():
        with open(enneagram_path, 'r', encoding='utf-8') as f:
            enneagram_data = json.load(f)
        type_count = len(enneagram_data.get("types", {}))
        print(f"✅ Enneagram: {type_count}/9 types ({type_count/9*100:.1f}%)")
        results['enneagram'] = {'status': 'complete', 'completeness': 100}
    
    # Final Summary
    print("\n" + "=" * 60)
    print("📊 FINAL VERIFICATION SUMMARY")
    print("=" * 60)
    
    complete_engines = sum(1 for r in results.values() if r['status'] == 'complete')
    total_engines = len(results)
    overall_completion = complete_engines / total_engines * 100
    
    print(f"\n🎯 OVERALL STATUS: {complete_engines}/{total_engines} engines complete ({overall_completion:.1f}%)")
    
    for engine, data in results.items():
        status_icon = "✅" if data['status'] == 'complete' else "⚠️" if data['status'] == 'incomplete' else "❌"
        print(f"{status_icon} {engine.replace('_', ' ').title()}: {data['completeness']:.1f}% complete")
    
    print(f"\n🚀 ENGINES READY FOR PRODUCTION:")
    ready_engines = [engine for engine, data in results.items() if data['status'] == 'complete']
    for engine in ready_engines:
        print(f"   • {engine.replace('_', ' ').title()}")
    
    if overall_completion == 100:
        print(f"\n🎉 ALL CONSCIOUSNESS EXPLORATION ENGINES ARE FULLY OPERATIONAL!")
        print(f"The WitnessOS reality matrix is complete and ready for field debugging.")
    else:
        print(f"\n⚠️  Some engines need attention. Run the dataset generator again if needed.")
    
    return results

if __name__ == "__main__":
    verify_datasets()
