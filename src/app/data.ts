import { DecisionRule, SchemaField, CanvasNode, CanvasConnection, ExecutionTraceLog } from './types';

export const INITIAL_DECISION_RULES: DecisionRule[] = [
  {
    id: '1',
    ruleId: 'R-001',
    userType: 'New User',
    spendMin: 5000,
    regions: ['NA', 'EU'],
    conditionFx: 'vel(24h) > 5',
    thenAction: 'Block',
    thenRiskScore: 95,
    thenReturnRecord: true,
    isActive: true,
  },
  {
    id: '2',
    ruleId: 'R-002',
    userType: 'Existing',
    spendMin: 10000,
    regions: ['*Any*'],
    conditionFx: '*Any*',
    thenAction: 'Review',
    thenRiskScore: 75,
    thenReturnRecord: false,
    isActive: true,
  },
  {
    id: '3',
    ruleId: 'R-003',
    userType: 'VIP',
    spendMin: 50000,
    regions: ['*Any*'],
    conditionFx: 'avgSpend(30d) < 5k',
    thenAction: 'Approve',
    thenRiskScore: 10,
    thenReturnRecord: true,
    isActive: true,
  },
];

export const SCHEMA_FIELDS: SchemaField[] = [
  { name: 'user_id', type: 'str', entity: 'User Context', description: 'Unique identifier of the transacting user.' },
  { name: 'risk_score', type: 'num', entity: 'User Context', description: 'Calculated baseline user security risk score.' },
  { name: 'account_age_days', type: 'int', entity: 'User Context', description: 'Days passed since account activation.' },
  { name: 'amount_usd', type: 'num', entity: 'Transaction', description: 'The current transaction volume in US Dollars.' },
  { name: 'merchant_mcc', type: 'str', entity: 'Transaction', description: 'Merchant Category Code (MCC) representing the purchase sector.' },
  { name: 'device_velocity_1h', type: 'int', entity: 'Transaction', description: 'Number of discrete payments on this device within the hour.' },
  { name: 'geo_match', type: 'bool', entity: 'User Context', description: 'Whether the current location matches known user hotspots.' },
];

