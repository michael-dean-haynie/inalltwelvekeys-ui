import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordDetectorComponent } from './chord-detector.component';

describe('ChordDetectorComponent', () => {
  let component: ChordDetectorComponent;
  let fixture: ComponentFixture<ChordDetectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChordDetectorComponent]
    });
    fixture = TestBed.createComponent(ChordDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
