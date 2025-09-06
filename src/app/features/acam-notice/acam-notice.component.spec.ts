import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcamNoticeComponent } from './acam-notice.component';

describe('AcamNoticeComponent', () => {
  let component: AcamNoticeComponent;
  let fixture: ComponentFixture<AcamNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcamNoticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcamNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
