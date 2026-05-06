import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptorsInterceptor: HttpInterceptorFn = (req, next) => {
  const router=inject(Router);

  const token = localStorage.getItem('WeTourjwt_token')??"";
  let authReq=req;
  if(token){
    authReq=req.clone({
      setHeaders:{
        Authorization:`Bearer ${token}`
      }
    });
  }
  return next(authReq).pipe(
    catchError((err:HttpErrorResponse)=>{
      if(err.status===401){
        console.warn("session expired or invalid Role.Redirecting to login...");
        localStorage.removeItem('WeTourjwt_token');
        router.navigateByUrl('/login'),{queryParams:{msg:"Token Expired or login with admin id"}};
      }
      return throwError(()=>err);
    })
  );
};
