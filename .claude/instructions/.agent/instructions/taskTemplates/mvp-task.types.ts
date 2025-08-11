import { MVPTask, TestSpec } from './ai-task.types';

export interface EnhancedMVPTask extends MVPTask {
  context?: string;
  constraints?: string[];
  
  testSpecs?: {
    unit: TestSpec[];
    integration: TestSpec[];
  };
  
  implementationSteps?: string[];
  
  validationCommands?: {
    lint: string;
    typecheck: string;
    test: string;
    build: string;
  };
  
  checkpoints?: {
    name: string;
    completed: boolean;
    timestamp?: number;
  }[];
}