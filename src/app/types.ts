export interface DecisionRule {
  id: string;
  ruleId: string;
  userType: string;
  spendMin: number;
  regions: string[];
  conditionFx: string;
  thenAction: 'Block' | 'Review' | 'Approve';
  thenRiskScore: number;
  thenReturnRecord: boolean;
  isActive: boolean;
}

export interface SchemaField {
  name: string;
  type: 'str' | 'num' | 'int' | 'bool';
  entity: string;
  description: string;
  datasource?: string;
  businessKey?: string;
}

export interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  mccList?: string[];
}

export interface RuleGroup {
  id: string;
  type: 'AND' | 'OR';
  conditions: (RuleCondition | RuleGroup)[];
}

export interface CanvasNode {
  id: string;
  type: 'Start' | 'DataLookup' | 'Decision' | 'Route';
  name: string;
  description: string;
  x: number;
  y: number;
  inputs?: { key: string; value: string }[];
  failSafe?: boolean;
  logic?: string;
  action?: string;
  decisionLogic?: any;
  inputSchema?: string;
  outputSchema?: string;
  selectionLogic?: string;
  exitFlow?: boolean;
  exitValue?: string;
  transformFunction?: string;
  transformArguments?: string;
  transformTargetVariable?: string;
  evaluationContext?: 'chained' | 'source';
}

export interface CanvasConnection {
  fromNodeId: string;
  toNodeId: string;
  fromPort?: string;
  toPort?: string;
}

export interface ExecutionTraceLog {
  id: string;
  timestamp: string;
  executionId: string;
  ruleName: string;
  action: string;
  latency: number;
  status: 'Success' | 'Error' | 'Warning';
  rawInput: Record<string, any>;
  rawOutput: Record<string, any>;
  steps: {
    name: string;
    duration: string;
    status: 'success' | 'error' | 'warning';
    details: string;
  }[];
}
