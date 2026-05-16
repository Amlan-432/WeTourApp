import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Tokenservice } from '../tokenService/tokenservice';
import { User } from '../../../Models/User.model';

@Injectable({
  providedIn: 'root',
})
export class Authservice {

  API_URL:string="http://localhost:8000/user";
  http=inject(HttpClient);
  tokenservice = inject(Tokenservice);

  currentUser = new BehaviorSubject<any>(this.getDecodedToken());

  private getDecodedToken() {
    const token = localStorage.getItem("WeTourjwt_token");
    if (token) {
      const decoded = this.tokenservice.tokenDecode(token);
      return decoded?.user || null;
    }
    return null;
  }

//userLogin---->>>>>

  loginUser(email:string,password:string):Observable<{data:{token:string},msg:string,success:boolean}>{

    // debugger;

    return this.http.post<{data:{token:string},msg:string,success:boolean}>(`${this.API_URL}/auth`,{email,password}).pipe(
      tap(r=>{
        if(r?.data?.token && r?.success){
          localStorage.setItem("WeTourjwt_token",r.data.token);
          const decodedtoken =this.tokenservice.tokenDecode(r.data.token);
          this.currentUser.next(decodedtoken.user);
        }else{
          r.msg="Invalid Credentials";
        }
      })
    );
  }

//registerUser---->>>

  registerUser(user:User):Observable<{msg:string,res:any,success:boolean}>{
    
    const {name,email,password,role,phone} =user;
    return this.http.post<{msg:string,res:any,success:boolean}>(`${this.API_URL}/register`,{name,email,password,role,phone});
  }
  
}
