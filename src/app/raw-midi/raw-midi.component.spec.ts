import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawMidiComponent } from './raw-midi.component';

describe('RawMidiComponent', () => {
  let component: RawMidiComponent;
  let fixture: ComponentFixture<RawMidiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RawMidiComponent]
    });
    fixture = TestBed.createComponent(RawMidiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
