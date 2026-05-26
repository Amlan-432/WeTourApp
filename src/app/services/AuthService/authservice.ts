import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { Tokenservice } from '../tokenService/tokenservice';
import { User } from '../../../Models/User.model';

@Injectable({
  providedIn: 'root',
})
export class Authservice {

  API:string='http://localhost:8000';
  API_URL:string="http://localhost:8000/user";
  API_URL_T:string='http://localhost:8000/traveller'
  http=inject(HttpClient);
  tokenservice = inject(Tokenservice);

  currentUser = new BehaviorSubject<any>(null);
  currentCsrfToken: string = '';
  isLoggedin:boolean=false;

  loginUser(email: string, password: string):  Observable<{ statusCode: number, data: any, msg: string, success: boolean }> {
    return this.http.post<{ statusCode: number, data: any, msg: string, success: boolean }>(
      `${this.API_URL}/auth`, 
      { email, password }
    ).pipe(
      tap(r => {
        if (r.success) {
          debugger;
          const decodedToken = this.tokenservice.tokenDecode(r.data.token);
          this.currentUser.next(decodedToken.user);
          this.currentCsrfToken=r.data?.csrfToken;
          this.isLoggedin=true;
        }
      })
    );
  }

  xsrf():Observable<{status:string,csrfToken:string}>{
    return this.http.get<{status:string,csrfToken:string}>(`http://localhost:8000/api/init-session`,{ withCredentials: true }).pipe(
      tap(res=>{
        if(res){
          this.currentCsrfToken=res.csrfToken;
        }
      })
    );
  }

  getInMemoryCsrfToken(): string {
    return this.currentCsrfToken;
  }

  logout():Observable<{statusCode: number, data: any, msg: string, success: boolean}>{
    debugger;

    return this.http.post<{statusCode: number, data: any, msg: string, success: boolean} >(`${this.API}/auth/logout`,{},{withCredentials:true});

  }

//registerUser---->>>

  registerUser(user:User):Observable<{msg:string,res:any,success:boolean}>{
    
    const {name,email,password,role,phone} =user;
    return this.http.post<{msg:string,res:any,success:boolean}>(`${this.API_URL}/register`,{name,email,password,role,phone});
  }


  getProfile(): Observable<{ statusCode: number, data: any, msg: string, success: boolean }|null> {
    return this.http.get<{ statusCode: number, data: any, msg: string, success: boolean }>(
      `${this.API}/auth/getprofile`, 
      { withCredentials: true }
    ).pipe(
      tap(response => {
        debugger;
        if (response && response.success) {
          this.currentUser.next(response.data);
          this.isLoggedin=true;
        }
      }),
      catchError(() => {
        this.currentUser.next(null);
        return of(null); 
      })
    );
  }
  
}
