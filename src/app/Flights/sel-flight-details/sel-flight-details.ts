import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Flightservice } from '../../services/FlightService/flightservice';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authservice } from '../../services/AuthService/authservice';
import { Tokenservice } from '../../services/tokenService/tokenservice';

@Component({
  selector: 'app-sel-flight-details',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './sel-flight-details.html',
  styleUrl: './sel-flight-details.css',
})
export class SelFlightDetails {
  private route = inject(ActivatedRoute);
  flightService = inject(Flightservice);
  private authService=inject(Authservice);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private tokenService = inject(Tokenservice);

  flight = signal<any>(null);
  numOfTravellers = signal<number>(1);
  selectedBonus = signal<number>(0);
  selectedClassName = signal<string>('');
  selectedSeats = signal<string[]>([]);


  // --- Reactive Form for Passengers ---
  bookingForm: FormGroup = this.fb.group({
    passengers: this.fb.array([])
  });

  totalPrice = computed(() => {
    const f = this.flight();
    if (!f) return 0;
    const selSeatIds = this.selectedSeats();
    let totalCost=0;
    selSeatIds.forEach(Sno=>{
       const seat_details =f.seats.find((s:any)=>s.seat_number===Sno);
       if(seat_details){
        const classInfo = this.Classes.find((c:any)=>c.name===seat_details.class);
        const bonus = classInfo?classInfo.bonus:0;
        totalCost+=(f.base_price+bonus+(seat_details.price||0));
       }
    });
     return totalCost;
    
  });

  totalUpgradeBonus = computed(() => {
  const f = this.flight();
  if (!f) return 0;
  
  return this.selectedSeats().reduce((sum, seatNo) => {
    const seatDetail = f.seats.find((s: any) => s.seat_number === seatNo);
    const classInfo = this.Classes.find(c => c.name === seatDetail?.class);
    return sum + (classInfo ? classInfo.bonus : 0);
  }, 0);
});

  get passengers() {
     return this.bookingForm.get('passengers') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')??"";

    this.flightService.currentSearch$.subscribe(criteria => {
      const count = criteria?.people || 1;
      this.numOfTravellers.set(count);

      if (this.passengers.length === 0) {
        this.addPassenger(); 
      }
    });

    const fdate = this.flightService.fdate();

    this.flightService.getFlightFromID(id,fdate).subscribe(flight => {
      if(flight.success){
        this.flight.set(flight.data);
        console.log(flight.data);
      }
    
    });
  }




  filteredSeatsByClass=computed(()=>{
    const flightData = this.flight();
    const className = this.selectedClassName();

    if(!flightData || !className)return [];

    const classSeats = flightData.seats.filter((s:any)=>s.class===className);
    const rowsMap = new Map<string,any[]>();
    classSeats.forEach((seat:any) => {
        const rowNum = seat.seat_number.match(/\d+/)?.[0] || '0';
        if (!rowsMap.has(rowNum)) rowsMap.set(rowNum, []);
        rowsMap.get(rowNum)?.push(seat);
    });
    return Array.from(rowsMap.values());
  });

  

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
  
  onProceedToPayment() {
    if (this.bookingForm.valid) {

      // let arr = []
      // for(let seat of this.selectedSeats()){
      //   arr.push({...this.bookingForm.value[i],})
      // }
      const Passengers = this.bookingForm.value.passengers||[];
      const finalPassengers = Passengers.map((passenger:any,index:number)=>{
      const seatNo = this.selectedSeats()[index]||"";
      const seatDetail = this.flight()?.seats?.find((s: any) => s.seat_number === seatNo);

        const seatClass = seatDetail ? seatDetail.class : "";
        return {
          ...passenger,
          seat:seatNo,
          class:seatClass
        }
      });

      const token = localStorage.getItem('WeTourjwt_token')??"";
      const payload = this.tokenService.tokenDecode(token);
      const user_Id = payload.user?.user_id||"";
      const template_id = this.flight()?._id||"";
      const fdate = this.flightService.fdate();
      const total_price = this.totalPrice();
      console.log(total_price);
      

      this.flightService.bookFlight(user_Id,template_id,fdate,total_price,finalPassengers).subscribe({
        next:res=>{
          if(res.success){
            this.authService.currentUser.subscribe(res => {
            if (res) {
              this.router.navigateByUrl('/landingDash/traveller/flights/flightssummary');
            }
          });
          }
        },
        error:err=>{
          alert(err.message);
        }
      });





      // this.authService.currentUser.subscribe(res => {
      //   if (res) {
      //     this.router.navigateByUrl('/landingDash/traveller/flights/flightssummary');
      //   } else {
      //     this.router.navigateByUrl('/landingDash/flights/flightssummary');
      //   }
      // });


    }
  }


  Classes = [
    {
      name: 'Economy',
      bonus: 0,
      features: ['Basic seating', 'Standard meal', '1 carry-on bag']
    },
    {
      name: 'First',
      bonus: 5000,
      features: ['Luxury seating', 'Premium meal', 'Extra baggage allowance']
    },
    {
      name: 'Business',
      bonus: 10000,
      features: ['Spacious seating', 'Exclusive lounge access', 'Priority boarding']
    }
  ];


  selectClass(bonus: number,className:string) {
    this.selectedBonus.set(bonus);
    this.selectedClassName.set(className);
    
  }

  seatAction(seatNo:string){
    if (this.flight()?.bookedSeats?.includes(seatNo)) return;
    const current =this.selectedSeats();
    if(current.includes(seatNo)){
      this.selectedSeats.set(current.filter(s=>s!==seatNo));
    }else if(current.length<this.numOfTravellers()){
      this.selectedSeats.set([...current,seatNo]);
    }

  }


    getTimediff(startTime:string,endTime:string):string{

    let start:any= new Date(`1970-01-01T${startTime}:00`).getTime();
    let end:any = new Date(`1970-01-01T${endTime}:00`).getTime();
    if(start>end){
      end+=(1000*60*60*24);
    }
    const diff:any= Math.abs(end-start);
    const diffhr=Math.floor(diff/(1000*60*60));
    const diffmin=Math.floor((diff/(1000*60))%60);

    return `${diffhr}h:${diffmin}m`;
    

  }


}
