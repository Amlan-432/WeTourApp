import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import {HotelManDashboardData} from '../../../Models/hotelManData';


@Injectable({
  providedIn: 'root',
})
export class PackageService {

  private http = inject(HttpClient);


  private readonly API_URL_User: string = "http://localhost:8000/user";
  private readonly API_URL_Traveller: string = "http://localhost:8000/traveller";
  private readonly API_URL_Package: string = "http://localhost:8000/package"; 

  packages = new BehaviorSubject<any[]>([]); 
  getAllPackage$ = new BehaviorSubject<any[]>([]);
  guestList$ = new BehaviorSubject<any[]>([]);
  dashStats$ =new BehaviorSubject<HotelManDashboardData|null>(null);
  isLoading = signal<boolean>(false);
  hasErrors: boolean = false;
  bookedPackageDetails$ = new BehaviorSubject<any | null>(null);



  //user
  getdestination(word:string):Observable<{statusCode:number,msg:string,data:any[],success:boolean}>{
    return this.http.get<{statusCode:number,msg:string,data:any[],success:boolean}>(`${this.API_URL_User}/dropDest/${word}`);
  }

  searchPackage(dest:string,start_date:string):Observable<{statusCode:number,msg:string,data:any[],success:boolean}>{
    this.isLoading.set(true);
    const params = new HttpParams().set('destination',dest)
                                    .set('start_date',start_date)
    return this.http.get<{statusCode:number,msg:string,data:any[],success:boolean}>(`${this.API_URL_User}/searchPackage`,{params}).pipe(
      tap(res=>{
        if(res.success){
          this.packages.next(res.data);
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      }));
  }



//package

addPackage(packageData: any): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);

  return this.http.post<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Package}/package`, 
    packageData
  ).pipe(
    tap(res => {
      if (res.success) {
        this.isLoading.set(false);
      }
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


getAllPackages(): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
  this.isLoading.set(true);
  return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL_Package}/package`).pipe(
    tap(res => {
      if (res.success) {
        this.getAllPackage$.next(res.data);
      }
      this.isLoading.set(false);
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


updatePackage(id: string, updatedData: any): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
  this.isLoading.set(true);

const params = new HttpParams().set('id',id);
  return this.http.patch<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Package}/package`, 
    updatedData,{params}
  ).pipe(
    tap(res => {
      if (res.success) {
        this.isLoading.set(false);
      }
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}




deletePackage(id: string): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);
  const params = new HttpParams().set('id',id);

  return this.http.delete<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Package}/package`,{params}
  ).pipe(
    tap(res => {
      if (res.success) {
        this.isLoading.set(false);
      }
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


bookingGuestList(): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
    this.isLoading.set(true);
   
    return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(
      `${this.API_URL_Package}/getGuest`
    ).pipe(
      tap(res => {
        
        if (res.success) {
          this.guestList$.next(res.data); 
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        
        this.hasErrors = true;
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }



//traveller
bookPackage( packageId: string, packageUserId:string, travellers: any[]): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);
  const payload = {
    package_id: packageId,
    PackageUserId:packageUserId,
    travellers: travellers
  };
  return this.http.post<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Traveller}/package`, 
    payload
  ).pipe(
    tap(res => {
      if (res.success) {
        this.bookedPackageDetails$.next(res.data.booking);
      }
      this.isLoading.set(false);
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}


cancelPackageBooking(bookingId: string): Observable<{ statusCode: number, msg: string, data: any, success: boolean }> {
  this.isLoading.set(true);

  const params = new HttpParams().set('bookingId',bookingId);

  return this.http.patch<{ statusCode: number, msg: string, data: any, success: boolean }>(
    `${this.API_URL_Traveller}/package`, 
    {},{params}
  ).pipe(
    tap(res => {
      if (res.success) {
        this.isLoading.set(false);
      }
    }),
    catchError(err => {
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}

 getPackageDashData(year:string,month:string): Observable<{ statusCode: number, msg: string, data:HotelManDashboardData, success: boolean }>{
    this.isLoading.set(true);
    const params = new HttpParams().set('year',year).set('month',month);
    return this.http.get<{ statusCode: number, msg: string, data:HotelManDashboardData, success: boolean }>(`${this.API_URL_Package}/dash`,{params}).pipe(
      tap(res=>{
        if(res.success){
          this.dashStats$.next(res.data);
        }
        this.isLoading.set(false);
      }),
      catchError(err => {
        this.hasErrors=true;
        this.isLoading.set(false);
        return throwError(() => err)
      })
    );
  }
  
}
