import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rule-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-1 flex flex-col overflow-hidden' },
  template: `
    <div class="flex-1 overflow-y-auto p-6 bg-surface-container-low max-h-[calc(100vh-56px)] custom-scrollbar">
      <!-- Page Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">
              Rule Configuration
            </span>
            <span class="text-outline-variant font-bold text-xs">/</span>
            <span class="font-mono text-xs text-secondary px-2 py-0.5 bg-secondary-container bg-opacity-25 rounded">
              {{ technicalId }}
            </span>
          </div>
          <h2 class="font-serif text-lg font-bold text-on-background leading-snug">{{ ruleName }}</h2>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 border border-outline-variant text-on-surface-variant font-bold text-xs rounded hover:bg-surface-container-highest transition-all cursor-pointer">
            Save Draft
          </button>
          <button class="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:bg-primary-hover transition-all cursor-pointer shadow-sm">
            Save Configuration
          </button>
        </div>
      </div>

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <!-- Left Column: Identity, Description & Attached Tasks -->
        <div class="xl:col-span-2 space-y-6">
          <!-- Identity & Ownership card -->
          <section class="bg-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <h3 class="text-sm font-bold text-on-background mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span class="w-2.5 h-2.5 bg-primary rounded-full inline-block"></span>
              <span>Identity &amp; Ownership</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Rule Name
                </label>
                <input
                  type="text"
                  [(ngModel)]="ruleName"
                  class="w-full h-8 px-3 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Technical ID
                </label>
                <input
                  type="text"
                  [value]="technicalId"
                  disabled
                  class="w-full h-8 px-3 text-xs font-mono border border-outline-variant rounded bg-surface-container-low text-on-surface-variant outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Team Ownership
                </label>
                <select
                  [(ngModel)]="teamOwnership"
                  class="w-full h-8 px-2 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer"
                >
                  <option>Risk Management</option>
                  <option>Fraud Ops</option>
                  <option>Compliance</option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  [(ngModel)]="description"
                  rows="3"
                  class="w-full p-3 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </section>

          <!-- Attached Tasks card -->
          <section class="bg-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <div class="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
              <h3 class="text-sm font-bold text-on-background flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-secondary rounded-full inline-block"></span>
                <span>Attached Tasks</span>
              </h3>
              <button class="flex items-center gap-1 text-secondary font-bold text-xs hover:text-secondary-hover cursor-pointer bg-transparent border-none">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
                </svg>
                <span>Add Task</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Task 1 -->
              <div class="border border-outline-variant rounded p-4 bg-surface-container-lowest hover:border-secondary transition-all group cursor-pointer">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-red-600"></div>
                    <span class="text-xs font-bold text-on-background">Manual Compliance Review</span>
                  </div>
                  <svg class="w-3.5 h-3.5 text-on-surface-variant group-hover:text-secondary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  </svg>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-relaxed">
                  Route flagged transaction to Level 2 Compliance Queue.
                </p>
              </div>

              <!-- Task 2 -->
              <div class="border border-outline-variant rounded p-4 bg-surface-container-lowest hover:border-secondary transition-all group cursor-pointer">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span class="text-xs font-bold text-on-background">Slack Alert: Risk Ops</span>
                  </div>
                  <svg class="w-3.5 h-3.5 text-on-surface-variant group-hover:text-secondary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  </svg>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-relaxed">
                  Post immediate notification to #alert-risk-ops channel.
                </p>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column: Sidebar Options (Lifecycle, Behaviors, tags) -->
        <div class="space-y-6">
          <!-- Lifecycle Status card -->
          <section class="bg-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <h3 class="text-sm font-bold text-on-background mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span class="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
              <span>Lifecycle Status</span>
            </h3>

            <div class="flex flex-col gap-3 mt-4">
              <label
                *ngFor="let status of statuses"
                (click)="lifecycleStatus = status"
                [ngClass]="getLifecycleClass(status)"
                class="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-surface-container transition-all"
              >
                <input
                  type="radio"
                  name="lifecycle"
                  [checked]="lifecycleStatus === status"
                  (change)="lifecycleStatus = status"
                  class="text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                />
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-on-background flex items-center gap-1.5">
                    {{ status }}
                    <span *ngIf="status === 'Active'" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </span>
                  <span class="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    {{ status === 'Draft' ? 'Not evaluating traffic.' : status === 'Active' ? 'Live in production environment.' : 'Temporarily disabled.' }}
                  </span>
                </div>
              </label>
            </div>
          </section>

          <!-- Execution Behaviors card -->
          <section class="bg-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <h3 class="text-sm font-bold text-on-background mb-4 flex items-center gap-2 border-b border-outline-variant pb-2">
              <span class="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block"></span>
              <span>Execution Behaviors</span>
            </h3>

            <div class="space-y-4 mt-4 text-xs font-medium">
              <!-- Derive Facts Toggle -->
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="font-bold text-on-background text-xs">Derive Facts</span>
                  <span class="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    Generate secondary data points.
                  </span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="deriveFacts"
                    class="sr-only peer"
                  />
                  <div class="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <!-- Send Back Data Toggle -->
              <div class="flex items-center justify-between border-t border-outline-variant pt-4">
                <div class="flex flex-col">
                  <span class="font-bold text-on-background text-xs">Send Back Data</span>
                  <span class="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    Return enriched payload to caller.
                  </span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="sendBackData"
                    class="sr-only peer"
                  />
                  <div class="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <!-- Cache TTL -->
              <div class="border-t border-outline-variant pt-4">
                <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Cache TTL (ms)
                </label>
                <input
                  type="number"
                  [(ngModel)]="cacheTtl"
                  class="w-full h-8 px-2 border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-right font-mono"
                />
              </div>
            </div>
          </section>

          <!-- Resource Tags card -->
          <section class="bg-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <div class="flex justify-between items-center border-b border-outline-variant pb-2 mb-4">
              <h3 class="text-sm font-bold text-on-background flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-purple-600 rounded-full inline-block"></span>
                <span>Resource Tags</span>
              </h3>
              <button
                (click)="handleAddTag()"
                class="text-secondary hover:text-secondary-hover cursor-pointer p-0.5 rounded hover:bg-surface-container bg-transparent border-none"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
                </svg>
              </button>
            </div>

            <div class="space-y-2">
              <div
                *ngFor="let tag of tags; let idx = index"
                class="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded border border-outline-variant border-opacity-50 text-xs font-mono"
              >
                <input
                  type="text"
                  [ngModel]="tag.key"
                  (ngModelChange)="handleUpdateTag(idx, 'key', $event)"
                  class="w-[45%] h-7 px-1.5 text-[11px] border border-outline-variant rounded bg-white text-on-background outline-none font-semibold text-center"
                />
                <span class="text-outline-variant">:</span>
                <input
                  type="text"
                  [ngModel]="tag.value"
                  (ngModelChange)="handleUpdateTag(idx, 'value', $event)"
                  class="w-[45%] h-7 px-1.5 text-[11px] border border-outline-variant rounded bg-white text-on-background outline-none text-center"
                />
                <button
                  (click)="handleRemoveTag(idx)"
                  class="text-on-surface-variant hover:text-red-600 p-0.5 rounded cursor-pointer bg-transparent border-none"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <!-- Metadata Display Footer -->
          <div class="bg-white border border-outline-variant rounded-lg p-4 shadow-sm text-xs space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase text-on-surface-variant">Version</span>
              <span class="font-mono text-[10px] bg-surface-container px-1 py-0.5 rounded border border-outline-variant text-primary font-bold">
                v2.1.4-draft
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase text-on-surface-variant">Created By</span>
              <span class="font-semibold text-on-surface">sys_admin</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold uppercase text-on-surface-variant">Last Mod</span>
              <span class="font-mono text-[11px] text-on-surface">2026-06-27 14:32</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RuleConfigComponent {
  ruleName: string = 'High-Value Transaction Flagging';
  technicalId: string = 'RULE-8472-B';
  description: string = 'Flags incoming domestic transactions exceeding $50,000 for manual compliance review before clearing.';
  teamOwnership: string = 'Risk Management';
  lifecycleStatus: string = 'Draft';

  deriveFacts: boolean = true;
  sendBackData: boolean = false;
  cacheTtl: number = 3600;

  statuses: ('Draft' | 'Active' | 'Paused')[] = ['Draft', 'Active', 'Paused'];

  connectors: Record<string, boolean> = {
    'CRM Pipeline': true,
    'Transactional Log': true,
    'User Profile DB': false,
    'Geo-IP Service': false,
  };

  tags: { key: string; value: string }[] = [
    { key: 'Environment', value: 'Production' },
    { key: 'Department', value: 'Risk Mgt' },
  ];

  handleToggleConnector(name: string) {
    this.connectors = {
      ...this.connectors,
      [name]: !this.connectors[name]
    };
  }

  handleAddTag() {
    this.tags = [...this.tags, { key: 'NewKey', value: 'NewValue' }];
  }

  handleRemoveTag(idx: number) {
    this.tags = this.tags.filter((_, i) => i !== idx);
  }

  handleUpdateTag(idx: number, field: 'key' | 'value', val: string) {
    this.tags = this.tags.map((tag, i) => {
      if (i === idx) {
        return { ...tag, [field]: val };
      }
      return tag;
    });
  }

  getLifecycleClass(status: 'Draft' | 'Active' | 'Paused'): string {
    const isSelected = this.lifecycleStatus === status;
    if (!isSelected) return 'border-outline-variant';
    if (status === 'Active') {
      return 'border-emerald-50 bg-emerald-50/20 border-l-4 border-l-emerald-500 border-emerald-500';
    }
    return 'border-secondary bg-surface-container-low';
  }
}
