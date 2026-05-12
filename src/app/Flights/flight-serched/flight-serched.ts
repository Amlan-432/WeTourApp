import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Flightservice } from '../../services/FlightService/flightservice';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/AuthService/authservice';

@Component({
  selector: 'app-flight-serched',
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './flight-serched.html',
  styleUrl: './flight-serched.css',
})
export class FlightSerched {

  flightservice = inject(Flightservice);
  private authService = inject(Authservice);


  private readonly airlineLogos: { [key: string]: string } = {
    "Air India": "https://www.gstatic.com/flights/airline_logos/70px/AI.png",
    "IndiGo": "https://www.gstatic.com/flights/airline_logos/70px/6E.png",
    "SpiceJet": "https://www.gstatic.com/flights/airline_logos/70px/SG.png",
    "Vistara": "https://www.gstatic.com/flights/airline_logos/70px/UK.png",
    "GoAir": "https://www.gstatic.com/flights/airline_logos/70px/G8.png",
    "AirAsia": "https://www.gstatic.com/flights/airline_logos/70px/I5.png",
    "Akasa Air": "https://www.gstatic.com/flights/airline_logos/70px/QP.png" 
  };


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



   getLogo(airlineName: string): string {
    if (this.airlineLogos[airlineName]) return this.airlineLogos[airlineName];
    const key = Object.keys(this.airlineLogos).find(
      k => k.toLowerCase() === airlineName.toLowerCase()
    );
    return key ? this.airlineLogos[key] : 'https://www.gstatic.com/flights/airline_logos/70px/default.png';
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

}
