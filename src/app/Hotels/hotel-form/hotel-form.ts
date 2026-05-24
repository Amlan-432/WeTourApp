import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { Authservice } from '../../services/AuthService/authservice';
import { ChatBox } from '../../chatAi/chat-box/chat-box';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-hotel-form',
  imports: [CommonModule,FormsModule,RouterModule,ChatBox],
  templateUrl: './hotel-form.html',
  styleUrl: './hotel-form.css',
})
export class HotelForm {

  searchData = { 
    location: '', 
    people: 1, 
    start: '', 
    end: '' 
  };

  private router = inject(Router);
  private hotelservice = inject(Hotelservice);
  private authservice=inject(Authservice);

    public loc = signal<any[]>([]);

  private searchTerms = new Subject<string>();
  private searchSubscription!: Subscription;

  ngOnInit(){
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),       
      distinctUntilChanged(),     
      switchMap((term: string) => {
        debugger;
        if (!term.trim() || term.trim().length < 2) {
          return of({ data: [] }); 
        }

        return this.hotelservice.getloc(term).pipe(
          catchError((err) => {
            console.error('API Error:', err);
            return of({ data: [] }); 
          })
        );
      })
    ).subscribe({
      next: (res: any) => {
        debugger;
        this.loc.set(res?.data || []);
      }
    });
  }

  public onSearchChange(value: string): void {
    this.searchTerms.next(value);
  }

  onSearch() {
    const startDate = new Date(this.searchData.start);
    const endDate = new Date(this.searchData.end);
    startDate.setHours(0, 0, 0, 0);

    if (!this.searchData.location.trim()) {
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

    this.authservice.currentUser.subscribe(res=>{
    
      
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

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

}
