import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RuleFx {
  id: string;
  name: string;
  category: 'filters' | 'aggregates' | 'sorting';
  signature: string;
  description: string;
  syntax: string;
  returnType: string;
  parameters?: { name: string; type: string; description: string }[];
  sampleOutput?: string;
  isCustom?: boolean;
  builderDetails?: {
    sourceCollection: string;
    filterField: string;
    filterOperator: string;
    filterValue: string;
    sortByField: string;
    sortDirection: 'asc' | 'desc';
    selectionType: 'all' | 'first' | 'last' | 'range';
    selectionCount: number;
    selectionFrom: number;
    selectionTo: number;
    aggregateOperation: string;
    aggregateField: string;
  };
}

const INITIAL_FUNCTIONS: RuleFx[] = [
  {
    id: 'date_range',
    name: 'Date Range',
    category: 'filters',
    signature: 'IS_BETWEEN(target_date, start_date, end_date) -> bool',
    description: 'Evaluates if a target date falls strictly within a specified start and end period.',
    syntax: 'IS_BETWEEN(target_date, start_date, end_date)',
    returnType: 'BOOLEAN',
    parameters: [
      { name: 'target_date', type: 'datetime', description: 'The date value to be checked.' },
      { name: 'start_date', type: 'datetime', description: 'The beginning of the allowed period.' },
      { name: 'end_date', type: 'datetime', description: 'The end of the allowed period.' }
    ],
    sampleOutput: 'true'
  },
  {
    id: 'value_match',
    name: 'Value Match',
    category: 'filters',
    signature: 'EQUALS(attribute, value) -> bool',
    description: 'Performs a strict equality check against a defined scalar value.',
    syntax: 'EQUALS(attribute, value)',
    returnType: 'BOOLEAN',
    parameters: [
      { name: 'attribute', type: 'any', description: 'The variable to compare.' },
      { name: 'value', type: 'any', description: 'The absolute value to compare against.' }
    ],
    sampleOutput: 'false'
  },
  {
    id: 'contains_list',
    name: 'Contains List',
    category: 'filters',
    signature: 'IN_ARRAY(target, [list_values]) -> bool',
    description: 'Checks if the target string exists within a defined array of acceptable strings.',
    syntax: 'IN_ARRAY(target, [list_values])',
    returnType: 'BOOLEAN',
    parameters: [
      { name: 'target', type: 'str', description: 'The value being verified.' },
      { name: 'list_values', type: 'str[]', description: 'Array of valid comparison values.' }
    ],
    sampleOutput: 'true'
  },
  {
    id: 'sum_total',
    name: 'Sum Total',
    category: 'aggregates',
    signature: "SUM(collection, 'field_name') -> num",
    description: 'Calculates the total numeric sum of a specific field across a collection.',
    syntax: "SUM(collection, 'field_name')",
    returnType: 'FLOAT',
    parameters: [
      { name: 'collection', type: 'array', description: 'The array of records to compute.' },
      { name: 'field_name', type: 'str', description: 'The numeric field identifier inside each record.' }
    ],
    sampleOutput: '45000.00'
  },
  {
    id: 'count_items',
    name: 'Count Items',
    category: 'aggregates',
    signature: 'COUNT(collection, [condition]) -> int',
    description: 'Returns the number of items in a collection that match an optional condition.',
    syntax: 'COUNT(collection, [condition])',
    returnType: 'INTEGER',
    parameters: [
      { name: 'collection', type: 'array', description: 'The records to evaluate.' },
      { name: 'condition', type: 'expr', description: 'Optional logical filter expression.' }
    ],
    sampleOutput: '18'
  },
  {
    id: 'rolling_average',
    name: 'Rolling Average',
    category: 'aggregates',
    signature: "AVERAGE(collection, 'field', window) -> num",
    description: 'Computes the mean value of a field over a specified time window.',
    syntax: "AVERAGE(collection, 'field', window)",
    returnType: 'FLOAT',
    parameters: [
      { name: 'collection', type: 'array', description: 'The record history dataset.' },
      { name: 'field', type: 'str', description: 'The numeric field name.' },
      { name: 'window', type: 'str', description: 'Rolling time limit (e.g. 30d).' }
    ],
    sampleOutput: '1240.25'
  },
  {
    id: 'first_n',
    name: 'First N Records',
    category: 'sorting',
    signature: 'FIRST(collection, sort_attr, n) -> array',
    description: 'Selects the first N records after sorting by a specific attribute.',
    syntax: 'FIRST(collection, sort_attr, n)',
    returnType: 'COLLECTION',
    parameters: [
      { name: 'collection', type: 'array', description: 'Source record elements.' },
      { name: 'sort_attr', type: 'str', description: 'The sorting attribute name.' },
      { name: 'n', type: 'int', description: 'Count limit to extract.' }
    ],
    sampleOutput: '[{id: 1, val: 500}, {id: 2, val: 450}]'
  },
  {
    id: 'last_n',
    name: 'Last N Records',
    category: 'sorting',
    signature: 'LAST(collection, sort_attr, n) -> array',
    description: 'Selects the last N records after sorting by a specific attribute.',
    syntax: 'LAST(collection, sort_attr, n)',
    returnType: 'COLLECTION',
    parameters: [
      { name: 'collection', type: 'array', description: 'Source record elements.' },
      { name: 'sort_attr', type: 'str', description: 'The sorting attribute name.' },
      { name: 'n', type: 'int', description: 'Count limit from the tail.' }
    ],
    sampleOutput: '[{id: 99, val: 5}, {id: 100, val: 2}]'
  },
  {
    id: 'record_range',
    name: 'Record Range',
    category: 'sorting',
    signature: 'RANGE(collection, sort_attr, start, end) -> array',
    description: 'Selects a specific range of records based on sorting criteria.',
    syntax: 'RANGE(collection, sort_attr, start, end)',
    returnType: 'COLLECTION',
    parameters: [
      { name: 'collection', type: 'array', description: 'Source record elements.' },
      { name: 'sort_attr', type: 'str', description: 'The sorting attribute name.' },
      { name: 'start', type: 'int', description: 'Lower index offset.' },
      { name: 'end', type: 'int', description: 'Upper index limit.' }
    ],
    sampleOutput: '[{id: 5, val: 120}, {id: 6, val: 110}]'
  }
];

