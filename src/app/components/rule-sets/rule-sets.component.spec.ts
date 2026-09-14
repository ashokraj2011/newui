import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RuleSetsComponent } from './rule-sets.component';

describe('RuleSetsComponent filter authoring', () => {
  let component: RuleSetsComponent;
  let fixture: ComponentFixture<RuleSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleSetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('@ac:FILTER-APP:AC-001 renders the filter block on the rule-authoring screen', () => {
    expect(fixture.nativeElement.querySelector('#filter-heading')?.textContent).toContain('Define the entity slice');
  });

  it('@ac:FILTER-APP:AC-002 rejects an empty namespace and accepts customer', () => {
    expect(component.getFilterValidationMessages()).toContain('Namespace is required.');
    component.filter.namespace = 'customer';
    expect(component.getFilterValidationMessages()).not.toContain('Namespace is required.');
  });

  it('@ac:FILTER-APP:AC-003 selects and explicitly orders attributes', () => {
    component.filter.namespace = 'customer';
    component.toggleFilterAttribute('id');
    component.toggleFilterAttribute('name');
    expect(component.filter.attributes).toEqual(['id', 'name']);
    component.moveFilterAttribute(1, -1);
    expect(component.filter.attributes).toEqual(['name', 'id']);
  });

  it('@ac:FILTER-APP:AC-004 validates top, bottom, and inclusive range limits', () => {
    component.filter.namespace = 'customer';
    component.filter.attributes = ['id'];
    component.filter.limit = 0;
    expect(component.getFilterValidationMessages()).toContain('Limit must be a positive integer.');

    component.filter.mode = 'bottom';
    component.filter.limit = 3;
    expect(component.getFilterValidationMessages()).not.toContain('Limit must be a positive integer.');

    component.filter.mode = 'range';
    component.filter.rangeStart = 8;
    component.filter.rangeEnd = 4;
    expect(component.getFilterValidationMessages()).toContain('Range start must be less than or equal to end.');
    component.filter.rangeEnd = 8;
    expect(component.getFilterValidationMessages()).toEqual([]);
  });

  it('@ac:FILTER-APP:AC-005 defaults new filters to top 10', () => {
    expect(component.filter.mode).toBe('top');
    expect(component.filter.limit).toBe(10);
  });

  it('@req:FILTER-APP:REQ-008 renders visible validation feedback', () => {
    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Namespace is required.');
    expect(alert?.textContent).toContain('Select at least one attribute.');
  });
});