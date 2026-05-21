import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PackageService } from '../../services/packageService/package-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customers',
  imports: [CommonModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers {
 public packService = inject(PackageService);
  private subscription = new Subscription();
 
  allBookings = signal<any[]>([]);
 
  ngOnInit() {
    this.getAllGuests();
  }
 
  getAllGuests() {
    this.subscription.add(
      this.packService.bookingGuestList().subscribe()
    );
    this.subscription.add( 
      this.packService.guestList$.subscribe({
          next:(res)=>{
            this.allBookings.set(res)
          },
          error:(err)=>{console.log(err)}
      }
      )
    )

  }
 
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
