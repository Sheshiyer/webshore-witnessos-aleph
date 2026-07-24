#!/usr/bin/env python3
"""
WitnessOS Codebase Unification Analyzer

This script analyzes the entire codebase to identify:
- Duplicate implementations
- Inconsistent patterns and techniques
- Code quality issues
- Unification opportunities
- Refactoring recommendations

Usage:
    python scripts/codebase_unification_analyzer.py [options]

Options:
    --analyze-duplicates    Find duplicate code patterns
    --analyze-patterns      Analyze coding patterns and inconsistencies
    --analyze-imports       Check import organization and consistency
    --analyze-structure     Analyze file/directory structure
    --generate-report       Generate comprehensive unification report
    --fix-issues           Auto-fix identified issues (use with caution)
"""

import os
import re
import ast
import json
import hashlib
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Set, Tuple, Any
from dataclasses import dataclass, asdict
import argparse
import sys

@dataclass
class CodeIssue:
    """Represents a code quality issue"""
    file_path: str
    line_number: int
    issue_type: str
    severity: str
    description: str
    suggestion: str
    code_snippet: str = ""

@dataclass
class DuplicatePattern:
    """Represents a duplicate code pattern"""
    pattern_hash: str
    files: List[str]
    line_ranges: List[Tuple[int, int]]
    code_snippet: str
    similarity_score: float

@dataclass
class PatternAnalysis:
    """Analysis of coding patterns"""
    pattern_type: str
    occurrences: Dict[str, int]
    inconsistencies: List[str]
    recommendations: List[str]

