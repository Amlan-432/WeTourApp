import { Component, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { Authservice } from '../../services/AuthService/authservice';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule,RouterLinkActive],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {

  router=inject(Router);
  private authService = inject(Authservice);

  onLogout() {
  this.authService.logout().subscribe({
    next: (res) => {
      console.log("Logged out successfully on backend:", res);
      this.authService.currentUser.next(null);
      this.authService.isLoggedin = false;
       this.authService.xsrf().subscribe({
        next: () => {
          console.log("Fresh guest CSRF token initialized for the next user.");
          this.router.navigateByUrl('/login'); 
        }
      }); 
    },
    error: (err) => {
      console.error("Logout failed:", err);
      this.authService.currentUser.next(null);
      this.authService.isLoggedin = false;
      this.router.navigateByUrl('/login');
    }
  });
}

}
