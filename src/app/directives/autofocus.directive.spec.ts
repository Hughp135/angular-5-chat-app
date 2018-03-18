import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AutofocusDirective } from './autofocus.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `<input type="text" appAutoFocus>`,
})
class TestAutoFocusComponent {}

describe('AutofocusDirective', () => {
  let directive: AutofocusDirective;
  let fixture: ComponentFixture<TestAutoFocusComponent>;
  let component: TestAutoFocusComponent;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestAutoFocusComponent, AutofocusDirective],
    });
    fixture = TestBed.createComponent(TestAutoFocusComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
    jasmine.clock().install();
    directive = new AutofocusDirective(inputEl);
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });
  it('should create an instance', () => {
    expect(directive).toBeTruthy();
    expect(component).toBeTruthy();
  });
  it('should focus element after a delay', () => {
    spyOn(inputEl.nativeElement, 'focus');
    directive.ngAfterViewInit();

    jasmine.clock().tick(50);

    expect(inputEl.nativeElement.focus).toHaveBeenCalledTimes(1);
  });
});
