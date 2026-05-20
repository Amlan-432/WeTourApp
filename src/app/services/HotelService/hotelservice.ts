import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, delay, Observable, of, Subject, tap, throwError } from 'rxjs';
import { Authservice } from '../AuthService/authservice';
import { HttpClient, HttpParams, HttpStatusCode } from '@angular/common/http';



export interface SearchCriteria {
  location: string;
  people?: number; // Added this
  rooms?: number;  // Added this
  start?: string;
  end?: string;
}

@Injectable({
  providedIn: 'root',
})

export class Hotelservice {

  private router = inject(Router);
  private authservice = inject(Authservice);
  private loggedInUser!:any;
  private http = inject(HttpClient);
  is_loading = signal<boolean>(false);
  has_error = signal<boolean>(false);


  
  private readonly API_URL= 'http://localhost:8000';

  private searchCriteria = new BehaviorSubject<SearchCriteria | null>(null);
  currentSearch$ = this.searchCriteria.asObservable();

  bookingDetails = new BehaviorSubject<any[]>([]);

  updateSearch(criteria: SearchCriteria): void {
    this.searchCriteria.next(criteria);
  }


getHotels(location: string): Observable<{statusCode:number,msg:string,data:any[],success:boolean}>{
   this.is_loading.set(true);

  const pathValue = location.trim() ? location : 'all';

  return this.http.get<{statusCode:number,msg:string,data:any[],success:boolean}>(`${this.API_URL}/user/getHotels/${pathValue}`).pipe(
    tap(res=>{
      if(res.success){
        this.is_loading.set(false)
      }
    }
    ),
     catchError(err => {
            this.has_error.set(true);
            this.is_loading.set(false);
            return throwError(() => err);
          }));
}


getHotelById(id:string):Observable<{statusCode:number,msg:string,data:any[], success:boolean}>{

  this.is_loading.set(true);

  return this.http.get<{statusCode:number,msg:string,data:any[], success:boolean}>(`${this.API_URL}/user/getHotelDetails/${id}`).pipe(
    tap(res=>{
      if(res.success){
        this.is_loading.set(false)
      }
    }),
    catchError(err =>{
      this.has_error.set(true);
      this.is_loading.set(false);
      return throwError(()=>err)
    })
  )
}


  createBooking(hotelId:string, roomType:string, travellers:any[], totalPrice:number, checkInDate:Date | null, checkOutDate:Date | null): Observable<{statusCode:number, msg:string,data:any[], success:boolean}> {
    this.is_loading.set(true);
    debugger;
        return this.http.post<{statusCode:number, msg:string,data:any[], success:boolean}>(`${this.API_URL}/traveller/hotel`,{hotelId, roomType, travellers, totalPrice, checkInDate, checkOutDate}).pipe(
          tap(res=>{
            debugger;
            if(res.success){
              this.bookingDetails.next(res.data);
            }
            this.is_loading.set(false);
          }),
          catchError(err =>{
            debugger;
            this.has_error.set(true);
            this.is_loading.set(false);
            return throwError(()=>err)
          })
        )
   }

  
   //-------------------------For Hotel Manager---------------------------------------------

   getAllHotelsManager():Observable<{statusCode:number, msg:string, data:any[],success:true}>{

    this.is_loading.set(true);

    
      return this.http.get<{statusCode:number, msg:string, data:any[],success:true}>(`${this.API_URL}/hotelManager/hotel`).pipe(
        tap(res=>{
          if(res.success){
            this.is_loading.set(false)
          }
        }),
        catchError(err=>{
          this.has_error.set(true);
          this.is_loading.set(false);
          return throwError(()=>err)
        })
      );
   }

   addHotelsManager(hotelData:any):Observable<{statusCode:number, msg:string, data:any[], success:true}>{

    this.is_loading.set(true);

      return this.http.post<{statusCode:number, msg:string, data:any[], success:true}>(`${this.API_URL}/hotelManager/hotel`, hotelData).pipe(
        tap(res=>{
          if(res.success){
            this.is_loading.set(false)
          }
        }),
        catchError(err=>{
          this.has_error.set(true);
          this.is_loading.set(false);
          return throwError(()=>err)
        })
      )
   }

   getGuestList():Observable<{statusCode:number, msg:string, data:any[], success:true}>{
    return this.http.get<{statusCode:number, msg:string, data:any[], success:true}>(`${this.API_URL}/hotelManager/guest`).pipe(
      tap(res=>{
        if(res.success){
          this.is_loading.set(false)
        }
      }),
      catchError(err=>{
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(()=>err)
      })
    )
   }

  
}




