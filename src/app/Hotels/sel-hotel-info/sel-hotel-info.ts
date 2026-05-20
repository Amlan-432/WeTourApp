import { Component, inject, signal } from '@angular/core';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sel-hotel-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './sel-hotel-info.html',
  styleUrl: './sel-hotel-info.css',
})
export class SelHotelInfo {
  hotelService = inject(Hotelservice);
  confirmedBooking = signal<any>({});
  


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
}
