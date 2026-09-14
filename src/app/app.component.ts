import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopNavBarComponent } from './components/top-nav-bar/top-nav-bar.component';
import { DataSchemaComponent } from './components/data-schema/data-schema.component';
import { DecisionTableComponent } from './components/decision-table/decision-table.component';
import { RuleSetsComponent } from './components/rule-sets/rule-sets.component';
import { RuleCanvasComponent } from './components/rule-canvas/rule-canvas.component';
import { RuleConfigComponent } from './components/rule-config/rule-config.component';
import { FunctionsComponent } from './components/functions/functions.component';
import { HistoryLogsComponent } from './components/history-logs/history-logs.component';
import { ShellComponent } from './components/validator/shell/shell.component';
import { RuleStoreService } from './services/rule-store.service';
import { RuleEngineService } from './services/rule-engine.service';

import {
  INITIAL_DECISION_RULES,
  SCHEMA_FIELDS,
  INITIAL_CANVAS_NODES,
  INITIAL_CANVAS_CONNECTIONS,
  EXECUTION_LOGS,
} from './data';

import { DecisionRule, SchemaField, CanvasNode, CanvasConnection } from './types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopNavBarComponent,
    DataSchemaComponent,
    DecisionTableComponent,
    RuleSetsComponent,
    RuleCanvasComponent,
    RuleConfigComponent,
    FunctionsComponent,
    HistoryLogsComponent,
    ShellComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Rule Engine Console';

  // Navigation & view states
  activeTab: string = 'rulesets'; // Default to Rules tab
  activeNavGroup: 'Drafts' | 'Staging' | 'Production' = 'Drafts';
  rulesetsSubView: 'designer' | 'canvas' | 'config' = 'designer';
  activeRuleType: 'general' | 'decisionTable' = 'general';

  // Shared Data States
  rules: DecisionRule[] = INITIAL_DECISION_RULES;
  schemaFields: SchemaField[] = SCHEMA_FIELDS;
  canvasNodes: CanvasNode[] = INITIAL_CANVAS_NODES;
  canvasConnections: CanvasConnection[] = INITIAL_CANVAS_CONNECTIONS;
  executionLogs = EXECUTION_LOGS;

  searchQuery: string = '';

  // Alerts & Notifications Simulation
  notification: string | null = null;

  triggerNotification(message: string) {
    this.notification = message;
    setTimeout(() => {
      this.notification = null;
    }, 4000);
  }

  handlePublish() {
    this.triggerNotification(`Rules successfully compiled and published to ${this.activeNavGroup}!`);
  }

  readonly store = inject(RuleStoreService);
  readonly ruleEngine = inject(RuleEngineService);

  async ngOnInit() {
    try {
      const res = await fetch('http://localhost:65421/api/glossary');
      const list = await res.json();
      if (list && list.length > 0) {
        const fieldsFromDb: SchemaField[] = list.map((row: any) => ({
          name: row.name,
          type: row.type as any,
          entity: row.entity,
          description: row.description || '',
          datasource: row.datasource,
          businessKey: row.business_key || undefined
        }));
        this.schemaFields = fieldsFromDb;
        this.ruleEngine.syncGlossary(this.schemaFields);
      }
    } catch (err) {
      console.error('Failed to load glossary inside app component:', err);
    }
  }

  handleFieldsChange(updatedFields: SchemaField[]) {
    this.schemaFields = updatedFields;
    this.ruleEngine.syncGlossary(updatedFields);
  }

  handleNewRule() {
    this.activeTab = 'rulesets';
    this.activeRuleType = 'general';
    this.rulesetsSubView = 'designer';
    this.triggerNotification('Adding a new Fraud Detection rule template.');
  }

  // Determine header title based on active navigation
  getHeaderTitle(): string {
    switch (this.activeTab) {
      case 'schema':
        return 'Data Schema Explorer';
      case 'rulesets':
        if (this.activeRuleType === 'decisionTable') return 'Decision Table Editor';
        if (this.rulesetsSubView === 'designer') return 'Rule Designer';
        if (this.rulesetsSubView === 'canvas') return 'Rule Orchestrator';
        return 'Rule Configuration';
      case 'validator':
        const sub = this.store.activeTab();
        if (sub === 'overview') return 'Validator Studio — Dashboard';
        if (sub === 'test-data') return 'Validator Studio — Test Workbench';
        if (sub === 'generated') return 'Validator Studio — Generated Cases';
        if (sub === 'test-runs') return 'Validator Studio — Rule Evaluation';
        if (sub === 'coverage') return 'Validator Studio — Test Coverage';
        if (sub === 'validate') return 'Validator Studio — Pre-flight Lint';
        if (sub === 'library') return 'Validator Studio — Fixture Library';
        return 'Validator & Testing Studio';
      case 'functions':
        return 'Mathematical Functions';
      case 'history':
        return 'Execution History logs';
      default:
        return 'Rule Engine Console';
    }
  }

  handleActiveTabChange(tab: string) {
    this.activeTab = tab;
    // Auto-reset sub-view if selecting rules
    if (tab === 'rulesets') {
      this.activeRuleType = 'general';
      this.rulesetsSubView = 'designer';
    }
  }
}
