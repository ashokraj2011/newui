import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchemaField } from '../../types';

@Component({
  selector: 'app-data-schema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-1 flex flex-col overflow-hidden' },
  template: `
    <div class="flex-1 overflow-y-auto p-6 bg-background flex flex-col gap-6 max-h-[calc(100vh-56px)] custom-scrollbar animate-fade-in">
      <!-- Page Header -->
      <div class="bg-white border border-outline-variant rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 class="font-serif text-lg font-bold text-on-surface">Data Schema Explorer</h2>
          <p class="text-xs text-on-surface-variant leading-relaxed mt-1">
            Define attributes, upload source glossaries (database, API, session, rulemetadata) and prepare schemas for rule authoring.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Side: Manage Attributes (Declare or Upload) -->
        <div class="bg-white border border-outline-variant rounded-xl p-5 shadow-xs h-fit">
          <!-- Mode Segment Control -->
          <div class="flex p-0.5 bg-surface-container rounded-lg mb-4 select-none">
            <button
              (click)="schemaMode = 'declare'"
              [class.bg-white]="schemaMode === 'declare'"
              [class.shadow-sm]="schemaMode === 'declare'"
              [class.text-primary]="schemaMode === 'declare'"
              class="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-on-surface-variant cursor-pointer text-center"
            >
              Manual Declare
            </button>
            <button
              (click)="schemaMode = 'upload'"
              [class.bg-white]="schemaMode === 'upload'"
              [class.shadow-sm]="schemaMode === 'upload'"
              [class.text-primary]="schemaMode === 'upload'"
              class="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all text-on-surface-variant cursor-pointer text-center"
            >
              Upload Glossary
            </button>
          </div>

          <!-- Tab Pane 1: Manual Declare -->
          <div *ngIf="schemaMode === 'declare'" class="space-y-4 animate-scale-up">
            <div>
              <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Attribute Name
              </label>
              <input
                type="text"
                placeholder="e.g. age"
                [(ngModel)]="newFieldName"
                class="w-full h-8 px-3 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-mono"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Entity Namespace
              </label>
              <select
                [(ngModel)]="newFieldEntity"
                class="w-full h-8 px-2 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer"
              >
                <!-- Dynamically list current namespaces plus defaults -->
                <option *ngFor="let ns of getUniqueNamespaces()" [value]="ns">{{ ns }}</option>
                <option value="+ Create Namespace">+ Create Namespace...</option>
              </select>
            </div>

            <!-- Create Custom Namespace Inline -->
            <div *ngIf="newFieldEntity === '+ Create Namespace'" class="animate-fade-in">
              <label class="block text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">
                New Namespace Name
              </label>
              <input
                type="text"
                placeholder="e.g. customer"
                [(ngModel)]="customNamespaceName"
                class="w-full h-8 px-3 text-xs border border-primary rounded bg-white text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Data Source Type
              </label>
              <select
                [(ngModel)]="newFieldDataSource"
                class="w-full h-8 px-2 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer"
              >
                <option value="session">session (Active Request Payload)</option>
                <option value="database">database (Relational Store)</option>
                <option value="api">api (External Microservice)</option>
                <option value="rulemetadata">rulemetadata (Static Engine Info)</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Data Type
              </label>
              <select
                [(ngModel)]="newFieldType"
                class="w-full h-8 px-2 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none cursor-pointer font-mono"
              >
                <option value="str">str (String)</option>
                <option value="num">num (Decimal/Float)</option>
                <option value="int">int (Integer)</option>
                <option value="bool">bool (Boolean)</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                Description
              </label>
              <textarea
                placeholder="Describe attribute purpose..."
                [(ngModel)]="newFieldDesc"
                rows="3"
                class="w-full p-3 text-xs border border-outline-variant rounded bg-white text-on-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none resize-none"
              ></textarea>
            </div>

            <button
              (click)="handleAddField()"
              class="w-full h-8 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary-hover transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              <span>Add Attribute</span>
            </button>
          </div>

          <!-- Tab Pane 2: Upload Glossary -->
          <div *ngIf="schemaMode === 'upload'" class="space-y-4 animate-scale-up">
            <div
              (dragover)="dragOver = true; $event.preventDefault()"
              (dragleave)="dragOver = false"
              (drop)="dragOver = false; $event.preventDefault(); onDrop($event)"
              [ngClass]="{'border-primary bg-primary/5': dragOver}"
              class="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-all duration-200 select-none bg-surface-container-lowest"
              (click)="fileInput.click()"
            >
              <input #fileInput type="file" (change)="onFileSelected($event)" accept=".json" class="hidden" />
              <svg class="w-8 h-8 mx-auto text-outline-variant mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p class="text-xs font-bold text-on-surface">Click to browse or drop Glossary JSON here</p>
              <p class="text-[10px] text-on-surface-variant mt-1">Accepts Glossary structures with database, api, session, or rulemetadata sources</p>
            </div>

            <!-- Upload summary -->
            <div *ngIf="parsedSummary" class="bg-surface-container-low border border-outline-variant rounded-xl p-3.5 space-y-3 animate-fade-in">
              <div class="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>File Loaded:</span>
                <span class="font-mono text-xs font-semibold text-primary truncate max-w-[150px]" [title]="fileName">{{ fileName }}</span>
              </div>

              <!-- Stats grids -->
              <div class="grid grid-cols-3 gap-2 py-1 text-center border-t border-b border-outline-variant/60 my-2">
                <div>
                  <div class="text-lg font-black text-primary">{{ parsedSummary.datasources.length }}</div>
                  <div class="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Sources</div>
                </div>
                <div>
                  <div class="text-lg font-black text-secondary">{{ parsedSummary.namespacesCount }}</div>
                  <div class="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Namespaces</div>
                </div>
                <div>
                  <div class="text-lg font-black text-purple-600">{{ parsedSummary.attributesCount }}</div>
                  <div class="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Attributes</div>
                </div>
              </div>

              <!-- Datasources visual summary tags -->
              <div>
                <div class="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Source categories:</div>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span *ngFor="let ds of parsedSummary.datasources"
                    class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border font-mono"
                    [ngClass]="{
                      'bg-blue-50 text-blue-700 border-blue-200': ds === 'session',
                      'bg-green-50 text-green-700 border-green-200': ds === 'database',
                      'bg-purple-50 text-purple-700 border-purple-200': ds === 'api',
                      'bg-amber-50 text-amber-700 border-amber-200': ds === 'rulemetadata'
                    }"
                  >{{ ds }}</span>
                </div>
              </div>

              <button
                (click)="importGlossary()"
                class="w-full h-8 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 mt-3 cursor-pointer"
              >
                <span>Import & Merge Glossary</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Active Declared Attributes list -->
        <div class="lg:col-span-2 space-y-6">
          <div *ngFor="let entityName of entities" class="bg-white border border-outline-variant rounded-xl p-5 shadow-xs animate-fade-in">
            <h3 class="text-sm font-bold text-on-surface mb-3 flex items-center gap-2 select-none">
              <!-- Context icon -->
              <svg class="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              <span>{{ entityName }} Namespace</span>
              <span class="text-xs bg-surface-container px-2 py-0.5 rounded font-mono text-on-surface-variant">
                {{ getEntityFields(entityName).length }} attributes
              </span>
            </h3>

            <div class="divide-y divide-outline-variant">
              <div
                *ngFor="let field of getEntityFields(entityName)"
                class="py-3 flex items-start justify-between gap-4 hover:bg-surface-container-low/30 transition-all rounded-lg px-2"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-mono text-xs font-bold text-on-surface">{{ field.name }}</span>
                    <!-- Type Badge -->
                    <span class="font-mono text-[9px] font-extrabold uppercase tracking-wider bg-surface-container border border-outline-variant px-1.5 py-0.5 rounded text-on-surface-variant">
                      {{ field.type }}
                    </span>
                    <!-- Source Badge -->
                    <span *ngIf="field.datasource"
                      class="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      [ngClass]="{
                        'bg-blue-50 text-blue-700 border border-blue-200': field.datasource === 'session',
                        'bg-green-50 text-green-700 border border-green-200': field.datasource === 'database',
                        'bg-purple-50 text-purple-700 border border-purple-200': field.datasource === 'api',
                        'bg-amber-50 text-amber-700 border border-amber-200': field.datasource === 'rulemetadata'
                      }"
                    >{{ field.datasource }}</span>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-1.5 leading-relaxed font-sans">
                    {{ field.description }}
                  </p>
                </div>

                <button
                  (click)="handleDeleteField(field.name, field.entity)"
                  class="p-1.5 text-on-surface-variant hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer shrink-0"
                  title="Delete from schema"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DataSchemaComponent {
  @Input() fields: SchemaField[] = [];
  @Output() fieldsChange = new EventEmitter<SchemaField[]>();

  // Schema declaration view mode
  schemaMode: 'declare' | 'upload' = 'declare';

  // Manual Declare inputs
  newFieldName: string = '';
  newFieldType: SchemaField['type'] = 'str';
  newFieldEntity: string = 'customer';
  customNamespaceName: string = '';
  newFieldDataSource: 'session' | 'database' | 'api' | 'rulemetadata' = 'session';
  newFieldDesc: string = '';

  // Glossary uploader state variables
  dragOver = false;
  fileName: string | null = null;
  uploadedGlossary: any = null;
  parsedSummary: {
    datasources: string[];
    namespacesCount: number;
    attributesCount: number;
  } | null = null;

  // Compute active unique entities/namespaces dynamically from schema data
  get entities(): string[] {
    const list = this.fields.map(f => f.entity);
    return [...new Set(list)];
  }

  getUniqueNamespaces(): string[] {
    const list = this.fields.map(f => f.entity);
    const set = new Set(list);
    // Seed standard defaults if not present
    set.add('customer');
    set.add('Transaction');
    set.add('User Context');
    return Array.from(set);
  }

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
        // Overwrite initial state with db state
        this.fields = fieldsFromDb;
        this.fieldsChange.emit(this.fields);
      }
    } catch (err) {
      console.error('Failed to load glossary from PostgreSQL:', err);
    }
  }

  getEntityFields(entity: string): SchemaField[] {
    return this.fields.filter(f => f.entity === entity);
  }

  async handleAddField() {
    const name = this.newFieldName.trim().toLowerCase();
    if (!name) return;

    let targetEntity = this.newFieldEntity;
    if (this.newFieldEntity === '+ Create Namespace') {
      const customNsName = this.customNamespaceName.trim();
      if (!customNsName) {
        alert('Please enter a valid namespace name!');
        return;
      }
      targetEntity = customNsName;
    }

    if (this.fields.some(f => f.name === name && f.entity === targetEntity)) {
      alert('Field already exists on this Entity namespace!');
      return;
    }

    const newField: SchemaField = {
      name,
      type: this.newFieldType,
      entity: targetEntity,
      description: this.newFieldDesc.trim() || 'Custom declared schema element.',
      datasource: this.newFieldDataSource
    };

    // Save to PostgreSQL
    try {
      await fetch('http://localhost:65421/api/glossary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newField.name,
          type: newField.type,
          entity: newField.entity,
          description: newField.description,
          datasource: newField.datasource,
          business_key: null
        })
      });
    } catch (err) {
      console.error('Failed to save glossary field to DB:', err);
    }

    const updated = [...this.fields, newField];
    this.fieldsChange.emit(updated);

    this.newFieldName = '';
    this.newFieldDesc = '';
    this.customNamespaceName = '';
    // reset inline option if created
    if (this.newFieldEntity === '+ Create Namespace') {
      this.newFieldEntity = targetEntity;
    }
  }

  async handleDeleteField(name: string, entity: string) {
    // Delete from PostgreSQL
    try {
      await fetch(`http://localhost:65421/api/glossary/${entity}/${name}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete glossary field from DB:', err);
    }

    const updated = this.fields.filter(f => !(f.name === name && f.entity === entity));
    this.fieldsChange.emit(updated);
  }

  // drag-and-drop glossary loaders
  onDrop(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        this.parseGlossary(json);
        this.fileName = file.name;
      } catch (err) {
        alert('Failed to parse file. Please upload a valid JSON format!');
      }
    };
    reader.readAsText(file);
  }

  private parseGlossary(data: any) {
    if (!Array.isArray(data)) {
      alert('Glossary JSON format incorrect! Root must be an array of datasources.');
      return;
    }

    this.uploadedGlossary = data;
    const datasourcesSet = new Set<string>();
    let namespacesCount = 0;
    let attributesCount = 0;

    data.forEach((item: any) => {
      if (item.datasource) datasourcesSet.add(item.datasource);
      if (Array.isArray(item.namespaces)) {
        namespacesCount += item.namespaces.length;
        item.namespaces.forEach((ns: any) => {
          if (Array.isArray(ns.attributeList)) {
            attributesCount += ns.attributeList.length;
          }
        });
      }
    });

    this.parsedSummary = {
      datasources: Array.from(datasourcesSet),
      namespacesCount,
      attributesCount
    };
  }

  async importGlossary() {
    if (!this.uploadedGlossary) return;

    const newFields: SchemaField[] = [];
    this.uploadedGlossary.forEach((item: any) => {
      const ds = item.datasource || 'session';
      if (Array.isArray(item.namespaces)) {
        item.namespaces.forEach((ns: any) => {
          const entityName = ns.name || 'custom';
          const businessKey = ns.businessKey || '';
          if (Array.isArray(ns.attributeList)) {
            ns.attributeList.forEach((attr: any) => {
              const field: SchemaField = {
                name: attr.name,
                type: attr.type || 'str',
                entity: entityName,
                description: `Imported from glossary source [${ds}]. Business Key: ${businessKey || 'none'}.`,
                datasource: ds,
                businessKey: businessKey
              };
              // Filter internal array duplicates
              if (!newFields.some(f => f.name === field.name && f.entity === field.entity)) {
                newFields.push(field);
              }
            });
          }
        });
      }
    });

    // Save each imported field to PostgreSQL
    for (const field of newFields) {
      try {
        await fetch('http://localhost:65421/api/glossary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: field.name,
            type: field.type,
            entity: field.entity,
            description: field.description,
            datasource: field.datasource,
            business_key: field.businessKey || null
          })
        });
      } catch (err) {
        console.error('Failed to save imported field to DB:', err);
      }
    }

    // Merge with currently loaded list avoiding duplication
    const merged = [...this.fields];
    newFields.forEach(nf => {
      if (!merged.some(f => f.name === nf.name && f.entity === nf.entity)) {
        merged.push(nf);
      }
    });

    this.fieldsChange.emit(merged);

    // Reset upload state
    this.uploadedGlossary = null;
    this.parsedSummary = null;
    this.fileName = null;
    this.schemaMode = 'declare';
    alert('Glossary imported successfully!');
  }
}
