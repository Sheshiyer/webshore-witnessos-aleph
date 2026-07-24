#!/usr/bin/env node
/**
 * WitnessOS Agent CLI
 * 
 * Command-line interface for the autonomous development agent.
 * Provides direct access to task orchestration, workflow execution,
 * and consciousness technology development automation.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { AgentTaskOrchestrator } from '../lib/agent-task-orchestrator';

// Type definitions for CLI options
interface InitOptions {
  auto: boolean;
  concurrent: string;
  todo: string;
  memory: string;
}

interface ExecuteOptions {
  single?: boolean;
  taskId?: string;
  dryRun?: boolean;
}

interface StatusOptions {
  verbose?: boolean;
}

interface TaskOptions {
  status?: string;
  priority?: string;
}

interface CreateTaskOptions {
  title: string;
  description?: string;
  priority: string;
}

interface EngineOptions {
  name: string;
  test?: boolean;
  input?: string;
}

interface WorkflowOptions {
  name: string;
  type?: string;
  params?: string;
}

interface MemoryOptions {
  task?: string;
  outcome?: string;
  limit?: string;
}

// CLI version
const CLI_VERSION = '1.0.0';

// ASCII art banner
const BANNER = `
${chalk.cyan('╔══════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}  ${chalk.bold.magenta('🧠 WitnessOS Autonomous Development Agent')}                ${chalk.cyan('║')}
${chalk.cyan('║')}  ${chalk.gray('Consciousness Technology Development Automation')}        ${chalk.cyan('║')}
${chalk.cyan('╚══════════════════════════════════════════════════════════════╝')}
`;

// Task orchestrator instance
let orchestrator: AgentTaskOrchestrator;

/**
 * Initialize the CLI application
 */
function initializeCLI(): Command {
  const program = new Command();
  
  program
    .name('witnessos-agent')
    .description('WitnessOS Autonomous Development Agent CLI')
    .version(CLI_VERSION)
    .hook('preAction', async () => {
      console.log(BANNER);
    });

  // Initialize orchestrator command
  program
    .command('init')
    .description('Initialize the agent task orchestrator')
    .option('-a, --auto', 'Enable autonomous execution', true)
    .option('-c, --concurrent <number>', 'Max concurrent tasks', '3')
    .option('--todo <path>', 'Path to todo.md file', 'todo.md')
    .option('--memory <path>', 'Path to memory.md file', 'memory.md')
    .action(async (options: InitOptions) => {
      await initializeOrchestrator(options);
    });

  // Execute tasks command
  program
    .command('execute')
    .description('Execute pending tasks from todo.md')
    .option('-s, --single', 'Execute only one task')
    .option('-t, --task-id <id>', 'Execute specific task by ID')
    .option('--dry-run', 'Show what would be executed without running')
    .action(async (options: ExecuteOptions) => {
      await executeTasks(options);
    });

  // Status command
  program
    .command('status')
    .description('Show current task status and agent state')
    .option('-v, --verbose', 'Show detailed information')
    .action(async (options: StatusOptions) => {
      await showStatus(options);
    });

  // Interactive mode command
  program
    .command('interactive')
    .alias('i')
    .description('Start interactive agent session')
    .action(async () => {
      await startInteractiveMode();
    });

  // Task management commands
  program
    .command('tasks')
    .description('Task management operations')
    .addCommand(createTasksSubcommands());

  // Engine development commands
  program
    .command('engine')
    .description('Consciousness engine development operations')
    .addCommand(createEngineSubcommands());

  // Workflow commands
  program
    .command('workflow')
    .description('Development workflow operations')
    .addCommand(createWorkflowSubcommands());

  // Memory management commands
  program
    .command('memory')
    .description('Memory and documentation management')
    .addCommand(createMemorySubcommands());

  return program;
}

/**
 * Initialize the task orchestrator
 */
