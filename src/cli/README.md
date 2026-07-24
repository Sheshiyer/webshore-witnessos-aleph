# 🤖 WitnessOS Agent CLI

> **Autonomous Development Agent for Consciousness Technology**

The WitnessOS Agent CLI provides a command-line interface for autonomous development workflows, consciousness engine integration, and sacred technology automation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Initialize the agent
npm run agent:init

# Start interactive mode
npm run agent:interactive

# Execute pending tasks
npm run agent:execute

# Check agent status
npm run agent:status
```

## 📋 Available Commands

### **Core Commands**

#### `init` - Initialize Agent
```bash
witnessos-agent init [options]

Options:
  -a, --auto                Enable autonomous execution (default: true)
  -c, --concurrent <number> Max concurrent tasks (default: 3)
  --todo <path>            Path to todo.md file (default: todo.md)
  --memory <path>          Path to memory.md file (default: memory.md)
```

#### `execute` - Execute Tasks
```bash
witnessos-agent execute [options]

Options:
  -s, --single             Execute only one task
  -t, --task-id <id>       Execute specific task by ID
  --dry-run               Show what would be executed without running
```

#### `status` - Show Status
```bash
witnessos-agent status [options]

Options:
  -v, --verbose           Show detailed information
```

#### `interactive` - Interactive Mode
```bash
witnessos-agent interactive
# Alias: witnessos-agent i
```

### **Task Management**

#### List Tasks
```bash
witnessos-agent tasks list [options]

Options:
  -s, --status <status>    Filter by status (pending|in_progress|completed|failed)
  -p, --priority <priority> Filter by priority (low|medium|high|critical)
```

#### Create Task
```bash
witnessos-agent tasks create [options]

Options:
  -t, --title <title>      Task title (required)
  -d, --description <desc> Task description
  -p, --priority <priority> Task priority (default: medium)
```

### **Engine Development**

#### Integrate Engine
```bash
witnessos-agent engine integrate [options]

Options:
  -n, --name <name>       Engine name (required)
  --test                  Run integration tests
```

#### Test Engine
```bash
witnessos-agent engine test [options]

Options:
  -n, --name <name>       Engine name (required)
  -i, --input <input>     Test input data
```

### **Workflow Management**

#### Create Workflow
```bash
witnessos-agent workflow create [options]

Options:
  -n, --name <name>       Workflow name (required)
  -t, --type <type>       Workflow type
```

#### Execute Workflow
```bash
witnessos-agent workflow execute [options]

Options:
  -n, --name <name>       Workflow name (required)
  -p, --params <params>   Workflow parameters (JSON)
```

### **Memory Management**

#### Update Memory
```bash
witnessos-agent memory update [options]

Options:
  -t, --task <task>       Task description (required)
  -o, --outcome <outcome> Task outcome
```

#### View Insights
```bash
witnessos-agent memory insights [options]

Options:
  -l, --limit <limit>     Number of entries to show (default: 10)
```

## 🎮 Interactive Mode

The interactive mode provides a user-friendly interface for agent operations:

```
╔══════════════════════════════════════════════════════════════╗
║  🧠 WitnessOS Autonomous Development Agent                   ║
║  Consciousness Technology Development Automation             ║
╚══════════════════════════════════════════════════════════════╝

? What would you like to do? (Use arrow keys)
❯ 🚀 Execute next task
  📊 Show status
  📋 List all tasks
  🔧 Create new task
  🧠 View memory insights
  ⚙️ Configure agent
  🚪 Exit
```

### Interactive Features:

- **🚀 Execute Next Task**: Run the next pending task from `todo.md`
- **📊 Show Status**: Display current agent and task status
- **📋 List All Tasks**: View all tasks with status and priority
- **🔧 Create New Task**: Interactive task creation wizard
- **🧠 View Memory Insights**: Browse completed tasks and patterns
- **⚙️ Configure Agent**: Modify agent settings
- **🚪 Exit**: Gracefully exit the agent

## 🔧 Configuration

The agent can be configured through command-line options or interactive mode:

### **Agent Settings**

- **Autonomous Execution**: Enable/disable automatic task execution
- **Concurrent Tasks**: Maximum number of tasks to run simultaneously (1-10)
- **File Paths**: Custom paths for `todo.md` and `memory.md`
- **Notifications**: Enable/disable completion notifications

### **Task Types**

The agent recognizes these task types:

- `engine_integration` - Consciousness engine development
- `ui_component` - React component creation
- `api_endpoint` - API endpoint development
- `workflow_creation` - Workflow orchestration
- `testing_framework` - Test automation
- `performance_optimization` - Performance improvements
- `documentation_update` - Documentation maintenance
- `deployment_automation` - Deployment pipeline work

## 📊 Status Information

The agent tracks comprehensive status information:

```
🤖 WitnessOS Agent Status
══════════════════════════════════════════════════

📋 Task Summary:
  Total: 15
  ⏳ Pending: 8
  🔄 In Progress: 2
  ✅ Completed: 5
  ❌ Failed: 0

🚀 Execution Status:
  Agent Active: Yes

