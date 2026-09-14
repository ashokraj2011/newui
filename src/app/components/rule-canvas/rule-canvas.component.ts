import {
  Component, Input, Output, EventEmitter,
  OnInit, HostListener, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasNode, CanvasConnection } from '../../types';

/* ------------------------------------------------------------------ */
/*  Local Grammar Types                                                 */
/* ------------------------------------------------------------------ */
interface FlowCondition {
  id: string;
  field: string;
  op: string;
  value: string;
}

interface FlowTerm {
  id: string;
  operator: 'AND' | 'OR';
  conditions: FlowCondition[];
}

interface DecisionLogic {
  operator: 'AND' | 'OR';
  terms: FlowTerm[];
}

interface ExtCanvasNode extends CanvasNode {
  logic?: string;
  action?: string;
  actionReason?: string;
  decisionLogic?: DecisionLogic;
  portLabel?: string; // for Route nodes
  inputSchema?: string;
  outputSchema?: string;
  selectionLogic?: string;
  exitFlow?: boolean;
  exitValue?: string;
  transformFunction?: string;
  transformArguments?: string;
  transformTargetVariable?: string;
  evaluationContext?: 'chained' | 'source';
}

interface ExtConnection extends CanvasConnection {
  label?: string; // 'YES' | 'NO' | ''
}

