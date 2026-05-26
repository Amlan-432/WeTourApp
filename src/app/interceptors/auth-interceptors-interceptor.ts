import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Authservice } from '../services/AuthService/authservice';

export const authInterceptorsInterceptor: HttpInterceptorFn = (req, next) => {
  const router=inject(Router);
  const authService = inject(Authservice);

  // const token = localStorage.getItem('WeTourjwt_token')??"";
  // let authReq=req;
  // if(token){
  //   authReq=req.clone({
  //     setHeaders:{
  //       Authorization:`Bearer ${token}`
  //     }
  //   });
  // }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next(req.clone({ withCredentials: true }));
  }
  const token = authService.getInMemoryCsrfToken();

  const secureReq = req.clone({
    setHeaders: {
      'x-csrf-token': token 
    },
    withCredentials: true 
  });
  return next(secureReq).pipe(
    catchError((err:HttpErrorResponse)=>{
      if(err.status===401){
        console.warn("session expired.Redirecting to login...");
        alert("session expired or invalid Role. Redirecting to login...");
        authService.currentUser.next(null);
        router.navigate(['/login'], { queryParams: { msg: "Token Expired" } });
      }
      return throwError(()=>err);
    })
  );
};
