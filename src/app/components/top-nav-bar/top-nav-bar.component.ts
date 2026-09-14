import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-nav-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'block shrink-0' },
  template: `
    <header class="bg-surface-container-lowest text-primary h-14 w-full flex items-center justify-between border-b border-outline-variant sticky top-0 z-40 px-6">
      <!-- Left side: Brand/Title & Search -->
      <div class="flex items-center gap-6 flex-1 max-w-xl">
        <span class="text-md font-bold text-on-surface whitespace-nowrap">{{ title }}</span>
        
        <!-- Search Input -->
        <div class="relative w-full max-w-xs">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            class="w-full pl-9 pr-3 py-1 bg-surface-container rounded border-none text-xs focus:ring-1 focus:ring-primary outline-none h-8 text-on-surface placeholder-on-surface-variant"
            [placeholder]="searchPlaceholder"
            type="text"
            [ngModel]="searchValue"
            (ngModelChange)="searchValueChange.emit($event)"
          />
        </div>
      </div>

      <!-- Center navigation -->
      <nav class="flex items-center gap-6 h-full font-label-caps text-xs">
        <button
          *ngFor="let group of groups"
          (click)="activeNavGroupChange.emit(group)"
          [ngClass]="{
            'text-primary font-bold border-b-2 border-primary': activeNavGroup === group,
            'text-on-surface-variant hover:text-on-surface font-medium': activeNavGroup !== group
          }"
          class="h-full flex items-center px-2 cursor-pointer transition-all duration-150 relative"
        >
          {{ group }}
        </button>
      </nav>

      <!-- Right side action buttons -->
      <div class="flex items-center gap-4">
        <!-- Sync Status & Notifications -->
        <div class="flex items-center gap-2 text-on-surface-variant">
          <button class="w-8 h-8 rounded hover:bg-surface-container transition-all flex items-center justify-center cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
          </button>
          <button class="w-8 h-8 rounded hover:bg-surface-container transition-all flex items-center justify-center cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.3.27A6.47 6.47 0 0 0 8.5 8.5c-2 0-3.6 1.4-4 3.2C2.1 12.3 1 13.9 1 15.5A3.5 3.5 0 0 0 4.5 19Z"/>
            </svg>
          </button>
        </div>

        <!-- Dynamic Buttons -->
        <div class="flex items-center gap-2">
          <button class="px-3 py-1 rounded border border-outline-variant text-on-surface font-semibold text-xs hover:bg-surface-container transition-all h-8 flex items-center cursor-pointer">
            Version
          </button>
          <button
            (click)="publish.emit()"
            class="px-4 py-1 rounded bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-all h-8 flex items-center cursor-pointer shadow-sm"
          >
            Publish
          </button>
        </div>

        <!-- Profile Avatar -->
        <img
          alt="Admin profile"
          class="w-8 h-8 rounded-full border border-outline-variant object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPMdrrqWyzeOWydYDZ5GiEusaaccNuwwSzgUaeSCNdY0rzEod9mZhgtdB-AexNkKdDmk8VMnw50e3_A57G4e246PIAsj5STVCYnoX1VBbJ979-dCzxGdiAe2pmicSzaiZhM31RIDWa_lJ6tVD4mp6-nihoNTdiGyBCJQtB_81TXkox0ForwrvheiRC9oRco748uZGIhs4yQFKIHmiU_V54KTaAHPGPSrwZpxhfK6a_HlM26-1dqzVadUjIYlueVBZj_pfl_4PeL1Ea"
        />
      </div>
    </header>
  `
})
export class TopNavBarComponent {
  @Input() title: string = '';
  @Input() activeNavGroup: 'Drafts' | 'Staging' | 'Production' = 'Drafts';
  @Output() activeNavGroupChange = new EventEmitter<'Drafts' | 'Staging' | 'Production'>();
  @Input() searchPlaceholder: string = 'Search rules...';
  @Input() searchValue: string = '';
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() publish = new EventEmitter<void>();

  groups: ('Drafts' | 'Staging' | 'Production')[] = ['Drafts', 'Staging', 'Production'];
}