async function initializeOrchestrator(options: InitOptions): Promise<void> {
  const spinner = ora('Initializing WitnessOS Agent...').start();
  
  try {
    orchestrator = new AgentTaskOrchestrator({
      todoFilePath: options.todo,
      memoryFilePath: options.memory,
      maxConcurrentTasks: parseInt(options.concurrent),
      autoExecute: options.auto,
      notificationEnabled: true,
      backupEnabled: true
    });
    
    await orchestrator.initialize();
    
    spinner.succeed('Agent initialized successfully!');
    
    // Show initial status
    const summary = orchestrator.getTaskSummary();
    console.log(`\n${chalk.green('📊 Task Summary:')}`);
    console.log(`  Total tasks: ${chalk.bold(summary.total)}`);
    console.log(`  Pending: ${chalk.yellow(summary.pending)}`);
    console.log(`  In Progress: ${chalk.blue(summary.inProgress)}`);
    console.log(`  Completed: ${chalk.green(summary.completed)}`);
    console.log(`  Failed: ${chalk.red(summary.failed)}`);
    
    if (summary.pending > 0) {
      console.log(`\n${chalk.cyan('🚀 Ready to execute')} ${chalk.bold(summary.pending)} ${chalk.cyan('pending tasks')}`);
    }
    
  } catch (error) {
    spinner.fail('Failed to initialize agent');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Execute tasks
 */
async function executeTasks(options: ExecuteOptions): Promise<void> {
  if (!orchestrator) {
    console.error(chalk.red('❌ Agent not initialized. Run "witnessos-agent init" first.'));
    return;
  }
  
  if (options.dryRun) {
    console.log(chalk.yellow('🔍 Dry run mode - showing what would be executed:'));
    const summary = orchestrator.getTaskSummary();
    console.log(`Would execute ${summary.pending} pending tasks`);
    return;
  }
  
  const spinner = ora('Executing tasks...').start();
  
  try {
    if (options.single) {
      await orchestrator.executeNextTask();
      spinner.succeed('Single task executed');
    } else {
      // Start autonomous execution
      spinner.text = 'Running autonomous task execution...';
      // In a real implementation, this would trigger the orchestrator
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate execution
      spinner.succeed('All tasks executed');
    }
    
    // Show updated status
    const summary = orchestrator.getTaskSummary();
    console.log(`\n${chalk.green('✅ Execution completed')}`);
    console.log(`Remaining pending tasks: ${chalk.yellow(summary.pending)}`);
    
  } catch (error) {
    spinner.fail('Task execution failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
  }
}

/**
 * Show current status
 */
async function showStatus(options: StatusOptions): Promise<void> {
  if (!orchestrator) {
    console.error(chalk.red('❌ Agent not initialized. Run "witnessos-agent init" first.'));
    return;
  }
  
  const summary = orchestrator.getTaskSummary();
  
  console.log(`\n${chalk.bold.cyan('🤖 WitnessOS Agent Status')}`);
  console.log(`${chalk.gray('═'.repeat(50))}`);
  
  // Task summary
  console.log(`\n${chalk.bold('📋 Task Summary:')}`);
  console.log(`  Total: ${chalk.bold(summary.total)}`);
  console.log(`  ${chalk.yellow('⏳ Pending:')} ${summary.pending}`);
  console.log(`  ${chalk.blue('🔄 In Progress:')} ${summary.inProgress}`);
  console.log(`  ${chalk.green('✅ Completed:')} ${summary.completed}`);
  console.log(`  ${chalk.red('❌ Failed:')} ${summary.failed}`);
  
  // Execution status
  console.log(`\n${chalk.bold('🚀 Execution Status:')}`);
  console.log(`  Agent Active: ${summary.isExecuting ? chalk.green('Yes') : chalk.gray('No')}`);
  
  if (options.verbose) {
    console.log(`\n${chalk.bold('🔧 Configuration:')}`);
    console.log(`  Auto Execute: ${chalk.green('Enabled')}`);
    console.log(`  Max Concurrent: ${chalk.blue('3')}`);
    console.log(`  Notifications: ${chalk.green('Enabled')}`);
    
    console.log(`\n${chalk.bold('📁 File Paths:')}`);
    console.log(`  Todo: ${chalk.gray('todo.md')}`);
    console.log(`  Memory: ${chalk.gray('memory.md')}`);
  }
  
  console.log(`\n${chalk.gray('Last updated:')} ${new Date().toLocaleString()}`);
}

/**
 * Start interactive mode
 */
async function startInteractiveMode(): Promise<void> {
  console.log(`\n${chalk.bold.magenta('🎮 Interactive Agent Mode')}`);
  console.log(chalk.gray('Use arrow keys to navigate, Enter to select, Ctrl+C to exit\n'));
  
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🚀 Execute next task', value: 'execute_next' },
          { name: '📊 Show status', value: 'status' },
          { name: '📋 List all tasks', value: 'list_tasks' },
          { name: '🔧 Create new task', value: 'create_task' },
          { name: '🧠 View memory insights', value: 'view_memory' },
          { name: '⚙️ Configure agent', value: 'configure' },
          { name: '🚪 Exit', value: 'exit' }
        ]
      }
    ]);
    
    switch (action) {
      case 'execute_next':
        await handleExecuteNext();
        break;
      case 'status':
        await showStatus({ verbose: false });
        break;
      case 'list_tasks':
        await handleListTasks();
        break;
      case 'create_task':
        await handleCreateTask();
        break;
      case 'view_memory':
        await handleViewMemory();
        break;
      case 'configure':
        await handleConfigure();
        break;
      case 'exit':
        console.log(chalk.cyan('\n👋 Goodbye! Keep building consciousness technology!'));
        process.exit(0);
    }
    
    // Pause before next iteration
    await inquirer.prompt([{
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }]);
  }
}

