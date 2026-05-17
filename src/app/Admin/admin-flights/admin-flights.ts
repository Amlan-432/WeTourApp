import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/AdminService/admin-service';

@Component({
  selector: 'app-admin-flights',
  imports: [CommonModule,FormsModule,DatePipe],
  templateUrl: './admin-flights.html',
  styleUrl: './admin-flights.css',
})
export class AdminFlights {
  adminService = inject(AdminService);
  allFlights = signal<any[]>([]);

  filteredFlights = [...this.allFlights()];
  filterStatus = 'All';


  ngOnInit(){
    this.adminService.getAllFlightsIns().subscribe();
    this.adminService.allFlightsIns$.subscribe({
      next:res=>{
        this.allFlights.set(res);      
      },
      error:err=>{console.log(err);
      }
    });

    this.applyFilter(this.filterStatus);
    
  }

  applyFilter(status: string) {
    this.filterStatus = status;
    this.filteredFlights = status === 'All' 
      ? [...this.allFlights()] 
      : this.allFlights().filter(f => f.status === status);
  }

  cancelFlight(id: string) {
    this.adminService.cancelFlight(id).subscribe({
      next:res=>{
        if(res.success){
          this.allFlights.update(allflight=>
            allflight.map(f=>{
              return f._id==id?{...f,status:'Cancelled'}:f;
            }));
        }
      },
      error:err=>{console.log(err);
      }
    });
  }

}
