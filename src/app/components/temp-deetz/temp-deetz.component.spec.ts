import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempDeetzComponent } from './temp-deetz.component';

describe('TempDeetzComponent', () => {
  let component: TempDeetzComponent;
  let fixture: ComponentFixture<TempDeetzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempDeetzComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TempDeetzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