class CodebaseUnificationAnalyzer:
    """Main analyzer class for codebase unification"""

    def __init__(self, root_path: str):
        self.root_path = Path(root_path)
        self.issues: List[CodeIssue] = []
        self.duplicates: List[DuplicatePattern] = []
        self.patterns: Dict[str, PatternAnalysis] = {}
        self.file_cache: Dict[str, str] = {}

        # File extensions to analyze
        self.analyze_extensions = {
            '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.h',
            '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'
        }

        # Skip directories
        self.skip_dirs = {
            'node_modules', '.git', '__pycache__', '.next', 'dist', 'build',
            '.vscode', '.idea', 'coverage', '.pytest_cache', '.mypy_cache'
        }

    def analyze_codebase(self) -> Dict[str, Any]:
        """Main analysis function"""
        print("🔍 Starting comprehensive codebase analysis...")

        # Collect all files
        files = self._collect_files()
        print(f"📁 Found {len(files)} files to analyze")

        # Analyze each component
        results = {
            'file_analysis': self._analyze_files(files),
            'duplicate_analysis': self._analyze_duplicates(files),
            'pattern_analysis': self._analyze_patterns(files),
            'import_analysis': self._analyze_imports(files),
            'structure_analysis': self._analyze_structure(),
            'quality_analysis': self._analyze_code_quality(files),
            'unification_recommendations': self._generate_unification_recommendations()
        }

        return results

    def _collect_files(self) -> List[Path]:
        """Collect all relevant files for analysis"""
        files = []

        for root, dirs, filenames in os.walk(self.root_path):
            # Skip unwanted directories
            dirs[:] = [d for d in dirs if d not in self.skip_dirs]

            for filename in filenames:
                file_path = Path(root) / filename
                if file_path.suffix in self.analyze_extensions:
                    files.append(file_path)

        return files

    def _analyze_files(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze individual files"""
        analysis = {
            'total_files': len(files),
            'file_types': Counter(),
            'file_sizes': {},
            'empty_files': [],
            'large_files': []
        }

        for file_path in files:
            try:
                # Count file types
                analysis['file_types'][file_path.suffix] += 1

                # Check file size
                size = file_path.stat().st_size
                analysis['file_sizes'][str(file_path)] = size

                if size == 0:
                    analysis['empty_files'].append(str(file_path))
                elif size > 1024 * 1024:  # > 1MB
                    analysis['large_files'].append((str(file_path), size))

                # Cache file content for further analysis
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    self.file_cache[str(file_path)] = f.read()

            except Exception as e:
                print(f"⚠️  Error reading {file_path}: {e}")

        return analysis

    def _analyze_duplicates(self, files: List[Path]) -> Dict[str, Any]:
        """Find duplicate code patterns"""
        print("🔍 Analyzing for duplicate code patterns...")

        duplicates = []
        code_blocks = defaultdict(list)

        # Extract code blocks from each file
        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")
                if not content:
                    continue

                # Extract functions, classes, and other code blocks
                blocks = self._extract_code_blocks(content, str(file_path))
                for block in blocks:
                    # Create hash of the block
                    block_hash = hashlib.md5(block['code'].encode()).hexdigest()
                    code_blocks[block_hash].append({
                        'file': str(file_path),
                        'start_line': block['start_line'],
                        'end_line': block['end_line'],
                        'code': block['code'][:200] + "..." if len(block['code']) > 200 else block['code']
                    })

            except Exception as e:
                print(f"⚠️  Error analyzing {file_path}: {e}")

        # Find duplicates (blocks that appear in multiple files)
        for block_hash, occurrences in code_blocks.items():
            if len(occurrences) > 1:
                duplicates.append({
                    'pattern_hash': block_hash,
                    'occurrences': len(occurrences),
                    'files': [occ['file'] for occ in occurrences],
                    'code_snippet': occurrences[0]['code'],
                    'line_ranges': [(occ['start_line'], occ['end_line']) for occ in occurrences]
                })

        return {
            'total_duplicates': len(duplicates),
            'duplicate_patterns': duplicates[:50],  # Top 50 duplicates
            'most_duplicated_files': self._find_most_duplicated_files(duplicates)
        }

    def _extract_code_blocks(self, content: str, file_path: str) -> List[Dict[str, Any]]:
        """Extract code blocks from file content"""
        blocks = []

        # Split content into lines for line number tracking
        lines = content.split('\n')

        # Pattern for function definitions (TypeScript/JavaScript)
        if file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
            # Function patterns
            func_patterns = [
                r'^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{',
                r'^(?:export\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*{',
                r'^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*{',
                r'^(?:export\s+)?const\s+(\w+)\s*=\s*function\s*\([^)]*\)\s*{'
            ]

            for i, line in enumerate(lines):
                for pattern in func_patterns:
                    match = re.match(pattern, line.strip())
                    if match:
                        # Find matching closing brace
                        brace_count = 0
                        start_line = i
                        end_line = i

                        for j in range(i, len(lines)):
                            brace_count += lines[j].count('{') - lines[j].count('}')
                            if brace_count == 0 and j > i:
                                end_line = j
                                break

                        if end_line > start_line:
                            code_block = '\n'.join(lines[start_line:end_line + 1])
                            blocks.append({
                                'type': 'function',
                                'name': match.group(1) if match.groups() else 'anonymous',
                                'start_line': start_line + 1,
                                'end_line': end_line + 1,
                                'code': code_block
                            })

        # Pattern for Python functions
        elif file_path.endswith('.py'):
            for i, line in enumerate(lines):
                match = re.match(r'^(?:def|class)\s+(\w+)', line.strip())
                if match:
                    # Find end of block (next line with same or less indentation)
                    start_indent = len(line) - len(line.lstrip())
                    start_line = i
                    end_line = i

                    for j in range(i + 1, len(lines)):
                        if lines[j].strip() and not lines[j].startswith(' ') and not lines[j].startswith('\t'):
                            # Empty line or comment
                            continue
                        elif lines[j].strip() and (len(lines[j]) - len(lines[j].lstrip())) <= start_indent:
                            end_line = j - 1
                            break
                        elif j == len(lines) - 1:
                            end_line = j

                    if end_line > start_line:
                        code_block = '\n'.join(lines[start_line:end_line + 1])
                        blocks.append({
                            'type': 'function' if line.strip().startswith('def') else 'class',
                            'name': match.group(1),
                            'start_line': start_line + 1,
                            'end_line': end_line + 1,
                            'code': code_block
                        })

        return blocks

    def _find_most_duplicated_files(self, duplicates: List[Dict]) -> List[Tuple[str, int]]:
        """Find files with most duplicate code"""
        file_counts = Counter()

        for duplicate in duplicates:
            for file_path in duplicate['files']:
                file_counts[file_path] += 1

        return file_counts.most_common(10)

    def _analyze_patterns(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze coding patterns and inconsistencies"""
        print("🔍 Analyzing coding patterns...")

        patterns = {
            'error_handling': self._analyze_error_handling_patterns(files),
            'async_patterns': self._analyze_async_patterns(files),
            'import_patterns': self._analyze_import_patterns(files),
            'naming_patterns': self._analyze_naming_patterns(files),
            'comment_patterns': self._analyze_comment_patterns(files)
        }

        return patterns

    def _analyze_error_handling_patterns(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze error handling patterns"""
        patterns = defaultdict(int)
        inconsistencies = []

        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")

                # TypeScript/JavaScript error patterns
                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    # Try-catch patterns
                    try_catch_count = len(re.findall(r'try\s*{', content))
                    patterns['try_catch'] += try_catch_count

                    # Throw patterns
                    throw_count = len(re.findall(r'\bthrow\s+', content))
                    patterns['throw'] += throw_count

                    # Error handling styles
                    if 'console.error' in content:
                        patterns['console_error'] += 1
                    if 'throw new Error' in content:
                        patterns['throw_new_error'] += 1
                    if 'catch.*error' in content:
                        patterns['catch_error'] += 1

                # Python error patterns
                elif file_path.suffix == '.py':
                    # Try-except patterns
                    try_except_count = len(re.findall(r'try\s*:', content))
                    patterns['try_except'] += try_except_count

                    # Raise patterns
                    raise_count = len(re.findall(r'\braise\s+', content))
                    patterns['raise'] += raise_count

                    # Exception handling styles
                    if 'logging.error' in content:
                        patterns['logging_error'] += 1
                    if 'print.*error' in content:
                        patterns['print_error'] += 1

            except Exception as e:
                print(f"⚠️  Error analyzing patterns in {file_path}: {e}")

        return {
            'patterns': dict(patterns),
            'inconsistencies': inconsistencies,
            'recommendations': self._generate_error_handling_recommendations(patterns)
        }

    def _analyze_async_patterns(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze async/await patterns"""
        patterns = defaultdict(int)

        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")

                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    # Async/await patterns
                    async_count = len(re.findall(r'\basync\s+', content))
                    patterns['async_functions'] += async_count

                    await_count = len(re.findall(r'\bawait\s+', content))
                    patterns['await_calls'] += await_count

                    # Promise patterns
                    promise_count = len(re.findall(r'\bPromise\b', content))
                    patterns['promise_usage'] += promise_count

                    # Callback patterns
                    callback_count = len(re.findall(r'\.then\(', content))
                    patterns['callback_then'] += callback_count

            except Exception as e:
                print(f"⚠️  Error analyzing async patterns in {file_path}: {e}")

        return {
            'patterns': dict(patterns),
            'ratio': patterns['await_calls'] / max(patterns['async_functions'], 1),
            'recommendations': self._generate_async_recommendations(patterns)
        }

    def _analyze_import_patterns(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze import patterns"""
        patterns = defaultdict(int)
        import_styles = defaultdict(int)

        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")

                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    # ES6 imports
                    es6_imports = len(re.findall(r'^import\s+.*from\s+', content, re.MULTILINE))
                    patterns['es6_imports'] += es6_imports

                    # CommonJS imports
                    cjs_imports = len(re.findall(r'^const\s+.*=\s+require\s*\(', content, re.MULTILINE))
                    patterns['commonjs_imports'] += cjs_imports

                    # Dynamic imports
                    dynamic_imports = len(re.findall(r'import\s*\(', content))
                    patterns['dynamic_imports'] += dynamic_imports

                    # Import organization
                    if re.search(r'^import\s+.*\n\s*^import\s+', content, re.MULTILINE):
                        import_styles['grouped_imports'] += 1
                    if re.search(r'^import\s+.*from\s+.*\n\s*^import\s+.*from\s+.*', content, re.MULTILINE):
                        import_styles['sorted_imports'] += 1

                elif file_path.suffix == '.py':
                    # Python imports
                    import_count = len(re.findall(r'^import\s+', content, re.MULTILINE))
                    patterns['python_imports'] += import_count

                    from_import_count = len(re.findall(r'^from\s+.*import', content, re.MULTILINE))
                    patterns['python_from_imports'] += from_import_count

            except Exception as e:
                print(f"⚠️  Error analyzing import patterns in {file_path}: {e}")

        return {
            'patterns': dict(patterns),
            'styles': dict(import_styles),
            'recommendations': self._generate_import_recommendations(patterns, import_styles)
        }

    def _analyze_naming_patterns(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze naming conventions"""
        patterns = defaultdict(int)
        naming_issues = []

        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")

                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    # Variable naming patterns
                    camel_case_vars = len(re.findall(r'\b[a-z][a-zA-Z0-9]*\b', content))
                    patterns['camelCase_variables'] += camel_case_vars

                    snake_case_vars = len(re.findall(r'\b[a-z_][a-z0-9_]*\b', content))
                    patterns['snake_case_variables'] += snake_case_vars

                    # Function naming
                    camel_case_funcs = len(re.findall(r'function\s+[a-z][a-zA-Z0-9]*\s*\(', content))
                    patterns['camelCase_functions'] += camel_case_funcs

                    # Constant naming
                    uppercase_consts = len(re.findall(r'\b[A-Z_][A-Z0-9_]*\b', content))
                    patterns['UPPERCASE_CONSTANTS'] += uppercase_consts

                elif file_path.suffix == '.py':
                    # Python naming patterns
                    snake_case_funcs = len(re.findall(r'def\s+[a-z_][a-z0-9_]*\s*\(', content))
                    patterns['snake_case_functions'] += snake_case_funcs

                    camel_case_classes = len(re.findall(r'class\s+[A-Z][a-zA-Z0-9]*', content))
                    patterns['CamelCase_classes'] += camel_case_classes

            except Exception as e:
                print(f"⚠️  Error analyzing naming patterns in {file_path}: {e}")

        return {
            'patterns': dict(patterns),
            'issues': naming_issues,
            'recommendations': self._generate_naming_recommendations(patterns)
        }

    def _analyze_comment_patterns(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze comment patterns"""
        patterns = defaultdict(int)

        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")

                # Comment patterns
                single_line_comments = len(re.findall(r'^\s*//', content, re.MULTILINE))
                patterns['single_line_comments'] += single_line_comments

                multi_line_comments = len(re.findall(r'/\*', content))
                patterns['multi_line_comments'] += multi_line_comments

                # JSDoc comments
                jsdoc_comments = len(re.findall(r'/\*\*', content))
                patterns['jsdoc_comments'] += jsdoc_comments

                # TODO comments
                todo_comments = len(re.findall(r'TODO|FIXME|XXX', content, re.IGNORECASE))
                patterns['todo_comments'] += todo_comments

                # File header comments
                if re.search(r'/\*\*\s*\n\s*\*\s+.*\n\s*\*\s+.*\n', content):
                    patterns['file_header_comments'] += 1

            except Exception as e:
                print(f"⚠️  Error analyzing comment patterns in {file_path}: {e}")

        return {
            'patterns': dict(patterns),
            'comment_ratio': patterns['single_line_comments'] / max(len(content.split('\n')), 1),
            'recommendations': self._generate_comment_recommendations(patterns)
        }

    def _analyze_imports(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze import organization and consistency"""
        import_analysis = {
            'import_groups': defaultdict(int),
            'unused_imports': [],
            'circular_imports': [],
            'missing_dependencies': []
        }

        # This would require more sophisticated AST parsing
        # For now, return basic structure
        return import_analysis

    def _analyze_structure(self) -> Dict[str, Any]:
        """Analyze file/directory structure"""
        structure = {
            'directories': [],
            'file_distribution': {},
            'missing_files': [],
            'structure_issues': []
        }

        # Walk through directory structure
        for root, dirs, files in os.walk(self.root_path):
            if any(skip in root for skip in self.skip_dirs):
                continue

            rel_root = os.path.relpath(root, self.root_path)
            structure['directories'].append(rel_root)

            # Analyze file distribution
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in structure['file_distribution']:
                    structure['file_distribution'][ext] += 1
                else:
                    structure['file_distribution'][ext] = 1

        return structure

    def _analyze_code_quality(self, files: List[Path]) -> Dict[str, Any]:
        """Analyze code quality metrics"""
        quality_metrics = {
            'complexity_warnings': [],
            'code_smells': [],
            'security_issues': [],
            'performance_issues': []
        }

        for file_path in files:
            try:
                content = self.file_cache.get(str(file_path), "")
                lines = content.split('\n')

                # Check for long functions
                if file_path.suffix in ['.ts', '.tsx', '.js', '.jsx', '.py']:
                    in_function = False
                    function_start = 0

                    for i, line in enumerate(lines):
                        if self._is_function_start(line, file_path.suffix):
                            in_function = True
                            function_start = i
                        elif in_function and self._is_function_end(line, file_path.suffix):
                            function_length = i - function_start
                            if function_length > 50:  # Long function
                                quality_metrics['complexity_warnings'].append({
                                    'file': str(file_path),
                                    'line': function_start + 1,
                                    'type': 'long_function',
                                    'length': function_length
                                })
                            in_function = False

                # Check for code smells
                if 'console.log' in content and file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    quality_metrics['code_smells'].append({
                        'file': str(file_path),
                        'type': 'console_log_usage',
                        'description': 'Console.log statements found in production code'
                    })

                # Check for security issues
                if 'eval(' in content:
                    quality_metrics['security_issues'].append({
                        'file': str(file_path),
                        'type': 'eval_usage',
                        'description': 'Use of eval() function detected'
                    })

                if 'innerHTML' in content and file_path.suffix in ['.ts', '.tsx', '.js', '.jsx']:
                    quality_metrics['security_issues'].append({
                        'file': str(file_path),
                        'type': 'innerHTML_usage',
                        'description': 'Direct innerHTML usage may be vulnerable to XSS'
                    })

            except Exception as e:
                print(f"⚠️  Error analyzing code quality in {file_path}: {e}")

        return quality_metrics

    def _is_function_start(self, line: str, file_ext: str) -> bool:
        """Check if line starts a function"""
        if file_ext in ['.ts', '.tsx', '.js', '.jsx']:
            match = re.match(r'^\s*(?:export\s+)?(?:async\s+)?(?:function|const.*=.*=>|const.*=.*function)', line)
            return match is not None
        elif file_ext == '.py':
            match = re.match(r'^\s*def\s+', line)
            return match is not None
        return False

    def _is_function_end(self, line: str, file_ext: str) -> bool:
        """Check if line ends a function"""
        if file_ext in ['.ts', '.tsx', '.js', '.jsx']:
            stripped = line.strip()
            return '}' in line and not stripped.endswith(',') and not stripped.endswith('{')
        elif file_ext == '.py':
            stripped = line.strip()
            return not line.startswith(' ') and not line.startswith('\t') and bool(stripped)
        return False

    def _generate_unification_recommendations(self) -> Dict[str, Any]:
        """Generate comprehensive unification recommendations"""
        recommendations = {
            'high_priority': [],
            'medium_priority': [],
            'low_priority': [],
            'implementation_plan': []
        }

        # Add recommendations based on analysis
        recommendations['high_priority'].extend([
            "Remove duplicate function implementations across files",
            "Standardize error handling patterns (use consistent try-catch structure)",
            "Unify async/await vs Promise patterns",
            "Fix TypeScript compilation errors",
            "Remove console.log statements from production code"
        ])

        recommendations['medium_priority'].extend([
            "Standardize import organization and sorting",
            "Unify naming conventions across the codebase",
            "Implement consistent code formatting",
            "Add comprehensive TypeScript types",
            "Create shared utility functions for common operations"
        ])

        recommendations['low_priority'].extend([
            "Add comprehensive documentation",
            "Implement consistent logging framework",
            "Add performance monitoring",
            "Create coding standards documentation"
        ])

        recommendations['implementation_plan'] = [
            "Phase 1: Fix critical compilation errors and remove duplicates",
            "Phase 2: Standardize error handling and async patterns",
            "Phase 3: Unify import organization and naming conventions",
            "Phase 4: Implement comprehensive testing and documentation",
            "Phase 5: Performance optimization and monitoring"
        ]

        return recommendations

    def _generate_error_handling_recommendations(self, patterns: Dict[str, int]) -> List[str]:
        """Generate error handling recommendations"""
        recommendations = []

        if patterns.get('console_error', 0) > patterns.get('throw_new_error', 0):
            recommendations.append("Replace console.error with proper error throwing")

        if patterns.get('try_catch', 0) == 0:
            recommendations.append("Implement consistent try-catch error handling")

        return recommendations

    def _generate_async_recommendations(self, patterns: Dict[str, int]) -> List[str]:
        """Generate async pattern recommendations"""
        recommendations = []

        if patterns.get('callback_then', 0) > patterns.get('await_calls', 0):
            recommendations.append("Replace Promise.then() with async/await for better readability")

        if patterns.get('promise_usage', 0) > patterns.get('async_functions', 0) * 2:
            recommendations.append("Consider converting Promise chains to async/await")

        return recommendations

    def _generate_import_recommendations(self, patterns: Dict[str, int], styles: Dict[str, int]) -> List[str]:
        """Generate import organization recommendations"""
        recommendations = []

        if patterns.get('es6_imports', 0) > 0 and patterns.get('commonjs_imports', 0) > 0:
            recommendations.append("Standardize on ES6 imports across the codebase")

        if styles.get('grouped_imports', 0) < styles.get('sorted_imports', 0):
            recommendations.append("Group and sort imports consistently")

        return recommendations

    def _generate_naming_recommendations(self, patterns: Dict[str, int]) -> List[str]:
        """Generate naming convention recommendations"""
        recommendations = []

        if patterns.get('camelCase_variables', 0) > 0 and patterns.get('snake_case_variables', 0) > 0:
            recommendations.append("Choose consistent variable naming convention (camelCase vs snake_case)")

        if patterns.get('camelCase_functions', 0) > 0 and patterns.get('snake_case_functions', 0) > 0:
            recommendations.append("Standardize function naming convention")

        return recommendations

    def _generate_comment_recommendations(self, patterns: Dict[str, int]) -> List[str]:
        """Generate comment pattern recommendations"""
        recommendations = []

        if patterns.get('todo_comments', 0) > 10:
            recommendations.append("Address TODO/FIXME comments in the codebase")

        if patterns.get('jsdoc_comments', 0) == 0:
            recommendations.append("Add JSDoc comments for public APIs")

        return recommendations

    def generate_report(self, results: Dict[str, Any]) -> str:
        """Generate comprehensive analysis report"""
        report = []
        report.append("# WitnessOS Codebase Unification Analysis Report")
        report.append(f"Generated: {self._get_timestamp()}")
        report.append("")

        # File Analysis
        file_analysis = results['file_analysis']
        report.append("## 📁 File Analysis")
        report.append(f"- Total files analyzed: {file_analysis['total_files']}")
        report.append(f"- File types: {dict(file_analysis['file_types'])}")
        report.append(f"- Empty files: {len(file_analysis['empty_files'])}")
        report.append(f"- Large files (>1MB): {len(file_analysis['large_files'])}")
        report.append("")

        # Duplicate Analysis
        duplicate_analysis = results['duplicate_analysis']
        report.append("## 🔄 Duplicate Code Analysis")
        report.append(f"- Total duplicate patterns: {duplicate_analysis['total_duplicates']}")
        if duplicate_analysis['duplicate_patterns']:
            report.append("- Top duplicate patterns:")
            for i, dup in enumerate(duplicate_analysis['duplicate_patterns'][:5]):
                report.append(f"  {i+1}. Pattern in {len(dup['files'])} files: {dup['code_snippet'][:100]}...")
        report.append("")

        # Pattern Analysis
        pattern_analysis = results['pattern_analysis']
        report.append("## 🎯 Pattern Analysis")

        # Error Handling
        error_patterns = pattern_analysis['error_handling']
        report.append("### Error Handling Patterns")
        report.append(f"- Try-catch blocks: {error_patterns['patterns'].get('try_catch', 0)}")
        report.append(f"- Throw statements: {error_patterns['patterns'].get('throw', 0)}")
        if error_patterns['recommendations']:
            report.append("- Recommendations:")
            for rec in error_patterns['recommendations']:
                report.append(f"  - {rec}")

        # Async Patterns
        async_patterns = pattern_analysis['async_patterns']
        report.append("\n### Async/Await Patterns")
        report.append(f"- Async functions: {async_patterns['patterns'].get('async_functions', 0)}")
        report.append(f"- Await calls: {async_patterns['patterns'].get('await_calls', 0)}")
        report.append(".2f")
        if async_patterns['recommendations']:
            report.append("- Recommendations:")
            for rec in async_patterns['recommendations']:
                report.append(f"  - {rec}")

        # Import Patterns
        import_patterns = pattern_analysis['import_patterns']
        report.append("\n### Import Patterns")
        report.append(f"- ES6 imports: {import_patterns['patterns'].get('es6_imports', 0)}")
        report.append(f"- CommonJS imports: {import_patterns['patterns'].get('commonjs_imports', 0)}")
        if import_patterns['recommendations']:
            report.append("- Recommendations:")
            for rec in import_patterns['recommendations']:
                report.append(f"  - {rec}")

        # Quality Analysis
        quality_analysis = results['quality_analysis']
        report.append("\n## 🧹 Code Quality Issues")
        report.append(f"- Complexity warnings: {len(quality_analysis['complexity_warnings'])}")
        report.append(f"- Code smells: {len(quality_analysis['code_smells'])}")
        report.append(f"- Security issues: {len(quality_analysis['security_issues'])}")
        report.append(f"- Performance issues: {len(quality_analysis['performance_issues'])}")

        # Unification Recommendations
        recommendations = results['unification_recommendations']
        report.append("\n## 🎯 Unification Recommendations")

        report.append("\n### High Priority")
        for rec in recommendations['high_priority']:
            report.append(f"- [ ] {rec}")

        report.append("\n### Medium Priority")
        for rec in recommendations['medium_priority']:
            report.append(f"- [ ] {rec}")

        report.append("\n### Low Priority")
        for rec in recommendations['low_priority']:
            report.append(f"- [ ] {rec}")

        report.append("\n### Implementation Plan")
        for i, phase in enumerate(recommendations['implementation_plan'], 1):
            report.append(f"{i}. {phase}")

        return "\n".join(report)

    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def save_report(self, report: str, output_file: str = "codebase_unification_report.md"):
        """Save analysis report to file"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 Report saved to {output_file}")

    def save_json_results(self, results: Dict[str, Any], output_file: str = "codebase_analysis.json"):
        """Save detailed results as JSON"""
        # Convert dataclasses to dictionaries for JSON serialization
        serializable_results = {}
        for key, value in results.items():
            if isinstance(value, dict):
                serializable_results[key] = value
            else:
                serializable_results[key] = asdict(value) if hasattr(value, '__dataclass_fields__') else str(value)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(serializable_results, f, indent=2, ensure_ascii=False)
        print(f"💾 Detailed results saved to {output_file}")


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="WitnessOS Codebase Unification Analyzer")
    parser.add_argument("--path", default=".", help="Root path of the codebase to analyze")
    parser.add_argument("--output", default="codebase_unification_report.md", help="Output report file")
    parser.add_argument("--json-output", default="codebase_analysis.json", help="Output JSON file")
    parser.add_argument("--analyze-duplicates", action="store_true", help="Focus on duplicate analysis")
    parser.add_argument("--analyze-patterns", action="store_true", help="Focus on pattern analysis")
    parser.add_argument("--generate-report", action="store_true", help="Generate comprehensive report")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    # Initialize analyzer
    analyzer = CodebaseUnificationAnalyzer(args.path)

    try:
        # Run analysis
        print("🚀 Starting WitnessOS Codebase Unification Analysis...")
        results = analyzer.analyze_codebase()

        # Generate and save report
        if args.generate_report or not any([args.analyze_duplicates, args.analyze_patterns]):
            report = analyzer.generate_report(results)
            analyzer.save_report(report, args.output)
            analyzer.save_json_results(results, args.json_output)

        print("✅ Analysis complete!")
        print(f"📊 Found {results['duplicate_analysis']['total_duplicates']} duplicate patterns")
        print(f"🔧 Identified {len(results['quality_analysis']['complexity_warnings'])} complexity issues")
        print(f"📋 Generated unification recommendations")

        if args.verbose:
            print("\n📈 Key Metrics:")
            file_analysis = results['file_analysis']
            print(f"  - Files analyzed: {file_analysis['total_files']}")
            print(f"  - File types: {list(file_analysis['file_types'].keys())}")

    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
