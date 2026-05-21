import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/AdminService/admin-service';

@Component({
  selector: 'app-admin-hotels',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-hotels.html',
  styleUrl: './admin-hotels.css',
})
export class AdminHotels {

  hotels = signal<any[]>([]);
  adminService =inject(AdminService);
  searchQuery= signal<string>('');


  filteredHotels = computed(() =>
    this.hotels().filter(hotel =>
      hotel.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
      hotel.location.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
      hotel.user_id?.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  ngOnInit() {

    this.adminService.getAllHotels().subscribe();
    this.adminService.allHotels$.subscribe({
      next:res=>{
        if(res){
          this.hotels.set(res);
        }
      },
      error:err=>{console.log(err);
      }
    })
  }


  editHotel(hotel: any) {
    
  }

  deleteHotel(id: string) {
    
  }

}
