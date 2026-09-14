import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchemaField } from '../../types';

/* ─── Interfaces ──────────────────────────────────────────── */

interface Condition {
  id: string;
  field: string;
  op: string;
  value: string;
}

interface ScheduleConfig {
  dailyFrom: string;      // HH:mm
  dailyTo: string;        // HH:mm
  yearlyFrom: string;     // dd/mm
  yearlyTo: string;       // dd/mm
  daysOfWeek: string[];   // ['Mon','Tue',...]
}

interface Term {
  id: string;
  operator: 'AND' | 'OR';
  termType: 'general' | 'schedule';
  conditions: Condition[];
  schedule?: ScheduleConfig;
}

interface RuleGrammar {
  name: string;
  description: string;
  team: string;
  operator: 'AND' | 'OR';
  terms: Term[];
  thenAction: string;
  thenReason: string;
  isActive: boolean;
}

/* ─── Constants ───────────────────────────────────────────── */

const OPERATORS   = ['>', '<', '>=', '<=', '==', '!=', 'in', 'not_in', 'contains', 'starts_with'];
const ACTIONS     = ['Flag for Review', 'Decline Transaction', 'Route to Analyst', 'Return Record', 'Trigger Alert'];
const TEAMS       = ['Risk & Fraud', 'Compliance', 'Payments', 'KYC Operations', 'Credit Underwriting', 'Platform Eng'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_FIELDS = [
  'Transaction.amount_usd', 'Transaction.merchant_mcc',
  'Transaction.currency',   'Transaction.channel',
  'User.risk_score',        'User.account_age_days',
  'User.country',           'User.email_verified',
  'Device.is_new',          'Device.os',
];

const DEFAULT_SCHEDULE: ScheduleConfig = {
  dailyFrom: '09:00', dailyTo: '17:00',
  yearlyFrom: '01/01', yearlyTo: '31/12',
  daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
};

/* ─── Component ───────────────────────────────────────────── */

@Component({
  selector: 'app-rule-sets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-grow flex flex-col overflow-hidden' },
  template: `
    <div class="flex-1 flex overflow-hidden bg-surface-container relative">

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- Main column (header + canvas + JSON + footer)         -->
      <!-- ══════════════════════════════════════════════════════ -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- ── Header bar ── -->
        <div class="bg-surface-container-lowest border-b border-outline-variant px-6 py-4 flex flex-wrap items-center gap-5 shrink-0 shadow-sm z-10">

          <!-- Rule name -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Name</label>
            <div class="relative flex items-center">
              <input [(ngModel)]="rule.name"
                class="h-9 pl-3 pr-8 text-xs font-bold border border-outline-variant rounded-lg bg-white text-primary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary w-56 transition-all"
                placeholder="Rule name" />
              <button
                type="button"
                (click)="generateAIName()"
                [disabled]="isGeneratingName"
                class="absolute right-1 p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-container transition-all cursor-pointer disabled:opacity-50 border-none bg-transparent"
                title="Generate name with AI (LLM)"
              >
                <!-- Magic wand SVG -->
                <svg *ngIf="!isGeneratingName" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.34 18.66a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
                  <path d="m14 7 3 3"/>
                  <path d="M5 6v4"/>
                  <path d="M19 14v4"/>
                  <path d="M10 2v2"/>
                  <path d="M7 8H3"/>
                  <path d="M21 16h-4"/>
                  <path d="M11 3H9"/>
                </svg>
                <!-- Loading spinner SVG -->
                <svg *ngIf="isGeneratingName" class="w-3.5 h-3.5 animate-spin text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round" fill="none"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="flex items-center gap-2 flex-1 min-w-[200px]">
            <label class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Description</label>
            <input [(ngModel)]="rule.description"
              class="h-9 px-3 text-xs border border-outline-variant rounded-lg bg-white text-on-surface focus:outline-none focus:border-secondary flex-1 transition-all"
              placeholder="What does this rule do?" />
          </div>

          <!-- Team -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Team</label>
            <select [(ngModel)]="rule.team"
              class="h-9 px-3 text-xs border border-outline-variant rounded-lg bg-white font-medium focus:outline-none focus:border-secondary cursor-pointer transition-all">
              <option value="">— Select team —</option>
              <option *ngFor="let t of teams" [value]="t">{{ t }}</option>
            </select>
          </div>

          <!-- Global Operator pill (click to flip) -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Operator</label>
            <button type="button"
              (click)="rule.operator = rule.operator === 'AND' ? 'OR' : 'AND'"
              [ngClass]="rule.operator === 'AND' ? 'bg-primary text-white border-primary/40' : 'bg-secondary text-white border-secondary/40'"
              class="h-9 px-5 rounded-lg text-xs font-extrabold cursor-pointer transition-all border shadow-sm tracking-wider select-none"
              title="Click to flip operator">{{ rule.operator }}</button>
          </div>

          <!-- Active toggle -->
          <label class="flex items-center gap-2.5 cursor-pointer ml-auto">
            <span class="text-xs font-semibold text-on-surface-variant">Active</span>
            <div class="relative">
              <input type="checkbox" [(ngModel)]="rule.isActive" class="sr-only peer" />
              <div class="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-success-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
            </div>
            <span [ngClass]="rule.isActive ? 'text-success-green font-bold' : 'text-on-surface-variant'" class="text-xs">
              {{ rule.isActive ? 'Live' : 'Draft' }}
            </span>
          </label>
        </div>

        <!-- ── Canvas + JSON preview ── -->
        <div class="flex-1 flex overflow-hidden">

          <!-- Designer canvas -->
          <div class="flex-1 overflow-y-auto dot-grid p-8 custom-scrollbar">
            <div class="max-w-2xl mx-auto space-y-0 pb-40">

              <!-- Empty state -->
              <div *ngIf="rule.terms.length === 0" class="text-center py-20 text-on-surface-variant text-xs">
                <svg class="w-12 h-12 mx-auto mb-4 opacity-25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6"/><path d="M9 12h6"/><path d="M9 15h4"/>
                </svg>
                <p class="font-bold text-sm text-on-surface">No conditions defined</p>
                <p class="opacity-60 mt-1">Select a term type below to build this rule</p>
              </div>

              <!-- Term blocks -->
              <ng-container *ngFor="let term of rule.terms; let i = index; let last = last">

                <!-- ── Term Card (Continuous Squircle Radius) ── -->
                <div class="bg-surface-container-lowest border-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                  [ngClass]="{
                    'border-primary/20': term.operator === 'AND' && term.termType === 'general',
                    'border-secondary/20': term.operator === 'OR' && term.termType === 'general',
                    'border-amber-500/20': term.termType === 'schedule'
                  }">

                  <!-- Term header -->
                  <div class="flex items-center gap-3 px-5 py-3 border-b border-outline-variant/60 rounded-t-[14px]"
                    [ngClass]="{
                      'bg-primary/[0.03]': term.operator === 'AND' && term.termType === 'general',
                      'bg-secondary/[0.03]': term.operator === 'OR' && term.termType === 'general',
                      'bg-amber-500/[0.03]': term.termType === 'schedule'
                    }">

                    <!-- Term label + type badge -->
                    <span class="text-xs font-bold text-on-surface-variant">Term {{ i + 1 }}</span>
                    <span class="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide select-none"
                      [ngClass]="term.termType === 'schedule'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant'">
                      {{ term.termType === 'schedule' ? '⏰ Schedule' : '⚙ General' }}
                    </span>

                    <!-- Operator toggle (general only) -->
                    <ng-container *ngIf="term.termType === 'general'">
                      <span class="text-xs text-on-surface-variant font-medium ml-2">Join by</span>
                      <div class="flex bg-surface-container-high p-0.5 rounded-lg border border-outline-variant/60 h-7 items-center shadow-sm">
                        <button type="button"
                          (click)="term.operator = 'AND'"
                          [ngClass]="term.operator === 'AND' ? 'bg-primary text-white font-bold shadow-sm' : 'text-on-surface-variant'"
                          class="px-3 h-6 rounded-md text-[10px] font-bold cursor-pointer transition-all border-none">AND</button>
                        <button type="button"
                          (click)="term.operator = 'OR'"
                          [ngClass]="term.operator === 'OR' ? 'bg-secondary text-white font-bold shadow-sm' : 'text-on-surface-variant'"
                          class="px-3 h-6 rounded-md text-[10px] font-bold cursor-pointer transition-all border-none">OR</button>
                      </div>
                    </ng-container>

                    <!-- Remove term -->
                    <button type="button" (click)="removeTerm(term.id)"
                      class="ml-auto p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all border-none bg-transparent" title="Remove block">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>

                  <!-- ── General: condition rows ── -->
                  <div *ngIf="term.termType === 'general'" class="p-5 space-y-3">
                    <ng-container *ngFor="let cond of term.conditions; let ci = index">
                      <!-- Operator badge between rows -->
                      <div *ngIf="ci > 0" class="flex items-center gap-2 py-0.5 pl-2">
                        <div class="text-[9px] font-bold px-2 py-0.5 rounded-md border tracking-wide select-none"
                          [ngClass]="{
                            'bg-primary/5 text-primary border-primary/10': term.operator === 'AND',
                            'bg-secondary/5 text-secondary border-secondary/10': term.operator === 'OR'
                          }">{{ term.operator }}</div>
                        <div class="flex-1 h-px border-t border-dashed border-outline-variant/60"></div>
                      </div>

                      <!-- Condition row -->
                      <div class="flex items-center gap-2.5 bg-white border border-outline-variant rounded-xl p-2.5 hover:border-outline-variant hover:shadow-sm transition-all group">
                        <svg class="w-3.5 h-3.5 text-outline-variant cursor-grab shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>
                        </svg>
                        <select [(ngModel)]="cond.field"
                          class="h-8 text-[11px] border border-outline-variant rounded-lg bg-surface-container-low font-mono min-w-[190px] focus:ring-1 focus:ring-primary focus:border-primary px-2 cursor-pointer transition-all">
                          <option *ngFor="let f of getFieldOptions()" [value]="f">{{ f }}</option>
                        </select>
                        <select [(ngModel)]="cond.op"
                          class="h-8 text-[11px] border border-outline-variant rounded-lg bg-surface-container-low font-bold text-center min-w-[90px] focus:ring-1 focus:ring-primary focus:border-primary px-2 cursor-pointer transition-all">
                          <option *ngFor="let op of operators" [value]="op">{{ op }}</option>
                        </select>
                        <input [(ngModel)]="cond.value" type="text" placeholder="value…"
                          class="h-8 text-[11px] border border-outline-variant rounded-lg px-3 font-mono focus:ring-1 focus:ring-secondary focus:border-secondary outline-none flex-1 min-w-[80px] bg-white transition-all" />
                        <button type="button" (click)="removeCondition(term.id, cond.id)"
                          class="text-on-surface-variant hover:text-red-600 p-1.5 rounded-lg cursor-pointer transition-colors border-none bg-transparent opacity-0 group-hover:opacity-100">
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </ng-container>

                    <!-- Add Condition -->
                    <button type="button" (click)="addCondition(term.id)"
                      class="mt-1 flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-secondary-hover cursor-pointer border-none bg-transparent px-3 py-2 rounded-lg hover:bg-secondary/5 transition-all">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
                      </svg>
                      Add condition
                    </button>
                  </div>

                  <!-- ── Schedule: date/time config (Apple Grid alignment) ── -->
                  <div *ngIf="term.termType === 'schedule' && term.schedule" class="p-5 space-y-5">

                    <!-- Time & Date Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <!-- Daily time range -->
                      <div>
                        <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                          <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Daily range
                        </label>
                        <div class="flex items-center justify-between bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2.5">
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">From</span>
                            <input type="time" [(ngModel)]="term.schedule.dailyFrom"
                              class="h-8 w-[115px] border border-outline-variant rounded-lg px-2 text-xs font-mono bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none cursor-pointer" />
                          </div>
                          <div class="w-2.5 h-px bg-outline-variant shrink-0"></div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">To</span>
                            <input type="time" [(ngModel)]="term.schedule.dailyTo"
                              class="h-8 w-[115px] border border-outline-variant rounded-lg px-2 text-xs font-mono bg-white focus:border-amber-400 focus:ring-1 focus:ring-amber-200 outline-none cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <!-- Yearly date range -->
                      <div>
                        <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                          <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          Active months (dd/mm)
                        </label>
                        <div class="flex items-center justify-between bg-surface-container-low border border-outline-variant/60 rounded-xl px-3 py-2.5">
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">From</span>
                            <input type="text" [(ngModel)]="term.schedule.yearlyFrom" placeholder="dd/mm" maxlength="5"
                              class="h-8 w-[72px] border border-outline-variant rounded-lg px-1.5 text-xs font-mono bg-white focus:border-amber-400 outline-none text-center" />
                          </div>
                          <div class="w-2.5 h-px bg-outline-variant shrink-0"></div>
                          <div class="flex items-center gap-1.5">
                            <span class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">To</span>
                            <input type="text" [(ngModel)]="term.schedule.yearlyTo" placeholder="dd/mm" maxlength="5"
                              class="h-8 w-[72px] border border-outline-variant rounded-lg px-1.5 text-xs font-mono bg-white focus:border-amber-400 outline-none text-center" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Days of week (Neutral Physical Toggles) -->
                    <div>
                      <label class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                        <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>
                        Weekly days
                      </label>
                      <div class="flex flex-wrap gap-2">
                        <button *ngFor="let day of daysOfWeek" type="button"
                          (click)="toggleDay(term, day)"
                          [ngClass]="isDayActive(term, day)
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-on-surface-variant border-outline-variant/60 hover:bg-slate-200/60'"
                          class="h-8 w-12 rounded-lg border text-xs font-bold cursor-pointer transition-all select-none">
                          {{ day }}
                        </button>
                      </div>
                    </div>
                  </div>

                </div><!-- end term card -->

                <!-- Global op connector between terms -->
                <div *ngIf="!last" class="flex flex-col items-center py-2.5 gap-0.5 select-none">
                  <div class="w-px h-4 bg-outline-variant/70"></div>
                  <div class="text-[10px] font-bold px-3 py-0.5 rounded-full border tracking-wide shadow-sm"
                    [ngClass]="rule.operator === 'AND' ? 'bg-primary text-white border-primary/60' : 'bg-secondary text-white border-secondary/60'">
                    {{ rule.operator }}
                  </div>
                  <div class="w-px h-4 bg-outline-variant/70"></div>
                </div>

              </ng-container>

              <!-- ── Add Term button with type picker ── -->
              <div [ngClass]="rule.terms.length > 0 ? 'mt-6' : 'mt-0'" class="relative">

                <!-- Closed: show single button -->
                <button *ngIf="!showAddTermMenu" type="button" (click)="showAddTermMenu = true"
                  class="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-outline-variant rounded-2xl text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all bg-transparent">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/>
                  </svg>
                  Add condition group
                </button>

                <!-- Open: type picker (Apple Card Panel) -->
                <div *ngIf="showAddTermMenu"
                  class="w-full border-2 border-primary/25 rounded-2xl overflow-hidden shadow-lg bg-surface-container-lowest animate-in fade-in zoom-in-95 duration-200">
                  <div class="px-5 py-3 bg-primary/[0.02] border-b border-outline-variant/60 flex items-center justify-between">
                    <span class="text-xs font-bold text-on-surface-variant">Select logic block type</span>
                    <button type="button" (click)="showAddTermMenu = false"
                      class="text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    </button>
                  </div>
                  <div class="flex gap-0 divide-x divide-outline-variant/60">

                    <!-- General option -->
                    <button type="button" (click)="addTerm('general')"
                      class="flex-1 flex flex-col items-center gap-2.5 px-4 py-6 hover:bg-primary/[0.03] cursor-pointer transition-all border-none bg-transparent group">
                      <div class="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all">
                        <svg class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>
                        </svg>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-primary">General conditions</div>
                        <div class="text-[10px] text-on-surface-variant mt-0.5">Filter on transaction context parameters</div>
                      </div>
                    </button>

                    <!-- Schedule option -->
                    <button type="button" (click)="addTerm('schedule')"
                      class="flex-1 flex flex-col items-center gap-2.5 px-4 py-6 hover:bg-amber-500/[0.04] cursor-pointer transition-all border-none bg-transparent group">
                      <div class="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-all">
                        <svg class="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-amber-800">Schedule constraints</div>
                        <div class="text-[10px] text-on-surface-variant mt-0.5">Filter on active operational windows</div>
                      </div>
                    </button>

                  </div>
                </div>
              </div><!-- end add term wrapper -->

            </div>

          </div><!-- end canvas -->

        </div><!-- end canvas row -->


      </div><!-- end main column -->

      <!-- ══════════════════════════════════════════════════════ -->
      <!-- Data Explorer sidebar (right)                         -->
      <!-- ══════════════════════════════════════════════════════ -->
      <aside class="w-64 bg-surface-container-lowest border-l border-outline-variant flex flex-col z-20 shadow-inner shrink-0">

        <!-- Header -->
        <div class="px-3 pt-3 pb-2 border-b border-outline-variant bg-surface-container">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-3.5 h-3.5 text-on-surface-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
            </svg>
            <h2 class="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-wider">Data Explorer</h2>
            <!-- selected count badge -->
            <span *ngIf="selectedFields.size > 0"
              class="ml-auto text-[9px] font-extrabold bg-secondary text-white px-1.5 py-0.5 rounded-full">
              {{ selectedFields.size }} added
            </span>
          </div>
          <!-- Search box -->
          <div class="relative">
            <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              [(ngModel)]="explorerSearch"
              type="text"
              placeholder="Search fields…"
              class="w-full h-7 pl-7 pr-2 text-[11px] border border-outline-variant rounded-lg bg-white focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none font-mono"
            />
            <button *ngIf="explorerSearch" (click)="explorerSearch = ''"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer border-none bg-transparent">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Field list -->
        <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <!-- no results -->
          <div *ngIf="getFilteredFields().length === 0" class="text-center py-8 text-on-surface-variant text-[11px]">
            <svg class="w-6 h-6 mx-auto mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            No fields match <strong>"{{ explorerSearch }}"</strong>
          </div>

          <div class="space-y-4">
            <div *ngFor="let entity of getFilteredEntities()">
              <!-- Entity header -->
              <div class="flex items-center gap-1.5 mb-1.5">
                <span class="w-2 h-2 rounded-full inline-block"
                  [ngClass]="{
                    'bg-primary':    entity === 'Transaction' || entity === 'User Context',
                    'bg-secondary':  entity === 'User',
                    'bg-purple-600': entity === 'Device'
                  }"></span>
                <span class="text-[10px] font-extrabold text-on-surface uppercase tracking-wide">{{ entity }}</span>
              </div>

              <!-- Fields -->
              <div class="ml-3 border-l border-outline-variant pl-3 space-y-1">
                <ng-container *ngFor="let f of fields">
                  <div *ngIf="f.entity === entity && fieldMatchesSearch(f)"
                    (click)="addConditionFromExplorer(f)"
                    class="flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all"
                    [ngClass]="isFieldSelected(f)
                      ? 'bg-secondary/10 border border-secondary/30 text-secondary'
                      : 'hover:bg-surface-container text-on-surface border border-transparent'"
                  >
                    <!-- icon: check if selected, arrow otherwise -->
                    <svg *ngIf="isFieldSelected(f)" class="w-3 h-3 text-secondary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg *ngIf="!isFieldSelected(f)" class="w-3 h-3 text-outline-variant group-hover:text-secondary shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>

                    <!-- name -->
                    <span class="font-mono text-[11px] truncate flex-1"
                      [ngClass]="isFieldSelected(f) ? 'text-secondary font-bold' : 'text-on-surface'"
                    >{{ f.name }}</span>

                    <!-- type badge -->
                    <span class="text-[9px] ml-auto px-1 rounded border font-mono shrink-0"
                      [ngClass]="isFieldSelected(f)
                        ? 'bg-secondary/10 text-secondary border-secondary/30'
                        : 'bg-surface-container text-on-surface-variant border-outline-variant'"
                    >{{ f.type }}</span>
                  </div>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </aside>

    </div>
  `
})
export class RuleSetsComponent implements OnInit {
  @Input() fields: SchemaField[] = [];

