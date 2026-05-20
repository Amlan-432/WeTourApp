import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewHotel } from './add-new-hotel';

describe('AddNewHotel', () => {
  let component: AddNewHotel;
  let fixture: ComponentFixture<AddNewHotel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewHotel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewHotel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
