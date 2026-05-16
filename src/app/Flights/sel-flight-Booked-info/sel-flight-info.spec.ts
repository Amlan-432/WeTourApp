import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelFlightInfo } from './sel-flight-info';

describe('SelFlightInfo', () => {
  let component: SelFlightInfo;
  let fixture: ComponentFixture<SelFlightInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelFlightInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelFlightInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
