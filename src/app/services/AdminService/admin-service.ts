import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  http=inject(HttpClient);
  API_URL:string="http://localhost:8000/admin";

  allUsers= new BehaviorSubject<any[]>([]);
  allUsers$=this.allUsers.asObservable();

  allFlights$=new BehaviorSubject<any[]>([]);
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

  getAllFlights():Observable<{statusCode:number,data:any[],message:string,success:boolean}>{
    this.isLoading.set(true);
    return this.http.get<{statusCode:number,data:any[],message:string,success:boolean}>(`${this.API_URL}/flight`).pipe(
      tap(flights=>{
        if(flights.success){
          this.allFlights$.next(flights.data);
        }
        this.isLoading.set(false);
      }),
       catchError(err=>{
        this.hasErrors=true;
        this.isLoading.set(false);
        return throwError(()=>err);
      }));
  }
  
}
