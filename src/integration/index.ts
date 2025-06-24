/**
 * WitnessOS Integration Layer
 * 
 * Complete integration system for multi-engine orchestration,
 * result synthesis, and workflow management.
 */

export { EngineOrchestrator, type EngineConfig, type ComprehensiveReading, type WorkflowResult } from './orchestrator';
export { ResultSynthesizer, type SynthesisResult, type NumericalCorrelation, type ArchetypalCorrelation } from './synthesizer';
export { WorkflowManager, type WorkflowDefinition, type WorkflowOptions, type WorkflowResult as WorkflowExecutionResult } from './workflows';

// Main integration exports
export { orchestrator } from './orchestrator';
export { synthesizer } from './synthesizer';
export { workflowManager } from './workflows';

/**
 * Convenience function for running complete consciousness analysis
 */
export async function runCompleteAnalysis(birthData: Record<string, any>) {
  const { orchestrator, synthesizer } = await import('./orchestrator');
  const { default: orchestratorInstance } = await import('./orchestrator');
  const { default: synthesizerInstance } = await import('./synthesizer');
  
  // Run comprehensive reading
  const reading = await orchestratorInstance.createComprehensiveReading(birthData);
  
  // Synthesize results
  const synthesis = synthesizerInstance.synthesizeReading(reading.results);
  
  return {
    ...reading,
    synthesis
  };
}

/**
 * Convenience function for running workflow analysis
 */
export async function runWorkflow(
  workflowName: string,
  inputData: Record<string, any>,
  options?: any
) {
  const { default: workflowManagerInstance } = await import('./workflows');
  
  return workflowManagerInstance.runWorkflow(workflowName, inputData, options);
}
