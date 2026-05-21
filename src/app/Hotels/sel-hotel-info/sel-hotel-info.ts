import { Component, inject, signal } from '@angular/core';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sel-hotel-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './sel-hotel-info.html',
  styleUrl: './sel-hotel-info.css',
})
export class SelHotelInfo {
  hotelService = inject(Hotelservice);
  confirmedBooking = signal<any>({});
  router = inject(Router);
  


  ngOnInit(){
    this.hotelService.bookingDetails.subscribe({
      next:(res)=>{
        if(res){
          this.confirmedBooking.set(res);
          console.log(this.confirmedBooking());
        }
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

   goHome(){
    const re = confirm('redirecting to booking page');
    if(re){
    this.router.navigateByUrl('/landingDash/traveller');
    }
  }
}