  operators    = OPERATORS;
  actions      = ACTIONS;
  teams        = TEAMS;
  daysOfWeek   = DAYS_OF_WEEK;

  jsonExpanded    = false;
  showAddTermMenu = false;
  explorerSearch  = '';
  selectedFields  = new Set<string>();

  rule: RuleGrammar = {
    name:        'Fraud Prevention Alpha',
    description: 'Flags high-risk transactions based on velocity and risk score',
    team:        'Risk & Fraud',
    operator:    'AND',
    terms:       [],
    thenAction:  'Flag for Review',
    thenReason:  'High Risk Transaction Detected',
    isActive:    true,
  };

  /* ── Lifecycle ────────────────────────────────────────────── */

  ngOnInit() {
    this.rule.terms = [
      {
        id: this.uid(), operator: 'OR', termType: 'general',
        conditions: [
          { id: this.uid(), field: 'Transaction.amount_usd', op: '>', value: '10000' },
          { id: this.uid(), field: 'User.risk_score', op: '>', value: '85' },
        ]
      },
      {
        id: this.uid(), operator: 'AND', termType: 'schedule',
        conditions: [],
        schedule: { ...DEFAULT_SCHEDULE }
      }
    ];
  }

  /* ── Term operations ──────────────────────────────────────── */

