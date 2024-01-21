import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseDeetzComponent } from './exercise-deetz.component';

describe('ExerciseDeetzComponent', () => {
  let component: ExerciseDeetzComponent;
  let fixture: ComponentFixture<ExerciseDeetzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseDeetzComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExerciseDeetzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