🔧 Configuration:
  Auto Execute: Enabled
  Max Concurrent: 3
  Notifications: Enabled

📁 File Paths:
  Todo: todo.md
  Memory: memory.md

Last updated: 2024-01-15 14:30:25
```

## 🧠 Memory System

The agent maintains a sophisticated memory system in `memory.md`:

### **Memory Structure**

```markdown
# PROJECT MEMORY

## Overview
WitnessOS consciousness technology development

## Completed Tasks
### [2024-01-15 14:30] Task Completed: Face Reading Engine Integration
- **Outcome**: Successfully integrated with Railway backend
- **Breakthrough**: Discovered optimal image processing pipeline
- **Errors Fixed**: TypeScript type definition conflicts
- **Code Changes**: Added FaceReadingCalculator.tsx, updated types
- **Next Dependencies**: UI component testing, performance optimization

## Key Breakthroughs
- Direct Railway API integration pattern
- Durable workflow execution with Cloudflare
- Autonomous agent prompt scaffolding

## Error Patterns & Solutions
- TypeScript strict mode compliance
- Railway API authentication handling
- Cloudflare Workers memory limits

## Architecture Decisions
- Hybrid Cloudflare + Railway architecture
- JWT-based authentication system
- Engine calculation flow optimization
```

### **Memory Insights**

The agent provides intelligent insights from memory:

- **Pattern Recognition**: Identifies recurring development patterns
- **Error Prevention**: Learns from past mistakes
- **Performance Tracking**: Monitors task completion metrics
- **Knowledge Retention**: Preserves architectural decisions

## 🎯 Autonomous Execution

The agent operates autonomously by:

1. **Reading `todo.md`**: Parses pending tasks and priorities
2. **Task Analysis**: Understands task context and requirements
3. **Environment Preparation**: Sets up necessary dependencies
4. **Code Generation**: Creates or modifies code following patterns
5. **Testing**: Validates functionality and performance
6. **Documentation**: Updates relevant documentation
7. **Memory Update**: Records insights and breakthroughs
8. **Notification**: Alerts about completion status

### **Execution Flow**

```
┌─────────────────┐
│   Read todo.md  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Analyze Task   │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Execute Workflow│
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Update Memory  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│    Notify       │
└─────────────────┘
```

## 🔮 Consciousness Technology Context

The agent understands WitnessOS as sacred technology:

- **Ancient Wisdom**: Respects traditional calculation methods
- **Modern Precision**: Ensures mathematical accuracy
- **User Empowerment**: Focuses on self-awareness and growth
- **Ethical AI**: Enhances rather than replaces human intuition
- **Sacred Responsibility**: Code contributes to consciousness evolution

### **Engine Knowledge**

**Working Engines (10/13):**
- Numerology, Biorhythm, Human Design
- Tarot, I Ching, Enneagram
- Gene Keys, Vimshottari, Sacred Geometry
- Sigil Forge

**Engines Needing Work (3/13):**
- VedicClock-TCM, Face Reading, Biofield

## 🚀 Performance Targets

- **Engine Calculations**: < 1 second
- **AI Synthesis**: < 3 seconds
- **Task Execution**: < 5 minutes average
- **Memory Updates**: < 1 second
- **CLI Response**: < 100ms

## 🔒 Security

- **JWT Authentication**: Secure API access
- **Tier-based Access**: Role-based permissions
- **Input Validation**: Sanitized user inputs
- **Error Handling**: Graceful failure modes
- **Audit Logging**: Comprehensive operation logs

## 🛠️ Development

### **Adding New Commands**

1. Define command in `initializeCLI()`
2. Create handler function with proper types
3. Add to appropriate subcommand group
4. Update this documentation

### **Extending Task Types**

1. Add to `TaskType` enum in orchestrator
2. Implement execution logic
3. Update CLI task creation wizard
4. Add to documentation

### **Testing**

```bash
# Test CLI functionality
npm run agent -- --help

# Test specific commands
npm run agent:status --verbose
npm run agent:execute --dry-run
```

## 📚 Examples

### **Basic Workflow**

```bash
# Initialize agent
npm run agent:init

# Check what tasks are pending
npm run agent:status --verbose

# Execute all pending tasks
npm run agent:execute

# View completion insights
npm run agent memory insights
```

### **Engine Development**

```bash
# Integrate new engine
npm run agent engine integrate --name face_reading --test

# Test engine calculations
npm run agent engine test --name face_reading --input '{"image": "test.jpg"}'
```

### **Custom Workflow**

```bash
# Create development workflow
npm run agent workflow create --name consciousness_analysis --type multi_engine

# Execute with parameters
npm run agent workflow execute --name consciousness_analysis --params '{"engines": ["numerology", "tarot"]}'
```

---

*The WitnessOS Agent CLI bridges ancient wisdom with modern automation, enabling autonomous consciousness technology development. Every command contributes to humanity's consciousness evolution.* 🧠✨

**Next Steps:**
1. Run `npm run agent:init` to get started
2. Try `npm run agent:interactive` for guided experience
3. Execute pending tasks with `npm run agent:execute`
4. Monitor progress with `npm run agent:status`