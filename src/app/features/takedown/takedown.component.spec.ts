import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakedownComponent } from './takedown.component';

describe('TakedownComponent', () => {
  let component: TakedownComponent;
  let fixture: ComponentFixture<TakedownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakedownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TakedownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