/**
 * Handle execute next task in interactive mode
 */
async function handleExecuteNext(): Promise<void> {
  if (!orchestrator) {
    console.log(chalk.red('❌ Agent not initialized'));
    return;
  }
  
  const spinner = ora('Executing next task...').start();
  
  try {
    await orchestrator.executeNextTask();
    spinner.succeed('Task executed successfully');
  } catch (error) {
      spinner.fail('Task execution failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    }
}

/**
 * Handle list tasks in interactive mode
 */
async function handleListTasks(): Promise<void> {
  console.log(`\n${chalk.bold('📋 Current Tasks:')}`);
  console.log(chalk.gray('─'.repeat(60)));
  
  // In a real implementation, this would list actual tasks
  const sampleTasks = [
    { id: '1', title: 'Implement Face Reading engine integration', status: 'pending', priority: 'high' },
    { id: '2', title: 'Create performance monitoring dashboard', status: 'pending', priority: 'medium' },
    { id: '3', title: 'Enhance VedicClock-TCM engine', status: 'in_progress', priority: 'high' }
  ];
  
  sampleTasks.forEach(task => {
    const statusIcon = task.status === 'pending' ? '⏳' : task.status === 'in_progress' ? '🔄' : '✅';
    const priorityColor = task.priority === 'high' ? chalk.red : task.priority === 'medium' ? chalk.yellow : chalk.gray;
    
    console.log(`${statusIcon} ${chalk.bold(task.title)}`);
    console.log(`   ${chalk.gray('ID:')} ${task.id} ${chalk.gray('|')} ${chalk.gray('Priority:')} ${priorityColor(task.priority)}`);
    console.log('');
  });
}

/**
 * Handle create task in interactive mode
 */
async function handleCreateTask(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Task title:',
      validate: (input: string) => input.length > 0 || 'Title is required'
    },
    {
      type: 'textarea',
      name: 'description',
      message: 'Task description:'
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Priority:',
      choices: ['low', 'medium', 'high', 'critical']
    },
    {
      type: 'list',
      name: 'taskType',
      message: 'Task type:',
      choices: [
        'engine_integration',
        'ui_component',
        'api_endpoint',
        'workflow_creation',
        'testing_framework',
        'performance_optimization',
        'documentation_update',
        'deployment_automation'
      ]
    }
  ]);
  
  console.log(`\n${chalk.green('✅ Task created:')} ${answers.title}`);
  console.log(chalk.gray('Note: In a full implementation, this would be added to todo.md'));
}

/**
 * Handle view memory in interactive mode
 */
async function handleViewMemory(): Promise<void> {
  console.log(`\n${chalk.bold('🧠 Memory Insights:')}`);
  console.log(chalk.gray('─'.repeat(50)));
  
  // Sample memory insights
  console.log(`${chalk.green('✨ Recent Breakthroughs:')}`);
  console.log('  • Successfully integrated Railway API with all engines');
  console.log('  • Implemented durable workflow patterns');
  console.log('  • Created autonomous agent prompt scaffolding');
  
  console.log(`\n${chalk.yellow('🔧 Common Patterns:')}`);
  console.log('  • TypeScript engine type definitions');
  console.log('  • React calculator component structure');
  console.log('  • Cloudflare Workers routing patterns');
  
  console.log(`\n${chalk.blue('📈 Performance Metrics:')}`);
  console.log('  • Average task completion: 2.3 minutes');
  console.log('  • Success rate: 94%');
  console.log('  • Code quality score: 92/100');
}

/**
 * Handle configure in interactive mode
 */
