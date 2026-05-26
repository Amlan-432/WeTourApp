import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { Authservice } from '../../services/AuthService/authservice';

@Component({
  selector: 'app-hotel-man-dashboard',
  imports: [CommonModule,FormsModule,RouterModule,RouterLinkActive],
  templateUrl: './hotel-man-dashboard.html',
  styleUrl: './hotel-man-dashboard.css',
})
export class HotelManDashboard {
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

}