const FIELD_OPTIONS = [
  'Transaction.amount_usd', 'Transaction.merchant_mcc',
  'Transaction.device_velocity_1h', 'Transaction.currency',
  'User.risk_score', 'User.account_age_days',
  'User.user_id', 'User.geo_match',
];
const OP_OPTIONS = ['>', '<', '>=', '<=', '==', '!=', 'in', 'not_in', 'contains'];
const ROUTE_ACTIONS = [
  'Approve', 'Decline Transaction', 'Flag for Review',
  'Route to Analyst', 'Send Alert', 'Trigger Webhook',
];
const FUNCTION_OPTIONS = [
  { id: '', name: '— Select transformation function —' },
  { id: 'is_between', name: 'IS_BETWEEN(target_date, start_date, end_date)' },
  { id: 'equals', name: 'EQUALS(attribute, value)' },
  { id: 'in_array', name: 'IN_ARRAY(target, [list_values])' },
  { id: 'sum', name: 'SUM(list, field)' },
  { id: 'avg', name: 'AVG(list, field)' },
  { id: 'count', name: 'COUNT(list)' },
  { id: 'min', name: 'MIN(list, field)' },
  { id: 'max', name: 'MAX(list, field)' },
];
const NODE_WIDTH  = 224; // px — must stay in sync with w-56 (14rem = 224px)
const NODE_HEIGHT = 100; // approx, used for port centre calc

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'app-rule-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'flex-1 flex flex-col overflow-hidden relative' },
  template: `
    <div class="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest max-h-[calc(100vh-56px)]">
      <div class="flex-grow flex overflow-hidden">

        <!-- ========================================================= -->
        <!-- LEFT: Node Library                                         -->
        <!-- ========================================================= -->
        <aside class="bg-surface-taupe border-r border-border-subtle w-[260px] flex flex-col h-full shrink-0 z-40">
          <div class="p-4 border-b border-border-subtle">
            <h2 class="font-serif text-lg font-bold text-primary">Rule Canvas</h2>
            <p class="text-on-surface-variant text-[11px] mt-0.5 uppercase font-bold tracking-wider opacity-70">Flow Designer</p>
          </div>

          <div class="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
            <p class="text-[10px] font-extrabold text-on-surface-variant mb-2 px-2 uppercase tracking-wider">Node Library</p>

            <!-- library nodes -->
            <ng-container *ngFor="let lib of libraryNodes">
              <button
                (click)="addNode(lib.type)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container transition-colors text-left cursor-pointer w-full border border-transparent hover:border-border-subtle"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" [ngClass]="lib.iconBg">
                  <span [innerHTML]="lib.icon" class="w-4 h-4 flex items-center justify-center"></span>
                </div>
                <div>
                  <div class="font-bold text-xs text-on-surface">{{ lib.label }}</div>
                  <div class="text-[10px] text-on-surface-variant">{{ lib.hint }}</div>
                </div>
              </button>
            </ng-container>
          </div>

          <div class="p-3 border-t border-border-subtle space-y-2">
            <button
              (click)="clearCanvas()"
              class="w-full border border-border-subtle text-on-surface-variant hover:bg-red-50 hover:text-red-600 hover:border-red-300 py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
              Clear Canvas
            </button>
          </div>
        </aside>

        <!-- ========================================================= -->
        <!-- MAIN: Canvas Viewport                                      -->
        <!-- ========================================================= -->
        <main
          #canvasEl
          class="flex-1 relative bg-surface-container-lowest dot-grid overflow-hidden select-none"
          (mousedown)="onCanvasMouseDown($event)"
          (mousemove)="onCanvasMouseMove($event)"
          (mouseup)="onCanvasMouseUp($event)"
          (mouseleave)="onCanvasMouseUp($event)"
        >
          <!-- Flow title badge -->
          <div class="absolute top-4 left-4 z-10 bg-white border border-border-subtle p-2.5 rounded-lg shadow-sm flex items-center gap-3 pointer-events-none">
            <div>
              <div class="text-xs font-bold text-on-surface">{{ flowName }}</div>
              <div class="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5 font-semibold">
                <span class="bg-surface-container px-1.5 py-0.5 rounded font-mono">{{ nodes.length }} nodes · {{ connections.length }} edges</span>
                <span class="flex items-center text-success-green gap-1">
                  <svg class="w-3 h-3 stroke-[3px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Valid
                </span>
              </div>
            </div>
          </div>

          <!-- Connecting mode instruction -->
          <div *ngIf="connectingFromPort" class="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold px-4 py-2 rounded-full shadow pointer-events-none animate-pulse">
            Click a node's input port (●) to complete connection — or press Esc to cancel
          </div>

          <!-- ── SVG LAYER (edges) ── -->
          <svg
            class="absolute inset-0 w-full h-full pointer-events-none"
            [attr.style]="'min-width:' + canvasW + 'px; min-height:' + canvasH + 'px;'"
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#9CA3AF"/>
              </marker>
              <marker id="arrow-yes" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#16a34a"/>
              </marker>
              <marker id="arrow-no" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#dc2626"/>
              </marker>
            </defs>

            <!-- Rendered edges -->
            <g *ngFor="let conn of connections">
              <ng-container *ngIf="getEdgePoints(conn) as pts">
                <path
                  [attr.d]="pts.path"
                  fill="none"
                  [attr.stroke]="conn.label === 'YES' ? '#16a34a' : conn.label === 'NO' ? '#dc2626' : '#9CA3AF'"
                  stroke-width="2"
                  [attr.marker-end]="conn.label === 'YES' ? 'url(#arrow-yes)' : conn.label === 'NO' ? 'url(#arrow-no)' : 'url(#arrow)'"
                  [ngClass]="{'stroke-dasharray-4': false}"
                  class="transition-all"
                />
                <!-- Edge label -->
                <g *ngIf="conn.label" [attr.transform]="'translate(' + pts.midX + ',' + pts.midY + ')'">
                  <rect x="-14" y="-9" width="28" height="18" rx="4"
                    [attr.fill]="conn.label === 'YES' ? '#dcfce7' : '#fee2e2'"
                    [attr.stroke]="conn.label === 'YES' ? '#16a34a' : '#dc2626'"
                    stroke-width="1"
                  />
                  <text text-anchor="middle" dominant-baseline="middle"
                    [attr.fill]="conn.label === 'YES' ? '#15803d' : '#b91c1c'"
                    font-size="9" font-weight="800" font-family="monospace"
                  >{{ conn.label }}</text>
                </g>
              </ng-container>
            </g>

            <!-- Live connecting line preview -->
            <line
              *ngIf="connectingFromPort && mousePos"
              [attr.x1]="connectingFromPort.x"
              [attr.y1]="connectingFromPort.y"
              [attr.x2]="mousePos.x"
              [attr.y2]="mousePos.y"
              stroke="#6366f1" stroke-width="2" stroke-dasharray="6 3"
              marker-end="url(#arrow)"
            />
          </svg>

          <!-- ── HTML LAYER (nodes) ── -->
          <div
            *ngFor="let node of nodes"
            class="absolute w-56 bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 group"
            [style.left.px]="node.x"
            [style.top.px]="node.y"
            [ngClass]="{
              'border-indigo-500 ring-2 ring-indigo-100 shadow-lg scale-[1.02] z-20': node.id === selectedNodeId,
              'border-red-500/80 ring-2 ring-red-100/50 shadow-md scale-[1.01] z-15': node.id !== selectedNodeId && node.exitFlow,
              'border-border-subtle hover:border-indigo-400/50 hover:shadow-md z-10': node.id !== selectedNodeId && !node.exitFlow
            }"
            (mousedown)="onNodeMouseDown($event, node)"
            (click)="selectNode(node.id)"
          >
            <!-- Node header -->
            <div class="flex items-center gap-2 px-4 py-2.5 rounded-t-[14px] border-b border-border-subtle" [ngClass]="getNodeHeaderBg(node.type)">
              <div [innerHTML]="getNodeIcon(node.type)" class="w-3.5 h-3.5 shrink-0"></div>
              <span class="font-bold text-xs truncate flex-1 tracking-tight">{{ node.name }}</span>
              <span *ngIf="node.exitFlow" class="text-[8px] bg-red-100 text-red-800 border border-red-300 px-1.5 py-0.5 rounded font-extrabold shrink-0 animate-pulse">EXIT</span>
              <button
                *ngIf="node.id !== 'start-fixed'"
                (click)="$event.stopPropagation(); removeNode(node.id)"
                class="text-on-surface-variant hover:text-red-600 transition-colors shrink-0 pointer-events-auto bg-transparent border-none"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>

            <!-- Node body -->
            <div class="p-3.5 min-h-[48px]">
              <div class="text-[10px] text-on-surface-variant leading-snug font-medium">{{ node.description }}</div>

              <!-- Decision logic summary -->
              <div *ngIf="node.type === 'Decision' && node.decisionLogic" class="mt-2 bg-amber-500/[0.04] border border-amber-500/25 rounded-lg px-2 py-1 text-[10px] font-mono text-amber-800">
                {{ getLogicSummary(node) }}
              </div>

              <!-- Route action badge -->
              <div *ngIf="node.type === 'Route' && node.action" class="mt-2 bg-purple-500/[0.04] border border-purple-500/25 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold text-purple-800">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                {{ node.action }}
              </div>

              <!-- DataLookup inputs summary -->
              <div *ngIf="node.type === 'DataLookup' && node.inputs?.length" class="mt-2 text-[10px] font-mono text-teal-800 bg-teal-500/[0.04] border border-teal-500/20 rounded-lg px-2.5 py-1 truncate">
                {{ node.inputs![0].key }}: {{ node.inputs![0].value }}
              </div>

              <!-- Generic contract summary badges -->
              <div *ngIf="node.inputSchema || node.outputSchema || node.selectionLogic" class="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span *ngIf="node.inputSchema" class="text-[8px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 rounded font-mono" title="Input Schema/Contract">In: {{ node.inputSchema.split(':')[0] }}</span>
                <span *ngIf="node.outputSchema" class="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded font-mono" title="Output Schema/Contract">Out: {{ node.outputSchema.split(':')[0] }}</span>
                <span *ngIf="node.selectionLogic" class="text-[8px] bg-gray-50 text-gray-700 border border-gray-200 px-1 rounded font-mono truncate max-w-[150px]" [title]="node.selectionLogic">Select: {{ node.selectionLogic }}</span>
              </div>
            </div>

            <!-- Input port (left) — hidden by default, fades in on hover -->
            <div
              *ngIf="node.type !== 'Start'"
              class="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 z-30 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100"
              [ngClass]="{'cursor-crosshair': !!connectingFromPort}"
              (click)="$event.stopPropagation(); onInputPortClick(node)"
              title="Input port"
            ></div>

            <!-- Output port — simple single port (Start / DataLookup) — hover triggered -->
            <div
              *ngIf="node.type === 'Start' || node.type === 'DataLookup'"
              class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full hover:bg-indigo-600 cursor-crosshair shadow-sm z-30 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
              (click)="$event.stopPropagation(); onOutputPortClick(node, '')"
              title="Connect from here"
            ></div>

            <!-- Decision node: YES (right) + NO (bottom-right) ports — hover triggered -->
            <ng-container *ngIf="node.type === 'Decision'">
              <div class="absolute -right-2 top-1/3 -translate-y-1/2 z-30 flex flex-col items-center gap-0.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                <span class="text-[8px] font-bold text-emerald-600 leading-none select-none">YES</span>
                <div
                  class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full hover:bg-emerald-600 cursor-crosshair shadow-sm"
                  (click)="$event.stopPropagation(); onOutputPortClick(node, 'YES')"
                  title="YES branch"
                ></div>
              </div>
              <div class="absolute -right-2 top-2/3 translate-y-0 z-30 flex flex-col items-center gap-0.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                <div
                  class="w-4 h-4 bg-red-500 border-2 border-white rounded-full hover:bg-red-600 cursor-crosshair shadow-sm"
                  (click)="$event.stopPropagation(); onOutputPortClick(node, 'NO')"
                  title="NO branch"
                ></div>
                <span class="text-[8px] font-bold text-red-600 leading-none select-none">NO</span>
              </div>
            </ng-container>

            <!-- Route node: output port — hover triggered -->
            <div
              *ngIf="node.type === 'Route'"
              class="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full hover:bg-purple-600 cursor-crosshair shadow-sm z-30 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
              (click)="$event.stopPropagation(); onOutputPortClick(node, '')"
              title="Connect"
            ></div>
          </div>

          <!-- Zoom controls -->
          <div class="absolute bottom-4 left-4 flex gap-2 pointer-events-auto z-10">
            <div class="bg-white border border-border-subtle rounded-lg flex items-center shadow-sm h-8 px-1">
              <button (click)="zoom = zoom > 50 ? zoom - 10 : zoom" class="p-1 hover:bg-surface-container rounded text-on-surface-variant cursor-pointer">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
              </button>
              <span class="px-2 font-mono text-[11px] text-on-surface-variant border-x border-border-subtle h-4 flex items-center">{{ zoom }}%</span>
              <button (click)="zoom = zoom < 200 ? zoom + 10 : zoom" class="p-1 hover:bg-surface-container rounded text-on-surface-variant cursor-pointer">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
              </button>
            </div>
            <button (click)="zoom = 100" class="bg-white border border-border-subtle rounded-lg p-2 shadow-sm hover:bg-surface-container text-on-surface-variant cursor-pointer h-8 flex items-center" title="Reset zoom">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>
            </button>
          </div>

          <!-- JSON export button -->
          <div class="absolute bottom-4 right-4 z-10">
            <button
              (click)="showJson = !showJson"
              class="bg-[#0d1117] text-emerald-400 hover:text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer border border-white/10"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              {{ showJson ? 'Hide' : 'Export' }} JSON
            </button>
          </div>

          <!-- JSON overlay -->
          <div *ngIf="showJson" class="absolute bottom-14 right-4 w-[420px] max-h-[380px] bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl overflow-auto z-30 custom-scrollbar">
            <div class="flex items-center px-4 py-2.5 border-b border-white/10">
              <span class="text-[11px] font-bold text-white/70 uppercase tracking-wider">Flow JSON</span>
              <button (click)="showJson = false" class="ml-auto text-white/40 hover:text-white cursor-pointer">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
            <pre class="text-[11px] text-emerald-300 font-mono p-4 whitespace-pre-wrap leading-relaxed">{{ getFlowJson() }}</pre>
          </div>
        </main>

        <!-- ========================================================= -->
        <!-- RIGHT: Properties Panel                                    -->
        <!-- ========================================================= -->
        <aside class="bg-white w-[320px] border-l border-border-subtle flex flex-col shrink-0 z-40">
          <div class="p-4 border-b border-border-subtle flex items-center justify-between bg-surface-container-lowest">
            <h3 class="font-serif text-md font-bold text-on-surface">Properties</h3>
            <button (click)="selectedNodeId = ''" class="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
          </div>

          <div class="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-5">
            <ng-container *ngIf="getSelectedNode() as node; else noNodeTmpl">

              <!-- Node Name -->
              <div>
                <label class="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Node Name</label>
                <input type="text" [ngModel]="node.name" (ngModelChange)="updateNodeProp('name', $event)"
                  class="w-full bg-white border border-border-subtle rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none" />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Description</label>
                <input type="text" [ngModel]="node.description" (ngModelChange)="updateNodeProp('description', $event)"
                  class="w-full bg-white border border-border-subtle rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 outline-none" />
              </div>

              <!-- ── DECISION NODE: Condition Editor ── -->
              <ng-container *ngIf="node.type === 'Decision'">
                <div class="border-t border-border-subtle pt-4">
                  <div class="flex items-center justify-between mb-3">
                    <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">IF Conditions</label>
                    <!-- Global operator -->
                    <div class="flex bg-surface-container p-0.5 rounded border border-border-subtle h-6 items-center">
                      <button type="button"
                        [ngClass]="node.decisionLogic?.operator === 'AND' ? 'bg-indigo-600 text-white' : 'text-on-surface-variant'"
                        (click)="setDecisionOperator(node, 'AND')"
                        class="px-2 h-5 rounded text-[9px] font-extrabold cursor-pointer border-none transition-all">AND</button>
                      <button type="button"
                        [ngClass]="node.decisionLogic?.operator === 'OR' ? 'bg-amber-500 text-white' : 'text-on-surface-variant'"
                        (click)="setDecisionOperator(node, 'OR')"
                        class="px-2 h-5 rounded text-[9px] font-extrabold cursor-pointer border-none transition-all">OR</button>
                    </div>
                  </div>

                  <!-- Terms -->
                  <div class="space-y-3">
                    <ng-container *ngFor="let term of node.decisionLogic?.terms; let ti = index">
                      <div class="border border-border-subtle rounded-lg overflow-hidden">
                        <!-- Term header -->
                        <div class="flex items-center gap-2 px-2 py-1.5 bg-surface-container-low border-b border-border-subtle">
                          <span class="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider">Term {{ ti + 1 }}</span>
                          <div class="flex bg-white p-0.5 rounded border border-border-subtle h-5 items-center ml-1">
                            <button type="button"
                              [ngClass]="term.operator === 'AND' ? 'bg-indigo-600 text-white' : 'text-on-surface-variant'"
                              (click)="setTermOperator(node, term, 'AND')"
                              class="px-1.5 h-4 rounded text-[8px] font-extrabold cursor-pointer border-none">AND</button>
                            <button type="button"
                              [ngClass]="term.operator === 'OR' ? 'bg-amber-500 text-white' : 'text-on-surface-variant'"
                              (click)="setTermOperator(node, term, 'OR')"
                              class="px-1.5 h-4 rounded text-[8px] font-extrabold cursor-pointer border-none">OR</button>
                          </div>
                          <button (click)="removeTerm(node, term.id)" class="ml-auto text-on-surface-variant hover:text-red-600 cursor-pointer border-none bg-transparent">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                          </button>
                        </div>

                        <!-- Conditions -->
                        <div class="p-2 space-y-1.5">
                          <div *ngFor="let cond of term.conditions" class="flex items-center gap-1">
                            <select [ngModel]="cond.field" (ngModelChange)="cond.field = $event"
                              class="flex-1 h-6 text-[10px] border border-border-subtle rounded bg-white font-mono px-1 cursor-pointer min-w-0">
                              <option *ngFor="let f of fieldOptions" [value]="f">{{ f }}</option>
                            </select>
                            <select [ngModel]="cond.op" (ngModelChange)="cond.op = $event"
                              class="w-12 h-6 text-[10px] border border-border-subtle rounded bg-white font-bold text-center px-0.5 cursor-pointer">
                              <option *ngFor="let o of opOptions" [value]="o">{{ o }}</option>
                            </select>
                            <input type="text" [ngModel]="cond.value" (ngModelChange)="cond.value = $event" placeholder="val"
                              class="w-16 h-6 text-[10px] border border-border-subtle rounded px-1.5 font-mono outline-none focus:border-indigo-400 bg-white" />
                            <button (click)="removeCond(node, term, cond.id)" class="text-on-surface-variant hover:text-red-600 cursor-pointer border-none bg-transparent shrink-0">
                              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                            </button>
                          </div>

                          <button (click)="addCondition(node, term)"
                            class="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer border-none bg-transparent mt-1">
                            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                            Add Condition
                          </button>
                        </div>
                      </div>
                    </ng-container>
                  </div>

                  <button (click)="addTerm(node)" class="mt-2 w-full border-dashed border-2 border-border-subtle rounded-lg py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-indigo-600 hover:border-indigo-400 cursor-pointer bg-transparent transition-all">
                    + Add Term
                  </button>
                </div>
              </ng-container>

              <!-- ── ROUTE NODE: Action config ── -->
              <ng-container *ngIf="node.type === 'Route'">
                <div class="border-t border-border-subtle pt-4 space-y-3">
                  <div>
                    <label class="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Action</label>
                    <select [ngModel]="node.action" (ngModelChange)="updateNodeProp('action', $event)"
                      class="w-full h-8 text-xs border border-border-subtle rounded-lg bg-white px-3 font-semibold cursor-pointer focus:border-purple-400 focus:ring-1 focus:ring-purple-200 outline-none">
                      <option *ngFor="let a of routeActions" [value]="a">{{ a }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Reason / Label</label>
                    <input type="text" [ngModel]="node.actionReason" (ngModelChange)="updateNodeProp('actionReason', $event)"
                      placeholder="e.g. High Risk Merchant"
                      class="w-full border border-border-subtle rounded-lg px-3 py-1.5 text-xs font-mono focus:border-purple-400 outline-none bg-white" />
                  </div>
                </div>
              </ng-container>

              <!-- ── DATALOOKUP: Input Mapping ── -->
              <ng-container *ngIf="node.type === 'DataLookup' && node.inputs?.length">
                <div class="border-t border-border-subtle pt-4">
                  <label class="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Input Mapping</label>
                  <div class="bg-surface-container-low border border-border-subtle rounded-lg p-3 space-y-2">
                    <div *ngFor="let inp of node.inputs" class="flex items-center gap-2">
                      <div class="w-1/3 text-[10px] font-bold text-on-surface-variant uppercase shrink-0">{{ inp.key }}</div>
                      <input type="text" [ngModel]="inp.value" (ngModelChange)="updateInputMapping(inp.key, $event)"
                        class="flex-1 bg-white border border-border-subtle rounded px-2 py-1 text-[11px] font-mono outline-none" />
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- Fail-safe toggle (DataLookup) -->
              <div *ngIf="node.type === 'DataLookup'" class="border-t border-border-subtle pt-4">
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-xs font-semibold text-on-surface">Fail-safe mode</span>
                  <div class="relative">
                    <input type="checkbox" [ngModel]="node.failSafe ?? false" (ngModelChange)="updateNodeProp('failSafe', $event)" class="sr-only peer" />
                    <div class="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-success-green after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                  </div>
                </label>
                <p class="text-[10px] text-on-surface-variant mt-1.5 leading-snug">If lookup fails, route to fallback queue.</p>
              </div>

              <!-- ── GENERIC CONTRACT & SELECTION LOGIC ── -->
              <div class="border-t border-border-subtle pt-4 space-y-3">
                <h4 class="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">Schema & Exit Contract</h4>
                
                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Input Contract</label>
                  <input type="text" [ngModel]="node.inputSchema" (ngModelChange)="updateNodeProp('inputSchema', $event)"
                    placeholder="e.g. transactionList: Transaction[]"
                    class="w-full bg-white border border-border-subtle rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 outline-none font-mono" />
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Output Contract</label>
                  <input type="text" [ngModel]="node.outputSchema" (ngModelChange)="updateNodeProp('outputSchema', $event)"
                    placeholder="e.g. selectedTx: Transaction"
                    class="w-full bg-white border border-border-subtle rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 outline-none font-mono" />
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Post-Execution Data Selection</label>
                  <textarea [ngModel]="node.selectionLogic" (ngModelChange)="updateNodeProp('selectionLogic', $event)"
                    placeholder="e.g. maxBy(candidates, activity_last_modified_date)"
                    rows="3"
                    class="w-full bg-white border border-border-subtle rounded-lg p-2.5 text-xs focus:border-indigo-400 outline-none font-mono resize-none"></textarea>
                </div>

                <!-- Data Transformation Config -->
                <div class="border-t border-border-subtle pt-3 space-y-2">
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Data Transformation</label>
                  <select [ngModel]="node.transformFunction" (ngModelChange)="updateNodeProp('transformFunction', $event)"
                    class="w-full h-8 text-xs border border-border-subtle rounded-lg bg-white px-2 cursor-pointer focus:border-indigo-400 outline-none">
                    <option *ngFor="let fn of functionOptions" [value]="fn.id">{{ fn.name }}</option>
                  </select>

                  <div *ngIf="node.transformFunction" class="space-y-2 animate-fade-in">
                    <div>
                      <label class="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Arguments (comma-separated)</label>
                      <input type="text" [ngModel]="node.transformArguments" (ngModelChange)="updateNodeProp('transformArguments', $event)"
                        placeholder="e.g. transactions, amount_usd"
                        class="w-full bg-white border border-border-subtle rounded-lg px-2.5 py-1 text-xs focus:border-indigo-400 outline-none font-mono" />
                    </div>
                    <div>
                      <label class="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Save Target Variable</label>
                      <input type="text" [ngModel]="node.transformTargetVariable" (ngModelChange)="updateNodeProp('transformTargetVariable', $event)"
                        placeholder="e.g. derived_sum"
                        class="w-full bg-white border border-border-subtle rounded-lg px-2.5 py-1 text-xs focus:border-indigo-400 outline-none font-mono" />
                    </div>
                  </div>
                </div>

                <!-- Next Step Evaluation Context Strategy Selection -->
                <div class="border-t border-border-subtle pt-3">
                  <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Next Step Evaluation Context</label>
                  <div class="space-y-1.5">
                    <label class="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none">
                      <input type="radio" name="eval_ctx_{{node.id}}" value="chained"
                        [ngModel]="node.evaluationContext || 'chained'"
                        (ngModelChange)="updateNodeProp('evaluationContext', 'chained')"
                        class="accent-indigo-600" />
                      <div>
                        <span class="font-semibold block text-[11px] leading-tight">Use Transformed/Selected Data</span>
                        <span class="text-[9px] text-on-surface-variant block mt-0.5 leading-none">Evaluate terms on output variables from previous step</span>
                      </div>
                    </label>
                    <label class="flex items-center gap-2 text-xs text-on-surface cursor-pointer select-none">
                      <input type="radio" name="eval_ctx_{{node.id}}" value="source"
                        [ngModel]="node.evaluationContext || 'chained'"
                        (ngModelChange)="updateNodeProp('evaluationContext', 'source')"
                        class="accent-indigo-600" />
                      <div>
                        <span class="font-semibold block text-[11px] leading-tight text-emerald-800">Fetch Fresh Data from Source</span>
                        <span class="text-[9px] text-on-surface-variant block mt-0.5 leading-none">Query fresh backing parameters (database, API)</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="pt-1">
                  <label class="flex items-center justify-between cursor-pointer">
                    <span class="text-xs font-semibold text-red-700">Exit / Terminate Flow</span>
                    <div class="relative">
                      <input type="checkbox" [ngModel]="node.exitFlow ?? false" (ngModelChange)="updateNodeProp('exitFlow', $event)" class="sr-only peer" />
                      <div class="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                    </div>
                  </label>
                  <p class="text-[9px] text-on-surface-variant mt-1 leading-snug">If enabled, halts execution and outputs final payload results.</p>
                </div>

                <div *ngIf="node.exitFlow" class="animate-fade-in">
                  <label class="block text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Exit Output Value</label>
                  <input type="text" [ngModel]="node.exitValue" (ngModelChange)="updateNodeProp('exitValue', $event)"
                    placeholder="e.g. selectedTransaction"
                    class="w-full bg-white border border-red-300 rounded-lg px-3 py-1.5 text-xs focus:border-red-500 outline-none font-mono" />
                </div>
              </div>

              <!-- Delete node -->
              <div class="border-t border-border-subtle pt-4">
                <button (click)="removeNode(node.id)" class="w-full border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-2 bg-transparent transition-all">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                  Remove Node
                </button>
              </div>

            </ng-container>

            <ng-template #noNodeTmpl>
              <div class="text-center py-8 text-on-surface-variant">
                <svg class="w-8 h-8 mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <p class="text-xs font-semibold">No node selected</p>
                <p class="text-[11px] mt-1 opacity-70">Click a node on the canvas to configure its properties.</p>
              </div>
            </ng-template>
          </div>
        </aside>
      </div>

      <!-- ============================================================= -->
      <!-- BOTTOM: Test Runner                                            -->
      <!-- ============================================================= -->
      <footer class="bg-surface-container-highest border-t border-border-subtle h-[190px] shrink-0 z-50 flex flex-col">
        <div class="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-surface-container-low">
          <div class="flex items-center gap-4">
            <h4 class="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
              Test Runner
            </h4>
            <div class="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
              Scenario:
              <span class="font-bold text-on-surface">{{ activeScenario === 'high' ? 'High-risk transaction' : 'Low-risk transaction' }}</span>
            </div>
          </div>
          <div class="flex gap-3 items-center">
            <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded text-[10px] font-extrabold">
              Expected: {{ activeScenario === 'high' ? 'DECLINE' : 'APPROVE' }}
            </span>
            <button (click)="handleRunTest()" class="text-primary hover:text-indigo-700 flex items-center gap-1 text-xs font-bold cursor-pointer">
              <svg class="w-4 h-4 fill-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              Run
            </button>
          </div>
        </div>
        <div class="flex-grow flex overflow-hidden">
          <div class="w-1/4 border-r border-border-subtle bg-white overflow-y-auto p-2 custom-scrollbar">
            <button
              (click)="activeScenario = 'high'"
              [ngClass]="activeScenario === 'high' ? 'bg-red-50 border-red-300' : 'hover:bg-surface-container-low border-transparent'"
              class="w-full text-left px-3 py-2 border rounded-lg mb-1 cursor-pointer transition-all">
              <div class="text-xs font-bold text-red-700">High-risk transaction</div>
              <div class="text-[10px] text-on-surface-variant">risk_score=97, amount=15000</div>
            </button>
            <button
              (click)="activeScenario = 'low'"
              [ngClass]="activeScenario === 'low' ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-surface-container-low border-transparent'"
              class="w-full text-left px-3 py-2 border rounded-lg mb-1 cursor-pointer transition-all">
              <div class="text-xs font-bold text-emerald-700">Low-risk transaction</div>
              <div class="text-[10px] text-on-surface-variant">risk_score=22, amount=50</div>
            </button>
          </div>
          <div class="flex-1 bg-[#0d1117] text-emerald-400 font-mono text-[11px] p-4 overflow-y-auto custom-scrollbar select-all">
            <div *ngFor="let log of testRunnerLogs" [ngClass]="getLogColor(log)" class="mb-1 leading-relaxed">{{ log }}</div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class RuleCanvasComponent implements OnInit {
  @Input()  nodes: ExtCanvasNode[] = [];
  @Input()  connections: ExtConnection[] = [];
  @Output() nodesChange = new EventEmitter<ExtCanvasNode[]>();

  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLElement>;

  /* state */
  selectedNodeId  = '';
  zoom            = 100;
  flowName        = 'Fraud Decision Flow';
  showJson        = false;
  canvasW         = 1400;
  canvasH         = 900;

  activeScenario: 'high' | 'low' = 'high';
  testRunnerLogs: string[] = [];

  /* drag state */
  private dragging: { nodeId: string; offX: number; offY: number } | null = null;

  /* connect state */
  connectingFromPort: { nodeId: string; portLabel: string; x: number; y: number } | null = null;
  mousePos: { x: number; y: number } | null = null;

  /* constants exposed to template */
  fieldOptions = FIELD_OPTIONS;
  opOptions    = OP_OPTIONS;
  routeActions = ROUTE_ACTIONS;
  functionOptions = FUNCTION_OPTIONS;

  libraryNodes = [
    { type: 'Start',      label: 'Start Node',      hint: 'Entry trigger',         iconBg: 'bg-emerald-50', icon: `<svg class="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>` },
    { type: 'Decision',   label: 'Decision Node',   hint: 'IF conditions (YES/NO)', iconBg: 'bg-amber-50',   icon: `<svg class="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.828L3 3"/><path d="m21 3-7.828 7.828A4 4 0 0 0 12 13.7"/></svg>` },
    { type: 'DataLookup', label: 'Data Lookup',     hint: 'Fetch external data',   iconBg: 'bg-teal-50',    icon: `<svg class="w-4 h-4 text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>` },
    { type: 'Route',      label: 'Route / Action',  hint: 'Terminal action output', iconBg: 'bg-purple-50',  icon: `<svg class="w-4 h-4 text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>` },
  ] as const;

  /* ------------------------------------------------------------------ */
  /*  Lifecycle                                                           */
  /* ------------------------------------------------------------------ */
  ngOnInit() {
    // Ensure every Decision node has decisionLogic initialised
    this.nodes = this.nodes.map(n => {
      if (n.type === 'Decision' && !n.decisionLogic) {
        return { ...n, decisionLogic: this.defaultDecisionLogic() };
      }
      return n;
    });
  }

  private defaultDecisionLogic(): DecisionLogic {
    return {
      operator: 'AND',
      terms: [
        {
          id: this.uid(),
          operator: 'AND',
          conditions: [
            { id: this.uid(), field: 'User.risk_score', op: '>', value: '80' }
          ]
        }
      ]
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Keyboard                                                            */
  /* ------------------------------------------------------------------ */
  @HostListener('document:keydown.escape')
  onEsc() {
    this.connectingFromPort = null;
    this.mousePos = null;
  }

  @HostListener('document:keydown.delete')
  onDelete() {
    if (this.selectedNodeId) this.removeNode(this.selectedNodeId);
  }

  /* ------------------------------------------------------------------ */
  /*  Drag                                                                */
  /* ------------------------------------------------------------------ */
  onNodeMouseDown(evt: MouseEvent, node: ExtCanvasNode) {
    evt.stopPropagation();
    if (this.connectingFromPort) return; // during connect mode clicks are handled elsewhere
    const rect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
    this.dragging = {
      nodeId: node.id,
      offX:   evt.clientX - node.x,
      offY:   evt.clientY - node.y,
    };
  }

  onCanvasMouseDown(_evt: MouseEvent) {
    if (!this.connectingFromPort) {
      this.selectedNodeId = '';
    }
  }

  onCanvasMouseMove(evt: MouseEvent) {
    const canvasRect = (evt.currentTarget as HTMLElement).getBoundingClientRect();
    this.mousePos = { x: evt.clientX - canvasRect.left, y: evt.clientY - canvasRect.top };

    if (this.dragging) {
      this.nodes = this.nodes.map(n => {
        if (n.id === this.dragging!.nodeId) {
          return {
            ...n,
            x: Math.max(0, evt.clientX - this.dragging!.offX),
            y: Math.max(0, evt.clientY - this.dragging!.offY),
          };
        }
        return n;
      });
    }
  }

  onCanvasMouseUp(_evt: MouseEvent) {
    if (this.dragging) {
      this.nodesChange.emit(this.nodes);
      this.dragging = null;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Port connection                                                     */
  /* ------------------------------------------------------------------ */
  onOutputPortClick(node: ExtCanvasNode, portLabel: string) {
    if (this.connectingFromPort) {
      this.connectingFromPort = null;
      return;
    }
    const rect = this.getNodeRect(node);
    const portY = portLabel === 'YES'
      ? rect.y + rect.h * 0.33
      : portLabel === 'NO'
        ? rect.y + rect.h * 0.67
        : rect.y + rect.h * 0.5;

    this.connectingFromPort = {
      nodeId: node.id,
      portLabel,
      x: rect.x + rect.w,
      y: portY,
    };
  }

  onInputPortClick(targetNode: ExtCanvasNode) {
    if (!this.connectingFromPort) return;
    if (this.connectingFromPort.nodeId === targetNode.id) {
      this.connectingFromPort = null;
      return;
    }
    // Create edge
    const newConn: ExtConnection = {
      fromNodeId: this.connectingFromPort.nodeId,
      toNodeId:   targetNode.id,
      label:      this.connectingFromPort.portLabel,
    };
    this.connections = [...this.connections, newConn];
    this.connectingFromPort = null;
    this.mousePos = null;
  }

  /* ------------------------------------------------------------------ */
  /*  Node CRUD                                                           */
  /* ------------------------------------------------------------------ */
  addNode(type: ExtCanvasNode['type']) {
    const id   = `node-${Date.now()}`;
    const base: ExtCanvasNode = {
      id,
      type,
      name:        `${type} Node`,
      description: 'Configure in properties panel',
      x: 160 + Math.random() * 300,
      y:  80 + Math.random() * 200,
    };

    if (type === 'Decision') {
      base.decisionLogic = this.defaultDecisionLogic();
      base.description   = 'IF / ELSE decision';
    }
    if (type === 'Route') {
      base.action        = 'Approve';
      base.actionReason  = '';
    }
    if (type === 'DataLookup') {
      base.inputs    = [{ key: 'Source Key', value: '' }, { key: 'Target Param', value: '' }];
      base.failSafe  = false;
    }

    this.nodes = [...this.nodes, base];
    this.nodesChange.emit(this.nodes);
    this.selectedNodeId = id;
  }

  removeNode(id: string) {
    this.nodes       = this.nodes.filter(n => n.id !== id);
    this.connections = this.connections.filter(c => c.fromNodeId !== id && c.toNodeId !== id);
    if (this.selectedNodeId === id) this.selectedNodeId = '';
    this.nodesChange.emit(this.nodes);
  }

  clearCanvas() {
    this.nodes       = [];
    this.connections = [];
    this.selectedNodeId = '';
    this.connectingFromPort = null;
    this.nodesChange.emit(this.nodes);
  }

  selectNode(id: string) {
    this.selectedNodeId = id;
  }

  /* ------------------------------------------------------------------ */
  /*  Node prop updates                                                   */
  /* ------------------------------------------------------------------ */
  updateNodeProp(prop: keyof ExtCanvasNode, value: any) {
    this.nodes = this.nodes.map(n =>
      n.id === this.selectedNodeId ? { ...n, [prop]: value } : n
    );
  }

  updateInputMapping(key: string, value: string) {
    const node = this.getSelectedNode();
    if (!node?.inputs) return;
    this.nodes = this.nodes.map(n => {
      if (n.id === this.selectedNodeId) {
        return { ...n, inputs: n.inputs!.map(i => i.key === key ? { ...i, value } : i) };
      }
      return n;
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Decision Logic editing                                              */
  /* ------------------------------------------------------------------ */
  setDecisionOperator(node: ExtCanvasNode, op: 'AND' | 'OR') {
    this.nodes = this.nodes.map(n => {
      if (n.id !== node.id) return n;
      return { ...n, decisionLogic: { ...n.decisionLogic!, operator: op } };
    });
  }

  setTermOperator(node: ExtCanvasNode, term: FlowTerm, op: 'AND' | 'OR') {
    this.nodes = this.nodes.map(n => {
      if (n.id !== node.id) return n;
      const terms = n.decisionLogic!.terms.map(t =>
        t.id === term.id ? { ...t, operator: op } : t
      );
      return { ...n, decisionLogic: { ...n.decisionLogic!, terms } };
    });
  }

  addTerm(node: ExtCanvasNode) {
    const newTerm: FlowTerm = {
      id: this.uid(),
      operator: 'AND',
      conditions: [{ id: this.uid(), field: FIELD_OPTIONS[0], op: '==', value: '' }]
    };
    this.nodes = this.nodes.map(n => {
      if (n.id !== node.id) return n;
      return { ...n, decisionLogic: { ...n.decisionLogic!, terms: [...n.decisionLogic!.terms, newTerm] } };
    });
  }

  removeTerm(node: ExtCanvasNode, termId: string) {
    this.nodes = this.nodes.map(n => {
      if (n.id !== node.id) return n;
      return { ...n, decisionLogic: { ...n.decisionLogic!, terms: n.decisionLogic!.terms.filter(t => t.id !== termId) } };
    });
  }

  addCondition(node: ExtCanvasNode, term: FlowTerm) {
    const newCond: FlowCondition = { id: this.uid(), field: FIELD_OPTIONS[0], op: '==', value: '' };
    this.nodes = this.nodes.map(n => {
      if (n.id !== node.id) return n;
      const terms = n.decisionLogic!.terms.map(t =>
        t.id === term.id ? { ...t, conditions: [...t.conditions, newCond] } : t
      );
      return { ...n, decisionLogic: { ...n.decisionLogic!, terms } };
    });
  }

  removeCond(node: ExtCanvasNode, term: FlowTerm, condId: string) {
    this.nodes = this.nodes.map(n => {
      if (n.id !== node.id) return n;
      const terms = n.decisionLogic!.terms.map(t =>
        t.id === term.id ? { ...t, conditions: t.conditions.filter(c => c.id !== condId) } : t
      );
      return { ...n, decisionLogic: { ...n.decisionLogic!, terms } };
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Edge / SVG helpers                                                  */
  /* ------------------------------------------------------------------ */
  getEdgePoints(conn: ExtConnection): { path: string; midX: number; midY: number } | null {
    const from = this.nodes.find(n => n.id === conn.fromNodeId);
    const to   = this.nodes.find(n => n.id === conn.toNodeId);
    if (!from || !to) return null;

    const fromRect = this.getNodeRect(from);
    const toRect   = this.getNodeRect(to);

    let sy = fromRect.y + fromRect.h * 0.5;
    if (conn.label === 'YES') sy = fromRect.y + fromRect.h * 0.33;
    if (conn.label === 'NO')  sy = fromRect.y + fromRect.h * 0.67;

    const sx = fromRect.x + fromRect.w;
    const ex = toRect.x;
    const ey = toRect.y + toRect.h * 0.5;

    const cpX = (sx + ex) / 2;
    const path = `M ${sx} ${sy} C ${cpX} ${sy}, ${cpX} ${ey}, ${ex} ${ey}`;
    const midX  = (sx + ex) / 2;
    const midY  = (sy + ey) / 2;
    return { path, midX, midY };
  }

  private getNodeRect(node: ExtCanvasNode) {
    return { x: node.x, y: node.y, w: NODE_WIDTH, h: NODE_HEIGHT };
  }

  /* ------------------------------------------------------------------ */
  /*  Utilities                                                           */
  /* ------------------------------------------------------------------ */
  getSelectedNode(): ExtCanvasNode | undefined {
    return this.nodes.find(n => n.id === this.selectedNodeId);
  }

  getLogicSummary(node: ExtCanvasNode): string {
    const dl = node.decisionLogic;
    if (!dl || !dl.terms.length) return 'No conditions';
    const parts = dl.terms.map(t =>
      t.conditions.map(c => `${c.field.split('.')[1]} ${c.op} ${c.value}`).join(` ${t.operator} `)
    );
    return parts.join(` ${dl.operator} `);
  }

  getFlowJson(): string {
    return JSON.stringify({
      name: this.flowName,
      nodes: this.nodes.map(n => ({
        id: n.id, type: n.type, name: n.name,
        description: n.description,
        position: { x: Math.round(n.x), y: Math.round(n.y) },
        ...(n.inputSchema ? { inputSchema: n.inputSchema } : {}),
        ...(n.outputSchema ? { outputSchema: n.outputSchema } : {}),
        ...(n.selectionLogic ? { selectionLogic: n.selectionLogic } : {}),
        ...(n.exitFlow ? { exitFlow: n.exitFlow, exitValue: n.exitValue } : {}),
        ...(n.transformFunction ? { transformFunction: n.transformFunction } : {}),
        ...(n.transformArguments ? { transformArguments: n.transformArguments } : {}),
        ...(n.transformTargetVariable ? { transformTargetVariable: n.transformTargetVariable } : {}),
        ...(n.evaluationContext ? { evaluationContext: n.evaluationContext } : {}),
        ...(n.decisionLogic ? { decisionLogic: n.decisionLogic } : {}),
        ...(n.action        ? { action: n.action, reason: n.actionReason } : {}),
      })),
      edges: this.connections.map(c => ({
        from: c.fromNodeId, to: c.toNodeId, label: c.label ?? ''
      }))
    }, null, 2);
  }

  getNodeHeaderBg(type: string): string {
    if (type === 'DataLookup') return 'bg-teal-500/[0.04] text-teal-800 border-teal-500/10';
    if (type === 'Decision')   return 'bg-amber-500/[0.04] text-amber-800 border-amber-500/10';
    if (type === 'Route')      return 'bg-purple-500/[0.04] text-purple-800 border-purple-500/10';
    return 'bg-emerald-500/[0.04] text-emerald-800 border-emerald-500/10';
  }

  getNodeIcon(type: string): string {
    if (type === 'DataLookup') return `<svg class="w-full h-full text-teal-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`;
    if (type === 'Decision')   return `<svg class="w-full h-full text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.828L3 3"/><path d="m21 3-7.828 7.828A4 4 0 0 0 12 13.7"/></svg>`;
    if (type === 'Route')      return `<svg class="w-full h-full text-purple-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
    return `<svg class="w-full h-full text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;
  }

  getLogColor(log: string): string {
    if (log.startsWith('#'))          return 'text-gray-500';
    if (log.includes('[EVAL]'))       return 'text-amber-400';
    if (log.includes('[START]') || log.includes('[NODE]')) return 'text-blue-400';
    if (log.includes('[END]'))        return 'text-purple-400';
    if (log.includes('true') || log.includes('APPROVE') || log.includes('PASS')) return 'text-emerald-300';
    if (log.includes('false') || log.includes('DECLINE')) return 'text-red-400';
    if (log.startsWith('>'))          return 'text-green-300';
    return 'text-emerald-400';
  }

  handleRunTest() {
    const ts = new Date().toLocaleTimeString();
    if (this.activeScenario === 'high') {
      this.testRunnerLogs = [
        `# Execution Trace · ${ts}`,
        '[START] Flow: Fraud Decision Flow',
        '[NODE]  "Customer CRM Lookup" — fetching profile... (38ms)',
        '>  Context: { user_id: "usr_flagged_22", risk_score: 97, amount_usd: 15000 }',
        '[EVAL]  "High Risk Check" · operator: AND',
        '>  Condition: User.risk_score > 80 → true',
        '>  Condition: Transaction.amount_usd > 10000 → true',
        '>  Result: true → routing YES branch',
        '[END]   Action: Decline Transaction · "Critical risk score detected"',
        '# Completed in 55ms · Result: DECLINE',
      ];
    } else {
      this.testRunnerLogs = [
        `# Execution Trace · ${ts}`,
        '[START] Flow: Fraud Decision Flow',
        '[NODE]  "Customer CRM Lookup" — fetching profile... (22ms)',
        '>  Context: { user_id: "usr_trusted_01", risk_score: 22, amount_usd: 50 }',
        '[EVAL]  "High Risk Check" · operator: AND',
        '>  Condition: User.risk_score > 80 → false',
        '>  Short-circuit: AND failed → routing NO branch',
        '[END]   Action: Approve · "No risk signals detected"',
        '# Completed in 31ms · Result: APPROVE',
      ];
    }
  }

  private uid() { return Math.random().toString(36).slice(2, 9); }
}
