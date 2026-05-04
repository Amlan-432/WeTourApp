import { Component, computed, inject, signal } from '@angular/core';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-sel-hotel-details',
  imports: [CommonModule,RouterModule,ReactiveFormsModule],
  templateUrl: './sel-hotel-details.html',
  styleUrl: './sel-hotel-details.css',
})

export class SelHotelDetails {


  private travelService = inject(Hotelservice);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  hotel = signal<any | null>(null);
  selectedPrice = signal<number>(0);
  numUnits = signal<number>(1);
  bookingForm!: FormGroup;

  totalPrice = computed(() => this.selectedPrice() * this.numUnits());

  ngOnInit() {
  // 1. ALWAYS initialize the form structure first!
  this.bookingForm = this.fb.group({
    passengers: this.fb.array([])
  });

  const id = Number(this.route.snapshot.paramMap.get('id'));

  // 2. Now it is safe to subscribe and use generateInitialForms
  this.travelService.currentSearch$.subscribe(criteria => {
    const count = criteria?.people || criteria?.rooms || 1;
    this.numUnits.set(count);
    this.generateInitialForms(count); 
  });

  // 3. Fetch hotel data
  this.travelService.getHotels('').pipe(
    map(hotels => hotels.find(h => h.HotelID === id))
  ).subscribe(foundHotel => {
    if (foundHotel) {
      this.hotel.set(foundHotel);
      const initialPrice = foundHotel.Rooms?.[0]?.price || foundHotel.PricePerNight;
      this.selectedPrice.set(initialPrice);
    }
  });
}
get passengers() {
    return this.bookingForm.get('passengers') as FormArray;
  }

  // Create a single passenger group
  createPassengerGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  generateInitialForms(count: number) {
    this.passengers.clear();
    for (let i = 0; i < count; i++) {
      this.passengers.push(this.createPassengerGroup());
    }
  }

  addPassenger() {
    this.passengers.push(this.createPassengerGroup());
  }

  removePassenger(index: number) {
    this.passengers.removeAt(index);
  }

  updatePrice(price: number) {
    this.selectedPrice.set(price);
  }

  confirmBooking() {
    const hotelData = this.hotel();
   const guests = this.bookingForm.value.passengers; // This gets the array of names/phones

  console.log("Booking Summary:", {
    hotel: hotelData?.Name,
    guests: guests,
    total: this.totalPrice()
  });
    this.router.navigateByUrl('/landingDash/hotelsummary');
  }

}
