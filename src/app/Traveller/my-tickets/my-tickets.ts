import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Flightservice } from '../../services/FlightService/flightservice';

@Component({
  selector: 'app-my-tickets',
  imports: [CommonModule,FormsModule],
  templateUrl: './my-tickets.html',
  styleUrl: './my-tickets.css',
})
export class MyTickets {
  flightService = inject(Flightservice);
  tickets = signal<any[]>([]);
  searchQuery = signal('');

  filteredTickets = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.tickets().filter(t => 
      t.instance_id?.template_id?.origin?.city.toLowerCase().includes(query) || 
      t?.pnr_number.toLowerCase().includes(query)
    );
  });


  ngOnInit(){
    this.flightService.getFlightBookedDetails().subscribe();

    this.flightService.userAllbfd$.subscribe({
      next:res=>{
        if(res)this.tickets.set(res);
      },
      error:err=>{console.log(err);
      }
    });
  }

  cancelBooking(pnr:string){
    this.flightService.cancelBooking(pnr).subscribe({
      next:res=>{
        if(res.success){ 
        this.tickets.update(allboking=>
          allboking.map(booking=>{
            return booking?.pnr_number==pnr?{...booking,booking_status:'Cancelled'}:booking;
          })
        )}},
      error:err=>{console.log(err)}
    });
    
  }



}