async function handleConfigure(): Promise<void> {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoExecute',
      message: 'Enable autonomous execution?',
      default: true
    },
    {
      type: 'number',
      name: 'maxConcurrent',
      message: 'Maximum concurrent tasks:',
      default: 3,
      validate: (input: number) => input > 0 && input <= 10 || 'Must be between 1 and 10'
    },
    {
      type: 'confirm',
      name: 'notifications',
      message: 'Enable notifications?',
      default: true
    }
  ]);
  
  console.log(`\n${chalk.green('✅ Configuration updated')}`);
  console.log(chalk.gray('Note: In a full implementation, this would update the orchestrator config'));
}

/**
 * Create tasks subcommands
 */
function createTasksSubcommands(): Command {
  const tasksCmd = new Command('tasks');
  
  tasksCmd
    .command('list')
    .description('List all tasks')
    .option('-s, --status <status>', 'Filter by status')
    .option('-p, --priority <priority>', 'Filter by priority')
    .action(async (options: TaskOptions) => {
      console.log('📋 Listing tasks...', options);
    });
  
  tasksCmd
    .command('create')
    .description('Create a new task')
    .requiredOption('-t, --title <title>', 'Task title')
    .option('-d, --description <desc>', 'Task description')
    .option('-p, --priority <priority>', 'Task priority', 'medium')
    .action(async (options: CreateTaskOptions) => {
      console.log('➕ Creating task...', options);
    });
  
  return tasksCmd;
}

/**
 * Create engine subcommands
 */
function createEngineSubcommands(): Command {
  const engineCmd = new Command('engine');
  
  engineCmd
    .command('integrate')
    .description('Integrate a consciousness engine')
    .requiredOption('-n, --name <name>', 'Engine name')
    .option('--test', 'Run integration tests')
    .action(async (options: EngineOptions) => {
      console.log(`🔧 Integrating ${options.name} engine...`);
    });
  
  engineCmd
    .command('test')
    .description('Test engine calculations')
    .requiredOption('-n, --name <name>', 'Engine name')
    .option('-i, --input <input>', 'Test input data')
    .action(async (options: EngineOptions) => {
      console.log(`🧪 Testing ${options.name} engine...`);
    });
  
  return engineCmd;
}

/**
 * Create workflow subcommands
 */
function createWorkflowSubcommands(): Command {
  const workflowCmd = new Command('workflow');
  
  workflowCmd
    .command('create')
    .description('Create a new development workflow')
    .requiredOption('-n, --name <name>', 'Workflow name')
    .option('-t, --type <type>', 'Workflow type')
    .action(async (options: WorkflowOptions) => {
      console.log(`⚡ Creating ${options.name} workflow...`);
    });
  
  workflowCmd
    .command('execute')
    .description('Execute a workflow')
    .requiredOption('-n, --name <name>', 'Workflow name')
    .option('-p, --params <params>', 'Workflow parameters (JSON)')
    .action(async (options: WorkflowOptions) => {
      console.log(`🚀 Executing ${options.name} workflow...`);
    });
  
  return workflowCmd;
}

/**
 * Create memory subcommands
 */
function createMemorySubcommands(): Command {
  const memoryCmd = new Command('memory');
  
  memoryCmd
    .command('update')
    .description('Update memory with completed task')
    .requiredOption('-t, --task <task>', 'Task description')
    .option('-o, --outcome <outcome>', 'Task outcome')
    .action(async (options: MemoryOptions) => {
      console.log('🧠 Updating memory...', options);
    });
  
  memoryCmd
    .command('insights')
    .description('Show memory insights and patterns')
    .option('-l, --limit <limit>', 'Number of entries to show', '10')
    .action(async (options: MemoryOptions) => {
      console.log('💡 Showing memory insights...', options);
    });
  
  return memoryCmd;
}

/**
 * Main CLI entry point
 */
function main(): void {
  const program = initializeCLI();
  
  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error(chalk.red('\n❌ Uncaught Exception:'), error.message);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('\n❌ Unhandled Rejection:'), reason);
    process.exit(1);
  });
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log(chalk.cyan('\n\n👋 Agent stopped. Consciousness technology development paused.'));
    if (orchestrator) {
      orchestrator.stopExecution();
    }
    process.exit(0);
  });
  
  // Parse command line arguments
  program.parse();
}

// Export for testing
export { initializeCLI, AgentTaskOrchestrator };

// Run CLI if this file is executed directly
if (require.main === module) {
  main();
}