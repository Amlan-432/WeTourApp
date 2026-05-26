import { Component, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { Authservice } from '../services/AuthService/authservice';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterModule,RouterLinkActive],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {

  

  router=inject(Router);
  authservice=inject(Authservice);


  onLogout() {
  this.authservice.logout().subscribe({
    next: (res) => {
      console.log("Logged out successfully on backend:", res);
      this.authservice.currentUser.next(null);
      this.authservice.isLoggedin = false;
       this.authservice.xsrf().subscribe({
        next: () => {
          console.log("Fresh guest CSRF token initialized for the next user.");
          this.router.navigateByUrl('/login'); 
        }
      }); 
    },
    error: (err) => {
      console.error("Logout failed:", err);
      this.authservice.currentUser.next(null);
      this.authservice.isLoggedin = false;
      this.router.navigateByUrl('/login');
    }
  });
}

   getUrl(endpoint:string):string{
    if(this.authservice.isLoggedin){
      return `/landingDash/traveller/${endpoint}`;
    }

    return `/landingDash/${endpoint}`;
  }

}
