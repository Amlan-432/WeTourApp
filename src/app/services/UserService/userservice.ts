import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class Userservice {

  API_URL:string="http://localhost:8000/user";
  API_URL_TRAVELLER="http://localhost:8000/traveller";
  http=inject(HttpClient);
  _messages = signal<ChatMessage[]>([]);
  messages = computed(() => this._messages());
  myBookings$= new BehaviorSubject<[]>([]);
  isLoading = signal<boolean>(false);


  isExistsEmail(email:string):Observable<{isExists:boolean}>{

    return this.http.get<{isExists:boolean}>(`${this.API_URL}/validateEmail/${email}`);

  }

  chatAiMsg(message:string):Observable<{ statusCode: number, data:{response:string}, msg: string, success: true }>{
    this._messages.update(prev => [...prev, { role: 'user', text: message }]);
    this.isLoading.set(true);
    return this.http.post<{ statusCode: number, data:{response:string}, msg: string, success: true }>(`${this.API_URL_TRAVELLER}/chatAi`,{message}).pipe(
      tap(res=>{
        if(res.success){
          this._messages.update(prev => [...prev, { role: 'model', text: res.data.response }]);
        }
        this.isLoading.set(false);
      }),
     catchError(err => {
      console.log(err);
            this._messages.update(prev => [...prev, { 
            role: 'model', 
            text: "I'm having trouble reaching the WeTour servers. Please check your connection." 
          }]);
             this.isLoading.set(false);
             return throwError(() => err);
           }));

  }

  myBookings():Observable<{ statusCode: number, data:{allBookings:[]}, msg: string, success: true }>{
    this.isLoading.set(true);
    return this.http.get<{ statusCode: number, data:{allBookings:[]}, msg: string, success: true }>(`${this.API_URL_TRAVELLER}/mybookings`).pipe(
      tap(res=>{
        if(res.success){
          this.myBookings$.next(res.data.allBookings)
        }
        this.isLoading.set(false)
      }),
      catchError(err => {
             this.isLoading.set(false);
             return throwError(() => err);
           }));
  }

  addReview(payload:any):Observable<{ statusCode: number, data:{}, msg: string, success: true }>{
    this.isLoading.set(true);
    return this.http.post<{ statusCode: number, data:{}, msg: string, success: true }>(`${this.API_URL_TRAVELLER}/mybookings`,payload).pipe(
      tap(res=>{
        if(res.success){
          this.isLoading.set(false);
        }
      }),
      catchError(err => {
             this.isLoading.set(false);
             return throwError(() => err);
           }));
  }


  
}
