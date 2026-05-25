import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { DashboardData } from '../../../Models/adminDashData';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  http=inject(HttpClient);
  API_URL:string="http://localhost:8000/admin";

  allUsers= new BehaviorSubject<any[]>([]);
  allUsers$=this.allUsers.asObservable();

  allFlightsIns$=new BehaviorSubject<any[]>([]);
  allTourPackage$=new BehaviorSubject<any[]>([]);
  allHotels$=new BehaviorSubject<any[]>([]);
  allBookings$=new BehaviorSubject<{}>({});
  allstats$=new BehaviorSubject<DashboardData|null>(null);
  isLoading=signal<boolean>(false);
  hasErrors:boolean=false;


  getAllUsers():Observable<{statusCode:number,data:any[],message:string,success:boolean}>{
    this.isLoading.set(true);
    return this.http.get<{statusCode:number,data:any[],message:string,success:boolean}>(`${this.API_URL}/users`).pipe(
      tap(res=>{
        this.allUsers.next(res.data);
        this.isLoading.set(false);
            
      }),
      catchError(err=>{
        this.hasErrors=true;
        this.isLoading.set(false);
        return throwError(()=>err);
      })
    );
  }

  changeRole(userID:string,updatedRole:string):Observable<{statusCode:number,data:any[],message:string,success:boolean}>{
    debugger;
    this.isLoading.set(true);
    const params = new HttpParams().set('user_id',userID).set('updatedRole',updatedRole);
    return this.http.patch<{statusCode:number,data:any[],message:string,success:boolean}>(`${this.API_URL}/users`,{},{params}).pipe(
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

  getAllFlightsIns():Observable<{statusCode:number,data:any[],message:string,success:boolean}>{
    this.isLoading.set(true);
    return this.http.get<{statusCode:number,data:any[],message:string,success:boolean}>(`${this.API_URL}/flight`).pipe(
      tap(flights=>{
        if(flights.success){
          this.allFlightsIns$.next(flights.data);
        }
        this.isLoading.set(false);
      }),
       catchError(err=>{
        this.hasErrors=true;
        this.isLoading.set(false);
        return throwError(()=>err);
      }));
  }

  cancelFlight(fIid:string):Observable<{statusCode:number,data:any[],message:string,success:boolean}>{
    this.isLoading.set(true);
    const params=new HttpParams().set('fIid',fIid);
    return this.http.patch<{statusCode:number,data:any[],message:string,success:boolean}>(`${this.API_URL}/flight`,{},{params}).pipe(
      tap(f=>{
        if(f.success){
          this.isLoading.set(false);
        }
      })
    )
  }


  getAllPackages(): Observable<{ statusCode: number, msg: string, data: any[], success: boolean }> {
  this.isLoading.set(true);
  return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/TourPackage`).pipe(
    tap(res => {
      if (res.success) {
        this.allTourPackage$.next(res.data);
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

getAllHotels():Observable<{ statusCode: number, msg: string, data: any[], success: boolean }>{
  this.isLoading.set(true);
  return this.http.get<{ statusCode: number, msg: string, data: any[], success: boolean }>(`${this.API_URL}/hotel`).pipe(
    tap(res=>{
      if(res.success){
        this.allHotels$.next(res.data);
      }
      this.isLoading.set(false);
    }),
    catchError(err => {
      debugger;
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}

getAllBookings():Observable<{ statusCode: number, msg: string, data:{allBookings:{}}, success: boolean }>{
  this.isLoading.set(true);
    return this.http.get<{ statusCode: number, msg: string, data: {allBookings:{}}, success: boolean }>(`${this.API_URL}/all`).pipe(
      tap(res=>{
        if(res.success){
          this.allBookings$.next(res.data.allBookings);
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

getAllstats(year:string,month:string):Observable<{ statusCode: number, msg: string, data:DashboardData, success: boolean }>{
  this.isLoading.set(true);
  debugger;
  const params = new HttpParams().set('year',year).set('month',month);
  return this.http.get<{ statusCode: number, msg: string, data:DashboardData, success: boolean }>(`${this.API_URL}/dash`,{params}).pipe(
    tap(res=>{
      debugger;
      if(res.success){
        this.allstats$.next(res.data)
      }
      this.isLoading.set(false)
    }),
  catchError(err => {
    debugger;
      this.hasErrors = true;
      this.isLoading.set(false);
      return throwError(() => err);
    })
  );
}

  
}
