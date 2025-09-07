import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoguiaComponent } from './ecoguia.component';

describe('EcoguiaComponent', () => {
  let component: EcoguiaComponent;
  let fixture: ComponentFixture<EcoguiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcoguiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcoguiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
