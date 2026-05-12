import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, delay, Observable, of, tap, throwError } from 'rxjs';

export interface FlightSearchCriteria {
  from?: string;
  destination: string;
  date?: string;
  people: number;
}

@Injectable({
  providedIn: 'root',
})
export class Flightservice {
  http =inject(HttpClient);
  API_URL_Traveller:string="http://localhost:8000/traveller";
  API_URL_User:string="http://localhost:8000/user";

  private searchCriteria = new BehaviorSubject<FlightSearchCriteria | null>(null);


  currentSearch$ = this.searchCriteria.asObservable();
  fdate=signal<any>('');
  searchedFlights$= new BehaviorSubject<any[]>([]);
  // searchedFlights$=this.searchedFlights.asObservable();
  isLoading=signal<boolean>(false);
  hasErrors:boolean=false;


  private readonly flights = [
  { 
    FlightID: 'F1-22', 
    Airline: 'Akasa Air', 
    From: 'New Delhi', 
    To: 'Bangalore', 
    BasePrice: 6600, 
    Departure: '10:10 AM', 
    Arrival:'12:55 PM', 
    Duration: '2h 45m',
    Classes: [
      { name: 'Economy', bonus: 0, features: ['Standard Seat', '1 Free Meal'] },
      { name: 'Premium', bonus: 2500, features: ['Extra Legroom', 'Priority Boarding'] },
      { name: 'Business', bonus: 8000, features: ['Luxury Seat', 'Lounge Access', 'Free Drinks'] }
    ],
  },
  { 
    FlightID: 'JS-44', 
    Airline: 'Indigo', 
    From: 'Bagdogra', 
    To: 'Bangalore', 
    BasePrice: 8000, 
    Departure: '04:55 PM',
    Arrival:'07:55 PM',  
    Duration: '3h',
    Classes: [
      { name: 'Economy', bonus: 0, features: ['Standard Seat', '1 Free Meal'] },
      { name: 'Premium', bonus: 2500, features: ['Extra Legroom', 'Priority Boarding'] },
      { name: 'Business', bonus: 8000, features: ['Luxury Seat', 'Lounge Access', 'Free Drinks'] }
    ],
  }
];


  constructor() {}
  
  updateSearch(criteria: FlightSearchCriteria): void {
    console.log('Updating search store with:', criteria);
    this.searchCriteria.next(criteria);
  }

  getFlight(from: string, to: string, date: string): Observable<{statusCode:number,data:any[],msg:string,success:true}> {
    debugger;
     this.isLoading.set(true);
     const params = new HttpParams()
      .set('origin', from)
      .set('destination', to)
      .set('date', date);

      return this.http.get<{statusCode:number,data:any[],msg:string,success:true}>(`${this.API_URL_User}/searchFlight`,{params}).pipe(
        tap(res=>{
          debugger;
          if(res.success){
            debugger;
            this.searchedFlights$.next(res.data);
          }
          this.isLoading.set(false);
        }),
         catchError(err=>{
              this.hasErrors=true;
              this.isLoading.set(false);
              return throwError(()=>err);
        }));
}

 
  getLatestSearchValue(): FlightSearchCriteria | null {
    return this.searchCriteria.getValue();
  }
















getOriginAndDest(code:string):Observable<{statusCode:number,data:any[],msg:string,success:boolean}>{

  return this.http.get<{statusCode:number,data:any[],msg:string,success:boolean}>(`${this.API_URL_User}/searchOrigin/${code}`);

}

  
}
