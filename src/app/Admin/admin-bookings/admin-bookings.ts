import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/AdminService/admin-service';

@Component({
  selector: 'app-admin-bookings',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css',
})
export class AdminBookings {
  adminService = inject(AdminService)

  allBookings = signal<any[]>([]);
  searchTerm = signal<string>('');
  selectedType = signal<string>('All');


 filteredBookings = computed(() => {
    const data = this.allBookings();
    const search = this.searchTerm().toLowerCase().trim();
    const typeFilter = this.selectedType();

    return data.filter(booking => {
      const matchesType = typeFilter === 'All' || booking.type === typeFilter;
      const matchesSearch = !search || 
        booking.id.toLowerCase().includes(search) ||
        booking.user.toLowerCase().includes(search) ||
        booking.item.toLowerCase().includes(search);

      return matchesType && matchesSearch;
    });
  });

  ngOnInit() {
    this.adminService.getAllBookings().subscribe();
    this.adminService.allBookings$.subscribe({
      next:res=>{
        if(res){
          this.allBookings.set(Object.values(res));
        }
      },
      error:err=>{console.log(err);
      }
    })
  }


  updateStatus(booking: any, newStatus: string) {
    booking.status = newStatus;
  }

  deleteBooking(id: string) {

  }

}
