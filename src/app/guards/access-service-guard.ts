import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Tokenservice } from '../services/tokenService/tokenservice';
import { Authservice } from '../services/AuthService/authservice';
import { firstValueFrom } from 'rxjs';

export const accessServiceGuard: CanActivateFn = async (route, state) => {

  
  const authService = inject(Authservice);
  const router = inject(Router);
  const user = await firstValueFrom(authService.currentUser);
  
  if(user){
    
    if(user.role==='TRAVELLER'){
      return true;
    }
    alert("u dont have access");
  }
  return router.navigateByUrl('/login');
};
