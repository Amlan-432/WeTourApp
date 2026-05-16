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
  http = inject(HttpClient);
  API_URL_Traveller: string = "http://localhost:8000/traveller";
  API_URL_User: string = "http://localhost:8000/user";

  private searchCriteria = new BehaviorSubject<FlightSearchCriteria | null>(null);


  currentSearch$ = this.searchCriteria.asObservable();
  fdate = signal<any>('');
  passengers$ = new BehaviorSubject<any[]>([]);
  searchedFlights$ = new BehaviorSubject<any[]>([]);
  bookFlightdetails$=new BehaviorSubject<any[]>([]);
  userAllbfd$=new BehaviorSubject<any[]>([]);
  isLoading = signal<boolean>(false);
  hasErrors: boolean = false;

  // Airline Logo Mapping
  private readonly airlineLogos: { [key: string]: string } = {
  "Emirates": "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
  "Qatar Airways": "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
  "Air India": "https://www.gstatic.com/flights/airline_logos/70px/AI.png",
  "IndiGo": "https://www.gstatic.com/flights/airline_logos/70px/6E.png",
  "Lufthansa": "https://www.gstatic.com/flights/airline_logos/70px/LH.png",
  "British Airways": "https://www.gstatic.com/flights/airline_logos/70px/BA.png",
  "Singapore Airlines": "https://www.gstatic.com/flights/airline_logos/70px/SQ.png",
  "Etihad Airways": "https://www.gstatic.com/flights/airline_logos/70px/EY.png",
  "Air France": "https://www.gstatic.com/flights/airline_logos/70px/AF.png",
  "Turkish Airlines": "https://www.gstatic.com/flights/airline_logos/70px/TK.png",
  "United Airlines": "https://www.gstatic.com/flights/airline_logos/70px/UA.png"
  };




  constructor() { }

  updateSearch(criteria: FlightSearchCriteria): void {
    console.log('Updating search store with:', criteria);
    this.searchCriteria.next(criteria);
  }

  getFlight(from: string, to: string, date: string): Observable<{ statusCode: number, data: any[], msg: string, success: true }> {

    this.isLoading.set(true);
    this.fdate.set(date);
    const params = new HttpParams()
      .set('origin', from)
      .set('destination', to)
      .set('date', date);

    return this.http.get<{ statusCode: number, data: any[], msg: string, success: true }>(`${this.API_URL_User}/searchFlight`, { params }).pipe(
      tap(res => {
        if (res.success) {
          this.searchedFlights$.next(res.data);
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      }));
  }

  getFlightFromID(flightId:string,fDate:string):Observable<{statusCode: number, data: any[], msg: string, success: true}>{
    this.isLoading.set(true);
    const params = new HttpParams()
      .set('flightId', flightId)
      .set('fDate', fDate);

    return this.http.get<{statusCode: number, data: any[], msg: string, success: true}>(`${this.API_URL_Traveller}/flights`,{params}).pipe(
      tap(res=>{
        if(res.success){
          this.isLoading.set(false);
        }
      }),
      catchError(err => {
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      }));
  }


  bookFlight(user_Id:string,template_Id:string,date:string,total_price:number,passengers:any[]):Observable<{ statusCode: number, data: any[], msg: string, success: boolean }>{
    this.isLoading.set(true);
    return this.http.post<{ statusCode: number, data: any[], msg: string, success: boolean }>(`${this.API_URL_Traveller}/flights`,{user_Id,template_Id,date,total_price,passengers}).pipe(
      tap(res=>{
        if(res.success){
          this.bookFlightdetails$.next(res.data);
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      }));
  }

  cancelBooking(pnr_number:string):Observable<{ statusCode: number, data: any[], msg: string, success: true }>{
    this.isLoading.set(true);
    const params = new HttpParams()
    .set('pnr_number', pnr_number);    
    return this.http.patch<{ statusCode: number, data: any[], msg: string, success: true }>(`${this.API_URL_Traveller}/flights`,{},{params}).pipe(
      tap(res=>{
        debugger;
        if(res.success){
          this.isLoading.set(false);
        }
      })
    )
  }

  getFlightBookedDetails():Observable<{ statusCode: number, data: any[], msg: string, success: true }>{
    this.isLoading.set(true);
    return this.http.get<{ statusCode: number, data: any[], msg: string, success: true }>(`${this.API_URL_Traveller}/flight/bookingDetails`).pipe(
      tap(res=>{
        if(res.success){
          this.userAllbfd$.next(res.data);
        }
        this.isLoading.set(false);
      }),
    catchError(err => {
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      }));
  }


  getLatestSearchValue(): FlightSearchCriteria | null {
    return this.searchCriteria.getValue();
  }


  getOriginAndDest(code: string): Observable<{ statusCode: number, data: any[], msg: string, success: boolean }> {

    return this.http.get<{ statusCode: number, data: any[], msg: string, success: boolean }>(`${this.API_URL_User}/searchOrigin/${code}`);

  }


  getLogo(airlineName: string): string {
    if (!airlineName) return '';

    const key = Object.keys(this.airlineLogos).find(
      k => k.toLowerCase() === airlineName.toLowerCase()
    );
    return key ? this.airlineLogos[key] : 'https://www.gstatic.com/flights/airline_logos/70px/default.png';
  }


}
