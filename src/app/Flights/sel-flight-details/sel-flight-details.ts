import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Flightservice } from '../../services/FlightService/flightservice';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authservice } from '../../services/AuthService/authservice';

@Component({
  selector: 'app-sel-flight-details',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './sel-flight-details.html',
  styleUrl: './sel-flight-details.css',
})
export class SelFlightDetails {
private route = inject(ActivatedRoute);
  private flightService = inject(Flightservice);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService=inject(Authservice);

  flight = signal<any>(null);
  numOfTravellers = signal<number>(1);
  selectedBonus = signal<number>(0);

  // Airline Logo Mapping
  private readonly airlineLogos: { [key: string]: string } = {
    "Air India": "https://www.gstatic.com/flights/airline_logos/70px/AI.png",
    "IndiGo": "https://www.gstatic.com/flights/airline_logos/70px/6E.png",
    "SpiceJet": "https://www.gstatic.com/flights/airline_logos/70px/SG.png",
    "Vistara": "https://www.gstatic.com/flights/airline_logos/70px/UK.png",
    "GoAir": "https://www.gstatic.com/flights/airline_logos/70px/G8.png",
    "AirAsia": "https://www.gstatic.com/flights/airline_logos/70px/I5.png",
    "Akasa Air": "https://www.gstatic.com/flights/airline_logos/70px/QP.png"
  };

  // --- Reactive Form for Passengers ---
  bookingForm: FormGroup = this.fb.group({
    passengers: this.fb.array([])
  });

  totalPrice = computed(() => {
    const f = this.flight();
    if (!f) return 0;
    return (f.BasePrice + this.selectedBonus()) * this.numOfTravellers();
  });

  get passengers() {
    return this.bookingForm.get('passengers') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.flightService.currentSearch$.subscribe(criteria => {
      const count = criteria?.people || 1;
      this.numOfTravellers.set(count);

      if (this.passengers.length === 0) {
        this.addPassenger(); 
      }
    });

    this.flightService.getFlight('', '','').subscribe(flights => {
      const found = flights.data.find((f: any) => f.FlightID === id);
      if (found) {
        this.flight.set(found);
        if (found.Classes && found.Classes.length > 0) {
          this.selectedBonus.set(found.Classes[0].bonus);
        }
      }
    });
  }


  getLogo(airlineName: string): string {
    if (!airlineName) return '';
  
    const key = Object.keys(this.airlineLogos).find(
      k => k.toLowerCase() === airlineName.toLowerCase()
    );
    return key ? this.airlineLogos[key] : 'https://www.gstatic.com/flights/airline_logos/70px/default.png';
  }

  addPassenger() {
    if (this.passengers.length < this.numOfTravellers()) {
      const passengerGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        email: ['', [Validators.required, Validators.email]]
      });
      this.passengers.push(passengerGroup);
    }
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.removeAt(index);
    }
  }

  selectClass(bonus: number) {
    this.selectedBonus.set(bonus);
  }

  onProceedToPayment() {
    if (this.bookingForm.valid) {
      const bookingData = {
        flight: this.flight(),
        passengers: this.bookingForm.value.passengers,
        totalAmount: this.totalPrice(),
        fareClassBonus: this.selectedBonus()
      };
      console.log('Final Booking Data:', bookingData);
      this.authService.currentUser.subscribe(res=>{
        if(res){
           this.router.navigateByUrl('/landingDash/traveller/flights/flightssummary');
        }else{
          this.router.navigateByUrl('/landingDash/flights/flightssummary');
        }
      });
      
        
    }
  }

}
