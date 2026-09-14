import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RuleStoreService } from '../../services/rule-store.service';
import { ActiveTab } from '../../models/types';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'block' },
  template: `
    <aside class="w-[280px] h-screen bg-surface-container-low dark:bg-primary-container border-r border-outline-variant flex flex-col fixed left-0 top-0 bottom-0 z-50">
      <!-- Header -->
      <div class="p-5 border-b border-outline-variant shrink-0">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-serif text-lg font-bold">
            R
          </div>
          <div>
            <h1 class="font-serif text-lg font-bold text-primary leading-tight">Rule Engine</h1>
            <p class="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Enterprise v4.2
            </p>
          </div>
        </div>
        <button
          (click)="newRule.emit()"
          class="w-full bg-primary text-white hover:bg-primary-hover transition-all duration-150 py-2 px-3 rounded flex items-center justify-center gap-2 font-medium cursor-pointer active:scale-98 shadow-sm text-sm"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          <span>New Rule</span>
        </button>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 overflow-y-auto py-3 custom-scrollbar">
        <!-- Section: Rules & Schema -->
        <ul class="flex flex-col gap-0.5 px-2">
          <li *ngFor="let item of menuItems">
            <button
              (click)="activeTabChange.emit(item.id)"
              [ngClass]="{
                'bg-primary text-white font-semibold shadow-sm': activeTab === item.id,
                'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high': activeTab !== item.id
              }"
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left"
            >
              <div [innerHTML]="item.svg" class="w-4 h-4 shrink-0" [ngClass]="{'text-white': activeTab === item.id, 'text-on-surface-variant': activeTab !== item.id}"></div>
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>

        <!-- Section: Testing & Validation Studio -->
        <div class="mt-4 px-2">
          <div class="px-4 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant opacity-60">
            Testing & Validation
          </div>

          <!-- Selector for Active Test Rule -->
          <div class="px-3 py-2 bg-surface-container/50 border border-outline-variant/60 rounded-xl mb-2.5 mt-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Target Test Rule</label>
            <select
              [ngModel]="store.selectedRuleId()"
              (ngModelChange)="store.selectRule($event)"
              class="w-full h-8 text-xs border border-outline-variant rounded-lg bg-white px-2 focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option *ngFor="let r of store.allRules()" [value]="r.rule_id">{{ r.name }}</option>
            </select>
          </div>

          <!-- Testing Sub-navigation tabs -->
          <ul class="flex flex-col gap-0.5">
            <li *ngFor="let tab of validatorTabs">
              <button
                (click)="selectValidatorTab(tab.id)"
                [ngClass]="{
                  'bg-secondary text-white font-semibold shadow-sm': activeTab === 'validator' && store.activeTab() === tab.id,
                  'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high': !(activeTab === 'validator' && store.activeTab() === tab.id)
                }"
                class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left"
              >
                <div [innerHTML]="tab.svg" class="w-4 h-4 shrink-0" [ngClass]="{'text-white': activeTab === 'validator' && store.activeTab() === tab.id, 'text-on-surface-variant': !(activeTab === 'validator' && store.activeTab() === tab.id)}"></div>
                <span>{{ tab.label }}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer Navigation -->
      <div class="p-4 border-t border-outline-variant shrink-0">
        <ul class="flex flex-col gap-0.5 mb-4">
          <li *ngFor="let item of footerItems">
            <button
              (click)="activeTabChange.emit(item.id)"
              [ngClass]="{
                'bg-primary text-white font-semibold shadow-sm': activeTab === item.id,
                'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high': activeTab !== item.id
              }"
              class="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer text-left"
            >
              <div [innerHTML]="item.svg" class="w-4 h-4 shrink-0" [ngClass]="{'text-white': activeTab === item.id, 'text-on-surface-variant': activeTab !== item.id}"></div>
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>

        <!-- User Card -->
        <div class="flex items-center gap-3 pt-3 border-t border-outline-variant">
          <div class="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
            <img
              class="object-cover w-full h-full"
              alt="Logic Author avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQO6UJ0kM4jzaarCjzFq2wK6MsvyvE7l5Wv8mTUhbHYfNM9H2FcUVjZndOPqqtRfSzmSwO-8I223DE17XaE8Ybg1WSb8SXgd_MzG_aXTYzxvtilizt3PVEyTnTQmLsZ5itryDWqHpOubqDO5m79INZhhhhIPgBEONQ4mzZffkNY0r0zzpEKXeZpOcetG8y1KUV4-bHadf7LaKL8EtY-ODhaDDk6xCJBq1OqkCbZjA6BpS5JZ8nLnU5MtKPtbNYrgUoCifyBtLUHZb4"
            />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-on-surface truncate">Logic Author</div>
            <div class="text-[10px] text-on-surface-variant opacity-80 truncate">Admin Console</div>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() activeTab: string = '';
  @Output() activeTabChange = new EventEmitter<string>();
  @Output() newRule = new EventEmitter<void>();

  readonly store = inject(RuleStoreService);

  menuItems = [
    {
      id: 'schema',
      label: 'Data Schema',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`
    },
    {
      id: 'rulesets',
      label: 'Rules',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`
    },
    {
      id: 'functions',
      label: 'Functions',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M18 7V5H6l6 7-6 7h12v-2"/></svg>`
    },
    {
      id: 'history',
      label: 'History',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`
    }
  ];

  validatorTabs = [
    {
      id: 'overview',
      label: 'Dashboard',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`
    },
    {
      id: 'test-data',
      label: 'Test Rule',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`
    },
    {
      id: 'generated',
      label: 'Test Cases',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5"/><path d="M12 2v10"/><path d="m9 12 3 3 3-3"/><path d="M9 6h6"/></svg>`
    },
    {
      id: 'test-runs',
      label: 'Evaluate',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`
    },
    {
      id: 'coverage',
      label: 'Coverage',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
    },
    {
      id: 'validate',
      label: 'Validate',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    },
    {
      id: 'library',
      label: 'Library',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" x2="14" y1="12" y2="12"/></svg>`
    }
  ];

  footerItems = [
    {
      id: 'settings',
      label: 'Settings',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
    },
    {
      id: 'support',
      label: 'Support',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`
    }
  ];

  selectValidatorTab(tabId: string) {
    this.store.activeTab.set(tabId as ActiveTab);
    this.activeTabChange.emit('validator');
  }
}
