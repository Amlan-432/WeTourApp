import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { Authservice } from '../../services/AuthService/authservice';

@Component({
  selector: 'app-hotel-form',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './hotel-form.html',
  styleUrl: './hotel-form.css',
})
export class HotelForm {

  // 1. Defined a proper type/interface for searchData if possible
  searchData = { 
    destination: '', 
    people: 1, 
    start: '', 
    end: '' 
  };

  private router = inject(Router);
  private hotelservice = inject(Hotelservice);
  private authservice=inject(Authservice);

  onSearch() {
    const startDate = new Date(this.searchData.start);
    const endDate = new Date(this.searchData.end);
    startDate.setHours(0, 0, 0, 0);

    // Validation checks
    if (!this.searchData.destination.trim()) {
      alert("Please enter a destination");
      return;
    }

    if (!this.searchData.start || !this.searchData.end) {
      alert("Please select both dates");
      return;
    }

    if (endDate <= startDate) {
      alert("Check-out date must be after the check-in date");
      return;
    }


    this.hotelservice.updateSearch({ ...this.searchData });

    // Navigate to the hotels page
    this.authservice.currentUser.subscribe(res=>{
      // debugger;
    
      
      if(res){
        
        this.router.navigateByUrl('/landingDash/traveller/searchedHotels');
      }else{
        this.router.navigateByUrl('/landingDash/searchedHotels');
      }
    })

    
  }

  getCurrentDate(){
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = date.getDate().toString().padStart(2,'0');
    return `${year}-${month}-${day}`;
  }


  getMinCheckoutDate(): string {
    if (!this.searchData.start) {
      return this.getCurrentDate();
    }
 
    const checkIn = new Date(this.searchData.start);
    // Add 1 day to the check-in date
    checkIn.setDate(checkIn.getDate() + 1);
 
    const year = checkIn.getFullYear();
    const month = String(checkIn.getMonth() + 1).padStart(2, '0');
    const day = String(checkIn.getDate()).padStart(2, '0');
 
    return `${year}-${month}-${day}`;
  }
  onCheckInChange() {
  if (this.searchData.start && this.searchData.end) {
    if (new Date(this.searchData.end) <= new Date(this.searchData.start)) {
      this.searchData.end = ''; // Reset check-out if it's now invalid
    }
  }
}

}
