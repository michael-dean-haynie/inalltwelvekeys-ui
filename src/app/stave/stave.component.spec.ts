import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaveComponent } from './stave.component';

describe('StaveComponent', () => {
  let component: StaveComponent;
  let fixture: ComponentFixture<StaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StaveComponent]
    });
    fixture = TestBed.createComponent(StaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