  addTerm(type: 'general' | 'schedule') {
    const newTerm: Term = {
      id: this.uid(),
      operator: 'AND',
      termType: type,
      conditions: type === 'general'
        ? [{ id: this.uid(), field: DEFAULT_FIELDS[0], op: '>', value: '' }]
        : [],
      schedule: type === 'schedule' ? { ...DEFAULT_SCHEDULE } : undefined,
    };
    this.rule.terms = [...this.rule.terms, newTerm];
    this.showAddTermMenu = false;
  }

  removeTerm(termId: string) {
    this.rule.terms = this.rule.terms.filter(t => t.id !== termId);
  }

  /* ── Condition operations ─────────────────────────────────── */

  addCondition(termId: string) {
    this.rule.terms = this.rule.terms.map(t => {
      if (t.id !== termId) return t;
      return { ...t, conditions: [...t.conditions, { id: this.uid(), field: DEFAULT_FIELDS[0], op: '==', value: '' }] };
    });
  }

  removeCondition(termId: string, condId: string) {
    this.rule.terms = this.rule.terms.map(t => {
      if (t.id !== termId) return t;
      return { ...t, conditions: t.conditions.filter(c => c.id !== condId) };
    });
  }

  addConditionFromExplorer(field: SchemaField) {
    // Add General term if none exist or last term is a schedule
    const last = this.rule.terms[this.rule.terms.length - 1];
    if (!last || last.termType === 'schedule') {
      this.addTerm('general');
    }
    const targetId = this.rule.terms[this.rule.terms.length - 1].id;
    this.rule.terms = this.rule.terms.map(t => {
      if (t.id !== targetId) return t;
      return { ...t, conditions: [...t.conditions, { id: this.uid(), field: `${field.entity}.${field.name}`, op: '==', value: '' }] };
    });
    // Mark as selected
    this.selectedFields = new Set([...this.selectedFields, `${field.entity}.${field.name}`]);
  }

