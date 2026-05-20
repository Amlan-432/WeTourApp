import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Tokenservice } from '../services/tokenService/tokenservice';

export const accessServiceGuard: CanActivateFn = (route, state) => {

  
  const tokenService=inject(Tokenservice);
  const token = localStorage.getItem('WeTourjwt_token');
  const router = inject(Router);
  
  if(token){
    const decodedtoken = tokenService.tokenDecode(token);
    
    if(decodedtoken.user.role==='TRAVELLER'){
      return true;
    }
    alert("u dont have access");
  }
  return router.navigateByUrl('/login');
};
