#!/usr/bin/env python3
"""
Update all 12 WitnessOS consciousness engines for Cloudflare D1/KV compatibility

This script systematically updates each engine's data models to inherit from
CloudflareEngineInput/Output instead of BaseEngineInput/Output, adding:
- UUID fields for D1 database storage
- User association fields
- Storage metadata fields
- KV caching support
- Privacy compliance features
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple

# Engine model files to update
ENGINE_FILES = [
    'witnessos-engines/engines/human_design_models.py',
    'witnessos-engines/engines/gene_keys_models.py', 
    'witnessos-engines/engines/vimshottari_dasha_models.py',
    'witnessos-engines/engines/i_ching_models.py',
    'witnessos-engines/engines/numerology_models.py',
    'witnessos-engines/engines/tarot_models.py',
    'witnessos-engines/engines/enneagram_models.py',
    'witnessos-engines/engines/biorhythm_models.py',
    'witnessos-engines/engines/sacred_geometry_models.py',
    'witnessos-engines/engines/sigil_forge_models.py',
    'witnessos-engines/engines/vedicclock_tcm_models.py',
    'witnessos-engines/engines/face_reading_models.py'  # Already updated
]

def update_imports(file_path: str) -> bool:
    """Update imports to include Cloudflare base models."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if already updated
        if 'CloudflareEngineInput' in content:
            print(f"✅ {file_path} - Already has Cloudflare imports")
            return False
        
        # Update the import statement
        old_import = "from shared.base.data_models import BaseEngineInput, BaseEngineOutput"
        new_import = """from shared.base.data_models import (
    BaseEngineInput, BaseEngineOutput, BirthDataInput,
    CloudflareEngineInput, CloudflareEngineOutput
)"""
        
        # Handle various import patterns
        patterns = [
            r"from shared\.base\.data_models import BaseEngineInput, BaseEngineOutput, BirthDataInput",
            r"from shared\.base\.data_models import BaseEngineInput, BaseEngineOutput",
            r"from shared\.base\.data_models import.*BaseEngineInput.*BaseEngineOutput.*"
        ]
        
        updated = False
        for pattern in patterns:
            if re.search(pattern, content):
                content = re.sub(pattern, new_import.replace('\n', ''), content)
                updated = True
                break
        
        if updated:
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"✅ {file_path} - Updated imports")
            return True
        else:
            print(f"⚠️  {file_path} - Could not find import pattern to update")
            return False
            
    except Exception as e:
        print(f"❌ {file_path} - Error updating imports: {e}")
        return False

def update_input_class(file_path: str, engine_name: str) -> bool:
    """Update input class to inherit from CloudflareEngineInput."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Find input class pattern
        input_class_pattern = rf"class {engine_name}Input\(BaseEngineInput"
        
        if re.search(input_class_pattern, content):
            # Replace BaseEngineInput with CloudflareEngineInput
            content = re.sub(
                rf"class {engine_name}Input\(BaseEngineInput",
                f"class {engine_name}Input(CloudflareEngineInput",
                content
            )
            
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"✅ {file_path} - Updated {engine_name}Input class")
            return True
        else:
            print(f"⚠️  {file_path} - Could not find {engine_name}Input class")
            return False
            
    except Exception as e:
        print(f"❌ {file_path} - Error updating input class: {e}")
        return False

def update_output_class(file_path: str, engine_name: str) -> bool:
    """Update output class to inherit from CloudflareEngineOutput."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Find output class pattern
        output_class_pattern = rf"class {engine_name}Output\(BaseEngineOutput"
        
        if re.search(output_class_pattern, content):
            # Replace BaseEngineOutput with CloudflareEngineOutput
            content = re.sub(
                rf"class {engine_name}Output\(BaseEngineOutput",
                f"class {engine_name}Output(CloudflareEngineOutput",
                content
            )
            
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"✅ {file_path} - Updated {engine_name}Output class")
            return True
        else:
            print(f"⚠️  {file_path} - Could not find {engine_name}Output class")
            return False
            
    except Exception as e:
        print(f"❌ {file_path} - Error updating output class: {e}")
        return False