  isFieldSelected(field: SchemaField): boolean {
    return this.selectedFields.has(`${field.entity}.${field.name}`);
  }

  fieldMatchesSearch(field: SchemaField): boolean {
    if (!this.explorerSearch) return true;
    const q = this.explorerSearch.toLowerCase();
    return field.name.toLowerCase().includes(q) || field.entity.toLowerCase().includes(q) || field.type.toLowerCase().includes(q);
  }

  getFilteredFields(): SchemaField[] {
    return this.fields.filter(f => this.fieldMatchesSearch(f));
  }

  getFilteredEntities(): string[] {
    return this.getEntities().filter(e => this.fields.some(f => f.entity === e && this.fieldMatchesSearch(f)));
  }

  /* ── Schedule helpers ─────────────────────────────────────── */

  toggleDay(term: Term, day: string) {
    if (!term.schedule) return;
    const days = term.schedule.daysOfWeek;
    term.schedule = {
      ...term.schedule,
      daysOfWeek: days.includes(day) ? days.filter(d => d !== day) : [...days, day]
    };
  }

  isDayActive(term: Term, day: string): boolean {
    return !!term.schedule?.daysOfWeek.includes(day);
  }

  /* ── Utilities ────────────────────────────────────────────── */

  uid(): string { return Math.random().toString(36).slice(2, 10); }

