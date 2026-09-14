import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DecisionRule } from '../../types';

@Component({
  selector: 'app-decision-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-1 flex flex-col overflow-hidden' },
  template: `
    <div class="flex flex-col gap-4 p-6 bg-background overflow-y-auto max-h-[calc(100vh-56px)]">
      <!-- Table Toolbar -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-wrap items-center justify-between shadow-sm gap-4">
        <div class="flex items-center gap-4">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-extrabold uppercase text-on-surface-variant tracking-wider">Sort Limit:</span>
            <button
              (click)="toggleSort()"
              class="h-8 px-3 border border-outline-variant rounded hover:bg-surface-container transition-all flex items-center gap-1.5 text-xs text-on-surface font-semibold cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
              </svg>
              <span>{{ sortBy === 'spend_desc' ? 'Min Spend (High → Low)' : 'Min Spend (Low → High)' }}</span>
            </button>
          </div>

          <button class="h-8 px-3 border border-outline-variant rounded hover:bg-surface-container transition-all flex items-center gap-1.5 text-xs text-on-surface font-semibold cursor-pointer">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span>Filters (0)</span>
          </button>
        </div>

        <button
          (click)="handleAddRule()"
          class="h-8 px-4 bg-primary text-white hover:bg-primary-hover font-bold text-xs rounded shadow-sm transition-all flex items-center gap-1 cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          <span>Add Rule Row</span>
        </button>
      </div>

      <!-- High Density Spreadsheet Grid -->
      <div class="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead class="bg-surface-container sticky top-0 border-b border-outline-variant font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th class="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    [checked]="areAllSelected()"
                    (change)="handleSelectAll($any($event.target).checked)"
                    class="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th class="p-3 w-16">ID</th>
                <th class="p-3 w-40">User Type (Cond)</th>
                <th class="p-3 w-40">Min Spend (Cond)</th>
                <th class="p-3">Regions (Cond)</th>
                <th class="p-3">Condition Formula</th>
                <th class="p-3 w-36">Then: Action</th>
                <th class="p-3 w-28 text-right">Risk Score</th>
                <th class="p-3 w-24 text-center">Return Record</th>
                <th class="p-3 w-20 text-center">Active</th>
                <th class="p-3 w-12"></th>
              </tr>
            </thead>

            <tbody class="font-mono text-xs text-on-surface divide-y divide-outline-variant">
              <tr
                *ngFor="let rule of getSortedRules()"
                [ngClass]="{
                  'bg-surface-container-low/40': selectedIds.includes(rule.id),
                  'opacity-60 bg-surface-container-low/20': !rule.isActive
                }"
                class="hover:bg-surface-container-low/30 transition-all"
              >
                <!-- Row Selector -->
                <td class="p-3 text-center">
                  <input
                    type="checkbox"
                    [checked]="selectedIds.includes(rule.id)"
                    (change)="handleSelectRow(rule.id, $any($event.target).checked)"
                    class="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                  />
                </td>

                <!-- Rule ID -->
                <td class="p-3 font-bold text-on-surface-variant">{{ rule.ruleId }}</td>

                <!-- User Type -->
                <td
                  (click)="setActiveCell(rule.id, 'userType')"
                  class="p-2 cursor-text transition-all hover:bg-surface-container"
                >
                  <ng-container *ngIf="isCellActive(rule.id, 'userType'); else userTypeStatic">
                    <select
                      [ngModel]="rule.userType"
                      (ngModelChange)="handleCellUpdate(rule.id, 'userType', $event)"
                      (blur)="clearActiveCell()"
                      class="w-full h-7 px-1 text-xs border border-secondary rounded bg-white text-on-surface outline-none"
                      autoFocus
                    >
                      <option value="New User">New User</option>
                      <option value="Existing">Existing</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </ng-container>
                  <ng-template #userTypeStatic>
                    <span class="px-1 text-on-surface">{{ rule.userType }}</span>
                  </ng-template>
                </td>

                <!-- Min Spend -->
                <td
                  (click)="setActiveCell(rule.id, 'spendMin')"
                  class="p-2 cursor-text transition-all hover:bg-surface-container text-right"
                >
                  <ng-container *ngIf="isCellActive(rule.id, 'spendMin'); else spendMinStatic">
                    <input
                      type="number"
                      [ngModel]="rule.spendMin"
                      (ngModelChange)="handleCellUpdate(rule.id, 'spendMin', $event)"
                      (blur)="clearActiveCell()"
                      (keydown.enter)="clearActiveCell()"
                      class="w-full h-7 px-2 text-xs border border-secondary rounded bg-white text-on-surface outline-none text-right"
                      autoFocus
                    />
                  </ng-container>
                  <ng-template #spendMinStatic>
                    <span class="px-1 text-on-surface font-bold">\${{ rule.spendMin.toLocaleString() }}</span>
                  </ng-template>
                </td>

                <!-- Regions -->
                <td class="p-2">
                  <div class="flex flex-wrap gap-1 items-center max-w-xs">
                    <span
                      *ngFor="let reg of rule.regions"
                      class="inline-flex items-center gap-0.5 bg-secondary/10 border border-secondary/30 text-secondary text-[9px] font-bold px-1.5 py-0.5 rounded"
                    >
                      <span>{{ reg }}</span>
                      <button
                        (click)="handleRemoveRegion(rule.id, rule.regions, reg)"
                        class="hover:text-red-600 font-extrabold cursor-pointer text-[9px] leading-none"
                      >
                        ×
                      </button>
                    </span>

                    <input
                      placeholder="+ Add Region..."
                      (keydown)="handleRegionKeyDown(rule.id, rule.regions, $event)"
                      class="h-6 px-1.5 text-[10px] border border-outline-variant border-dashed rounded bg-transparent text-on-surface outline-none w-20 focus:border-secondary focus:border-solid focus:w-24 transition-all"
                    />
                  </div>
                </td>

                <!-- Condition FX -->
                <td
                  (click)="setActiveCell(rule.id, 'conditionFx')"
                  class="p-2 cursor-text transition-all hover:bg-surface-container"
                >
                  <ng-container *ngIf="isCellActive(rule.id, 'conditionFx'); else condFxStatic">
                    <input
                      type="text"
                      [ngModel]="rule.conditionFx"
                      (ngModelChange)="handleCellUpdate(rule.id, 'conditionFx', $event)"
                      (blur)="clearActiveCell()"
                      (keydown.enter)="clearActiveCell()"
                      class="w-full h-7 px-2 text-xs font-mono border border-secondary rounded bg-white text-on-surface outline-none"
                      autoFocus
                    />
                  </ng-container>
                  <ng-template #condFxStatic>
                    <span class="px-1 text-secondary font-bold font-mono">{{ rule.conditionFx }}</span>
                  </ng-template>
                </td>

                <!-- Action -->
                <td class="p-2">
                  <div class="flex items-center gap-1.5">
                    <select
                      [ngModel]="rule.thenAction"
                      (ngModelChange)="handleCellUpdate(rule.id, 'thenAction', $event)"
                      class="h-7 px-1.5 text-xs font-sans border border-outline-variant rounded bg-white text-on-surface outline-none cursor-pointer w-28 font-medium"
                    >
                      <option value="Block">Block</option>
                      <option value="Review">Review</option>
                      <option value="Approve">Approve</option>
                    </select>

                    <ng-container [ngSwitch]="rule.thenAction">
                      <svg *ngSwitchCase="'Block'" class="w-4 h-4 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l7-2a1 1 0 0 1 .48 0l7 2A1 1 0 0 1 20 6z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                      </svg>
                      <svg *ngSwitchCase="'Review'" class="w-4 h-4 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12" y1="17" y2="17"/>
                      </svg>
                      <svg *ngSwitchCase="'Approve'" class="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </ng-container>
                  </div>
                </td>

                <!-- Then Risk Score -->
                <td
                  (click)="setActiveCell(rule.id, 'thenRiskScore')"
                  class="p-2 cursor-text transition-all hover:bg-surface-container text-right"
                >
                  <ng-container *ngIf="isCellActive(rule.id, 'thenRiskScore'); else riskScoreStatic">
                    <input
                      type="number"
                      [ngModel]="rule.thenRiskScore"
                      (ngModelChange)="handleCellUpdate(rule.id, 'thenRiskScore', $event)"
                      (blur)="clearActiveCell()"
                      (keydown.enter)="clearActiveCell()"
                      class="w-full h-7 px-2 text-xs border border-secondary rounded bg-white text-on-surface outline-none text-right"
                      autoFocus
                    />
                  </ng-container>
                  <ng-template #riskScoreStatic>
                    <span
                      [ngClass]="{
                        'text-red-700 font-extrabold': rule.thenRiskScore >= 80,
                        'text-amber-700 font-bold': rule.thenRiskScore >= 40 && rule.thenRiskScore < 80,
                        'text-emerald-700': rule.thenRiskScore < 40
                      }"
                      class="px-1"
                    >
                      {{ rule.thenRiskScore }}
                    </span>
                  </ng-template>
                </td>

                <!-- Return Record -->
                <td class="p-3 text-center">
                  <input
                    type="checkbox"
                    [ngModel]="rule.thenReturnRecord"
                    (ngModelChange)="handleCellUpdate(rule.id, 'thenReturnRecord', $event)"
                    class="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                  />
                </td>

                <!-- Active -->
                <td class="p-3 text-center">
                  <input
                    type="checkbox"
                    [ngModel]="rule.isActive"
                    (ngModelChange)="handleCellUpdate(rule.id, 'isActive', $event)"
                    class="rounded text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                  />
                </td>

                <!-- Actions / Delete -->
                <td class="p-3 text-center">
                  <button
                    (click)="handleDeleteRule(rule.id)"
                    class="text-on-surface-variant hover:text-red-600 transition-colors p-1 rounded cursor-pointer"
                    title="Delete row"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Pagination -->
        <div class="bg-surface-container border-t border-outline-variant p-3 flex items-center justify-between text-xs font-sans">
          <span class="text-on-surface-variant font-medium">
            Showing 1 to {{ rules.length }} of {{ rules.length }} rulesets
          </span>
          <div class="flex items-center space-x-2 font-mono">
            <button class="p-1 rounded hover:bg-surface-container-highest disabled:opacity-40 text-on-surface-variant cursor-pointer" disabled>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <span class="px-2 text-on-surface font-bold">1</span>
            <button class="p-1 rounded hover:bg-surface-container-highest disabled:opacity-40 text-on-surface-variant cursor-pointer" disabled>
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
export class DecisionTableComponent {
  @Input() rules: DecisionRule[] = [];
  @Output() rulesChange = new EventEmitter<DecisionRule[]>();

  selectedIds: string[] = [];
  activeCell: { id: string; field: string } | null = { id: '2', field: 'spendMin' }; // Preset cell
  sortBy: 'spend_desc' | 'spend_asc' = 'spend_desc';

  toggleSort() {
    this.sortBy = this.sortBy === 'spend_desc' ? 'spend_asc' : 'spend_desc';
  }

  getSortedRules() {
    return [...this.rules].sort((a, b) => {
      if (this.sortBy === 'spend_desc') {
        return b.spendMin - a.spendMin;
      } else {
        return a.spendMin - b.spendMin;
      }
    });
  }

  areAllSelected() {
    return this.rules.length > 0 && this.selectedIds.length === this.rules.length;
  }

  handleSelectAll(checked: boolean) {
    if (checked) {
      this.selectedIds = this.rules.map(r => r.id);
    } else {
      this.selectedIds = [];
    }
  }

  handleSelectRow(id: string, checked: boolean) {
    if (checked) {
      if (!this.selectedIds.includes(id)) {
        this.selectedIds.push(id);
      }
    } else {
      this.selectedIds = this.selectedIds.filter(item => item !== id);
    }
  }

  handleAddRule() {
    const nextId = String(Math.max(...this.rules.map(r => Number(r.id)), 0) + 1);
    const paddedIdStr = String(nextId).padStart(3, '0');
    const newRule: DecisionRule = {
      id: nextId,
      ruleId: `R-${paddedIdStr}`,
      userType: 'New User',
      spendMin: 1000,
      regions: ['US'],
      conditionFx: 'vel(1h) > 2',
      thenAction: 'Review',
      thenRiskScore: 50,
      thenReturnRecord: true,
      isActive: true,
    };
    const updated = [...this.rules, newRule];
    this.rulesChange.emit(updated);
    this.activeCell = { id: nextId, field: 'spendMin' };
  }

  handleDeleteRule(id: string) {
    const updated = this.rules.filter(r => r.id !== id);
    this.rulesChange.emit(updated);
    this.selectedIds = this.selectedIds.filter(item => item !== id);
  }

  handleCellUpdate(id: string, field: keyof DecisionRule, value: any) {
    const updated = this.rules.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    });
    this.rulesChange.emit(updated);
  }

  handleRegionKeyDown(id: string, regions: string[], event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const target = event.currentTarget as HTMLInputElement;
      const newRegion = target.value.trim().toUpperCase();
      if (newRegion && !regions.includes(newRegion)) {
        this.handleCellUpdate(id, 'regions', [...regions, newRegion]);
        target.value = '';
      }
    }
  }

  handleRemoveRegion(id: string, regions: string[], regToRemove: string) {
    this.handleCellUpdate(
      id,
      'regions',
      regions.filter(r => r !== regToRemove)
    );
  }

  setActiveCell(id: string, field: string) {
    this.activeCell = { id, field };
  }

  isCellActive(id: string, field: string): boolean {
    return this.activeCell?.id === id && this.activeCell?.field === field;
  }

  clearActiveCell() {
    this.activeCell = null;
  }
}
