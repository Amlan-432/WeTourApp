import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Flightservice } from '../../services/FlightService/flightservice';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/AuthService/authservice';
import { debounceTime, distinctUntilChanged, EMPTY, switchMap } from 'rxjs';


type locationarr = {
  origin: {
    airport_code: string,
    city: string
  },
  destination: {
    airport_code: string,
    city: string
  }
}

@Component({
  selector: 'app-flight-serched',
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './flight-serched.html',
  styleUrl: './flight-serched.css',
})


export class FlightSerched {

  flightservice = inject(Flightservice);
  private authService = inject(Authservice);

  filteredOrigins: locationarr[] = [];
  filteredDestinations: locationarr[] = [];

  flight = {
    from: '',
    to: '',
    date: ''
  };

  flights = signal<any[]>([]);

  ngOnInit() {
    this.flightservice.searchedFlights$.subscribe(f=>{
   
      this.flights.set(f);
    });
    
    this.flightservice.currentSearch$.subscribe(criteria => {
      this.flight.from = criteria?.from || '';
      this.flight.to = criteria?.destination || '';
      this.flight.date=criteria?.date||'';
    });

  }

  applyFilter() {
    this.flightservice.getFlight(this.flight.from, this.flight.to, this.flight.date).subscribe();
  }
 onSearchInput(event:Event, target:'filteredOrigins'|'filteredDestinations'){
  const inputElement = event.target as HTMLInputElement;
  const value = inputElement.value;

  if (!value || value.trim().length === 0) {
    if (target === 'filteredOrigins') {
      this.filteredOrigins = []; 
    } else {
      this.filteredDestinations = [];
    }
    return;
  }
  this.flightservice.getOriginAndDest(value).subscribe({
    next: res => {
      if (res && res.success) {
        if (target === 'filteredOrigins') {
          this.filteredOrigins = [
                ...new Map(
                  [...this.filteredOrigins, ...res.data].map(item => [item.origin.airport_code, item])
                ).values()
              ];          
        } else {
          this.filteredDestinations = this.filteredDestinations = [
                ...new Map(
                  [...this.filteredDestinations, ...res.data].map(item => [item.destination.airport_code, item])
                ).values()
              ];
        }
      }
    },
    error: err => console.error('Search Error:', err)
  });
  }


  getUrl(endpoint:string):string{
    let url=`/landingDash/flights/flightsdetails/${endpoint}`;
    this.authService.currentUser.subscribe(res=>{
      if(res){
        url = `/landingDash/traveller/flights/flightsdetails/${endpoint}`;
      }
      return url;
    });
    return url;
    
  }


  getCurrentDate(){
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = date.getDate().toString().padStart(2,'0');
    return `${year}-${month}-${day}`;
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

  flightBeforePNRscheduled(departure_time:string):boolean{
    const date = this.flightservice.fdate(); 
    const time = departure_time;//07:30
    
    const dateOfFlight = new Date(`${date}T${time}:00`).getTime();
    const current = Date.now();
    
    const diffInHr = Math.floor((dateOfFlight-current)/(1000*60*60));

    if(diffInHr>=4){
      return true;
    }
    return false;
  }

}