  getFieldOptions(): string[] {
    return this.fields?.length ? this.fields.map(f => `${f.entity}.${f.name}`) : DEFAULT_FIELDS;
  }

  getEntities(): string[] {
    return this.fields?.length ? [...new Set(this.fields.map(f => f.entity))] : ['Transaction', 'User', 'Device'];
  }

  getTotalConditions(): number {
    return this.rule.terms.reduce((s, t) => s + t.conditions.length, 0);
  }

  getJsonPreview(): string {
    return JSON.stringify({
      name:        this.rule.name,
      description: this.rule.description,
      team:        this.rule.team,
      operator:    this.rule.operator,
      terms: this.rule.terms.map(t => ({
        termType: t.termType,
        ...(t.termType === 'general' ? {
          operator:   t.operator,
          conditions: t.conditions.map(c => ({ field: c.field, op: c.op, value: c.value }))
        } : {
          schedule: t.schedule
        })
      })),
      then: { action: this.rule.thenAction, reason: this.rule.thenReason }
    }, null, 2);
  }

  isGeneratingName = false;

  async generateAIName() {
    this.isGeneratingName = true;
    try {
      const body = {
        terms: this.rule.terms.map(t => ({
          termType: t.termType,
          ...(t.termType === 'general' ? {
            operator:   t.operator,
            conditions: t.conditions.map(c => ({ field: c.field, op: c.op, value: c.value }))
          } : {
            schedule: t.schedule
          })
        })),
        operator: this.rule.operator
      };

      const res = await fetch('http://localhost:65421/api/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data && data.name) {
        this.rule.name = data.name;
      }
    } catch (err) {
      console.error('Failed to generate AI name:', err);
    } finally {
      this.isGeneratingName = false;
    }
  }

  async handleSave() {
    try {
      const body = {
        rule_id: 'rule_' + this.rule.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: this.rule.name,
        description: this.rule.description,
        team: this.rule.team,
        terms: this.rule, // save the full rule configuration
        is_active: this.rule.isActive
      };

      const res = await fetch('http://localhost:65421/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const saved = await res.json();
      console.log('Saved rule to PostgreSQL:', saved);
      alert(`Rule "${this.rule.name}" successfully saved to PostgreSQL database!`);
    } catch (err) {
      console.error('Failed to save rule to PostgreSQL:', err);
      alert('Failed to save rule to DB.');
    }
  }
}
