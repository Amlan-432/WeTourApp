import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

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
  isLoading = signal<boolean>(false);


  isExistsEmail(email:string):Observable<{isExists:boolean}>{

    return this.http.get<{isExists:boolean}>(`${this.API_URL}/validateEmail/${email}`);

  }

  chatAiMsg(message:string):Observable<{ statusCode: number, data:{response:string}, msg: string, success: true }>{
    this._messages.update(prev => [...prev, { role: 'user', text: message }]);
    this.isLoading.set(true);
    debugger;
    return this.http.post<{ statusCode: number, data:{response:string}, msg: string, success: true }>(`${this.API_URL_TRAVELLER}/chatAi`,{message}).pipe(
      tap(res=>{
        debugger;
        if(res.success){
          this._messages.update(prev => [...prev, { role: 'model', text: res.data.response }]);
        }
        this.isLoading.set(false);
      }),
     catchError(err => {
      debugger;
      console.log(err);
            this._messages.update(prev => [...prev, { 
            role: 'model', 
            text: "I'm having trouble reaching the WeTour servers. Please check your connection." 
          }]);
             this.isLoading.set(false);
             return throwError(() => err);
           }));

  }


  
}
