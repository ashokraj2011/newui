import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExecutionTraceLog } from '../../types';

@Component({
  selector: 'app-history-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-1 flex flex-col overflow-hidden' },
  template: `
    <div class="flex-1 overflow-y-auto p-6 bg-background flex flex-col gap-6 max-h-[calc(100vh-56px)] custom-scrollbar">
      <!-- Header & Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-5 rounded-lg border border-outline-variant shadow-sm">
        <div>
          <h2 class="font-serif text-lg font-bold text-on-surface">Execution Logs</h2>
          <p class="text-xs text-on-surface-variant leading-relaxed">
            Debug and trace rule execution history
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Calendar Select -->
          <div class="flex items-center border border-outline-variant rounded bg-surface-container-lowest h-8 px-2 space-x-2 text-xs">
            <svg class="w-3.5 h-3.5 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <select
              [(ngModel)]="timeFilter"
              class="bg-transparent border-none focus:ring-0 p-0 pr-6 text-on-surface font-semibold cursor-pointer text-xs outline-none"
            >
              <option>Last 15 minutes</option>
              <option>Last 1 hour</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="flex items-center border border-outline-variant rounded bg-surface-container-lowest h-8 px-2 space-x-2 text-xs">
            <svg class="w-3.5 h-3.5 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <select
              [(ngModel)]="statusFilter"
              class="bg-transparent border-none focus:ring-0 p-0 pr-6 text-on-surface font-semibold cursor-pointer text-xs outline-none"
            >
              <option>All Statuses</option>
              <option>Success</option>
              <option>Error</option>
              <option>Warning</option>
            </select>
          </div>

          <!-- Refresh Button -->
          <button class="h-8 px-3 border border-outline-variant rounded hover:bg-surface-container transition-all flex items-center space-x-1.5 text-on-surface text-xs font-semibold cursor-pointer">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M16 3h5v5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 21H3v-5"/>
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Dense Execution Logs Table -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex-1 flex flex-col relative shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead class="bg-surface-container sticky top-0 z-10 border-b border-outline-variant font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th class="p-3">Timestamp</th>
                <th class="p-3">Execution ID</th>
                <th class="p-3">Rule Name</th>
                <th class="p-3">Result (Action)</th>
                <th class="p-3 text-right">Latency</th>
                <th class="p-3">Status</th>
                <th class="p-3 w-10"></th>
              </tr>
            </thead>

            <tbody class="font-mono text-xs text-on-surface divide-y divide-outline-variant">
              <ng-container *ngFor="let log of getFilteredLogs()">
                <!-- Main Log Row -->
                <tr
                  (click)="toggleRow(log.id)"
                  [ngClass]="{
                    'bg-surface-container-low': log.id === expandedLogId,
                    'bg-white': log.id !== expandedLogId
                  }"
                  class="hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <td class="p-3 text-on-surface-variant font-sans whitespace-nowrap">
                    {{ log.timestamp }}
                  </td>
                  <td class="p-3 text-secondary font-bold">
                    {{ log.executionId }}
                  </td>
                  <td class="p-3 font-sans font-bold text-on-surface">
                    {{ log.ruleName }}
                  </td>
                  <td class="p-3 font-sans">{{ log.action }}</td>
                  <td class="p-3 text-right text-on-surface-variant whitespace-nowrap">
                    {{ log.latency }}ms
                  </td>
                  <td class="p-3">
                    <span
                      *ngIf="log.status === 'Error'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200"
                    >
                      <svg class="w-3 h-3 mr-1 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/>
                      </svg>
                      <span>Error</span>
                    </span>
                    <span
                      *ngIf="log.status === 'Warning'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                    >
                      <svg class="w-3 h-3 mr-1 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/>
                      </svg>
                      <span>Warning</span>
                    </span>
                    <span
                      *ngIf="log.status === 'Success'"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
                    >
                      <svg class="w-3 h-3 mr-1 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                      </svg>
                      <span>Success</span>
                    </span>
                  </td>
                  <td class="p-3 text-right">
                    <svg
                      *ngIf="log.id === expandedLogId; else rightChevron"
                      class="w-4 h-4 text-on-surface-variant inline"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                    <ng-template #rightChevron>
                      <svg
                        class="w-4 h-4 text-on-surface-variant inline"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </ng-template>
                  </td>
                </tr>

                <!-- Expandable Trace Details -->
                <tr *ngIf="log.id === expandedLogId" class="bg-surface-container-lowest border-b-2 border-outline-variant">
                  <td class="p-0" colspan="7">
                    <div
                      [ngClass]="{
                        'border-red-600': log.status === 'Error',
                        'border-amber-500': log.status === 'Warning',
                        'border-emerald-600': log.status === 'Success'
                      }"
                      class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 border-l-4"
                    >
                      <!-- Left Column: Execution Trace timeline -->
                      <div>
                        <h4 class="font-label-caps text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant mb-4">
                          Execution Trace
                        </h4>

                        <div class="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-outline-variant pl-1">
                          <div *ngFor="let step of log.steps" class="relative flex items-start space-x-3">
                            <!-- Connected timeline circle -->
                            <div class="w-6 h-6 rounded-full bg-surface-container border-2 border-outline flex items-center justify-center z-10 mt-0.5">
                              <div
                                [ngClass]="{
                                  'bg-emerald-500': step.status === 'success',
                                  'bg-red-500': step.status === 'error',
                                  'bg-amber-500': step.status === 'warning'
                                }"
                                class="w-2 h-2 rounded-full"
                              ></div>
                            </div>

                            <div
                              [ngClass]="{
                                'bg-red-50/20 border-red-300 text-red-900': step.status === 'error',
                                'bg-amber-50/20 border-amber-300 text-amber-900': step.status === 'warning',
                                'bg-surface border-outline-variant text-on-surface': step.status !== 'error' && step.status !== 'warning'
                              }"
                              class="flex-1 rounded border p-3 shadow-inner"
                            >
                              <div class="flex justify-between items-center mb-1 font-sans">
                                <span class="text-xs font-bold">{{ step.name }}</span>
                                <span class="text-[10px] text-on-surface-variant opacity-85 font-semibold">
                                  {{ step.duration }}
                                </span>
                              </div>
                              <div class="text-[11px] text-on-surface-variant leading-relaxed">
                                {{ step.details }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Right Column: Raw JSON payloads -->
                      <div class="flex flex-col space-y-4 font-mono">
                        <div>
                          <h4 class="font-label-caps text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant mb-2">
                            Raw Input Context
                          </h4>
                          <div class="bg-primary-container text-white rounded-lg p-3 overflow-x-auto border border-outline-variant shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
                            <pre class="text-[10px] leading-relaxed text-emerald-300">{{ getFormattedJson(log.rawInput) }}</pre>
                          </div>
                        </div>

                        <div>
                          <h4 class="font-label-caps text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant mb-2">
                            {{ log.status === 'Error' ? 'Error Output' : 'Output Payload' }}
                          </h4>
                          <div
                            [ngClass]="{
                              'bg-red-50/10 border-red-300 text-red-600': log.status === 'Error',
                              'bg-surface border-outline-variant text-on-surface': log.status !== 'Error'
                            }"
                            class="rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto custom-scrollbar border"
                          >
                            <pre class="text-[10px] leading-relaxed">{{ getFormattedJson(log.rawOutput) }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="bg-surface-container border-t border-outline-variant p-3 flex items-center justify-between text-xs font-sans">
          <span class="text-on-surface-variant font-medium">
            Showing 1 to {{ getFilteredLogs().length }} of 10,234 entries
          </span>
          <div class="flex items-center space-x-2 font-mono">
            <button class="p-1 rounded hover:bg-surface-container-highest disabled:opacity-40 text-on-surface-variant cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <span class="px-2 text-on-surface font-bold">1</span>
            <button class="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryLogsComponent {
  @Input() logs: ExecutionTraceLog[] = [];

  expandedLogId: string | null = 'log-1'; // Preset log-1 as expanded
  statusFilter: string = 'All Statuses';
  timeFilter: string = 'Last 15 minutes';

  toggleRow(id: string) {
    if (this.expandedLogId === id) {
      this.expandedLogId = null;
    } else {
      this.expandedLogId = id;
    }
  }

  getFilteredLogs(): ExecutionTraceLog[] {
    return this.logs.filter(log => {
      if (this.statusFilter === 'All Statuses') return true;
      return log.status === this.statusFilter;
    });
  }

  getFormattedJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
}
