import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Tokenservice } from '../services/tokenService/tokenservice';
import { Authservice } from '../services/AuthService/authservice';
import { firstValueFrom } from 'rxjs';

export const adminGuard: CanMatchFn =async  (route, segments) => {
  const authService = inject(Authservice);
  const user = await firstValueFrom(authService.currentUser);
  
  if(user){
    if(user.role==='ADMIN'){
      return true;
    }
  }
  return false;
};
