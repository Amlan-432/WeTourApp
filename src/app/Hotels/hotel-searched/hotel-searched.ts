import { Component, inject, signal } from '@angular/core';
import { Hotelservice } from '../../services/HotelService/hotelservice';
import { Subscription, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Authservice } from '../../services/AuthService/authservice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotel-searched',
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './hotel-searched.html',
  styleUrl: './hotel-searched.css',
})
export class HotelSearched {

  hotels = signal<any[]>([]);
  cdest:string='';
  travelService = inject(Hotelservice);
  private searchSubscription= new Subscription();
  private authService = inject(Authservice);

  ngOnInit(): void {
    this.loadHotel();

  }
  loadHotel(){
     this.searchSubscription?.add(this.travelService.currentSearch$
      .pipe(
        switchMap((criteria) => {
          const location = this.cdest || criteria?.location || '';
          return this.travelService.getHotels(location);
        })
      )
      .subscribe({
        next: (res:any) => {
          this.hotels.set(res.data);
          console.log('Hotels loaded:',res.data);
        },
        error: (err) => {
          console.error('Error fetching hotels:', err);
        }
      }));
  }

  applyFilters(){
    this.searchSubscription?.add(
      this.travelService.currentSearch$.pipe(
      switchMap(s=>{
        const location=this.cdest;
        return this.travelService.getHotels(location);
      })
    ).subscribe({
        next: (res:any) => {
          this.hotels.set(res.data);
          console.log('Hotels loaded:', res.data);
        },
        error: (err) => {
          console.error('Error fetching hotels:', err);
        }
      })); 
  }

  getUrl(endpoint:string):string{
    let url = `/landingDash/hoteldetails/${endpoint}`;
    this.authService.currentUser.subscribe(res=>{
      if(res){
        url =  `/landingDash/traveller/hoteldetails/${endpoint}`
      }
    });
    return url;
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

}
