import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiTestComponent } from './midi-test.component';

describe('MidiTestComponent', () => {
  let component: MidiTestComponent;
  let fixture: ComponentFixture<MidiTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MidiTestComponent]
    });
    fixture = TestBed.createComponent(MidiTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