export const INITIAL_CANVAS_NODES: CanvasNode[] = [
  {
    id: 'tx-node-1',
    type: 'Start',
    name: 'Receive transactionList',
    description: 'Trigger: Inbound transaction collection event',
    x: 60,
    y: 240,
    inputSchema: 'transactionList: Transaction[]',
    outputSchema: 'transactionList: Transaction[]'
  },
  {
    id: 'tx-node-2',
    type: 'Decision',
    name: 'Validate transactionList is not empty',
    description: 'IF transactionList.length > 0',
    x: 320,
    y: 240,
    inputSchema: 'transactionList: Transaction[]',
    outputSchema: 'transactionList: Transaction[]',
    decisionLogic: {
      operator: 'AND',
      terms: [
        {
          id: 'term-validate',
          operator: 'AND',
          conditions: [
            { id: 'cond-v1', field: 'session.transactionList_length', op: '>', value: '0' }
          ]
        }
      ]
    } as any
  },
  {
    id: 'tx-node-3',
    type: 'DataLookup',
    name: 'Add original_sequence_number',
    description: 'Attach index key tracking to each transaction',
    x: 600,
    y: 240,
    inputSchema: 'transactionList: Transaction[]',
    outputSchema: 'transactionList: (Transaction & {original_sequence_number: number})[]',
    inputs: [
      { key: 'Sequence Index key', value: 'auto_increment' }
    ]
  },
  {
    id: 'tx-node-4',
    type: 'DataLookup',
    name: 'Derive selection_priority',
    description: 'Map: In Progress -> 1, Under Review -> 2, Others -> 3',
    x: 880,
    y: 240,
    inputSchema: 'transactionList: (Transaction & {original_sequence_number: number})[]',
    outputSchema: 'transactionList: (Transaction & {original_sequence_number: number, selection_priority: number})[]',
    transformFunction: 'in_array',
    transformArguments: 'state, ["In Progress", "Under Review"]',
    transformTargetVariable: 'is_high_priority_state',
    evaluationContext: 'chained',
    inputs: [
      { key: '1 (High Priority)', value: 'state == "In Progress"' },
      { key: '2 (Medium Priority)', value: 'state == "Under Review"' },
      { key: '3 (Low Priority)', value: 'state == "Others"' }
    ]
  },
  {
    id: 'tx-node-5',
    type: 'DataLookup',
    name: 'Group by selection_priority',
    description: 'Partition list into priority categories',
    x: 1160,
    y: 240,
    inputSchema: 'transactionList: (Transaction & {original_sequence_number: number, selection_priority: number})[]',
    outputSchema: 'grouped: Record<number, Transaction[]>',
    evaluationContext: 'chained'
  },
  {
    id: 'tx-node-6',
    type: 'DataLookup',
    name: 'Determine min priority',
    description: 'selectedPriority = minimum(selection_priority)',
    x: 1440,
    y: 240,
    inputSchema: 'grouped: Record<number, Transaction[]>',
    outputSchema: 'selectedPriority: number',
    transformFunction: 'min',
    transformArguments: 'grouped_list, selection_priority',
    transformTargetVariable: 'selectedPriority',
    selectionLogic: 'minimum(selection_priority)',
    evaluationContext: 'chained'
  },
  {
    id: 'tx-node-7',
    type: 'DataLookup',
    name: 'Filter candidateTransactions',
    description: 'Keep transactions matching selectedPriority',
    x: 1720,
    y: 240,
    inputSchema: 'selectedPriority: number, grouped: Record<number, Transaction[]>',
    outputSchema: 'candidateTransactions: Transaction[]',
    selectionLogic: 'transactions where selection_priority == selectedPriority',
    evaluationContext: 'chained'
  },
  {
    id: 'tx-node-8',
    type: 'Decision',
    name: 'Check selectedPriority value',
    description: 'IF selectedPriority in [1, 2]',
    x: 2000,
    y: 240,
    inputSchema: 'selectedPriority: number, candidateTransactions: Transaction[]',
    outputSchema: 'candidateTransactions: Transaction[]',
    evaluationContext: 'source',
    decisionLogic: {
      operator: 'AND',
      terms: [
        {
          id: 'term-prio',
          operator: 'OR',
          conditions: [
            { id: 'cond-p1', field: 'session.selectedPriority', op: '==', value: '1' },
            { id: 'cond-p2', field: 'session.selectedPriority', op: '==', value: '2' }
          ]
        }
      ]
    } as any
  },
  {
    id: 'tx-node-9',
    type: 'DataLookup',
    name: 'Tie breaker logic',
    description: 'Sort desc by modified_date, created_at and asc by sequence_number',
    x: 2280,
    y: 380,
    inputSchema: 'candidateTransactions: Transaction[]',
    outputSchema: 'selectedTransaction: Transaction',
    selectionLogic: 'sort desc by activity_last_modified_date, transaction_created_date and asc by original_sequence_number',
    exitFlow: true,
    exitValue: 'selectedTransaction',
    inputs: [
      { key: 'Criterion 1', value: 'activity_last_modified_date desc' },
      { key: 'Criterion 2', value: 'transaction_created_date desc' },
      { key: 'Criterion 3', value: 'original_sequence_number asc' }
    ]
  },
  {
    id: 'tx-node-10',
    type: 'Route',
    name: 'Send selectedTransaction for enrichment',
    description: 'Forward selected candidate record to enrichment pipe',
    x: 2560,
    y: 240,
    inputSchema: 'selectedTransaction: Transaction',
    outputSchema: 'enrichedTransaction: Transaction',
    exitFlow: true,
    exitValue: 'enrichedTransaction'
  },
  {
    id: 'tx-node-11',
    type: 'Route',
    name: 'Return selection reason',
    description: 'Output audit details log for reference tracking',
    x: 2840,
    y: 240,
    inputSchema: 'enrichedTransaction: Transaction',
    outputSchema: 'selectionReason: string',
    exitFlow: true,
    exitValue: '{ enrichedTransaction, reason: "Priority selection successfully enriched" }'
  }
];

export const INITIAL_CANVAS_CONNECTIONS: CanvasConnection[] = [
  { fromNodeId: 'tx-node-1', toNodeId: 'tx-node-2', label: '' } as any,
  { fromNodeId: 'tx-node-2', toNodeId: 'tx-node-3', label: 'YES' } as any,
  { fromNodeId: 'tx-node-3', toNodeId: 'tx-node-4', label: '' } as any,
  { fromNodeId: 'tx-node-4', toNodeId: 'tx-node-5', label: '' } as any,
  { fromNodeId: 'tx-node-5', toNodeId: 'tx-node-6', label: '' } as any,
  { fromNodeId: 'tx-node-6', toNodeId: 'tx-node-7', label: '' } as any,
  { fromNodeId: 'tx-node-7', toNodeId: 'tx-node-8', label: '' } as any,
  { fromNodeId: 'tx-node-8', toNodeId: 'tx-node-10', label: 'YES (prio 1/2)' } as any,
  { fromNodeId: 'tx-node-8', toNodeId: 'tx-node-9', label: 'NO (prio 3)' } as any,
  { fromNodeId: 'tx-node-9', toNodeId: 'tx-node-10', label: '' } as any,
  { fromNodeId: 'tx-node-10', toNodeId: 'tx-node-11', label: '' } as any,
];

