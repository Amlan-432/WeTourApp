import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Flightservice } from '../../services/FlightService/flightservice';
import { FormsModule } from '@angular/forms';
// Change from: import * as html2pdf from 'html2pdf.js';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-sel-flight-info',
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './sel-flight-info.html',
  styleUrl: './sel-flight-info.css',
})
export class SelFlightInfo {

  flightService = inject(Flightservice);
  router = inject(Router);
  bookedFlightDetails=signal<any>('');

  ticketCard = viewChild<ElementRef>('ticketCard');
  ngOnInit(){
    this.flightService.bookFlightdetails$.subscribe({
      next:res=>{
        if(res){
          this.bookedFlightDetails.set(res);
          console.log(this.bookedFlightDetails());

        }
      },
      error:err=>{
        console.log(err);
      }
    });
  


    
  }

  goHome(){
    const isConfirmed = confirm('Redirecting to Home');

  if (isConfirmed) {
    this.router.navigateByUrl('/landingDash/traveller/flights/flightsForm');
  }
  }


  downloadTicket() {
    const element = this.ticketCard()?.nativeElement;
    if (!element) return;
    const options = {
      margin:       0.4, // Document page margins (inches)
      filename:     `Ticket_${this.bookedFlightDetails()?.pnr_number || 'Flight'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2,          
        useCORS: true,     
        logging: false 
      },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    (html2pdf as any)(element, options);
  }



}
