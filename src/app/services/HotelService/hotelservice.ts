import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, delay, Observable, of, Subject, tap, throwError } from 'rxjs';
import { Authservice } from '../AuthService/authservice';
import { HttpClient, HttpParams, HttpStatusCode } from '@angular/common/http';
import{HotelManDashboardData} from '../../../Models/hotelManData'



export interface SearchCriteria {
  location: string;
  people?: number;
  rooms?: number;
  start?: string;
  end?: string;
}

@Injectable({
  providedIn: 'root',
})

export class Hotelservice {

  private http = inject(HttpClient);
  is_loading = signal<boolean>(false);
  has_error = signal<boolean>(false);
  hotelManDash$= new BehaviorSubject<HotelManDashboardData|null>(null);



  private readonly API_URL = 'http://localhost:8000';

  private searchCriteria = new BehaviorSubject<SearchCriteria | null>(null);
  currentSearch$ = this.searchCriteria.asObservable();

  bookingDetails = new BehaviorSubject<any[]>([]);

  updateSearch(criteria: SearchCriteria): void {
    this.searchCriteria.next(criteria);
  }


  getOrigin(code: string): Observable<{ statusCode: number, data: any[], msg: string, success: boolean }> {

    return this.http.get<{ statusCode: number, data: any[], msg: string, success: boolean }>(`${this.API_URL}/traveller/searchOrigin/${code}`);

  }


  getHotels(location: string): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
    this.is_loading.set(true);

    const pathValue = location.trim() ? location : 'all';

    return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/user/getHotels/${pathValue}`).pipe(
      tap(res => {
        if (res.success) {
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


  getHotelById(id: string): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {

    this.is_loading.set(true);

    return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/user/getHotelDetails/${id}`).pipe(
      tap(res => {
        if (res.success) {
          this.is_loading.set(false)
        }
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    )
  }


  createBooking(hotelId: string, hotelUserId:string,roomType: string, travellers: any[], totalPrice: number, checkInDate: Date | null, checkOutDate: Date | null): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
    this.is_loading.set(true);
    return this.http.post<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/traveller/hotel`, { hotelId, hotelUserId,roomType, travellers, totalPrice, checkInDate, checkOutDate }).pipe(
      tap(res => {
        if (res.success) {
          this.bookingDetails.next(res.data);
        }
        this.is_loading.set(false);
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    )
  }


  getReviews(hotelId: string): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
    const params = new HttpParams().set('itemId', hotelId)
    return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/user/reviews`, { params });
  }


  //-------------------------For Hotel Manager---------------------------------------------

  getAllHotelsManager(): Observable<{ statusCode: number, msg: string, data: any[], success: true }> {

    this.is_loading.set(true);


    return this.http.get<{ statusCode: number, msg: string, data: any[], success: true }>(`${this.API_URL}/hotelManager/hotel`).pipe(
      tap(res => {
        if (res.success) {
          this.is_loading.set(false)
        }
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    );
  }

  addHotelsManager(hotelData: any): Observable<{ statusCode: number, msg: string, data: any[], success: true }> {

    this.is_loading.set(true);

    return this.http.post<{ statusCode: number, msg: string, data: any[], success: true }>(`${this.API_URL}/hotelManager/hotel`, hotelData).pipe(
      tap(res => {
        if (res.success) {
          this.is_loading.set(false)
        }
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    )
  }

  updateHotels(hotelId: string, standardRooms: number, deluxeRooms: number, standardPrice: number, deluxePrice: number): Observable<{ statusCode: number, msg: string, data: any[], success: true }> {

    this.is_loading.set(true);
    const params = new HttpParams().set('id', hotelId)

    const updateBody = {
      roomsAvailable: {
        standard: standardRooms,
        deluxe: deluxeRooms
      },
      pricePerNight: {
        standard: standardPrice,
        deluxe: deluxePrice
      }
    }

    return this.http.patch<{ statusCode: number, msg: string, data: any[], success: true }>(`${this.API_URL}/hotelManager/hotel`, updateBody, { params }).pipe(
      tap(res => {
        if (res.success) {
          this.is_loading.set(false)
        }
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    )
  }


  getGuestList(): Observable<{ statusCode: number, msg: string, data: any[], success: true }> {
    return this.http.get<{ statusCode: number, msg: string, data: any[], success: true }>(`${this.API_URL}/hotelManager/guestList`).pipe(
      tap(res => {
        if (res.success) {
          this.is_loading.set(false)
        }
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    );
  }

  changeBookingStatus(BookingId:string,updatedStatus:string):Observable<{ statusCode: number, msg: string, data: any[], success: true }>{
    this.is_loading.set(true);
    const params = new HttpParams().set('bookingId',BookingId)
    return this.http.patch<{ statusCode: number, msg: string, data: any[], success: true }>(`${this.API_URL}/hotelManager/guestList`,{updatedStatus},{params}).pipe(
      tap(res=>{
        if(res.success){
          this.is_loading.set(false);
        }
      }),
    catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    );
  }


  deleteHotel(hotelId: string): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {

    this.is_loading.set(true);

    const params = new HttpParams().set('id', hotelId);

    return this.http.delete<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/hotelManager/hotel`, { params })
      .pipe(
        tap(res => {
          if (res.success) {
            this.is_loading.set(false);
          }
        }),
        catchError(err => {
          this.has_error.set(true);
          this.is_loading.set(false);
          return throwError(() => err);
        })
      )

  }

  getHotelDashData(year:string,month:string): Observable<{ statusCode: number, msg: string, data:HotelManDashboardData, success: boolean }>{
    this.is_loading.set(true);
    const params = new HttpParams().set('year',year).set('month',month);
    return this.http.get<{ statusCode: number, msg: string, data:HotelManDashboardData, success: boolean }>(`${this.API_URL}/hotelManager/dash`,{params}).pipe(
      tap(res=>{
        if(res.success){
          this.hotelManDash$.next(res.data);
        }
        this.is_loading.set(false);
      }),
      catchError(err => {
        this.has_error.set(true);
        this.is_loading.set(false);
        return throwError(() => err)
      })
    );
  }


}