@Component({
  selector: 'app-functions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-1 flex flex-col overflow-hidden' },
  template: `
    <div class="flex-1 flex overflow-hidden bg-[#F9FAFB] relative min-h-0">
      <!-- Toast alert -->
      <div *ngIf="toastMessage" class="fixed bottom-6 right-6 z-50 bg-primary border-2 border-emerald-300 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce text-xs font-bold">
        <span>{{ toastMessage }}</span>
      </div>

      <div *ngIf="currentView === 'library'" class="flex-1 flex overflow-hidden">
        <!-- Main List & Grid view on left -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-text">
          <!-- Header section with CTA -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-on-surface">Functions Library</h1>
              <p class="text-xs text-on-surface-variant mt-1">
                Manage and author core logic functions for advanced rule evaluation.
              </p>
            </div>
            <button
              (click)="handleOpenCreateWizard()"
              class="bg-secondary hover:bg-secondary/90 text-on-secondary px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              <span>Add Function</span>
            </button>
          </div>

          <!-- Filter Categories Chips & Search Bar -->
          <div class="bg-white border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex flex-wrap gap-1.5">
              <button
                *ngFor="let cat of categories"
                (click)="activeCategory = cat"
                [ngClass]="{
                  'bg-primary text-white': activeCategory === cat,
                  'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high': activeCategory !== cat
                }"
                class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                {{ cat === 'all' ? 'All Functions' : (cat | titlecase) }}
              </button>
            </div>

            <!-- Search input box -->
            <div class="relative w-full md:max-w-xs">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                placeholder="Search functions..."
                [(ngModel)]="searchQuery"
                class="w-full pl-9 pr-3 py-1.5 bg-surface-container rounded-lg border-none text-xs focus:ring-1 focus:ring-secondary outline-none h-8 text-on-surface placeholder-on-surface-variant"
              />
            </div>
          </div>

          <!-- Subdivisions: filters, aggregates, sorting -->
          <div class="space-y-8">
            <div *ngFor="let catName of ['filters', 'aggregates', 'sorting']" class="space-y-3">
              <h3 class="text-xs font-extrabold uppercase text-on-surface-variant tracking-wider flex items-center gap-2 border-b border-outline-variant/60 pb-2">
                <span class="w-2 h-2 rounded-full inline-block" [ngClass]="{
                  'bg-emerald-600': catName === 'filters',
                  'bg-secondary': catName === 'aggregates',
                  'bg-purple-600': catName === 'sorting'
                }"></span>
                <span>{{ catName }} ({{ filterCategoryItems(catName).length }})</span>
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div
                  *ngFor="let fx of filterCategoryItems(catName)"
                  (click)="handleLoadTester(fx)"
                  [ngClass]="{
                    'border-secondary ring-1 ring-secondary/50 bg-secondary/5': selectedFx?.id === fx.id,
                    'border-outline-variant hover:border-on-surface-variant/40 hover:shadow-sm': selectedFx?.id !== fx.id
                  }"
                  class="bg-white border rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div class="flex justify-between items-start gap-2 mb-1.5">
                      <span class="font-bold text-xs text-on-surface truncate">{{ fx.name }}</span>
                      <span *ngIf="fx.isCustom" class="bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wider">
                        Custom
                      </span>
                    </div>
                    <code class="font-mono text-[9px] bg-surface-container border border-outline-variant/40 px-1.5 py-0.5 rounded text-secondary block truncate mb-2">
                      {{ fx.signature }}
                    </code>
                    <p class="text-[11px] text-on-surface-variant leading-relaxed">
                      {{ fx.description }}
                    </p>
                  </div>

                  <div class="flex justify-between items-center mt-3 pt-2.5 border-t border-outline-variant border-opacity-40">
                    <span class="font-mono text-[9px] text-on-surface-variant uppercase font-semibold">
                      Returns: <span class="font-bold text-primary">{{ fx.returnType }}</span>
                    </span>

                    <div class="flex gap-1" *ngIf="fx.isCustom">
                      <button
                        (click)="handleOpenEditWizard(fx); $event.stopPropagation();"
                        class="p-1 text-on-surface-variant hover:text-secondary rounded hover:bg-surface-container"
                        title="Edit Function"
                      >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                        </svg>
                      </button>
                      <button
                        (click)="handleDeleteCustom(fx.id, $event)"
                        class="p-1 text-on-surface-variant hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete Function"
                      >
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Testing Console Sandbox panel on right -->
        <aside class="w-[380px] bg-white border-l border-outline-variant flex flex-col z-20 shadow-md">
          <div class="p-4 border-b border-outline-variant bg-surface-container-lowest flex items-center gap-2">
            <svg class="w-4.5 h-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17h6"/><path d="M9 13h6"/><path d="M9 9h6"/>
            </svg>
            <h3 class="font-serif text-sm font-bold text-on-surface">Interactive Sandbox</h3>
          </div>

          <div class="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-5" *ngIf="selectedFx; else noSelection">
            <div>
              <span class="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider block mb-1">
                Active Registry Block
              </span>
              <h2 class="text-sm font-bold text-primary">{{ selectedFx.name }}</h2>
              <p class="text-xs text-on-surface-variant leading-relaxed mt-1">
                {{ selectedFx.description }}
              </p>
            </div>

            <!-- Parameters forms block -->
            <div class="space-y-3">
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Parameter Inputs (Comma separated)
              </label>
              <input
                type="text"
                [(ngModel)]="testParamInput"
                class="w-full h-8 px-3 text-xs font-mono border border-outline-variant rounded focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
              />
              <p class="text-[9px] text-on-surface-variant mt-1 font-semibold leading-normal">
                Syntax Schema: <span class="text-secondary font-mono">{{ selectedFx.syntax }}</span>
              </p>
            </div>

            <!-- Trigger Button -->
            <button
              (click)="handleTestRun()"
              [disabled]="isTesting"
              class="w-full bg-primary hover:bg-primary-hover text-white transition-all py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg class="w-3.5 h-3.5 fill-white text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="6 3 20 12 6 21 6 3"/>
              </svg>
              <span>{{ isTesting ? 'Running Execution...' : 'Run sandbox test' }}</span>
            </button>

            <!-- Execution Logs output -->
            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Sandbox Output Console
              </label>
              <div class="bg-black/90 p-4 rounded-xl border border-outline-variant font-mono text-[10px] text-emerald-400 min-h-[160px] whitespace-pre-wrap select-all leading-relaxed">
                {{ executionOutput || 'Waiting for evaluation run trigger...' }}
              </div>
            </div>
          </div>
          <ng-template #noSelection>
            <div class="p-8 text-center text-on-surface-variant text-xs my-auto">
              <svg class="w-8 h-8 opacity-40 mx-auto mb-2 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              Select any function to begin testing values.
            </div>
          </ng-template>
        </aside>
      </div>

      <!-- STEPPER WIZARD VIEW -->
      <div *ngIf="currentView === 'wizard'" class="flex-1 flex flex-col overflow-hidden bg-surface-container-low select-text">
        <!-- Breadcrumb Header -->
        <div class="bg-white border-b border-outline-variant px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-sm z-10">
          <div>
            <div class="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-semibold mb-1">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 7V5H6l6 7-6 7h12v-2"/>
              </svg>
              <span>Functions</span>
              <svg class="w-3 h-3 text-on-surface-variant/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
              <span class="text-primary font-bold capitalize">{{ wizardMode }} Custom Logic</span>
            </div>
            <h2 class="text-lg font-bold text-primary leading-tight">
              {{ wizardStep === 1 ? 'Step 1: Source & Identification' : wizardStep === 2 ? 'Step 2: Filter Specification' : wizardStep === 3 ? 'Step 3: Record Sorting & Selection' : 'Step 4: Mathematical Aggregation' }}
            </h2>
          </div>

          <!-- Step Counter Pills -->
          <div class="flex items-center gap-2">
            <div
              *ngFor="let step of [1, 2, 3, 4]"
              [ngClass]="{
                'bg-secondary text-on-secondary border-secondary shadow-sm': wizardStep === step,
                'bg-primary text-white border-primary': wizardStep > step,
                'bg-white text-on-surface-variant border-outline-variant/60': wizardStep < step
              }"
              class="flex items-center justify-center h-7 px-3 rounded-full text-[11px] font-bold tracking-wide border transition-all"
            >
              <span class="mr-1">{{ step }}.</span>
              {{ step === 1 ? 'Source' : step === 2 ? 'Filter' : step === 3 ? 'Sort & Select' : 'Aggregate' }}
            </div>
          </div>
        </div>

        <!-- Stepper Wizard Content Area -->
        <div class="flex-1 overflow-y-auto p-6 lg:p-8 flex justify-center items-start min-h-0">
          <div class="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Form controls (span-2) -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- STEP 1: Identification & Source Collection -->
              <div *ngIf="wizardStep === 1" class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm space-y-5">
                <div class="flex items-center gap-3 mb-2 border-b border-outline-variant pb-3">
                  <div class="w-1.5 h-6 bg-secondary rounded-full"></div>
                  <h2 class="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <svg class="w-4.5 h-4.5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>Function Meta Information</span>
                  </h2>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Output Name (Display Identifier)
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="fxName"
                      class="w-full h-8 px-3 text-xs border border-outline-variant rounded bg-white text-on-surface font-semibold focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                      placeholder="e.g. Total High Value Txns"
                    />
                    <p class="text-[10px] text-on-surface-variant mt-1.5">
                      This identifier will represent your computed logic cell inside decision tables and rule sets.
                    </p>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Source Collection Dataset
                    </label>
                    <div class="relative">
                      <select
                        [(ngModel)]="fxSource"
                        class="w-full h-8 pl-3 pr-8 text-xs border border-outline-variant rounded bg-white text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
                      >
                        <option value="Transactions">Transactions (Ledger ledger collection)</option>
                        <option value="Users">Users (Verified client directory)</option>
                        <option value="Logins">Logins (Session telemetry collection)</option>
                        <option value="Devices">Devices (Hardware profiles registry)</option>
                      </select>
                      <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </div>
                    <p class="text-[10px] text-on-surface-variant mt-1.5">
                      Select the target raw collection framework that this logic function queries.
                    </p>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Business Objective Description
                    </label>
                    <textarea
                      [(ngModel)]="fxDescription"
                      rows="3"
                      class="w-full p-2.5 text-xs border border-outline-variant rounded bg-white text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                      placeholder="Brief explanation of logic rules, boundary constraints or business trigger..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- STEP 2: Conditional filter logic -->
              <div *ngIf="wizardStep === 2" class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm space-y-5">
                <div class="flex items-center justify-between pb-3 border-b border-outline-variant">
                  <div class="flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-secondary rounded-full"></div>
                    <h2 class="text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <svg class="w-4.5 h-4.5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                      </svg>
                      <span>Collection Logic Filters</span>
                    </h2>
                  </div>
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Enable Filters</span>
                    <input
                      type="checkbox"
                      [(ngModel)]="enableFilter"
                      class="rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>

                <div *ngIf="enableFilter; else noFilterTemplate" class="space-y-4">
                  <p class="text-xs text-on-surface-variant leading-relaxed">
                    Define matching criteria to isolate specific record subsets before performing the mathematical reduce aggregate operation.
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Match Target Field
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="filterField"
                        class="w-full h-8 px-3 text-xs border border-outline-variant rounded bg-white text-on-surface font-mono focus:outline-none focus:border-secondary"
                        placeholder="e.g. amount"
                      />
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Operator
                      </label>
                      <div class="relative">
                        <select
                          [(ngModel)]="filterOperator"
                          class="w-full h-8 pl-3 pr-8 text-xs border border-outline-variant rounded bg-white text-on-surface font-bold focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                        >
                          <option value=">">&gt; (Greater Than)</option>
                          <option value="<">&lt; (Less Than)</option>
                          <option value="==">== (Strict Equals)</option>
                          <option value="!=">!= (Not Equals)</option>
                          <option value="contains">Contains Pattern</option>
                          <option value="starts_with">Starts With</option>
                        </select>
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Constraint Value
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="filterValue"
                        class="w-full h-8 px-3 text-xs border border-outline-variant rounded bg-white text-on-surface font-mono focus:outline-none focus:border-secondary"
                        placeholder="e.g. 1000"
                      />
                    </div>
                  </div>

                  <div class="bg-surface-container-low border border-dashed border-outline-variant p-3.5 rounded-lg flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Synthesized Filter SQL:</span>
                    <code class="font-mono text-[10px] text-secondary font-bold bg-white px-2 py-0.5 rounded border">
                      {{ filterField || 'field' }} {{ filterOperator }} "{{ filterValue || 'value' }}"
                    </code>
                  </div>
                </div>
                <ng-template #noFilterTemplate>
                  <div class="p-8 text-center bg-surface-container rounded-xl border border-outline-variant/60">
                    <p class="text-xs text-on-surface-variant italic">
                      No logical constraints active. The entire raw collection dataset will be pulled into step 3.
                    </p>
                  </div>
                </ng-template>
              </div>

              <!-- STEP 3: Record Sorting & selection bounds -->
              <div *ngIf="wizardStep === 3" class="space-y-6 animate-fadeIn">
                <!-- Sorting criteria -->
                <div class="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
                  <div class="flex items-center gap-2 mb-2 border-b border-outline-variant pb-2">
                    <svg class="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
                    </svg>
                    <h3 class="text-sm font-bold text-on-surface">Sorting Order Configuration</h3>
                  </div>
                  <p class="text-xs text-on-surface-variant leading-relaxed">
                    Define the primary sorting database key and direction to sort filtered elements before selection.
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Sort By Field
                      </label>
                      <div class="relative">
                        <select
                          [(ngModel)]="sortByField"
                          class="w-full h-8 pl-3 pr-8 text-xs border border-outline-variant rounded bg-white text-on-surface font-mono focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                        >
                          <option value="transaction_timestamp">transaction_timestamp</option>
                          <option value="amount">amount</option>
                          <option value="merchant_id">merchant_id</option>
                          <option value="status">status</option>
                        </select>
                        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      </div>
                    </div>

                    <div>
                      <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Direction
                      </label>
                      <div class="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/40 h-8">
                        <button
                          type="button"
                          (click)="sortDirection = 'asc'"
                          [ngClass]="{
                            'bg-white text-primary shadow-sm font-bold': sortDirection === 'asc',
                            'text-on-surface-variant hover:text-on-surface': sortDirection !== 'asc'
                          }"
                          class="flex-1 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all border-none"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
                          </svg>
                          <span>Ascending</span>
                        </button>
                        <button
                          type="button"
                          (click)="sortDirection = 'desc'"
                          [ngClass]="{
                            'bg-white text-primary shadow-sm font-bold': sortDirection === 'desc',
                            'text-on-surface-variant hover:text-on-surface': sortDirection !== 'desc'
                          }"
                          class="flex-1 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all border-none"
                        >
                          <svg class="w-3.5 h-3.5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>
                          </svg>
                          <span>Descending</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Record Selection Choices -->
                <div class="bg-white border border-outline-variant rounded-xl p-6 shadow-sm space-y-4">
                  <div class="flex items-center gap-2 mb-2 border-b border-outline-variant pb-2">
                    <svg class="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>
                    </svg>
                    <h3 class="text-sm font-bold text-on-surface">Record Selection Bounds</h3>
                  </div>
                  <p class="text-xs text-on-surface-variant leading-relaxed">
                    Specify which specific boundary segment of sorted elements should be passed into aggregate operation reducer.
                  </p>

                  <div class="space-y-3">
                    <!-- Option ALL -->
                    <div
                      (click)="selectionType = 'all'"
                      [ngClass]="{
                        'border-secondary bg-secondary/5 ring-1 ring-secondary': selectionType === 'all',
                        'border-outline-variant/60 hover:bg-surface-container-low': selectionType !== 'all'
                      }"
                      class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        [checked]="selectionType === 'all'"
                        (change)="selectionType = 'all'"
                        class="mt-1 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <div class="flex-1">
                        <span class="text-xs font-bold text-on-surface block">All Filtered Records</span>
                        <span class="text-[10px] text-on-surface-variant leading-normal">
                          Pipes the entire collection (matching filters) straight to aggregate reducer.
                        </span>
                      </div>
                    </div>

                    <!-- Option FIRST N -->
                    <div
                      (click)="selectionType = 'first'"
                      [ngClass]="{
                        'border-secondary bg-secondary/5 ring-1 ring-secondary': selectionType === 'first',
                        'border-outline-variant/60 hover:bg-surface-container-low': selectionType !== 'first'
                      }"
                      class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all relative"
                    >
                      <input
                        type="radio"
                        [checked]="selectionType === 'first'"
                        (change)="selectionType = 'first'"
                        class="mt-1 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <div class="flex-1">
                        <span class="text-xs font-bold text-on-surface block">First N Records</span>
                        <span class="text-[10px] text-on-surface-variant leading-normal">
                          Extracts a precise limited number of elements from the very top of sorted ledger.
                        </span>

                        <div *ngIf="selectionType === 'first'" class="mt-2.5 flex items-center gap-2 bg-white border p-2 rounded-lg max-w-xs" (click)="$event.stopPropagation()">
                          <span class="text-[10px] font-bold text-on-surface-variant uppercase">COUNT LIMIT:</span>
                          <input
                            type="number"
                            [(ngModel)]="selectionCount"
                            class="w-20 h-7 border border-outline-variant rounded text-xs px-2 focus:outline-none focus:border-secondary font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Option LAST N -->
                    <div
                      (click)="selectionType = 'last'"
                      [ngClass]="{
                        'border-secondary bg-secondary/5 ring-1 ring-secondary': selectionType === 'last',
                        'border-outline-variant/60 hover:bg-surface-container-low': selectionType !== 'last'
                      }"
                      class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all relative"
                    >
                      <input
                        type="radio"
                        [checked]="selectionType === 'last'"
                        (change)="selectionType = 'last'"
                        class="mt-1 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <div class="flex-1">
                        <span class="text-xs font-bold text-on-surface block">Last N Records</span>
                        <span class="text-[10px] text-on-surface-variant leading-normal">
                          Extracts a precise limited count segment from the very tail of sorted elements list.
                        </span>

                        <div *ngIf="selectionType === 'last'" class="mt-2.5 flex items-center gap-2 bg-white border p-2 rounded-lg max-w-xs" (click)="$event.stopPropagation()">
                          <span class="text-[10px] font-bold text-on-surface-variant uppercase">COUNT LIMIT:</span>
                          <input
                            type="number"
                            [(ngModel)]="selectionCount"
                            class="w-20 h-7 border border-outline-variant rounded text-xs px-2 focus:outline-none focus:border-secondary font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Option RANGE -->
                    <div
                      (click)="selectionType = 'range'"
                      [ngClass]="{
                        'border-secondary bg-secondary/5 ring-1 ring-secondary': selectionType === 'range',
                        'border-outline-variant/60 hover:bg-surface-container-low': selectionType !== 'range'
                      }"
                      class="flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all relative"
                    >
                      <input
                        type="radio"
                        [checked]="selectionType === 'range'"
                        (change)="selectionType = 'range'"
                        class="mt-1 text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                      />
                      <div class="flex-1">
                        <span class="text-xs font-bold text-on-surface block">Index Offset Range</span>
                        <span class="text-[10px] text-on-surface-variant leading-normal">
                          Extracts a specific slice of sorted ledger bounded between index range bounds.
                        </span>

                        <div *ngIf="selectionType === 'range'" class="mt-2.5 flex items-center gap-4 bg-white border p-2 rounded-lg max-w-sm" (click)="$event.stopPropagation()">
                          <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold text-on-surface-variant uppercase">FROM INDEX:</span>
                            <input
                              type="number"
                              [(ngModel)]="selectionFrom"
                              class="w-16 h-7 border border-outline-variant rounded text-xs px-2 focus:outline-none focus:border-secondary font-mono"
                            />
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold text-on-surface-variant uppercase">TO INDEX:</span>
                            <input
                              type="number"
                              [(ngModel)]="selectionTo"
                              class="w-16 h-7 border border-outline-variant rounded text-xs px-2 focus:outline-none focus:border-secondary font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 4: Mathematical Aggregation Operations -->
              <div *ngIf="wizardStep === 4" class="bg-white rounded-xl border border-outline-variant p-6 shadow-sm space-y-6 animate-fadeIn">
                <div class="flex items-center justify-between pb-3 border-b border-outline-variant">
                  <div class="flex items-center gap-3">
                    <div class="w-1.5 h-6 bg-secondary rounded-full"></div>
                    <h2 class="text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <svg class="w-4.5 h-4.5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="16" height="16" x="4" y="4" rx="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="12" y2="12"/>
                      </svg>
                      <span>Mathematical Operation Reducer</span>
                    </h2>
                  </div>
                </div>

                <!-- Aggregate Operation Type Grid -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Select Aggregation Formula
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div
                      *ngFor="let op of aggregateOps"
                      (click)="aggregateOperation = op.id"
                      [ngClass]="{
                        'border-secondary bg-secondary/5 ring-1 ring-secondary text-primary': aggregateOperation === op.id,
                        'border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant': aggregateOperation !== op.id
                      }"
                      class="border rounded-xl p-3 text-center cursor-pointer transition-all"
                    >
                      <div [innerHTML]="op.svg" class="w-5 h-5 mx-auto mb-1.5 flex items-center justify-center" [ngClass]="{'text-secondary': aggregateOperation === op.id, 'text-on-surface-variant': aggregateOperation !== op.id}"></div>
                      <span class="text-xs font-bold block">{{ op.label }}</span>
                      <span class="text-[9px] opacity-80 block mt-0.5">{{ op.desc }}</span>
                    </div>
                  </div>
                </div>

                <!-- Target field selector -->
                <div class="space-y-2">
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Target Reducer Field
                  </label>
                  <div class="relative">
                    <select
                      [(ngModel)]="aggregateField"
                      class="w-full h-8 pl-3 pr-8 text-xs border border-outline-variant rounded bg-white text-on-surface focus:outline-none focus:border-secondary appearance-none cursor-pointer"
                    >
                      <option value="amount_usd">amount_usd (Numeric Float)</option>
                      <option value="transaction_fee">transaction_fee (Numeric Float)</option>
                      <option value="exchange_rate">exchange_rate (Numeric Float)</option>
                      <option value="login_count">login_count (Numeric Integer)</option>
                    </select>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>

                  <div class="mt-3 flex gap-2 flex-wrap">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container border border-outline-variant text-[10px] font-mono text-on-surface-variant rounded">
                      <svg class="w-3 h-3 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
                      context.dataset.{{ aggregateField }}
                    </span>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container border border-outline-variant text-[10px] font-mono text-on-surface-variant rounded">
                      Type: Float
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Logic Summary Card Preview -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col sticky top-6">
                <div class="bg-surface-container p-4 border-b border-outline-variant flex items-center gap-2">
                  <svg class="w-4.5 h-4.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/>
                  </svg>
                  <h3 class="font-bold text-xs text-primary uppercase tracking-wider">Active Logic Preview</h3>
                </div>

                <div class="p-5 text-xs text-on-surface space-y-4 flex-grow bg-surface-bright leading-relaxed font-mono select-none">
                  <p>
                    Takes the
                    <span class="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-bold border border-primary/25">
                      {{ getSelectionTypeLabel() }}
                    </span>
                    records from
                    <span class="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/60 font-bold">
                      {{ fxSource }}
                    </span>
                  </p>

                  <div class="pl-4 border-l-2 border-outline-variant/60 relative">
                    <svg class="absolute -left-[9px] top-1 w-4 h-4 text-outline-variant bg-surface-bright p-0.5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                    <p class="text-on-surface-variant text-[11px]">
                      Filtered where:
                      <span *ngIf="enableFilter" class="bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded font-bold block mt-1.5">
                        {{ filterField }} {{ filterOperator }} "{{ filterValue }}"
                      </span>
                      <span *ngIf="!enableFilter" class="text-on-surface-variant italic block mt-1">No custom filters defined</span>
                    </p>
                  </div>

                  <div class="pl-4 border-l-2 border-secondary/50 relative">
                    <svg class="absolute -left-[9px] top-1 w-4 h-4 text-secondary/60 bg-surface-bright p-0.5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                    <p class="text-on-surface-variant text-[11px]">
                      Sorted by:
                      <span class="bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded font-semibold block mt-1.5">
                        {{ sortByField }} ({{ sortDirection.toUpperCase() }})
                      </span>
                    </p>
                  </div>

                  <div class="pl-4 border-l-2 border-secondary relative">
                    <svg class="absolute -left-[9px] top-1 w-4 h-4 text-secondary bg-surface-bright p-0.5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                    <p class="font-bold">
                      Returns the
                      <span class="bg-secondary/10 px-1.5 py-0.5 rounded text-secondary border border-secondary/25 uppercase font-bold">
                        {{ aggregateOperation }}
                      </span>
                      of
                      <span class="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/60 font-normal">
                        {{ aggregateField }}
                      </span>
                    </p>
                  </div>
                </div>

                <div class="p-4 bg-surface-container-low border-t border-outline-variant">
                  <div class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Computed Logic Signature
                  </div>
                  <div class="bg-black/90 p-2.5 rounded-lg border border-outline-variant font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-nowrap">
                    {{ getOutputSignaturePreview() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Footer Wizard navigation bar -->
        <div class="bg-white border-t border-outline-variant p-4 shrink-0 shadow-md z-10">
          <div class="max-w-4xl mx-auto flex justify-between items-center w-full select-none">
            <button
              type="button"
              (click)="handleWizardBack()"
              class="px-4 py-2 border border-outline-variant/80 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
              <span>{{ wizardStep === 1 ? 'Back to Library' : 'Back Step' }}</span>
            </button>

            <div class="flex gap-2">
              <button
                type="button"
                (click)="currentView = 'library'"
                class="px-4 py-2 border border-outline-variant/80 text-on-surface-variant hover:bg-surface-container rounded-lg font-semibold text-xs transition-all cursor-pointer bg-white"
              >
                Cancel
              </button>

              <button
                *ngIf="wizardStep < 4; else finishBtn"
                type="button"
                (click)="wizardStep = wizardStep + 1"
                class="px-5 py-2 bg-secondary hover:bg-secondary/95 text-on-secondary rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border-none"
              >
                <span>Next Step</span>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
              <ng-template #finishBtn>
                <button
                  type="button"
                  (click)="handleFinishAndSave()"
                  class="px-6 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>{{ wizardMode === 'edit' ? 'Update & Save Logic' : 'Finish & Compile' }}</span>
                </button>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FunctionsComponent {
  functions: RuleFx[] = INITIAL_FUNCTIONS;
  currentView: 'library' | 'wizard' = 'library';
  searchQuery: string = '';
  activeCategory: 'all' | 'filters' | 'aggregates' | 'sorting' = 'all';

  categories: ('all' | 'filters' | 'aggregates' | 'sorting')[] = ['all', 'filters', 'aggregates', 'sorting'];

  // Interactive sandbox / detail state
  selectedFx: RuleFx | null = INITIAL_FUNCTIONS[0];
  testParamInput: string = 'transactions, amount_usd, 30';
  executionOutput: string = '';
  isTesting: boolean = false;

  // Wizard state
  wizardStep: number = 1;
  wizardMode: 'create' | 'edit' = 'create';
  editingId: string | null = null;

  // Form Fields
  fxName: string = 'Total High Value Txns';
  fxSource: string = 'Transactions';
  fxDescription: string = 'Aggregate high-value cardholder transactions for volume checks.';
  enableFilter: boolean = true;
  filterField: string = 'amount';
  filterOperator: string = '>';
  filterValue: string = '1000';
  sortByField: string = 'transaction_timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  selectionType: 'all' | 'first' | 'last' | 'range' = 'first';
  selectionCount: number = 100;
  selectionFrom: number = 1;
  selectionTo: number = 50;
  aggregateOperation: string = 'sum';
  aggregateField: string = 'amount_usd';

  toastMessage: string | null = null;

  aggregateOps = [
    { id: 'sum', label: 'Sum', svg: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`, desc: 'Accumulates target field' },
    { id: 'avg', label: 'Average', svg: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17h6"/><path d="M9 13h6"/><path d="M9 9h6"/></svg>`, desc: 'Computes arithmetic mean' },
    { id: 'count', label: 'Count', svg: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7V5H6l6 7-6 7h12v-2"/></svg>`, desc: 'Tally of element matches' },
    { id: 'min', label: 'Minimum', svg: `<svg class="w-full h-full animate-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>`, desc: 'Locates lowest scalar bound' },
    { id: 'max', label: 'Maximum', svg: `<svg class="w-full h-full rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>`, desc: 'Locates highest scalar bound' },
    { id: 'rolling', label: 'Rolling Avg', svg: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>`, desc: 'Mean over moving frames' },
  ];

  triggerToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => this.toastMessage = null, 3500);
  }

  filterCategoryItems(cat: string): RuleFx[] {
    return this.getFilteredFunctions().filter(f => f.category === cat);
  }

  getFilteredFunctions(): RuleFx[] {
    return this.functions.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        f.syntax.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.activeCategory === 'all' || f.category === this.activeCategory;
      return matchesSearch && matchesCategory;
    });
  }

  handleLoadTester(fx: RuleFx) {
    this.selectedFx = fx;
    this.executionOutput = '';
    if (fx.isCustom && fx.builderDetails) {
      this.testParamInput = fx.builderDetails.sourceCollection;
    } else {
      if (fx.id === 'date_range') this.testParamInput = '2026-06-27, 2026-06-01, 2026-06-30';
      else if (fx.id === 'value_match') this.testParamInput = 'status, "completed"';
      else if (fx.id === 'contains_list') this.testParamInput = '"US", ["US", "CA", "MX"]';
      else if (fx.id === 'sum_total') this.testParamInput = 'transactions, "amount_usd"';
      else if (fx.id === 'count_items') this.testParamInput = 'transactions, "amount_usd > 500"';
      else if (fx.id === 'rolling_average') this.testParamInput = 'transactions, "amount_usd", "30d"';
      else this.testParamInput = 'transactions, "amount_usd", 10';
    }
  }

  handleTestRun() {
    if (!this.selectedFx) return;
    this.isTesting = true;
    this.executionOutput = 'Compiling formula code execution block...\n';

    setTimeout(() => {
      let outputSim = '';
      if (this.selectedFx?.isCustom && this.selectedFx.builderDetails) {
        const details = this.selectedFx.builderDetails;
        outputSim = `[COMPILER] Instantiating logical pipeline:
- Target Collection: "${details.sourceCollection}"
- Filter Query: [${details.filterField} ${details.filterOperator} ${details.filterValue}]
- Sorting: Order by "${details.sortByField}" (${details.sortDirection.toUpperCase()})
- Scope constraints: "${details.selectionType.toUpperCase()}" selection
- Aggregate reducer: ${details.aggregateOperation.toUpperCase()}(${details.aggregateField})

[SUCCESS] Executed evaluation on simulated context.
[RESULT] Return value (Float): 125,480.50 USD
[LOGS] Evaluated 1,420 records in collection, isolated ${details.selectionType === 'all' ? 'All' : '100'} subset records. Pipeline OK.`;
      } else if (this.selectedFx) {
        outputSim = `[COMPILER] Invoking evaluation: ${this.selectedFx.syntax}
- Params parsed: [${this.testParamInput}]
- Return type definition: ${this.selectedFx.returnType}

[SUCCESS] Logical criteria matched.
[RESULT] Evaluated output value: "${this.selectedFx.sampleOutput || 'true'}"`;
      }
      this.executionOutput = outputSim;
      this.isTesting = false;
    }, 900);
  }

  handleOpenCreateWizard() {
    this.wizardMode = 'create';
    this.editingId = null;
    this.fxName = 'Total High Value Txns';
    this.fxSource = 'Transactions';
    this.fxDescription = 'Aggregate high-value cardholder transactions for volume checks.';
    this.enableFilter = true;
    this.filterField = 'amount';
    this.filterOperator = '>';
    this.filterValue = '1000';
    this.sortByField = 'transaction_timestamp';
    this.sortDirection = 'desc';
    this.selectionType = 'first';
    this.selectionCount = 100;
    this.selectionFrom = 1;
    this.selectionTo = 50;
    this.aggregateOperation = 'sum';
    this.aggregateField = 'amount_usd';
    this.wizardStep = 1;
    this.currentView = 'wizard';
  }

  handleOpenEditWizard(fx: RuleFx) {
    if (!fx.isCustom || !fx.builderDetails) {
      this.triggerToast('Built-in system functions cannot be edited directly.');
      return;
    }
    this.wizardMode = 'edit';
    this.editingId = fx.id;
    this.fxName = fx.name;
    this.fxDescription = fx.description;

    const b = fx.builderDetails;
    this.fxSource = b.sourceCollection;
    this.enableFilter = !!b.filterField;
    this.filterField = b.filterField || 'amount';
    this.filterOperator = b.filterOperator || '>';
    this.filterValue = b.filterValue || '1000';
    this.sortByField = b.sortByField || 'transaction_timestamp';
    this.sortDirection = b.sortDirection || 'desc';
    this.selectionType = b.selectionType || 'first';
    this.selectionCount = b.selectionCount || 100;
    this.selectionFrom = b.selectionFrom || 1;
    this.selectionTo = b.selectionTo || 50;
    this.aggregateOperation = b.aggregateOperation || 'sum';
    this.aggregateField = b.aggregateField || 'amount_usd';

    this.wizardStep = 1;
    this.currentView = 'wizard';
  }

  handleFinishAndSave() {
    const returnType = ['sum', 'avg', 'rolling'].includes(this.aggregateOperation) ? 'FLOAT' : this.aggregateOperation === 'count' ? 'INTEGER' : 'FLOAT';
    const formatted = this.getFormattedSignatureName();

    const customFx: RuleFx = {
      id: this.editingId || `custom_${Date.now()}`,
      name: this.fxName,
      category: 'aggregates',
      signature: `${formatted}() -> ${returnType.toLowerCase()}`,
      description: this.fxDescription || `Custom mathematical ${this.aggregateOperation} evaluation over ${this.fxSource}.`,
      syntax: `${formatted}()`,
      returnType: returnType,
      sampleOutput: '125480.50',
      isCustom: true,
      parameters: [
        { name: 'context', type: 'object', description: 'Evaluation payload context containing pipeline parameters.' }
      ],
      builderDetails: {
        sourceCollection: this.fxSource,
        filterField: this.enableFilter ? this.filterField : '',
        filterOperator: this.enableFilter ? this.filterOperator : '',
        filterValue: this.enableFilter ? this.filterValue : '',
        sortByField: this.sortByField,
        sortDirection: this.sortDirection,
        selectionType: this.selectionType,
        selectionCount: this.selectionCount,
        selectionFrom: this.selectionFrom,
        selectionTo: this.selectionTo,
        aggregateOperation: this.aggregateOperation,
        aggregateField: this.aggregateField
      }
    };

    if (this.wizardMode === 'edit' && this.editingId) {
      this.functions = this.functions.map(f => f.id === this.editingId ? customFx : f);
      this.triggerToast(`Successfully updated function "${this.fxName}".`);
    } else {
      this.functions = [...this.functions, customFx];
      this.triggerToast(`Successfully authored custom logic function "${this.fxName}".`);
    }

    this.selectedFx = customFx;
    this.currentView = 'library';
  }

  handleDeleteCustom(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.functions = this.functions.filter(f => f.id !== id);
    this.triggerToast('Custom function removed successfully.');
    if (this.selectedFx?.id === id) {
      this.selectedFx = INITIAL_FUNCTIONS[0];
    }
  }

  handleWizardBack() {
    if (this.wizardStep === 1) {
      this.currentView = 'library';
    } else {
      this.wizardStep = this.wizardStep - 1;
    }
  }

  getFormattedSignatureName(): string {
    return this.fxName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  getOutputSignaturePreview(): string {
    const returnType = ['sum', 'avg', 'rolling'].includes(this.aggregateOperation) ? 'Float' : this.aggregateOperation === 'count' ? 'Integer' : 'Float';
    return `fn: ${this.getFormattedSignatureName() || 'unnamed_function'}() -> ${returnType}`;
  }

  getSelectionTypeLabel(): string {
    if (this.selectionType === 'all') return 'All';
    if (this.selectionType === 'first') return `First ${this.selectionCount}`;
    if (this.selectionType === 'last') return `Last ${this.selectionCount}`;
    return `Indices ${this.selectionFrom} to ${this.selectionTo}`;
  }

  handleAddMcc() {
    const trimmed = this.newMcc.trim();
    if (trimmed && !this.mccList.includes(trimmed)) {
      this.mccList = [...this.mccList, trimmed];
      this.newMcc = '';
    }
  }

  handleRemoveMcc(val: string) {
    this.mccList = this.mccList.filter(item => item !== val);
  }
  mccList: string[] = ['7995', '6051'];
  newMcc: string = '';
}