export const EXECUTION_LOGS: ExecutionTraceLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-27 14:32:01.452',
    executionId: 'exec_9a8b7c6d',
    ruleName: 'Risk_Assessment_v2',
    action: '-',
    latency: 1240,
    status: 'Error',
    rawInput: {
      user_id: 'usr_99281a',
      transaction_amount: 4500.0,
      currency: 'USD',
      merchant_category_code: '5942',
      ip_address: '192.168.1.104',
    },
    rawOutput: {
      status: 'FAILED',
      error_code: 'ERR_ENRICHMENT_TIMEOUT',
      message: "Required dependency 'GeoIP' failed to respond within threshold (1000ms)",
    },
    steps: [
      {
        name: 'Input Validation',
        duration: '12ms',
        status: 'success',
        details: "Schema 'TransactionRequest' passed",
      },
      {
        name: 'API Enrichment (GeoIP)',
        duration: '1228ms',
        status: 'error',
        details: 'Timeout connection to ext_geoip_service (exceeded threshold of 1000ms)',
      },
    ],
  },
  {
    id: 'log-2',
    timestamp: '2026-06-27 14:31:55.102',
    executionId: 'exec_9a8b7c6c',
    ruleName: 'Fraud_Velocity_Check',
    action: 'Approve',
    latency: 45,
    status: 'Success',
    rawInput: {
      user_id: 'usr_abc772',
      transaction_amount: 120.5,
      currency: 'USD',
      merchant_category_code: '5411',
      device_velocity_1h: 1,
    },
    rawOutput: {
      status: 'APPROVED',
      reasons: ['Velocity index falls below threshold', 'Known trusted IP subnet'],
    },
    steps: [
      {
        name: 'Velocity Extraction',
        duration: '15ms',
        status: 'success',
        details: 'Parsed redis velocity key velocity:usr_abc772 = 1',
      },
      {
        name: 'Rules Evaluation',
        duration: '30ms',
        status: 'success',
        details: 'Evaluated Fraud_Velocity_Check -> Approved',
      },
    ],
  },
  {
    id: 'log-3',
    timestamp: '2026-06-27 14:31:42.881',
    executionId: 'exec_9a8b7c6b',
    ruleName: 'KYC_Status_Eval',
    action: 'Manual Review',
    latency: 210,
    status: 'Warning',
    rawInput: {
      user_id: 'usr_inactive_99',
      kyc_document: 'driving_license',
      country_code: 'US',
    },
    rawOutput: {
      status: 'WARNING',
      reasons: ['KYC document near expiry', 'Secondary address mismatch'],
    },
    steps: [
      {
        name: 'Document Analysis',
        duration: '180ms',
        status: 'warning',
        details: 'Expiry date is within 15 days',
      },
      {
        name: 'Route to Desk',
        duration: '30ms',
        status: 'success',
        details: 'Successfully flagged transaction for Tier 2 support queue',
      },
    ],
  },
  {
    id: 'log-4',
    timestamp: '2026-06-27 14:30:15.220',
    executionId: 'exec_9a8b7c6a',
    ruleName: 'Risk_Assessment_v2',
    action: 'Decline',
    latency: 115,
    status: 'Success',
    rawInput: {
      user_id: 'usr_flagged_22',
      transaction_amount: 15000.0,
      currency: 'USD',
    },
    rawOutput: {
      status: 'DECLINED',
      reasons: ['Transaction exceeds maximum limit for non-verified users'],
    },
    steps: [
      {
        name: 'Database Fetch',
        duration: '45ms',
        status: 'success',
        details: 'Fetched user security profile: tier = Basic',
      },
      {
        name: 'Limit Enforcement',
        duration: '70ms',
        status: 'success',
        details: 'Limit is 10k, transaction amount is 15k -> Decline',
      },
    ],
  },
];
