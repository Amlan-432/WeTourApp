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

  travelService = inject(Hotelservice);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  hotel = signal<any | null>(null);
  selectedPrice = signal<number>(0);
  roomType = signal<string>('standard');
  numUnits = signal<number>(1);
  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  bookingForm!: FormGroup;
  reviews=signal<any[]>([]);

  totalPrice = computed(() => this.selectedPrice() * this.numUnits());

  ngOnInit() {

  this.bookingForm = this.fb.group({
    passengers: this.fb.array([])
  });

  const id = this.route.snapshot.paramMap.get('id');

  this.travelService.currentSearch$.subscribe(criteria => {
    const count = criteria?.people || criteria?.rooms || 1;
    this.numUnits.set(count);
    this.generateInitialForms(count);
    
    if(criteria?.start){
      this.checkInDate.set(new Date(criteria.start))
    }
    if(criteria?.end){
      this.checkOutDate.set(new Date(criteria.end))
    }
  });

  if(id){
    this.travelService.getHotelById(id).subscribe({
      next:(res:any)=>{
        const foundHotel = res.data;
        if(foundHotel){
          this.hotel.set(foundHotel);

          this.roomType.set('standard');
          const initialPrice = foundHotel.pricePerNight?.standard || 0;
          this.selectedPrice.set(initialPrice);
        }
      },
      error: (err)=> {console.log(`could not load hotel details ${err}`)}
    })
  }

  this.getReviews();
  }

get passengers() {
    return this.bookingForm.get('passengers') as FormArray;
  }

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

  updatePrice(room:string, price: number) {
    this.selectedPrice.set(price);
    this.roomType.set(room);
  }

  getReviews(){
    const id = this.route.snapshot.paramMap.get('id')??"";
    this.travelService.getReviews(id).subscribe({
      next:res=>{
        this.reviews.set(res.data);
      },
      error:err=>{console.log(err);
      }
    })

  }

  getAverageRating(): number {
  if (!this.reviews() || this.reviews().length === 0) {
    return 0;
  }

  const total = this.reviews().reduce((sum, review) => {
    return sum + parseFloat(review.overallRating?.$numberDecimal || '0');
  }, 0);

  return total / this.reviews().length;
}

  confirmBooking() {
   const hotelData = this.hotel();
   const guests = this.bookingForm.value.passengers; 
   const checkInDate = this.checkInDate();
   const checkOutDate = this.checkOutDate();
   const roomTypes = this.roomType();
   const hotelId =  hotelData?._id;
   const hotelUserId = hotelData?.user_id;
   console.log(hotelUserId);
   


  this.travelService.createBooking(hotelId,hotelUserId,roomTypes,guests,this.totalPrice(),checkInDate,checkOutDate).subscribe({
    next:(res)=>{
      if(res.success){
         this.router.navigateByUrl('/landingDash/traveller/hotelsummary');
      }
    },
    error:(err)=>{
      console.log(err);
    }
  });
  }

}
