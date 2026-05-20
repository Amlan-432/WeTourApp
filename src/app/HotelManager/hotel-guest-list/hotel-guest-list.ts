import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hotel-guest-list',
  imports: [CommonModule],
  templateUrl: './hotel-guest-list.html',
  styleUrl: './hotel-guest-list.css',
})
export class HotelGuestList {
      public hotelService = inject(Hotelservice);
      private subscription = new Subscription();

      allBookings  = signal<any[]>([]);

      ngOnInit(){
        this.getAllGuests();

      }

      getAllGuests(){
        this.subscription.add(

          this.hotelService.getGuestList().subscribe({
            next:(res) =>{
              if(res.data && res.success){
                this.allBookings.set(res.data);
                console.log("List add", res.data);
              }
            },
            error:(err)=>{
              console.log("Failed", err)
            }

          })
        )
      }

      
      ngOnDestroy():void{
        this.subscription.unsubscribe();
      }
      
}