def add_kv_methods(file_path: str, engine_name: str) -> bool:
    """Add KV key generation methods to input class."""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if methods already exist
        if 'get_engine_kv_keys' in content:
            print(f"✅ {file_path} - Already has KV methods")
            return False
        
        # Find the end of the input class
        input_class_pattern = rf"class {engine_name}Input\([^)]+\):"
        match = re.search(input_class_pattern, content)
        
        if not match:
            print(f"⚠️  {file_path} - Could not find input class to add methods")
            return False
        
        # Find the next class or end of file
        start_pos = match.end()
        next_class_match = re.search(r'\nclass ', content[start_pos:])
        
        if next_class_match:
            insert_pos = start_pos + next_class_match.start()
        else:
            insert_pos = len(content)
        
        # KV methods to add
        kv_methods = f'''
    def get_engine_kv_keys(self) -> Dict[str, str]:
        """Generate KV keys for {engine_name.lower().replace('_', ' ')} engine data."""
        engine_name = "{engine_name.lower()}"
        return {{
            'reading': self.generate_user_key(engine_name, 'reading'),
            'analysis': self.generate_user_key(engine_name, 'analysis'),
            'cache': self.generate_cache_key(engine_name),
            'metadata': f"user:{{self.user_id}}:{{engine_name}}:metadata"
        }}
    
    def get_d1_table_name(self) -> str:
        """Get D1 table name for this engine."""
        return "engine_{engine_name.lower()}_readings"
'''
        
        # Insert the methods
        content = content[:insert_pos] + kv_methods + content[insert_pos:]
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"✅ {file_path} - Added KV methods")
        return True
        
    except Exception as e:
        print(f"❌ {file_path} - Error adding KV methods: {e}")
        return False

def get_engine_name_from_file(file_path: str) -> str:
    """Extract engine name from file path."""
    filename = Path(file_path).stem
    # Remove '_models' suffix and convert to PascalCase
    engine_name = filename.replace('_models', '')
    
    # Convert to PascalCase
    parts = engine_name.split('_')
    return ''.join(word.capitalize() for word in parts)

def update_engine_file(file_path: str) -> Dict[str, bool]:
    """Update a single engine file with all Cloudflare compatibility changes."""
    print(f"\n🔧 Updating {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return {'exists': False}
    
    engine_name = get_engine_name_from_file(file_path)
    print(f"📝 Engine name: {engine_name}")
    
    results = {
        'exists': True,
        'imports_updated': update_imports(file_path),
        'input_updated': update_input_class(file_path, engine_name),
        'output_updated': update_output_class(file_path, engine_name),
        'kv_methods_added': add_kv_methods(file_path, engine_name)
    }
    
    return results

def main():
    """Update all engine files for Cloudflare compatibility."""
    print("🚀 WitnessOS Engines - Cloudflare Integration Update")
    print("=" * 60)
    print("Updating all 12 consciousness engines for D1/KV compatibility")
    print("=" * 60)
    
    total_files = len(ENGINE_FILES)
    updated_files = 0
    results_summary = {}
    
    for file_path in ENGINE_FILES:
        results = update_engine_file(file_path)
        results_summary[file_path] = results
        
        if results.get('exists', False):
            if any(results.get(key, False) for key in ['imports_updated', 'input_updated', 'output_updated', 'kv_methods_added']):
                updated_files += 1
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 UPDATE SUMMARY")
    print("=" * 60)
    
    for file_path, results in results_summary.items():
        engine_name = get_engine_name_from_file(file_path)
        if results.get('exists', False):
            status = "✅ UPDATED" if any(results.get(key, False) for key in ['imports_updated', 'input_updated', 'output_updated', 'kv_methods_added']) else "✅ ALREADY CURRENT"
            print(f"{engine_name:20} - {status}")
        else:
            print(f"{engine_name:20} - ❌ FILE NOT FOUND")
    
    print(f"\n🎯 Results: {updated_files}/{total_files} files updated")
    
    if updated_files > 0:
        print("\n🔄 Next Steps:")
        print("1. Test updated engines locally")
        print("2. Update Cloudflare Workers integration")
        print("3. Deploy D1 database schema")
        print("4. Configure KV namespaces")
        print("5. Test end-to-end Cloudflare integration")
    else:
        print("\n✅ All engines already have Cloudflare compatibility!")
    
    print("\n🎉 Cloudflare integration update complete!")

if __name__ == "__main__":
    main()
